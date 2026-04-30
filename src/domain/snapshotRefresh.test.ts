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
      json: vi.fn().mockResolvedValue({
        info: {
          metagame: 'gen9bssregi',
          cutoff: 1760,
          'number of battles': 27977,
        },
        data: {
          Dragonite: {
            usage: 31.4,
            Moves: {
              extremespeed: 77.2,
              earthquake: 41.8,
            },
          },
          Kingambit: {
            usage: 25.6,
            Moves: {
              suckerpunch: 88.1,
            },
          },
        },
      }),
    });
    const result = await refreshSnapshots({ fetcher, format: 'champions-bss' });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(result.message);
    }
    expect(result.message).toBe('Données Smogon 2026-03 importées pour Champions 3v3.');
    expect(result.importedAt).toEqual(expect.any(String));
    expect(result.snapshot.entries).toEqual([
      {
        rank: 1,
        species: 'Dragonite',
        usage: 31.4,
        commonMoves: ['extremespeed', 'earthquake'],
      },
      {
        rank: 2,
        species: 'Kingambit',
        usage: 25.6,
        commonMoves: ['suckerpunch'],
      },
    ]);
    expect(result.snapshot.battleCount).toBe(27977);
    expect(fetcher).toHaveBeenCalledWith(
      'https://www.smogon.com/stats/2026-03/chaos/gen9bssregi-1760.json',
    );
  });

  it('can fetch through the local Vite proxy while keeping the Smogon source URL', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        info: {
          metagame: 'gen9nationaldex',
          cutoff: 1760,
          'number of battles': 100,
        },
        data: {
          'Great Tusk': {
            usage: 0.352,
            Moves: {
              earthquake: 90,
            },
          },
        },
      }),
    });

    const result = await refreshSnapshots({ fetcher, format: 'champions-ou', useProxy: true });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error(result.message);
    }
    expect(fetcher).toHaveBeenCalledWith('/smogon-stats/stats/2026-03/chaos/gen9nationaldex-1760.json');
    expect(result.snapshot.entries[0].usage).toBeCloseTo(35.2);
    expect(result.snapshot.source).toBe(
      'https://www.smogon.com/stats/2026-03/chaos/gen9nationaldex-1760.json',
    );
  });
});
