import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_SETTINGS } from '../types';
import { testLlmConnection } from './llmConnection';

describe('testLlmConnection', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports that the configured model can serve a real cloze request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    translationWithBlank: '这是一个 {{BLANK}} 测试。',
                    sense: '连接',
                    clue: '用于验证模型是否可用',
                    options: ['连接', '断开', '忽略'],
                    answerIndex: 0,
                  }),
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );

    const result = await testLlmConnection({
      ...DEFAULT_SETTINGS,
      apiKey: 'test-secret',
      model: 'deepseek-chat',
    });

    expect(result).toEqual({
      ok: true,
      message: '连接成功：deepseek-chat 可用',
    });
  });

  it('reports a provider failure without exposing the API key', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('invalid key test-secret', { status: 401 }),
      ),
    );

    const result = await testLlmConnection({
      ...DEFAULT_SETTINGS,
      apiKey: 'test-secret',
      model: 'deepseek-chat',
    });

    expect(result).toEqual({
      ok: false,
      message:
        '连接失败：全部候选 model 失败 → deepseek-chat: HTTP 401: invalid key ***',
    });
  });

  it('does not hide a configured model failure behind a fallback model', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('model not found', { status: 404 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    translationWithBlank: '这是一个 {{BLANK}} 测试。',
                    sense: '连接',
                    clue: '用于验证模型是否可用',
                    options: ['连接', '断开', '忽略'],
                    answerIndex: 0,
                  }),
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );
    vi.stubGlobal('fetch', fetchMock);

    const result = await testLlmConnection({
      ...DEFAULT_SETTINGS,
      apiKey: 'test-secret',
      model: 'missing-model',
      fallbackModels: ['working-fallback'],
    });

    expect(result).toEqual({
      ok: false,
      message:
        '连接失败：全部候选 model 失败 → missing-model: HTTP 404: model not found',
    });
  });
});
