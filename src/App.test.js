import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App'; // Replace with your actual component
import axios from 'axios';

jest.mock('axios');

test('renders a table with instance data and predicted scores', async () => {
  axios.get.mockImplementation((url) => {
    if (url.includes('/organisationUnits')) {
      return Promise.resolve({
        data: {
          organisationUnits: [
            { id: '1', name: 'Org 1' },
            { id: '2', name: 'Org 2' }
          ]
        }
      });
    }

    if (url.includes('/trackedEntityInstances')) {
      return Promise.resolve({
        data: {
          trackedEntityInstances: [
            { id: 't1', attributes: [], enrollments: [] },
            { id: 't2', attributes: [], enrollments: [] }
          ]
        }
      });
    }

    return Promise.reject(new Error('Unknown URL'));
  });

  render(<App />);

  // Wait for the rows to appear
  const instanceRows = await screen.findAllByRole('row');
  expect(instanceRows.length).toBe(3); // 1 header + 2 data rows
});
