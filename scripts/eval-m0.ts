/**
 * M0 出题质量评测脚本（本地运行，复用插件的 LLMProvider）
 *
 * - 运行时从环境变量读取 OpenAI-compatible LLM 配置，Key 仅在内存使用。
 * - 跑 N 个真实英语句/段 + 划词样本，对每条做自动校验 + 落脱敏结果。
 * - 绝不打印/写出 Key；输出报告由人工汇总，脚本只产出脱敏 JSON 指标。
 *
 * 用法：
 *   EVAL_API_KEY=... EVAL_API_BASE_URL=https://api.openai.com/v1 EVAL_MODEL=gpt-4o-mini npx tsx scripts/eval-m0.ts
 *   npx tsx scripts/eval-m0.ts --dry      # 只打印样本与配置来源，不调用
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LLMProvider } from '../src/lib/llmProvider.ts';
import type { ClozeRequestPayload, Settings } from '../src/types/index.ts';
import { BLANK_TOKEN } from '../src/types/index.ts';
import { SAMPLES } from './samples.ts';

function readEnv(name: string, fallback = ''): string {
  return process.env[name]?.trim() || fallback;
}

/** 从环境变量解析配置。Key 不回显、不落盘。 */
function parseEnvSettings(): Settings {
  const apiKey = readEnv('EVAL_API_KEY');
  const apiBaseUrl = readEnv('EVAL_API_BASE_URL', 'https://api.openai.com/v1');
  const model = readEnv('EVAL_MODEL', 'gpt-4o-mini');
  const authMode = readEnv('EVAL_AUTH_MODE', 'bearer');
  if (!apiKey) {
    throw new Error('缺少 EVAL_API_KEY');
  }
  if (authMode !== 'bearer' && authMode !== 'ak-query') {
    throw new Error('EVAL_AUTH_MODE 只能是 bearer 或 ak-query');
  }
  return {
    apiKey,
    apiBaseUrl,
    model,
    fallbackModels: readEnv('EVAL_FALLBACK_MODELS')
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean),
    authMode,
    glossLang: readEnv('EVAL_GLOSS_LANG', 'zh') === 'en' ? 'en' : 'zh',
    forceMock: false,
    perRequestTimeoutMs: Number(readEnv('EVAL_TIMEOUT_MS', '40000')) || 40_000,
    degradeToMockOnError: false,
  };
}

/** 拉取 /models 列表（model 名非机密，可打印） */
async function listModels(s: Settings): Promise<string[]> {
  try {
    const resp = await fetch(`${s.apiBaseUrl.replace(/\/+$/, '')}/models`, {
      headers: { Authorization: `Bearer ${s.apiKey}` },
      signal: AbortSignal.timeout(15_000),
    });
    if (!resp.ok) return [];
    const data = (await resp.json()) as { data?: { id?: string }[] };
    return (data.data ?? []).map((d) => d.id ?? '').filter(Boolean);
  } catch {
    return [];
  }
}

/** 快速探测 model 是否可用（小请求），返回响应耗时 ms，不可用返回 null */
async function probeModel(s: Settings, model: string): Promise<number | null> {
  const t0 = Date.now();
  try {
    const resp = await fetch(`${s.apiBaseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${s.apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 8,
        messages: [{ role: 'user', content: 'reply with the single word ok' }],
      }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!resp.ok) return null;
    await resp.json();
    return Date.now() - t0;
  } catch {
    return null;
  }
}

/** 探测所有 model，按响应耗时升序返回可用 model（最快在前） */
async function discoverResponsiveModels(s: Settings): Promise<string[]> {
  const all = await listModels(s);
  if (all.length === 0) return [];
  const probed = await Promise.all(
    all.map(async (m) => ({ m, t: await probeModel(s, m) })),
  );
  return probed
    .filter((p) => p.t !== null)
    .sort((a, b) => (a.t! - b.t!))
    .map((p) => p.m);
}

interface Check {
  hasSingleBlank: boolean;
  optionsCount: number;
  answerIndexValid: boolean;
  // 答案是否在译文非空位处泄露（正确义文本出现在 translationWithBlank 里）
  leaksAnswer: boolean;
  // 选项是否互不相同
  optionsDistinct: boolean;
  // sense 与 options[answerIndex] 是否一致
  senseMatchesAnswer: boolean;
}

function autoCheck(r: {
  translationWithBlank: string;
  sense: string;
  options: string[];
  answerIndex: number;
}): Check {
  const blanks = r.translationWithBlank.split(BLANK_TOKEN).length - 1;
  const filled = r.translationWithBlank.replaceAll(BLANK_TOKEN, '');
  const answer = r.options[r.answerIndex] ?? '';
  return {
    hasSingleBlank: blanks === 1,
    optionsCount: r.options.length,
    answerIndexValid:
      Number.isInteger(r.answerIndex) &&
      r.answerIndex >= 0 &&
      r.answerIndex < r.options.length,
    leaksAnswer: answer.length >= 2 && filled.includes(answer),
    optionsDistinct: new Set(r.options).size === r.options.length,
    senseMatchesAnswer: r.sense.trim() === answer.trim(),
  };
}

async function main() {
  const dry = process.argv.includes('--dry');
  const noDiscover = process.argv.includes('--no-discover');
  const settings = parseEnvSettings();
  console.log(
    `配置来源: env | endpoint=${settings.apiBaseUrl} | model=${settings.model} | key=<hidden,len=${settings.apiKey.length}>`,
  );

  // 探测可用 model 并按响应性排序（仅 bearer/标准 OpenAI-compatible 网关）。
  if (!dry && !noDiscover && settings.authMode === 'bearer') {
    const responsive = await discoverResponsiveModels(settings);
    if (responsive.length > 0) {
      settings.model = responsive[0];
      settings.fallbackModels = responsive.slice(1);
      console.log(
        `可用 model（按响应速度排序）: ${responsive.join(', ')}`,
      );
      console.log(`选用主 model: ${settings.model} | 备用: ${settings.fallbackModels.join(', ') || '无'}`);
    } else {
      console.log('⚠ 未探测到可用 model，沿用环境变量配置的 model。');
    }
  } else if (settings.authMode === 'ak-query') {
    console.log(`鉴权方式: ak-query | 使用环境变量标注 model: ${settings.model}`);
  }
  console.log(`样本数: ${SAMPLES.length}`);
  if (dry) {
    console.log('[dry] 不调用，退出。');
    return;
  }

  const provider = new LLMProvider(settings);
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : SAMPLES.length;
  const samples = SAMPLES.slice(0, limit);
  // 请求间隔：query-key 网关可能有 QPM 限流，默认插 5s 间隔模拟真实稀疏使用。
  const gapArg = process.argv.find((a) => a.startsWith('--gap='));
  const gapMs = gapArg
    ? Number(gapArg.split('=')[1])
    : settings.authMode === 'ak-query'
      ? 5000
      : 0;
  const results: any[] = [];
  let ok = 0;
  let failed = 0;
  let timeouts = 0;
  let rateLimited = 0;
  const latencies: number[] = []; // 仅成功样本的耗时(ms)

  for (let i = 0; i < samples.length; i++) {
    if (i > 0 && gapMs > 0) await sleep(gapMs);
    const s = samples[i];
    const payload: ClozeRequestPayload = {
      selectedText: s.selectedText,
      sourceText: s.sourceText,
      sourceScope: s.sourceScope,
      contextBefore: s.contextBefore ?? '',
      contextAfter: s.contextAfter ?? '',
      pageUrl: 'https://eval.local',
      pageTitle: 'M0 eval',
      glossLang: 'zh',
    };
    const t0 = Date.now();
    try {
      const r = await provider.generate(payload);
      const ms = Date.now() - t0;
      latencies.push(ms);
      const check = autoCheck(r);
      results.push({
        idx: i + 1,
        selectedText: s.selectedText,
        sourceText: s.sourceText,
        translationWithBlank: r.translationWithBlank,
        sense: r.sense,
        options: r.options,
        answerIndex: r.answerIndex,
        clue: r.clue,
        latencyMs: ms,
        check,
      });
      ok++;
      process.stdout.write(`#${i + 1} ok(${(ms / 1000).toFixed(1)}s)  `);
    } catch (e) {
      const ms = Date.now() - t0;
      const msg = String(e);
      if (/timeout|aborted|超时/i.test(msg)) timeouts++;
      if (/429|qpm|rate limit/i.test(msg)) rateLimited++;
      failed++;
      results.push({ idx: i + 1, selectedText: s.selectedText, latencyMs: ms, error: msg });
      process.stdout.write(`#${i + 1} ERR  `);
    }
  }
  console.log('\n');

  // 延迟分位
  const sorted = [...latencies].sort((a, b) => a - b);
  const pct = (p: number): number =>
    sorted.length === 0 ? 0 : sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
  const latency = {
    successRate: `${ok}/${samples.length}`,
    timeouts,
    rateLimited,
    p50Ms: pct(50),
    p95Ms: pct(95),
    maxMs: sorted[sorted.length - 1] ?? 0,
  };

  // 汇总自动指标
  const valid = results.filter((r) => r.check);
  const agg = {
    total: samples.length,
    ok,
    failed,
    timeouts,
    singleBlank: valid.filter((r) => r.check.hasSingleBlank).length,
    answerIndexValid: valid.filter((r) => r.check.answerIndexValid).length,
    optionsGe3: valid.filter((r) => r.check.optionsCount >= 3).length,
    noLeak: valid.filter((r) => !r.check.leaksAnswer).length,
    optionsDistinct: valid.filter((r) => r.check.optionsDistinct).length,
    senseMatchesAnswer: valid.filter((r) => r.check.senseMatchesAnswer).length,
  };
  console.log('延迟统计:', JSON.stringify(latency, null, 2));
  console.log('自动指标:', JSON.stringify(agg, null, 2));

  // 落盘脱敏结果（不含 key）供人工评估译文/干扰项语义质量
  const outPath = resolve(import.meta.dirname, 'eval-m0-output.json');
  writeFileSync(outPath, JSON.stringify({ latency, agg, results }, null, 2), 'utf8');
  console.log('明细已写入:', outPath);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((e) => {
  console.error('评测失败:', e);
  process.exit(1);
});
