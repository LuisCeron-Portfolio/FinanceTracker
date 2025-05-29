import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import Login from '../Login';
import '@testing-library/jest-dom/extend-expect';

test('renders login page heading', () => {
  act(() => {
    render(<Login />);
  });
  const headingElement = screen.getByText(/Login Page/i);
  expect(headingElement).toBeInTheDocument();
});
