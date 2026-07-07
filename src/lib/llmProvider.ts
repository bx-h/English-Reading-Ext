import type { ClozeRequestPayload, ClozeResult, Settings } from '../types';
import { BLANK_TOKEN } from '../types';
import type { ClozeProvider } from './provider';
import { validateClozeResult } from './provider';

/**
 * OpenAI 兼容出题引擎（用户自带 Key）。
 * - 走 chat/completions，靠 prompt 强约束 JSON（不依赖 response_format，
 *   实测该参数在部分网关上显著拖慢甚至超时）。
 * - 多 model 降级：主 model 超时/不可用时按 fallbackModels 顺序快速切换，
 *   不让用户卡满总超时。Key 仅从 settings 读取，绝不写死。
 */
export class LLMProvider implements ClozeProvider {
  readonly mocked = false;
  constructor(private readonly settings: Settings) {}

  /** 候选 model：主 model 去重在前，fallback 依次在后 */
  private candidateModels(): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const m of [this.settings.model, ...this.settings.fallbackModels]) {
      const t = (m ?? '').trim();
      if (t && !seen.has(t)) {
        seen.add(t);
        out.push(t);
      }
    }
    return out;
  }

  async generate(payload: ClozeRequestPayload): Promise<ClozeResult> {
    if (!this.settings.apiKey) {
      throw new Error('未配置 API Key');
    }
    const models = this.candidateModels();
    if (models.length === 0) {
      throw new Error('未配置 model');
    }

    // 候选 model 顺序尝试；单个 model 失败即降级到下一个。
    // 对瞬时错误（429 限流 / 连接抖动 fetch failed / 5xx）在同一 model 内做指数退避重试，
    // 退避 + 抖动避免密集划词把平台打爆；超时/无权限/invalid model 等不重试，直接降级。
    const MAX_ATTEMPTS = 3; // 首次 + 2 次重试
    const errors: string[] = [];
    for (const model of models) {
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        try {
          return await this.callOne(model, payload);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          const isLast = attempt === MAX_ATTEMPTS - 1;
          if (isTransient(msg) && !isLast) {
            // 指数退避 + 抖动：~0.6s, ~1.4s
            const base = 600 * 2 ** attempt;
            await sleep(base + Math.floor(Math.random() * 300));
            continue;
          }
          errors.push(`${shortModel(model)}: ${truncErr(e)}`);
          break; // 换下一个 model
        }
      }
    }
    throw new Error(`全部候选 model 失败 → ${errors.join(' | ')}`);
  }

  private async callOne(
    model: string,
    payload: ClozeRequestPayload,
  ): Promise<ClozeResult> {
    const { apiKey, apiBaseUrl, perRequestTimeoutMs, authMode } = this.settings;
    const body = {
      model,
      temperature: 0.3,
      // 一道题的 JSON 约 200~260 token，限制上限以缩短生成耗时
      max_tokens: 320,
      messages: [
        { role: 'system', content: buildSystemPrompt(payload.glossLang) },
        { role: 'user', content: buildUserPrompt(payload) },
      ],
    };

    const base = trimSlash(apiBaseUrl);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let url = `${base}/chat/completions`;
    if (authMode === 'ak-query') {
      // Some OpenAI-compatible gateways require credentials as a query parameter.
      url += `?ak=${encodeURIComponent(apiKey)}`;
    } else {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(perRequestTimeoutMs),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`HTTP ${resp.status}: ${text.slice(0, 120)}`);
    }

    const data = (await resp.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('返回为空');
    }

    const parsed = parseLooseJson(content);
    return validateClozeResult(parsed, payload);
  }
}

function trimSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** 是否为可重试的瞬时错误：限流 / 连接抖动 / 5xx；超时与权限类不重试 */
function isTransient(msg: string): boolean {
  return /\b429\b|qpm|rate limit|资源池|fetch failed|ECONNRESET|ECONNREFUSED|network|\b50[0-9]\b/i.test(
    msg,
  );
}

/** 容忍模型在 JSON 外裹 ```json 代码块或前后多余文字 */
function parseLooseJson(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // 抽取第一个 { 到最后一个 } 之间的内容再试
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        /* fallthrough */
      }
    }
    throw new Error('返回非合法 JSON');
  }
}

function shortModel(m: string): string {
  return m.length > 16 ? `…${m.slice(-12)}` : m;
}

function truncErr(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  // AbortSignal.timeout 抛 TimeoutError
  if (/timeout|aborted/i.test(msg)) return '超时';
  return msg.slice(0, 80);
}

function buildSystemPrompt(glossLang: 'zh' | 'en'): string {
  const lang = glossLang === 'zh' ? '中文' : '简单英文';
  return [
    `英语阅读出题引擎。用户在英文原文里划选了生词/短语，你只为该划线句/段生成一段${lang}译文，并把目标词义挖空让用户用上下文猜。`,
    '必须只输出一个 JSON 对象，不要 markdown 代码块、不要解释。字段：',
    'translationWithBlank（局部译文，目标词处用占位符 {{BLANK}} 且仅出现一次，禁止翻译未划线内容，禁止在别处泄露答案）、',
    'sense（当前语境的正确义，非词典通用义）、clue（一句上下文线索）、',
    'options（3 个同语言短语数组，长度接近且语法上都能填入空位，含正确项与干扰项）、answerIndex（正确项下标，整数）。',
    '干扰项用该词其他常见义项/形近词义项/字面直译但语境错误的义，不要随机错词。',
    `必须出现 ${BLANK_TOKEN}。`,
  ].join('');
}

function buildUserPrompt(p: ClozeRequestPayload): string {
  return JSON.stringify({
    selectedText: p.selectedText,
    sourceText: p.sourceText,
    contextBefore: p.contextBefore,
    contextAfter: p.contextAfter,
    optionCount: 3,
  });
}
