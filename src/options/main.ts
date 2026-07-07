import { loadSettings, saveSettings } from '../lib/settings';
import { listRecords } from '../lib/store';

const $ = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

async function init(): Promise<void> {
  const s = await loadSettings();
  $<HTMLInputElement>('apiKey').value = s.apiKey;
  $<HTMLInputElement>('apiBaseUrl').value = s.apiBaseUrl;
  $<HTMLSelectElement>('authMode').value = s.authMode;
  $<HTMLInputElement>('model').value = s.model;
  $<HTMLInputElement>('fallbackModels').value = s.fallbackModels.join(', ');
  $<HTMLInputElement>('perRequestTimeoutMs').value = String(s.perRequestTimeoutMs);
  $<HTMLSelectElement>('glossLang').value = s.glossLang;
  $<HTMLInputElement>('forceMock').checked = s.forceMock;
  $<HTMLInputElement>('degradeToMockOnError').checked = s.degradeToMockOnError;

  $('save').addEventListener('click', onSave);
  await renderRecords();
}

async function onSave(): Promise<void> {
  const fallbackModels = $<HTMLInputElement>('fallbackModels')
    .value.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const timeoutRaw = Number($<HTMLInputElement>('perRequestTimeoutMs').value.trim());
  const perRequestTimeoutMs =
    Number.isFinite(timeoutRaw) && timeoutRaw >= 1000 ? timeoutRaw : 28_000;
  const apiBaseUrl = $<HTMLInputElement>('apiBaseUrl').value.trim();
  const apiKey = $<HTMLInputElement>('apiKey').value.trim();
  const status = $('status');

  // 按需申请 endpoint origin 的 host 权限（非 mock 且配了真实 endpoint 时）
  if (apiKey && apiBaseUrl) {
    const origin = toOriginPattern(apiBaseUrl);
    if (origin) {
      const has = await chrome.permissions.contains({ origins: [origin] });
      if (!has) {
        const granted = await chrome.permissions.request({ origins: [origin] });
        if (!granted) {
          status.textContent = '未授权该接口域名，真实出题将无法调用（可重试或改用 mock）';
          setTimeout(() => (status.textContent = ''), 4000);
          // 仍保存其余设置，但提示权限缺失
        }
      }
    }
  }

  await saveSettings({
    apiKey,
    apiBaseUrl,
    authMode: $<HTMLSelectElement>('authMode').value as 'bearer' | 'ak-query',
    model: $<HTMLInputElement>('model').value.trim(),
    fallbackModels,
    perRequestTimeoutMs,
    glossLang: $<HTMLSelectElement>('glossLang').value as 'zh' | 'en',
    forceMock: $<HTMLInputElement>('forceMock').checked,
    degradeToMockOnError: $<HTMLInputElement>('degradeToMockOnError').checked,
  });
  if (!status.textContent) {
    status.textContent = '已保存';
    setTimeout(() => (status.textContent = ''), 1500);
  }
}

/** 把 base URL 转成 host 权限匹配模式，如 https://api.example.com/* */
function toOriginPattern(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    return `${u.protocol}//${u.hostname}/*`;
  } catch {
    return null;
  }
}

async function renderRecords(): Promise<void> {
  const records = await listRecords();
  const tbody = document.querySelector('#records tbody')!;
  tbody.innerHTML = '';
  for (const r of records.slice(0, 50)) {
    const tr = document.createElement('tr');
    const answer =
      r.userAnswerIndex === null
        ? '<span class="muted">揭示</span>'
        : r.correct
          ? '<span class="ok">✓</span>'
          : '<span class="bad">✗</span>';
    const title = esc(r.pageTitle || r.pageUrl);
    const safeUrl = isHttpUrl(r.pageUrl) ? esc(r.pageUrl) : '';
    const source = safeUrl
      ? `<a href="${safeUrl}" target="_blank" rel="noreferrer">${title}</a>`
      : title;
    tr.innerHTML = `
      <td>${esc(r.selectedText)}</td>
      <td>${esc(r.sense)}</td>
      <td>${answer}</td>
      <td>${source}</td>`;
    tbody.appendChild(tr);
  }
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isHttpUrl(url: string): boolean {
  try {
    const p = new URL(url).protocol;
    return p === 'http:' || p === 'https:';
  } catch {
    return false;
  }
}

init();
