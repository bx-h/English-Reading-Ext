// 内容脚本 与 background 之间的消息契约 + 出题数据模型。
// 这是前后端（content/worker/options）共享的唯一真相来源。

/** 划词所在范围粒度 */
export type SourceScope = 'sentence' | 'paragraph';

/** content 抽取后发给 worker 的出题输入 */
export interface ClozeRequestPayload {
  selectedText: string;
  sourceText: string;
  sourceScope: SourceScope;
  contextBefore: string;
  contextAfter: string;
  pageUrl: string;
  pageTitle: string;
  /** 释义语言，MVP 固定 'zh' */
  glossLang: 'zh' | 'en';
}

/** LLM / mock 产出的出题结果（严格 JSON 的反序列化形态） */
export interface ClozeResult {
  selectedText: string;
  sourceText: string;
  /** 含 {{BLANK}} 占位的局部译文 */
  translationWithBlank: string;
  /** 当前上下文中的正确义 */
  sense: string;
  /** 上下文线索说明 */
  clue: string;
  /** 候选义项（含正确项） */
  options: string[];
  /** 正确项在 options 中的下标 */
  answerIndex: number;
}

/** 本地生词记录（IndexedDB） */
export interface VocabRecord {
  id: string;
  selectedText: string;
  sourceText: string;
  sourceScope: SourceScope;
  contextBefore: string;
  contextAfter: string;
  pageUrl: string;
  pageTitle: string;
  translationWithBlank: string;
  sense: string;
  options: string[];
  answerIndex: number;
  userAnswerIndex: number | null;
  correct: boolean | null;
  clue: string;
  createdAt: number;
}

/** 设置 */
export interface Settings {
  apiKey: string;
  /** OpenAI 兼容 endpoint */
  apiBaseUrl: string;
  model: string;
  /** 主 model 不可用时按顺序降级尝试的候选 model */
  fallbackModels: string[];
  /**
   * 鉴权方式：
   * - 'bearer'：标准 OpenAI，Authorization: Bearer <key>
   * - 'ak-query'：部分兼容网关要求凭证作为 ?ak=<key> 查询参数
   */
  authMode: 'bearer' | 'ak-query';
  glossLang: 'zh' | 'en';
  /** 无 key 时强制 mock；有 key 时也可手动开 mock 演示 */
  forceMock: boolean;
  /** 单个 model 请求超时（毫秒），超时即快速降级到下一个候选 */
  perRequestTimeoutMs: number;
  /** 真实 LLM 全部失败时，是否自动降级到 mock 兜底（结果会明确标识为降级） */
  degradeToMockOnError: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  apiBaseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  fallbackModels: [],
  authMode: 'bearer',
  glossLang: 'zh',
  forceMock: false,
  perRequestTimeoutMs: 40_000,
  degradeToMockOnError: true,
};

// ---- 消息协议 ----

export type RuntimeMessage =
  | { type: 'GENERATE_CLOZE'; payload: ClozeRequestPayload }
  | { type: 'SAVE_RECORD'; payload: VocabRecord }
  | { type: 'PING' };

export interface GenerateClozeResponse {
  ok: boolean;
  /** 是否走了 mock（content 侧据此提示用户） */
  mocked: boolean;
  /** 是否为「真实 LLM 失败后自动降级到 mock」的结果（UI 需明确标识降级） */
  degraded?: boolean;
  /** 降级原因（脱敏，不含 key），用于卡片提示 */
  degradeReason?: string;
  result?: ClozeResult;
  error?: string;
}

export interface GenericAck {
  ok: boolean;
  error?: string;
}

export const BLANK_TOKEN = '{{BLANK}}';
