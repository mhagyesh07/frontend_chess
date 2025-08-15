import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome page when not authenticated', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/Chess Game/i);
  expect(welcomeElement).toBeInTheDocument();
  
  const loginButton = screen.getByText(/Sign In/i);
  expect(loginButton).toBeInTheDocument();
});
