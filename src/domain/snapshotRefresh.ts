export type RefreshResult =
  | { ok: true; message: string; importedAt: string }
  | { ok: false; message: string };

export async function refreshSnapshots({
  fetcher = fetch,
}: {
  fetcher?: typeof fetch;
} = {}): Promise<RefreshResult> {
  try {
    const response = await fetcher('https://play.pokemonshowdown.com/data/pokedex.json');
    if (!response.ok) {
      return { ok: false, message: `Pokemon Showdown reference refresh failed with HTTP ${response.status}` };
    }

    await response.json();

    return {
      ok: true,
      message: 'Reference source reachable. Local snapshot kept for this V1 session.',
      importedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      ok: false,
      message: `Snapshot refresh failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
