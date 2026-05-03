import { describe, expect, it, vi } from 'vitest';
import { buildPokeApiCsvUrl, fetchCsv, parseCsv } from './fetch-poke-assets.mjs';

function responseFromText(text, { ok = true, status = 200, statusText = 'OK', headers = {} } = {}) {
  return {
    ok,
    status,
    statusText,
    headers: {
      get(name) {
        return headers[name.toLowerCase()];
      },
    },
    text: vi.fn().mockResolvedValue(text),
  };
}

describe('fetch-poke-assets helpers', () => {
  it('builds PokeAPI CSV URLs from a pinned ref', () => {
    expect(buildPokeApiCsvUrl('pokemon.csv', 'abc123')).toBe(
      'https://raw.githubusercontent.com/PokeAPI/pokeapi/abc123/data/v2/csv/pokemon.csv',
    );
  });

  it('parses quoted CSV fields', () => {
    expect(parseCsv('id,name\n1,"Farfetch\'d, Kanto"\n')).toEqual([
      {
        id: '1',
        name: "Farfetch'd, Kanto",
      },
    ]);
  });

  it('rejects CSV files missing required headers', async () => {
    const fetcher = vi.fn().mockResolvedValue(responseFromText('id,identifier\n1,bulbasaur\n'));

    await expect(fetchCsv('pokemon.csv', { fetcher, ref: 'test-ref' })).rejects.toThrow(
      /pokemon\.csv missing required header species_id/i,
    );
  });

  it('rejects CSV payloads larger than the byte limit', async () => {
    const text = `id,identifier,species_id\n1,${'a'.repeat(64)},1\n`;
    const fetcher = vi.fn().mockResolvedValue(responseFromText(text));

    await expect(fetchCsv('pokemon.csv', { fetcher, maxBytes: 20 })).rejects.toThrow(/pokemon\.csv is too large/i);
  });

  it('aborts slow CSV fetches with a timeout signal', async () => {
    let receivedSignal;
    const fetcher = vi.fn((_url, init) => {
      receivedSignal = init.signal;
      return new Promise((_resolve, reject) => {
        init.signal.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });

    await expect(fetchCsv('pokemon.csv', { fetcher, timeoutMs: 1 })).rejects.toThrow(/timed out/i);
    expect(receivedSignal.aborted).toBe(true);
  });
});
