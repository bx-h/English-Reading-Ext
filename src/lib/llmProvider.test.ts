import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_SETTINGS, type ClozeRequestPayload } from '../types';
import { LLMProvider } from './llmProvider';

const payload: ClozeRequestPayload = {
  selectedText: 'relentlessly',
  sourceText: 'The agent works relentlessly until the task is complete.',
  sourceScope: 'sentence',
  contextBefore: '',
  contextAfter: '',
  pageUrl: 'https://example.com/article',
  pageTitle: 'Example article',
  glossLang: 'zh',
};

describe('LLMProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('gets final JSON content from DeepSeek V4 instead of exhausting output on thinking', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (_url: string, init: RequestInit) => {
        const body = JSON.parse(String(init.body)) as {
          thinking?: { type?: string };
        };
        const content =
          body.thinking?.type === 'disabled'
            ? JSON.stringify({
                translationWithBlank: '这个代理会 {{BLANK}} 工作，直到任务完成。',
                sense: '不懈地',
                clue: '直到任务完成',
                options: ['不懈地', '偶尔地', '被动地'],
                answerIndex: 0,
              })
            : null;
        return new Response(
          JSON.stringify({
            choices: [
              {
                finish_reason: content ? 'stop' : 'length',
                message: {
                  content,
                  reasoning_content: content ? null : 'thinking tokens exhausted',
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }),
    );

    const result = await new LLMProvider({
      ...DEFAULT_SETTINGS,
      apiKey: 'test-secret',
      apiBaseUrl: 'https://api.deepseek.com',
      model: 'deepseek-v4-flash',
    }).generate(payload);

    expect(result.sense).toBe('不懈地');
  });
});
