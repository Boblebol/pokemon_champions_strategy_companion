import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PwaStatus } from './PwaStatus';

describe('PwaStatus', () => {
  it('shows installable local-first copy when online', () => {
    render(<PwaStatus isOnline />);

    expect(screen.getByLabelText(/statut pwa/i)).toBeInTheDocument();
    expect(screen.getByText(/installable sans store/i)).toBeInTheDocument();
    expect(screen.getByText(/mode en ligne/i)).toBeInTheDocument();
  });

  it('shows an offline fallback message when offline', () => {
    render(<PwaStatus isOnline={false} />);

    expect(screen.getByText(/hors ligne/i)).toBeInTheDocument();
    expect(screen.getByText(/données locales conservées/i)).toBeInTheDocument();
  });
});
