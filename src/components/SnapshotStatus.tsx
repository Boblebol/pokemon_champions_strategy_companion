export function SnapshotStatus({
  id,
  label,
  source,
  onRefresh,
  refreshMessage,
  isRefreshing = false,
}: {
  id?: string;
  label: string;
  source: string;
  onRefresh: () => void;
  refreshMessage?: string;
  isRefreshing?: boolean;
}) {
  return (
    <section className="snapshot-status" id={id} aria-label="Statut des données">
      <div>
        <strong>{label}</strong>
        <span>{source}</span>
      </div>
      <button type="button" onClick={onRefresh} disabled={isRefreshing}>
        {isRefreshing ? 'Mise à jour...' : 'Mettre à jour'}
      </button>
      {refreshMessage ? (
        <p role="status" aria-live="polite">
          {refreshMessage}
        </p>
      ) : null}
    </section>
  );
}
