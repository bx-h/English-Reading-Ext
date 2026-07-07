import type { ClozeRequestPayload, ClozeResult } from '../types';
import { BLANK_TOKEN } from '../types';

/** 出题引擎统一接口：真实 LLM 与 mock 都实现它 */
export interface ClozeProvider {
  readonly mocked: boolean;
  generate(payload: ClozeRequestPayload): Promise<ClozeResult>;
}

/** 校验 LLM 返回是否满足契约，避免脏数据流入渲染层 */
export function validateClozeResult(
  raw: unknown,
  payload: ClozeRequestPayload,
): ClozeResult {
  if (!raw || typeof raw !== 'object') {
    throw new Error('出题结果不是对象');
  }
  const r = raw as Record<string, unknown>;
  const translationWithBlank = String(r.translationWithBlank ?? '');
  const sense = String(r.sense ?? '');
  const clue = String(r.clue ?? '');
  const options = Array.isArray(r.options) ? r.options.map((x) => String(x)) : [];
  const answerIndex = Number(r.answerIndex);

  if (!translationWithBlank.includes(BLANK_TOKEN)) {
    throw new Error(`译文缺少占位符 ${BLANK_TOKEN}`);
  }
  const blankCount = translationWithBlank.split(BLANK_TOKEN).length - 1;
  if (blankCount !== 1) {
    throw new Error(`占位符 ${BLANK_TOKEN} 必须且只能出现一次`);
  }
  if (options.length !== 3) {
    throw new Error('选项必须为 3 个');
  }
  if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= options.length) {
    throw new Error('answerIndex 越界');
  }
  // sense 应与正确项一致（容忍模型把 sense 与 options[answerIndex] 写得略有出入）
  const safeSense = sense || options[answerIndex];

  return {
    selectedText: payload.selectedText,
    sourceText: payload.sourceText,
    translationWithBlank,
    sense: safeSense,
    clue,
    options,
    answerIndex,
  };
}
