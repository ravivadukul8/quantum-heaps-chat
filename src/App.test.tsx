import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Scaffolding Test', () => {
  it('renders the application headline', () => {
    render(<App />);
    expect(screen.getByText(/Quantum Heaps Chat/i)).toBeInTheDocument();
  });
});
