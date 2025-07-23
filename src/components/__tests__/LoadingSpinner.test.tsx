import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('w-6', 'h-6', 'text-white');
  });

  it('should render with small size', () => {
    render(<LoadingSpinner size="small" />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('w-4', 'h-4');
  });

  it('should render with large size', () => {
    render(<LoadingSpinner size="large" />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('should render with medium size (default)', () => {
    render(<LoadingSpinner size="medium" />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('w-6', 'h-6');
  });

  it('should render with red color', () => {
    render(<LoadingSpinner color="red" />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('text-red-500');
  });

  it('should render with gray color', () => {
    render(<LoadingSpinner color="gray" />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('text-gray-400');
  });

  it('should render with white color (default)', () => {
    render(<LoadingSpinner color="white" />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('text-white');
  });

  it('should apply custom className', () => {
    const customClass = 'my-custom-class';
    render(<LoadingSpinner className={customClass} />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass(customClass);
  });

  it('should have spinning animation', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('should have proper SVG structure', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByLabelText('Loading');
    
    // Check for SVG elements
    const circle = spinner.querySelector('circle');
    const path = spinner.querySelector('path');
    
    expect(circle).toBeInTheDocument();
    expect(path).toBeInTheDocument();
    
    // Check SVG attributes
    expect(spinner).toHaveAttribute('viewBox', '0 0 24 24');
    expect(spinner).toHaveAttribute('fill', 'none');
  });

  it('should be accessible', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByLabelText('Loading');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });
});