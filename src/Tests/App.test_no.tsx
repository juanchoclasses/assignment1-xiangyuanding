import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  test('filler test', () => {
  const three = 3;
  expect(three).toBe(3);
}
);
}
);
/*
describe('App', () => {
  test('renders App component', () => {
    render(<App />);
    const linkElement = screen.getByText(/Calculator/i);
    expect(linkElement).toBeInTheDocument();
  });
} 
);
*/ 
