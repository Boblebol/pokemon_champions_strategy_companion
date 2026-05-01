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
        <p>Choisis un ou deux adversaires pour comparer les dégâts que tu fais et ceux que tu peux recevoir.</p>
      </article>
      <article>
        <strong>Adversaire dangereux</strong>
        <p>Le score monte si un Pokémon est souvent joué, touche ton équipe fort ou encaisse bien tes attaques.</p>
      </article>
      <article>
        <strong>Données à jour</strong>
        <p>Le bouton de mise à jour tente Smogon. Si le réseau bloque, les données locales restent disponibles.</p>
      </article>
      <article>
        <strong>Limites du calcul</strong>
        <p>Les IV ne sont pas encore éditables dans le constructeur ; vérifie les cas très spécifiques sur Showdown.</p>
      </article>
    </section>
  );
}
