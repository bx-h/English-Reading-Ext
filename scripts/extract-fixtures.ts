/**
 * 上下文抽取（长段落 / 脏 DOM）验证脚本。
 * 用 jsdom 构造若干贴近真实站点的 DOM fixture，模拟划词并断言 extractContext 的输出。
 *
 * 用法：npx tsx scripts/extract-fixtures.ts
 *
 * 注意：extract.ts 依赖 window/Selection/Node，本脚本在跑测前用 jsdom 注入全局，
 * 再动态 import extract.ts，保证它拿到的是 jsdom 的 DOM 实现。
 */
import { JSDOM } from 'jsdom';

interface Fixture {
  name: string;
  html: string;
  // 在文档中要划选的精确文本（必须能在某个文本节点内找到）
  select: string;
  expect: {
    scope?: 'sentence' | 'paragraph';
    // sourceText 必须包含这些子串
    sourceIncludes?: string[];
    // sourceText 不应包含这些（防止把整页/无关段落卷进来）
    sourceExcludes?: string[];
  };
}

const FIXTURES: Fixture[] = [
  {
    name: '普通文章句子（标准 <p>）',
    html: `<article><p>AI is everywhere now. The researchers proposed a novel approach to reducing emissions. People remain skeptical.</p></article>`,
    select: 'novel',
    expect: {
      scope: 'sentence',
      sourceIncludes: ['novel approach'],
      sourceExcludes: ['AI is everywhere', 'skeptical'],
    },
  },
  {
    name: '脏 DOM：嵌套 span/strong 包裹目标词',
    html: `<div class="post"><p>You should consider <strong>broadening</strong> your <span>skill</span> set before the market shifts.</p></div>`,
    select: 'skill',
    expect: {
      scope: 'sentence',
      sourceIncludes: ['broadening', 'skill', 'market shifts'],
    },
  },
  {
    name: '长段落（多句，应抽到所在句而非整段）',
    html: `<p>The first sentence sets the scene with plenty of detail. The committee tabled the proposal until they could gather more data and consult experts. A third sentence follows to add more length and noise here.</p>`,
    select: 'tabled',
    expect: {
      scope: 'sentence',
      sourceIncludes: ['tabled the proposal'],
      sourceExcludes: ['third sentence'],
    },
  },
  {
    name: '无尾标点社交长文（X 风格，应兜底为整段）',
    html: `<div>Honestly the whole thing about banking on a single product to save the company feels risky and shortsighted to me</div>`,
    select: 'banking on',
    expect: {
      sourceIncludes: ['banking on', 'risky'],
    },
  },
  {
    name: '<br> 分隔的伪段落',
    html: `<div class="content">Line one is just a header.<br>The newly released documents shed light on how the decision was made.<br>Line three trails off.</div>`,
    select: 'shed light on',
    expect: {
      sourceIncludes: ['shed light on', 'decision was made'],
    },
  },
  {
    name: '列表项 <li>',
    html: `<ul><li>Cut corners during testing and the bugs will surface later in production.</li><li>Unrelated item.</li></ul>`,
    select: 'Cut corners',
    expect: {
      sourceIncludes: ['Cut corners', 'production'],
      sourceExcludes: ['Unrelated item'],
    },
  },
  {
    name: '新闻站：figure/figcaption 噪声夹在段落间',
    html: `<article><figure><img><figcaption>Photo: a city skyline at dusk.</figcaption></figure><p>The new policy could render thousands of permits invalid overnight, officials warned.</p></article>`,
    select: 'render',
    expect: {
      scope: 'sentence',
      sourceIncludes: ['render', 'permits invalid'],
      sourceExcludes: ['Photo', 'skyline'],
    },
  },
  {
    name: '文档站：段内含 <code> 行内代码',
    html: `<div class="markdown-body"><p>Calling <code>flush()</code> too often can degrade throughput on slow disks.</p></div>`,
    select: 'degrade',
    expect: {
      scope: 'sentence',
      sourceIncludes: ['degrade', 'throughput'],
    },
  },
  {
    name: '阅读器：blockquote 引文',
    html: `<blockquote><p>There is a fine line between confidence and arrogance, he wrote in the memoir.</p></blockquote>`,
    select: 'fine',
    expect: {
      scope: 'sentence',
      sourceIncludes: ['fine line', 'arrogance'],
    },
  },
  {
    name: '表格单元格 <td>',
    html: `<table><tr><td>Q2 revenue</td><td>The company is banking on overseas markets to offset the domestic slump this year.</td></tr></table>`,
    select: 'banking on',
    expect: {
      sourceIncludes: ['banking on', 'overseas markets'],
      sourceExcludes: ['Q2 revenue'],
    },
  },
  {
    name: 'X 长文：嵌套 <a>/<span> 链接夹在句中',
    html: `<div data-testid="tweetText"><span>Everyone is </span><a href="#"><span>championing</span></a><span> remote work, but few measure its real cost on culture and mentorship over time.</span></div>`,
    select: 'championing',
    expect: {
      sourceIncludes: ['championing', 'remote work'],
    },
  },
];

/** 在文档里找到包含目标文本的文本节点，构造一个覆盖该文本的 Selection */
function selectText(dom: JSDOM, needle: string): boolean {
  const doc = dom.window.document;
  const walker = doc.createTreeWalker(doc.body, dom.window.NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const idx = node.textContent?.indexOf(needle) ?? -1;
    if (idx >= 0) {
      const range = doc.createRange();
      range.setStart(node, idx);
      range.setEnd(node, idx + needle.length);
      const sel = dom.window.getSelection()!;
      sel.removeAllRanges();
      sel.addRange(range);
      return true;
    }
  }
  return false;
}

async function main() {
  let pass = 0;
  let fail = 0;
  const issues: string[] = [];

  for (const fx of FIXTURES) {
    const dom = new JSDOM(`<!doctype html><html><body>${fx.html}</body></html>`, {
      url: 'https://fixture.local/page',
    });
    // 注入全局，供 extract.ts 使用
    const g = globalThis as any;
    g.window = dom.window;
    g.document = dom.window.document;
    g.location = dom.window.location;
    g.Node = dom.window.Node;
    g.HTMLElement = dom.window.HTMLElement;
    g.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);

    // 动态 import，确保拿到注入后的全局
    const { extractContext } = await import('../src/content/extract.ts');

    if (!selectText(dom, fx.select)) {
      fail++;
      issues.push(`[${fx.name}] 找不到要划选的文本: "${fx.select}"`);
      continue;
    }
    const sel = dom.window.getSelection()!;
    const payload = extractContext(sel as unknown as Selection);

    if (!payload) {
      fail++;
      issues.push(`[${fx.name}] extractContext 返回 null`);
      continue;
    }

    const errs: string[] = [];
    if (fx.expect.scope && payload.sourceScope !== fx.expect.scope) {
      errs.push(`scope 期望 ${fx.expect.scope} 实际 ${payload.sourceScope}`);
    }
    for (const inc of fx.expect.sourceIncludes ?? []) {
      if (!payload.sourceText.includes(inc)) {
        errs.push(`sourceText 缺少 "${inc}"`);
      }
    }
    for (const exc of fx.expect.sourceExcludes ?? []) {
      if (payload.sourceText.includes(exc)) {
        errs.push(`sourceText 不应含 "${exc}"`);
      }
    }

    if (errs.length === 0) {
      pass++;
      console.log(`✓ ${fx.name}`);
    } else {
      fail++;
      console.log(`✗ ${fx.name}`);
      for (const e of errs) {
        console.log(`    - ${e}`);
        issues.push(`[${fx.name}] ${e}`);
      }
      console.log(`    sourceText="${payload.sourceText}"`);
    }
  }

  console.log(`\n结果: ${pass} 通过 / ${fail} 失败 / 共 ${FIXTURES.length}`);
  if (fail > 0) {
    console.log('问题清单:');
    issues.forEach((i) => console.log('  -', i));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
