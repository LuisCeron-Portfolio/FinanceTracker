import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

describe('Integration tests for FinanceTracker app', () => {
  test('User can login and see dashboard', async () => {
    render(<App />);
    // Simulate user login
    userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    userEvent.type(screen.getByLabelText(/password/i), 'password');
    userEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for dashboard to appear
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });

  test('User can navigate to transactions and see list', async () => {
    render(<App />);
    // Assume user is logged in for this test or mock login state

    // Navigate to transactions page
    userEvent.click(screen.getByRole('link', { name: /transactions/i }));

    // Wait for transactions heading
    await waitFor(() => {
      expect(screen.getByText(/transactions/i)).toBeInTheDocument();
    });

    // Additional assertions for transaction list can be added here
  });

  // Additional integration tests for budgets, goals, reports, alerts, bank sync can be added here
});
