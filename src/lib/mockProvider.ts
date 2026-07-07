import type { ClozeRequestPayload, ClozeResult } from '../types';
import { BLANK_TOKEN } from '../types';
import type { ClozeProvider } from './provider';

/**
 * Mock 出题引擎：无 API Key 时保证插件可演示完整交互。
 * 不调用网络；根据选词构造一条合理的挖空译文 + 干扰项。
 */
export class MockProvider implements ClozeProvider {
  readonly mocked = true;

  async generate(payload: ClozeRequestPayload): Promise<ClozeResult> {
    // 模拟出题延迟，便于验证骨架态/loading
    await delay(450);

    const sel = payload.selectedText.trim();

    const options = [
      `${sel} 在此处的语境义`,
      `${sel} 的字面直译义`,
      `与 ${sel} 形近词的义项`,
    ];

    // 把原句中的选词替换成 BLANK，未命中则在句尾追加
    let translation = payload.sourceText;
    if (sel && translation.includes(sel)) {
      translation = translation.replace(sel, BLANK_TOKEN);
    } else {
      translation = `${payload.sourceText} —— ${BLANK_TOKEN}`;
    }

    return {
      selectedText: sel,
      sourceText: payload.sourceText,
      translationWithBlank: `【MOCK 译文】${translation}`,
      sense: options[0],
      clue: `这是 mock 数据：未配置 API Key（或开启了强制 mock），仅用于演示完整交互链路。正确项固定为第 1 项。`,
      options,
      answerIndex: 0,
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
