import { describe, expect, it, vi } from 'vitest';
import { refreshSnapshots } from './snapshotRefresh';

describe('refreshSnapshots', () => {
  it('returns an explicit error when a configured source fails', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('network blocked'));
    const result = await refreshSnapshots({ fetcher: fetcher as unknown as typeof fetch });

    expect(result.ok).toBe(false);
    expect(result.message).toContain('network blocked');
  });
});
