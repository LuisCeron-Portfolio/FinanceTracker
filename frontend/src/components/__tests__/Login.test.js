import React from 'react';
import { render, screen } from '@testing-library/react';
import Login from '../Login';

test('renders login page heading', () => {
  render(<Login />);
  const headingElement = screen.getByText(/Login Page/i);
  expect(headingElement).toBeInTheDocument();
});
