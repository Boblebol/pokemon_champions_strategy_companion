import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

async function renderAppRoute(path = '/app') {
  window.history.pushState({}, '', path);
  const result = render(<App />);
  await screen.findByLabelText(/application mobile champions/i, undefined, { timeout: 5000 });
  return result;
}

async function renderLandingPage() {
  window.history.pushState({}, '', '/landing');
  const result = render(<App />);
  await screen.findByLabelText(/présentation marketing/i, undefined, { timeout: 5000 });
  return result;
}

async function renderDocsPage() {
  window.history.pushState({}, '', '/docs');
  const result = render(<App />);
  await screen.findByLabelText(/documentation/i, undefined, { timeout: 5000 });
  return result;
}

async function openBuildTab(user: ReturnType<typeof userEvent.setup>) {
  const nav = screen.getByRole('navigation', { name: /navigation mobile tactile/i });
  await user.click(within(nav).getByRole('button', { name: /^build$/i }));
  expect(await screen.findByText(/roster showdown champions/i, undefined, { timeout: 5000 })).toBeInTheDocument();
}

async function openMatchTab(user: ReturnType<typeof userEvent.setup>) {
  const nav = screen.getByRole('navigation', { name: /navigation mobile tactile/i });
  await user.click(within(nav).getByRole('button', { name: /^match$/i }));
  expect(await screen.findByRole('heading', { name: /match rapide/i }, { timeout: 5000 })).toBeInTheDocument();
}

async function selectPickerOption(
  user: ReturnType<typeof userEvent.setup>,
  label: RegExp,
  query: string,
  optionName: RegExp,
) {
  const input = screen.getByLabelText(label);
  await user.clear(input);
  await user.type(input, query);
  await user.click(await screen.findByRole('option', { name: optionName }, { timeout: 5000 }));
}

describe('App', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('opens the touch-first app on the app route', async () => {
    await renderAppRoute('/app');

    expect(screen.getByLabelText(/application mobile champions/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/cockpit d'analyse/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /desktop/i })).not.toBeInTheDocument();
  });

  it('keeps the mobile route as a compatibility alias', async () => {
    await renderAppRoute('/mobile');

    expect(screen.getByLabelText(/application mobile champions/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /champions mobile/i })).toBeInTheDocument();
  });

  it('renders the local root route as the touch-first app in development', async () => {
    await renderAppRoute('/');

    expect(screen.getByLabelText(/application mobile champions/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/présentation marketing/i)).not.toBeInTheDocument();
  });

  it('renders a marketing landing page with a single app entry point', async () => {
    await renderLandingPage();

    const landing = screen.getByLabelText(/présentation marketing/i);
    const pageNav = within(landing).getByRole('navigation', { name: /navigation principale/i });
    expect(within(pageNav).getByRole('link', { name: /^app$/i })).toHaveAttribute('href', '/app');
    expect(within(pageNav).queryByRole('link', { name: /^mobile$/i })).not.toBeInTheDocument();
    expect(within(landing).getAllByRole('link', { name: /ouvrir l'app/i })[0]).toHaveAttribute('href', '/app');
    expect(within(landing).queryByText(/ouvrir l'app desktop/i)).not.toBeInTheDocument();
    expect(within(landing).queryByText(/ouvrir l'app mobile/i)).not.toBeInTheDocument();
    expect(within(landing).getByRole('link', { name: /ouvrir la doc/i })).toHaveAttribute('href', '/docs');
  });

  it('renders documentation with one app CTA', async () => {
    await renderDocsPage();

    const docs = screen.getByLabelText(/documentation/i);
    expect(within(docs).getByRole('heading', { name: /documentation champions companion/i })).toBeInTheDocument();
    expect(within(docs).getByRole('link', { name: /ouvrir l'app/i })).toHaveAttribute('href', '/app');
    expect(within(docs).queryByText(/ouvrir l'app desktop/i)).not.toBeInTheDocument();
    expect(within(docs).queryByText(/ouvrir l'app mobile/i)).not.toBeInTheDocument();
    expect(within(docs).getByText(/navigation tactile par écrans/i)).toBeInTheDocument();
  });

  it('shows creator and repository links in the app', async () => {
    await renderAppRoute();

    const projectInfo = screen.getByLabelText(/infos projet et créateur/i);
    expect(within(projectInfo).getByText(/alexandre enouf/i)).toBeInTheDocument();
    expect(within(projectInfo).getByRole('link', { name: /site perso/i })).toHaveAttribute(
      'href',
      'https://alexandre-enouf.fr',
    );
    expect(within(projectInfo).getByRole('link', { name: /repo github/i })).toHaveAttribute(
      'href',
      'https://github.com/Boblebol/pokemon_champions_strategy_companion',
    );
  });

  it('starts as a four-step assistant with an empty team ready to build', async () => {
    await renderAppRoute();

    const nav = screen.getByRole('navigation', { name: /navigation mobile tactile/i });
    expect(within(nav).getByRole('button', { name: /^team$/i })).toHaveAttribute('aria-pressed', 'true');
    expect(within(nav).getByRole('button', { name: /^build$/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /^actifs$/i })).toBeInTheDocument();
    expect(within(nav).getByRole('button', { name: /^match$/i })).toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: /données/i })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: /^combat$/i })).not.toBeInTheDocument();
    expect(within(nav).queryByRole('button', { name: /analyse/i })).not.toBeInTheDocument();

    expect(screen.getByRole('heading', { name: /gérer la team/i })).toBeInTheDocument();
    expect(screen.getByText(/team vide prête/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sauvegardes locales/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /créer une team vide/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /exporter l'équipe/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1v1 actif/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /2v2 actif/i })).toBeInTheDocument();
    expect(screen.getAllByText(/0\/3 actifs prêts/i).length).toBeGreaterThan(0);
  });

  it('auto-fills active picks while building and opens match without requiring six filled slots', async () => {
    const user = userEvent.setup();
    await renderAppRoute();
    await openBuildTab(user);

    await selectPickerOption(user, /slot 1 pokémon/i, 'Dracolosse', /Dracolosse/i);
    await user.click(screen.getByRole('button', { name: /modifier slot 2/i }));
    await selectPickerOption(user, /slot 2 pokémon/i, 'Carchacrok', /Carchacrok/i);
    await user.click(screen.getByRole('button', { name: /modifier slot 3/i }));
    await selectPickerOption(user, /slot 3 pokémon/i, 'Kangourex', /Kangourex/i);

    await user.click(screen.getByRole('button', { name: /^actifs$/i }));

    expect(screen.getByText(/3\/3 actifs prêts/i)).toBeInTheDocument();
    expect(screen.getByText(/dracolosse, carchacrok, kangourex/i)).toBeInTheDocument();

    await openMatchTab(user);

    expect(await screen.findByRole('heading', { name: /^combat$/i }, { timeout: 5000 })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /couverture rapide/i })).toBeInTheDocument();
    expect(screen.getAllByText(/joués : dracolosse, carchacrok, kangourex/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /adversaires fréquents dangereux/i })).toBeInTheDocument();
  }, 15000);

  it('switches between mobile screens with the tabbar', async () => {
    const user = userEvent.setup();
    await renderAppRoute();

    const nav = screen.getByRole('navigation', { name: /navigation mobile tactile/i });
    expect(within(nav).getByRole('button', { name: /^team$/i })).toHaveAttribute('aria-pressed', 'true');

    await user.click(within(nav).getByRole('button', { name: /^build$/i }));
    expect(await screen.findByRole('heading', { name: /build rapide/i })).toBeInTheDocument();

    await user.click(within(nav).getByRole('button', { name: /^actifs$/i }));
    expect(await screen.findByRole('heading', { name: /actifs du match/i })).toBeInTheDocument();

    await user.click(within(nav).getByRole('button', { name: /^match$/i }));
    expect(await screen.findByRole('heading', { name: /match rapide/i })).toBeInTheDocument();
  });

  it('switches picker display and search between French and English', async () => {
    const user = userEvent.setup();
    await renderAppRoute();
    await openBuildTab(user);

    await selectPickerOption(user, /slot 1 pokémon/i, 'Kangourex', /Kangourex/i);
    expect(screen.queryByText(/Kangourex \(Kangaskhan\)/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^EN$/i }));
    await selectPickerOption(user, /slot 1 pokémon/i, 'Kangaskhan', /Kangaskhan/i);
    expect(screen.getAllByText(/^Kangaskhan$/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Kangourex \(Kangaskhan\)/i)).not.toBeInTheDocument();
  }, 10000);

  it('searches moves from the selected Pokemon and shows battle metadata', async () => {
    const user = userEvent.setup();
    await renderAppRoute();
    await openBuildTab(user);

    await selectPickerOption(user, /slot 1 pokémon/i, 'Dracolosse', /Dracolosse/i);
    await user.click(screen.getByRole('button', { name: /modifier slot 2/i }));
    await selectPickerOption(user, /slot 2 pokémon/i, 'Carchacrok', /Carchacrok/i);

    const moveInput = screen.getByLabelText(/slot 2 attaque 1/i);
    await user.clear(moveInput);
    await user.type(moveInput, 'Séisme');

    const earthquake = await screen.findByRole('option', { name: /séisme/i });
    expect(within(earthquake).getByText(/^Sol$/i)).toBeInTheDocument();
    expect(within(earthquake).getByText(/^Physique$/i)).toBeInTheDocument();
    expect(within(earthquake).getByText(/^STAB$/i)).toBeInTheDocument();
    expect(within(earthquake).getByText(/puissance\s+100/i)).toBeInTheDocument();
    expect(within(earthquake).getByText(/précision\s+100/i)).toBeInTheDocument();
    expect(within(earthquake).getByText(/pp\s+10/i)).toBeInTheDocument();

    await user.click(earthquake);

    await user.click(screen.getByRole('button', { name: /^team$/i }));
    const exportLink = screen.getByRole('link', { name: /exporter l'équipe/i });
    expect(decodeURIComponent(exportLink.getAttribute('href') ?? '')).toContain('- Earthquake');
  }, 10000);

  it('keeps advanced build fields folded behind details by default', async () => {
    const user = userEvent.setup();
    await renderAppRoute();
    await openBuildTab(user);

    expect(screen.queryByLabelText(/slot 1 ev hp/i)).not.toBeInTheDocument();

    await user.click(screen.getByText(/détails du slot/i));

    expect(screen.getByLabelText(/slot 1 ev hp/i)).toBeInTheDocument();
  });

  it('saves, loads, deletes and exports teams from local browser storage', async () => {
    const user = userEvent.setup();
    await renderAppRoute();

    await user.click(screen.getByRole('button', { name: /^build$/i }));
    await selectPickerOption(user, /slot 1 pokémon/i, 'Dracolosse', /Dracolosse/i);
    await user.click(screen.getByRole('button', { name: /^team$/i }));

    await user.type(screen.getByLabelText(/nom de sauvegarde/i), 'Ladder BO1');
    await user.click(screen.getByRole('button', { name: /sauvegarder l'équipe/i }));

    expect(screen.getByText(/équipe sauvegardée localement/i)).toBeInTheDocument();
    expect(within(screen.getByLabelText(/sauvegardes locales/i)).getByText(/^Ladder BO1$/i)).toBeInTheDocument();

    const teamExportLink = screen.getByRole('link', { name: /exporter l'équipe/i });
    expect(teamExportLink).toHaveAttribute('download', 'pokemon-champions-team.txt');
    expect(decodeURIComponent(teamExportLink.getAttribute('href') ?? '')).toContain('Dragonite');

    await user.click(screen.getByRole('button', { name: /charger Ladder BO1/i }));
    expect(await screen.findByRole('heading', { name: /build rapide/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^team$/i }));

    await user.click(screen.getByRole('button', { name: /supprimer Ladder BO1/i }));
    expect(screen.getByText(/aucune équipe sauvegardée/i)).toBeInTheDocument();
  });

  it('filters saved teams by search before loading', async () => {
    const user = userEvent.setup();
    await renderAppRoute();

    await user.click(screen.getByRole('button', { name: /^build$/i }));
    await selectPickerOption(user, /slot 1 pokémon/i, 'Dracolosse', /Dracolosse/i);
    await user.click(screen.getByRole('button', { name: /^team$/i }));
    await user.type(screen.getByLabelText(/nom de sauvegarde/i), 'Ladder BO1');
    await user.click(screen.getByRole('button', { name: /sauvegarder l'équipe/i }));

    await user.click(screen.getByRole('button', { name: /créer une team vide/i }));
    await selectPickerOption(user, /slot 1 pokémon/i, 'Kangourex', /Kangourex/i);
    await user.click(screen.getByRole('button', { name: /^team$/i }));
    await user.type(screen.getByLabelText(/nom de sauvegarde/i), 'Casual test');
    await user.click(screen.getByRole('button', { name: /sauvegarder l'équipe/i }));

    await user.type(screen.getByLabelText(/rechercher une sauvegarde/i), 'ladder');

    expect(within(screen.getByLabelText(/sauvegardes locales/i)).getByText(/^Ladder BO1$/i)).toBeInTheDocument();
    expect(within(screen.getByLabelText(/sauvegardes locales/i)).queryByText(/^Casual test$/i)).not.toBeInTheDocument();
  }, 15000);

  it('exports a markdown analysis report from the match screen', async () => {
    const user = userEvent.setup();
    await renderAppRoute();
    await openMatchTab(user);

    const exportLink = screen.getByRole('link', { name: /exporter l'analyse/i });
    expect(exportLink).toHaveAttribute('download', 'pokemon-champions-analyse.md');
    const decodedReport = decodeURIComponent(exportLink.getAttribute('href') ?? '');
    expect(decodedReport).toContain('# Rapport Champions Companion');
    expect(decodedReport).toContain('Dracolosse');
    expect(decodedReport).toContain('Menaces frequentes');
  });
});
