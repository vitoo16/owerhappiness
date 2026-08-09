import { validateBlockContent } from '@portfolio/contracts';

describe('case study block schemas', () => {
  it('accepts a semantic heading block', () => {
    expect(validateBlockContent('HEADING', { level: 2, text: 'Problem' }).success).toBe(true);
  });
  it('rejects executable/unknown block shapes', () => {
    expect(validateBlockContent('CODE', { language: 'ts', code: '' }).success).toBe(false);
  });
});
