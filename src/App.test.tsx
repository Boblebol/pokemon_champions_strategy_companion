import { render, screen } from '@testing-library/react';
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

  it('parses a pasted team and displays threats', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText(/équipe showdown/i));
    await user.type(
      screen.getByLabelText(/équipe showdown/i),
      `Garchomp @ Rocky Helmet{enter}Ability: Rough Skin{enter}- Earthquake{enter}- Stealth Rock`,
    );

    expect(await screen.findByText('Garchomp')).toBeInTheDocument();
    expect(screen.getByText(/Great Tusk|Kingambit|Corviknight/)).toBeInTheDocument();
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
