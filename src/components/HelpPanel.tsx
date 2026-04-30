export function HelpPanel() {
  return (
    <section className="panel help-panel">
      <h2>Aides rapides</h2>
      <article>
        <strong>Assistant de départ</strong>
        <p>Il est repliable : masque-le une fois le flux compris, puis rouvre-le depuis le bandeau compact.</p>
      </article>
      <article>
        <strong>Combat</strong>
        <p>Choisis un ou deux adversaires pour comparer dégâts sortants, dégâts entrants, boosts, météo et protections.</p>
      </article>
      <article>
        <strong>Score de menace</strong>
        <p>Le score combine usage méta, pression super efficace sur ton équipe et résistances défensives.</p>
      </article>
      <article>
        <strong>Données live</strong>
        <p>Le bouton de mise à jour tente Smogon. Si le réseau bloque, le snapshot démo local reste actif.</p>
      </article>
      <article>
        <strong>Limites calcul</strong>
        <p>Les IV ne sont pas encore éditables dans le constructeur ; vérifie les cas très spécifiques sur Showdown.</p>
      </article>
    </section>
  );
}
