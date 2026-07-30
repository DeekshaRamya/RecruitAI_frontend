import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * ActionButton - Unified Action Button Component
 * Ensures single execution, automatic click-prevention, consistent loading spinner,
 * and disabled state handling across the entire RecruitAI platform.
 */
export const ActionButton = ({
  children,
  onClick,
  isLoading: externalIsLoading,
  loadingText,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  iconSize = 16,
  ...props
}) => {
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = externalIsLoading !== undefined ? Boolean(externalIsLoading) : internalLoading;

  const handleClick = async (e) => {
    if (isLoading || disabled) {
      if (e && e.preventDefault) e.preventDefault();
      return;
    }

    if (onClick) {
      try {
        const result = onClick(e);
        if (result && typeof result.then === 'function') {
          setInternalLoading(true);
          await result;
        }
      } catch (err) {
        // Error handling preserves button state reset
        throw err;
      } finally {
        setInternalLoading(false);
      }
    }
  };

  return (
    <button
      {...props}
      type={type}
      disabled={isLoading || disabled}
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer select-none border border-transparent disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin shrink-0" size={iconSize} />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={iconSize} className="shrink-0" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default ActionButton;
