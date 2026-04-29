import { describe, expect, it, vi } from 'vitest';
import { refreshSnapshots } from './snapshotRefresh';

describe('refreshSnapshots', () => {
  it('returns an explicit error when a configured source fails', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('network blocked'));
    const result = await refreshSnapshots({ fetcher });

    expect(result.ok).toBe(false);
    expect(result.message).toContain('network blocked');
  });

  it('returns an explicit error when the reference source responds with a non-ok status', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: vi.fn(),
    });
    const result = await refreshSnapshots({ fetcher });

    expect(result.ok).toBe(false);
    expect(result.message).toContain('HTTP 503');
  });

  it('returns an explicit error when the reference source cannot be parsed', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(new Error('invalid json')),
    });
    const result = await refreshSnapshots({ fetcher });

    expect(result.ok).toBe(false);
    expect(result.message).toContain('invalid json');
  });

  it('returns success metadata when the reference source is reachable and parseable', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ pokemon: {} }),
    });
    const result = await refreshSnapshots({ fetcher });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(result.message);
    }
    expect(result.message).toBe('Reference source reachable. Local snapshot kept for this V1 session.');
    expect(result.importedAt).toEqual(expect.any(String));
  });
});
