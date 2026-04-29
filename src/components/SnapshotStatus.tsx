export function SnapshotStatus({
  label,
  source,
  onRefresh,
  refreshMessage,
  isRefreshing = false,
}: {
  label: string;
  source: string;
  onRefresh: () => void;
  refreshMessage?: string;
  isRefreshing?: boolean;
}) {
  return (
    <section className="snapshot-status" aria-label="Statut des données">
      <div>
        <strong>{label}</strong>
        <span>{source}</span>
      </div>
      <button type="button" onClick={onRefresh} disabled={isRefreshing}>
        {isRefreshing ? 'Mise à jour...' : 'Mettre à jour'}
      </button>
      {refreshMessage ? <p>{refreshMessage}</p> : null}
    </section>
  );
}
