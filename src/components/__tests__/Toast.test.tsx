import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Toast from '../ui/Toast';

// Mock timers for testing auto-dismiss
jest.useFakeTimers();

describe('Toast', () => {
  const mockOnClose = jest.fn();
  const defaultToast = {
    id: 'test-toast',
    type: 'info' as const,
    title: 'Test Toast',
    message: 'Test message'
  };

  beforeEach(() => {
    mockOnClose.mockClear();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  it('should render toast with title and message', () => {
    render(<Toast toast={defaultToast} onClose={mockOnClose} />);
    
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should render toast with only title when no message', () => {
    const toast = { ...defaultToast, message: undefined };
    render(<Toast toast={toast} onClose={mockOnClose} />);
    
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<Toast toast={defaultToast} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('Close notification');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledWith('test-toast');
  });

  it('should auto-dismiss after default duration', () => {
    render(<Toast toast={defaultToast} onClose={mockOnClose} />);
    
    // Fast forward time by 5 seconds (default duration)
    jest.advanceTimersByTime(5000);
    
    expect(mockOnClose).toHaveBeenCalledWith('test-toast');
  });

  it('should auto-dismiss after custom duration', () => {
    const toast = { ...defaultToast, duration: 3000 };
    render(<Toast toast={toast} onClose={mockOnClose} />);
    
    // Fast forward time by 3 seconds
    jest.advanceTimersByTime(3000);
    
    expect(mockOnClose).toHaveBeenCalledWith('test-toast');
  });

  it('should not auto-dismiss when duration is 0', () => {
    const toast = { ...defaultToast, duration: 0 };
    render(<Toast toast={toast} onClose={mockOnClose} />);
    
    // Fast forward time
    jest.advanceTimersByTime(10000);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  describe('toast types and styling', () => {
    it('should render success toast with correct styling', () => {
      const toast = { ...defaultToast, type: 'success' as const };
      render(<Toast toast={toast} onClose={mockOnClose} />);
      
      const toastElement = screen.getByText('Test Toast').closest('div');
      expect(toastElement).toHaveClass('bg-green-800', 'border-green-600', 'text-green-100');
    });

    it('should render error toast with correct styling', () => {
      const toast = { ...defaultToast, type: 'error' as const };
      render(<Toast toast={toast} onClose={mockOnClose} />);
      
      const toastElement = screen.getByText('Test Toast').closest('div');
      expect(toastElement).toHaveClass('bg-red-800', 'border-red-600', 'text-red-100');
    });

    it('should render warning toast with correct styling', () => {
      const toast = { ...defaultToast, type: 'warning' as const };
      render(<Toast toast={toast} onClose={mockOnClose} />);
      
      const toastElement = screen.getByText('Test Toast').closest('div');
      expect(toastElement).toHaveClass('bg-yellow-800', 'border-yellow-600', 'text-yellow-100');
    });

    it('should render info toast with correct styling', () => {
      const toast = { ...defaultToast, type: 'info' as const };
      render(<Toast toast={toast} onClose={mockOnClose} />);
      
      const toastElement = screen.getByText('Test Toast').closest('div');
      expect(toastElement).toHaveClass('bg-blue-800', 'border-blue-600', 'text-blue-100');
    });
  });

  describe('icons', () => {
    it('should render success icon for success toast', () => {
      const toast = { ...defaultToast, type: 'success' as const };
      render(<Toast toast={toast} onClose={mockOnClose} />);
      
      // Check for checkmark path in success icon
      const icon = screen.getByText('Test Toast').parentElement?.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-green-400');
    });

    it('should render error icon for error toast', () => {
      const toast = { ...defaultToast, type: 'error' as const };
      render(<Toast toast={toast} onClose={mockOnClose} />);
      
      const icon = screen.getByText('Test Toast').parentElement?.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-red-400');
    });

    it('should render warning icon for warning toast', () => {
      const toast = { ...defaultToast, type: 'warning' as const };
      render(<Toast toast={toast} onClose={mockOnClose} />);
      
      const icon = screen.getByText('Test Toast').parentElement?.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-yellow-400');
    });

    it('should render info icon for info toast', () => {
      const toast = { ...defaultToast, type: 'info' as const };
      render(<Toast toast={toast} onClose={mockOnClose} />);
      
      const icon = screen.getByText('Test Toast').parentElement?.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('text-blue-400');
    });
  });

  it('should be accessible', () => {
    render(<Toast toast={defaultToast} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('Close notification');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute('aria-label', 'Close notification');
  });
});