import { useMemo } from 'react';
import type { AnalysisResult } from '../domain/analysis';
import { buildAnalysisReport, reportDownloadHref } from '../domain/analysisReport';
import type { FormatId, ReferenceSnapshot } from '../domain/types';

export function AnalysisExport({
  analysis,
  reference,
  format,
}: {
  analysis: AnalysisResult;
  reference: ReferenceSnapshot;
  format: FormatId;
}) {
  const report = useMemo(() => buildAnalysisReport({ analysis, reference, format }), [analysis, reference, format]);
  const href = useMemo(() => reportDownloadHref(report), [report]);

  return (
    <section className="panel analysis-export" aria-label="Export d'analyse">
      <div>
        <h2>Rapport d'analyse</h2>
        <p>Génère un résumé Markdown local pour partager le plan de match, les alertes et le statut des données.</p>
      </div>
      <a className="team-file-action" href={href} download="pokemon-champions-analyse.md">
        Exporter l'analyse
      </a>
    </section>
  );
}
