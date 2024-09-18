// App.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App'; // Assuming App.js is in the same directory

jest.mock('./api', () => ({
  fetchDHIS2Instances: jest.fn(() => Promise.resolve([
    { id: 1, attributes: { someAttribute: 'value' } },
    { id: 2, attributes: { anotherAttribute: 'differentValue' } },
  ])),
  fetchPrediction: jest.fn((features) => Promise.resolve(0.75)), // Mock prediction logic
}));

test('renders a table with instance data and predicted scores', async () => {
  await render(<App />);

  // Assertions for instance data
  const instanceRows = screen.getAllByRole('row');
  expect(instanceRows.length).toBe(2); // Two instances mocked

  // Assertions for scores (if applicable)
  const scoreElements = screen.getAllByText(/Score/i); // Match text "Score" (case-insensitive)
  expect(scoreElements.length).toBe(2); // Two scores for two instances

  // More specific assertions based on your data structure and expected output
});