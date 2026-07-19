// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';

import { initConnectionTest } from './connectionTest';

describe('LLM connection test button', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
  });

  it('tests the current unsaved form values and shows the model is available', async () => {
    document.body.innerHTML = `
      <input id="apiKey" value="test-secret" />
      <input id="apiBaseUrl" value="https://api.deepseek.com/v1" />
      <select id="authMode"><option value="bearer" selected>Bearer</option></select>
      <input id="model" value="deepseek-chat" />
      <input id="fallbackModels" value="" />
      <input id="perRequestTimeoutMs" value="40000" />
      <select id="glossLang"><option value="zh" selected>中文</option></select>
      <input id="forceMock" type="checkbox" />
      <input id="degradeToMockOnError" type="checkbox" checked />
      <button id="testConnection">测试连接</button>
      <span id="connectionStatus"></span>
    `;
    vi.stubGlobal('chrome', {
      permissions: {
        contains: vi.fn().mockResolvedValue(true),
        request: vi.fn(),
      },
    });
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

    initConnectionTest();
    document.querySelector<HTMLButtonElement>('#testConnection')!.click();

    await vi.waitFor(() => {
      expect(document.querySelector('#connectionStatus')?.textContent).toBe(
        '连接成功：deepseek-chat 可用',
      );
    });
  });
});
