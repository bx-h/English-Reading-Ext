import { describe, expect, it } from 'vitest';

import manifest from './manifest.config';

describe('extension action', () => {
  it('opens the settings page from the Safari toolbar', () => {
    expect(manifest.action?.default_popup).toBe('src/options/index.html');
  });
});
