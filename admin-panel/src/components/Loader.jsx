import React from 'react';

const Loader = ({ 
  size = 'medium', 
  variant = 'spinner', 
  color = 'blue', 
  text = '', 
  overlay = false,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  const spinnerClasses = `${sizeClasses[size]} ${colorClasses[color]} animate-spin`;

  const renderSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-2">
      <svg className={spinnerClasses} fill="none" viewBox="0 0 24 24">
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
      {text && (
        <p className={`text-sm ${colorClasses[color]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  const renderDots = () => (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="flex space-x-1">
        <div className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
        <div className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
        <div className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
      </div>
      {text && (
        <p className={`text-sm ${colorClasses[color]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  const renderPulse = () => (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse bg-current`}></div>
      {text && (
        <p className={`text-sm ${colorClasses[color]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'spinner':
      default:
        return renderSpinner();
    }
  };

  if (overlay) {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
        <div className="bg-white rounded-lg p-6 shadow-xl">
          {renderLoader()}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {renderLoader()}
    </div>
  );
};

// Button Loader Component
export const ButtonLoader = ({ loading, children, className = '', ...props }) => {
  return (
    <button 
      className={`relative ${className}`} 
      disabled={loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader size="small" color="white" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};

// Inline Loader Component
export const InlineLoader = ({ loading, children, fallback = null }) => {
  if (loading) {
    return fallback || <Loader size="small" text="Loading..." />;
  }
  return children;
};

// Page Loader Component
export const PageLoader = ({ loading, children }) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" text="Loading page..." />
      </div>
    );
  }
  return children;
};

// Card Loader Component
export const CardLoader = ({ loading, children, className = '' }) => {
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <Loader size="medium" text="Loading..." />
      </div>
    );
  }
  return children;
};

export default Loader;
