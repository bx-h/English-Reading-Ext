import type { SourceScope } from '../src/types/index.ts';

export interface Sample {
  selectedText: string;
  sourceText: string;
  sourceScope: SourceScope;
  contextBefore?: string;
  contextAfter?: string;
}

/**
 * M0 评测样本：真实风格英语句/段 + 划词目标。
 * 覆盖一词多义、习语、短语动词、抽象名词、隐喻等，模拟博客/新闻/X 长文/原版书。
 */
export const SAMPLES: Sample[] = [
  {
    selectedText: 'broadening your skill set',
    sourceText:
      'You may even adopt the Anti AI ideology as your new identity, screaming "f*ck AI" so you can feel like you are making a difference without actually changing your behavior, broadening your skill set, or adapting to the new world.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'run',
    sourceText: 'The play had a successful run on Broadway for three years.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'figure out',
    sourceText: 'It took me a while to figure out how the new system actually works.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'bear',
    sourceText: 'I can hardly bear to watch the news these days.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'spell',
    sourceText: 'After a long cold spell, the weather finally turned warm.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'compromise',
    sourceText:
      'A single weak password can compromise the security of the entire network.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'tabled',
    sourceText:
      'The committee tabled the proposal until they could gather more data.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'sound',
    sourceText: 'She gave him some very sound advice about managing his finances.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'novel',
    sourceText:
      'The researchers proposed a novel approach to reducing carbon emissions.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'cut corners',
    sourceText:
      'If you cut corners during the testing phase, the bugs will surface later in production.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'draw',
    sourceText: 'The match ended in a draw after ninety minutes of play.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'address',
    sourceText:
      'The report fails to address the root causes of the housing crisis.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'fine',
    sourceText:
      'There is a fine line between confidence and arrogance in leadership.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'capital',
    sourceText:
      'Startups often struggle to raise enough capital in their first year.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'temper',
    sourceText:
      'He learned to temper his expectations after several failed launches.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'broke',
    sourceText: 'The scandal broke just days before the election.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'pressing',
    sourceText:
      'There are more pressing issues we need to deal with before the deadline.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'shed light on',
    sourceText:
      'The newly released documents shed light on how the decision was made.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'volume',
    sourceText:
      'The sheer volume of data made manual analysis completely impractical.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'champion',
    sourceText:
      'She has long been a champion of open-source software and digital rights.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'gave way',
    sourceText:
      'The old wooden bridge finally gave way under the weight of the truck.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'subtle',
    sourceText:
      'There are subtle differences between the two translations that change the meaning entirely.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'banking on',
    sourceText:
      'The company is banking on its new product to reverse three years of losses.',
    sourceScope: 'sentence',
  },
  {
    selectedText: 'render',
    sourceText:
      'The injury could render him unable to compete for the rest of the season.',
    sourceScope: 'sentence',
  },
];
