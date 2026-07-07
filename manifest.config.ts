import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: '猜词义 · 英语阅读插件',
  version: '0.1.0',
  description: '逼你用上下文猜词义：划词后在原文下方插入挖空译文，选择后揭示答案。',
  permissions: ['storage'],
  // 不再静态声明 <all_urls> 的 host_permissions：
  // 真实 LLM 调用（background fetch）所需的 endpoint 域名，在设置页保存时
  // 通过 chrome.permissions.request 按需申请（仅授权用户实际配置的那个 origin）。
  optional_host_permissions: ['https://*/*'],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      // content script 需在任意英文页面监听划词，故 MVP 保留 <all_urls>；
      // 发布前收敛方案见 README（activeTab + 按站点 opt-in 注入）。
      matches: ['<all_urls>'],
      js: ['src/content/index.ts'],
      run_at: 'document_idle',
    },
  ],
  options_page: 'src/options/index.html',
  action: {
    default_title: '猜词义 · 设置',
  },
});
