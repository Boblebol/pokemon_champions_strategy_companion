export function SnapshotStatus({
  label,
  source,
  onRefresh,
  refreshMessage,
}: {
  label: string;
  source: string;
  onRefresh: () => void;
  refreshMessage?: string;
}) {
  return (
    <section className="snapshot-status" aria-label="Snapshot status">
      <div>
        <strong>{label}</strong>
        <span>{source}</span>
      </div>
      <button type="button" onClick={onRefresh}>
        Update
      </button>
      {refreshMessage ? <p>{refreshMessage}</p> : null}
    </section>
  );
}
