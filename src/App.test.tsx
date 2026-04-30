import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the French graphical wizard and dashboard regions', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /assistant stratégique pokémon champions/i })).toBeInTheDocument();
    expect(screen.getByText(/1\s+format/i)).toBeInTheDocument();
    expect(screen.getByText(/2\s+équipe/i)).toBeInTheDocument();
    expect(screen.getByText(/3\s+analyse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/format champions/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/équipe showdown/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /audit d'équipe/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /menaces méta/i })).toBeInTheDocument();
  });

  it('renders contextual help for strategy and data freshness', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /aides rapides/i })).toBeInTheDocument();
    expect(screen.getByText(/score de menace/i)).toBeInTheDocument();
    expect(screen.getByText(/données live/i)).toBeInTheDocument();
  });

  it('renders a portfolio footer link', () => {
    render(<App />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /alexandre enouf/i })).toHaveAttribute(
      'href',
      'https://alexandre-enouf.fr',
    );
  });

  it('renders the integrated team builder controls', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /constructeur d'équipe/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/slot 1 pokémon/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/slot 1 attaque 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/slot 1 ev atk/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/commentaire slot 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/jouer slot 1/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /analyse sélection jouée/i })).toBeInTheDocument();
  });

  it('updates the roster from builder controls and exports the generated paste', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText(/slot 2 pokémon/i), 'Dragonite');
    await user.type(screen.getByLabelText(/slot 2 objet/i), 'Heavy-Duty Boots');
    await user.selectOptions(screen.getByLabelText(/slot 2 attaque 1/i), 'Extreme Speed');
    await user.clear(screen.getByLabelText(/slot 2 ev atk/i));
    await user.type(screen.getByLabelText(/slot 2 ev atk/i), '252');
    await user.type(screen.getByLabelText(/commentaire slot 2/i), 'Win condition prioritaire.');

    const paste = screen.getByLabelText(/équipe showdown/i) as HTMLTextAreaElement;
    expect(paste.value).toContain('Dragonite @ Heavy-Duty Boots');
    expect(paste.value).toContain('EVs: 252 Atk');
    expect(paste.value).not.toContain('Win condition');
    expect(await screen.findAllByText('Dragonite')).not.toHaveLength(0);
  });

  it('adapts match selection to Champions BSS pick 3', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText(/format champions/i), 'champions-bss');

    expect(screen.getAllByText(/sélection de match : 3 pokémon/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/sélection incomplète : choisis 3 pokémon/i)).toBeInTheDocument();
  });

  it('parses a pasted team and displays threats', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText(/équipe showdown/i));
    await user.type(
      screen.getByLabelText(/équipe showdown/i),
      `Garchomp @ Rocky Helmet{enter}Ability: Rough Skin{enter}- Earthquake{enter}- Stealth Rock`,
    );

    expect((await screen.findAllByText('Garchomp')).length).toBeGreaterThan(0);
    expect(screen.getByText(/joués : garchomp/i)).toBeInTheDocument();
    const threatPanel = screen.getByRole('heading', { name: /menaces méta/i }).closest('section');
    expect(threatPanel).not.toBeNull();
    expect(within(threatPanel as HTMLElement).getByText(/Great Tusk|Kingambit|Corviknight/)).toBeInTheDocument();
  });

  it('shows member parse warnings from pasted teams', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText(/équipe showdown/i));
    await user.type(
      screen.getByLabelText(/équipe showdown/i),
      `Garchomp @ Rocky Helmet{enter}Ability: Rough Skin{enter}Level: banana{enter}- Earthquake`,
    );

    expect(await screen.findByText('Niveau invalide dans la ligne : Level: banana')).toBeInTheDocument();
  });
});
