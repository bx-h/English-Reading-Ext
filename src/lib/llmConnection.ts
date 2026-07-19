import type { ClozeRequestPayload, Settings } from '../types';
import { LLMProvider } from './llmProvider';

export type LlmConnectionTestResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

const CONNECTION_TEST_PAYLOAD: ClozeRequestPayload = {
  selectedText: 'connection',
  sourceText: 'This sentence verifies that the configured model can generate a cloze question.',
  sourceScope: 'sentence',
  contextBefore: '',
  contextAfter: '',
  pageUrl: 'https://extension.local/connection-test',
  pageTitle: 'LLM connection test',
  glossLang: 'zh',
};

/** 使用正式出题链路验证当前表单中的 endpoint、鉴权和 model。 */
export async function testLlmConnection(
  settings: Settings,
): Promise<LlmConnectionTestResult> {
  try {
    await new LLMProvider({ ...settings, fallbackModels: [] }).generate({
      ...CONNECTION_TEST_PAYLOAD,
      glossLang: settings.glossLang,
    });
    return {
      ok: true,
      message: `连接成功：${settings.model} 可用`,
    };
  } catch (error) {
    return {
      ok: false,
      message: `连接失败：${sanitizeConnectionError(error, settings.apiKey)}`,
    };
  }
}

function sanitizeConnectionError(error: unknown, apiKey: string): string {
  let message = error instanceof Error ? error.message : String(error);
  if (apiKey) message = message.split(apiKey).join('***');
  return message
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer ***')
    .replace(/([?&]ak=)[^\s&"']+/gi, '$1***')
    .slice(0, 300);
}
