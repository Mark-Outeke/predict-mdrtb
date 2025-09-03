import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick, 
  disabled = false, 
  loading = false,
  style = {},
  ...props 
}) => {
  const baseStyles = {
    border: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textDecoration: 'none',
    ...style
  };

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    },
    secondary: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      color: '#374151',
      border: '2px solid #e2e8f0',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
    },
    success: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
    }
  };

  const sizes = {
    small: {
      padding: '8px 16px',
      fontSize: '0.875rem',
    },
    medium: {
      padding: '12px 24px',
      fontSize: '1rem',
    },
    large: {
      padding: '16px 32px',
      fontSize: '1.125rem',
    }
  };

  const buttonStyles = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
    opacity: disabled ? 0.6 : 1,
  };

  const handleMouseEnter = (e) => {
    if (!disabled) {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = buttonStyles.boxShadow.replace('15px', '20px');
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = buttonStyles.boxShadow;
    }
  };

  return (
    <button
      style={buttonStyles}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      {...props}
    >
      {loading && (
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid transparent',
          borderTop: '2px solid currentColor',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      )}
      {children}
    </button>
  );
};

export default Button;
