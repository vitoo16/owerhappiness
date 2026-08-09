import { normalizeSlug } from './slug';

describe('normalizeSlug', () => {
  it('normalizes Vietnamese text deterministically', () => {
    expect(normalizeSlug('  Đồ Án Cá Nhân — 2026  ')).toBe('do-an-ca-nhan-2026');
  });
  it('removes unsafe URL characters', () => {
    expect(normalizeSlug('Hello / ../ world?')).toBe('hello-world');
  });
});
