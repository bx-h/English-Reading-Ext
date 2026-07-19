import { testLlmConnection } from '../lib/llmConnection';
import type { Settings } from '../types';

const $ = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

export function initConnectionTest(): void {
  $<HTMLButtonElement>('testConnection').addEventListener('click', () => {
    void runConnectionTest();
  });
}

async function runConnectionTest(): Promise<void> {
  const button = $<HTMLButtonElement>('testConnection');
  const status = $('connectionStatus');
  const settings = readSettingsFromForm();

  button.disabled = true;
  status.dataset.state = 'pending';
  status.textContent = '测试中…';

  try {
    const permissionError = await ensureEndpointPermission(settings.apiBaseUrl);
    if (permissionError) {
      status.dataset.state = 'error';
      status.textContent = permissionError;
      return;
    }

    const result = await testLlmConnection(settings);
    status.dataset.state = result.ok ? 'success' : 'error';
    status.textContent = result.message;
  } finally {
    button.disabled = false;
  }
}

function readSettingsFromForm(): Settings {
  const timeoutRaw = Number(
    $<HTMLInputElement>('perRequestTimeoutMs').value.trim(),
  );
  return {
    apiKey: $<HTMLInputElement>('apiKey').value.trim(),
    apiBaseUrl: $<HTMLInputElement>('apiBaseUrl').value.trim(),
    authMode: $<HTMLSelectElement>('authMode').value as Settings['authMode'],
    model: $<HTMLInputElement>('model').value.trim(),
    fallbackModels: $<HTMLInputElement>('fallbackModels')
      .value.split(',')
      .map((model) => model.trim())
      .filter(Boolean),
    perRequestTimeoutMs:
      Number.isFinite(timeoutRaw) && timeoutRaw >= 1000 ? timeoutRaw : 28_000,
    glossLang: $<HTMLSelectElement>('glossLang').value as Settings['glossLang'],
    forceMock: $<HTMLInputElement>('forceMock').checked,
    degradeToMockOnError: $<HTMLInputElement>('degradeToMockOnError').checked,
  };
}

async function ensureEndpointPermission(baseUrl: string): Promise<string | null> {
  const origin = toOriginPattern(baseUrl);
  if (!origin) return '连接失败：API Base URL 无效';
  if (await chrome.permissions.contains({ origins: [origin] })) return null;
  const granted = await chrome.permissions.request({ origins: [origin] });
  return granted ? null : '连接失败：未授权该接口域名';
}

function toOriginPattern(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    return `${parsed.protocol}//${parsed.hostname}/*`;
  } catch {
    return null;
  }
}
