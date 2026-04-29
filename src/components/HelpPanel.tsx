export function HelpPanel() {
  return (
    <section className="panel help-panel">
      <h2>Aides rapides</h2>
      <article>
        <strong>Score de menace</strong>
        <p>Le score combine usage méta, pression super efficace sur ton équipe et résistances défensives.</p>
      </article>
      <article>
        <strong>Données live</strong>
        <p>Le bouton de mise à jour tente Smogon. Si le réseau bloque, le snapshot demo local reste actif.</p>
      </article>
      <article>
        <strong>Lecture de l'audit</strong>
        <p>Priorise les faiblesses empilées, puis ajoute couverture offensive, pivot ou contrôle vitesse.</p>
      </article>
    </section>
  );
}
