export type RefreshResult =
  | { ok: true; message: string; importedAt: string }
  | { ok: false; message: string };

export type SnapshotRefreshFetcher = (input: string) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

export async function refreshSnapshots({
  fetcher = fetch,
}: {
  fetcher?: SnapshotRefreshFetcher;
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
