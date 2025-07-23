interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'white' | 'red' | 'gray';
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  color = 'white', 
  className = '' 
}: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-8 h-8';
      case 'medium':
      default:
        return 'w-6 h-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'red':
        return 'text-red-500';
      case 'gray':
        return 'text-gray-400';
      case 'white':
      default:
        return 'text-white';
    }
  };

  return (
    <svg 
      className={`animate-spin ${getSizeClasses()} ${getColorClasses()} ${className}`}
      fill="none" 
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}