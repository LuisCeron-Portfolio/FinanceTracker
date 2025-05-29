import React from 'react';
import { render, screen } from '@testing-library/react';
import Budgets from '../Budgets';

test('renders budgets heading', () => {
  render(<Budgets />);
  const headingElement = screen.getByText(/Budgets/i);
  expect(headingElement).toBeInTheDocument();
});

// Additional tests for budget list, creation, and error states can be added here
