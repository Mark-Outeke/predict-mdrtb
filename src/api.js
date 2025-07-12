export const fetchDHIS2Instances = jest.fn(() => Promise.resolve([
    { id: 1, attributes: { someAttribute: 'value' } },
    { id: 2, attributes: { anotherAttribute: 'differentValue' } },
  ]));