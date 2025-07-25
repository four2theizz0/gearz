/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductContactForm from '../ProductContactForm';
import { ToastContainer } from '../ui/ToastContainer';

// Mock fetch
global.fetch = jest.fn();

const mockProps = {
  productId: 'test-id',
  productName: 'Test Product',
  productPrice: 100,
  formType: 'question' as const,
  onClose: jest.fn(),
};

describe('ProductContactForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });
  });

  it('renders question form correctly', () => {
    render(
      <div>
        <ProductContactForm {...mockProps} />
        <ToastContainer />
      </div>
    );

    expect(screen.getByText('Ask a Question')).toBeDefined();
    expect(screen.getByText('What would you like to know?')).toBeDefined();
    expect(screen.getByDisplayValue('Test Product')).toBeDefined();
  });

  it('renders purchase form correctly', () => {
    render(
      <div>
        <ProductContactForm {...mockProps} formType="purchase" />
        <ToastContainer />
      </div>
    );

    expect(screen.getByText('Purchase Request')).toBeDefined();
    expect(screen.getByText('Pickup Schedule')).toBeDefined();
  });

  it('validates required fields for question form', async () => {
    render(
      <div>
        <ProductContactForm {...mockProps} />
        <ToastContainer />
      </div>
    );

    const submitButton = screen.getByRole('button', { name: /send question/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid name/i)).toBeDefined();
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    render(
      <div>
        <ProductContactForm {...mockProps} />
        <ToastContainer />
      </div>
    );

    // Fill in invalid email
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/what would you like to know/i), { target: { value: 'Test question here' } });

    const submitButton = screen.getByRole('button', { name: /send question/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeDefined();
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it('validates phone number', async () => {
    render(
      <div>
        <ProductContactForm {...mockProps} />
        <ToastContainer />
      </div>
    );

    // Fill in short phone number
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/what would you like to know/i), { target: { value: 'Test question here' } });

    const submitButton = screen.getByRole('button', { name: /send question/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid phone number/i)).toBeDefined();
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it('validates question length', async () => {
    render(
      <div>
        <ProductContactForm {...mockProps} />
        <ToastContainer />
      </div>
    );

    // Fill in short question
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/what would you like to know/i), { target: { value: 'Short' } });

    const submitButton = screen.getByRole('button', { name: /send question/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a question \(at least 10 characters\)/i)).toBeDefined();
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it('submits valid form successfully', async () => {
    render(
      <div>
        <ProductContactForm {...mockProps} />
        <ToastContainer />
      </div>
    );

    // Fill in valid data
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/what would you like to know/i), { target: { value: 'This is a valid question that is long enough' } });

    const submitButton = screen.getByRole('button', { name: /send question/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/question-email', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('test@example.com'),
      }));
    });
  });
});