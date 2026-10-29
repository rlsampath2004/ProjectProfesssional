import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Kothari Distributors executive dashboard', () => {
  render(<App />);
  const titleElements = screen.getAllByText(/Kothari Distributors/i);
  expect(titleElements.length).toBeGreaterThan(0);
});
