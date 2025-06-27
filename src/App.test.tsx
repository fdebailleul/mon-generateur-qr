import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders generate button', () => {
  render(<App />);
  const btn = screen.getByText(/generate/i);
  expect(btn).toBeInTheDocument();
});
