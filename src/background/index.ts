import type {
  ClozeRequestPayload,
  GenerateClozeResponse,
  GenericAck,
  RuntimeMessage,
} from '../types';
import { loadSettings } from '../lib/settings';
import { LLMProvider } from '../lib/llmProvider';
import { MockProvider } from '../lib/mockProvider';
import { putRecord } from '../lib/store';

// 请求缓存：同一 url+句段+选词+model+释义语言 的结果短期复用，减少重复请求。
// 仅缓存出题结果，绝不含 ak/key。带 TTL，过期失效。
interface CacheEntry {
  value: GenerateClozeResponse;
  expireAt: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_MAX = 100;
const CACHE_TTL_MS = 10 * 60_000; // 10 分钟

function cacheKey(payload: ClozeRequestPayload, model: string): string {
  return [
    payload.pageUrl,
    payload.selectedText,
    payload.sourceText,
    model,
    payload.glossLang,
  ].join('\u0001');
}

// 点击工具栏图标 → 打开设置页（填 Key、看记录）
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// 设置变更后清缓存，避免无 Key 时缓存的 mock 结果在配好 Key 后仍命中
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.settings) {
    cache.clear();
  }
});

chrome.runtime.onMessage.addListener(
  (msg: RuntimeMessage, _sender, sendResponse) => {
    if (msg.type === 'PING') {
      sendResponse({ ok: true } satisfies GenericAck);
      return false;
    }

    if (msg.type === 'GENERATE_CLOZE') {
      handleGenerate(msg.payload, sendResponse);
      return true; // 异步响应
    }

    if (msg.type === 'SAVE_RECORD') {
      putRecord(msg.payload)
        .then(() => sendResponse({ ok: true } satisfies GenericAck))
        .catch((e) =>
          sendResponse({ ok: false, error: String(e) } satisfies GenericAck),
        );
      return true;
    }

    return false;
  },
);

async function handleGenerate(
  payload: ClozeRequestPayload,
  sendResponse: (r: GenerateClozeResponse) => void,
): Promise<void> {
  const settings = await loadSettings();
  const useMock = settings.forceMock || !settings.apiKey;
  // 缓存 key 含 model（mock 用固定标识），命中真实结果优先
  const key = cacheKey(payload, useMock ? 'mock' : settings.model);
  const hit = cache.get(key);
  if (hit && hit.expireAt > Date.now()) {
    sendResponse(hit.value);
    return;
  }

  // 显式 mock（无 key / 强制）：直接走 mock
  if (useMock) {
    try {
      const result = await new MockProvider().generate(payload);
      const resp: GenerateClozeResponse = { ok: true, mocked: true, result };
      setCache(key, resp);
      sendResponse(resp);
    } catch (e) {
      sendResponse({ ok: false, mocked: true, error: String(e) });
    }
    return;
  }

  // 真实 LLM：失败后按设置自动降级到 mock 兜底（明确标识），保证用户总能拿到可交互结果
  try {
    const result = await new LLMProvider(settings).generate(payload);
    const resp: GenerateClozeResponse = { ok: true, mocked: false, result };
    setCache(key, resp);
    sendResponse(resp);
  } catch (e) {
    const reason = sanitize(String(e));
    if (!settings.degradeToMockOnError) {
      sendResponse({ ok: false, mocked: false, error: reason });
      return;
    }
    try {
      const result = await new MockProvider().generate(payload);
      // 降级结果不入缓存：网关恢复后下次仍应优先尝试真实 LLM
      sendResponse({
        ok: true,
        mocked: true,
        degraded: true,
        degradeReason: reason,
        result,
      });
    } catch (e2) {
      sendResponse({ ok: false, mocked: false, error: sanitize(String(e2)) });
    }
  }
}

/** 去除可能的 Bearer/ak 片段，确保错误信息不外泄凭证 */
function sanitize(msg: string): string {
  return msg
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer ***')
    .replace(/([?&]ak=)[^\s&"']+/gi, '$1***')
    .slice(0, 300);
}

function setCache(key: string, value: GenerateClozeResponse): void {
  if (cache.size >= CACHE_MAX) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  cache.set(key, { value, expireAt: Date.now() + CACHE_TTL_MS });
}
