import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the V1 dashboard regions', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /strategy companion/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/format/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/showdown paste/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /team audit/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /meta threats/i })).toBeInTheDocument();
  });

  it('parses a pasted team and displays threats', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText(/showdown paste/i));
    await user.type(
      screen.getByLabelText(/showdown paste/i),
      `Garchomp @ Rocky Helmet{enter}Ability: Rough Skin{enter}- Earthquake{enter}- Stealth Rock`,
    );

    expect(await screen.findByText('Garchomp')).toBeInTheDocument();
    expect(screen.getByText(/Great Tusk|Kingambit|Corviknight/)).toBeInTheDocument();
  });
});
