import React, {  useEffect, useRef } from 'react';
import type {ReactNode} from 'react';
import '../css/UniversalPopup.css';

export interface ButtonAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  autoFocus?: boolean;
}

export interface UniversalPopupProps {
  isOpen: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  confirmButton?: ButtonAction;
  cancelButton?: ButtonAction;
  customFooter?: ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const UniversalPopup: React.FC<UniversalPopupProps> = ({
  isOpen,
  title,
  children,
  onClose,
  confirmButton,
  cancelButton,
  customFooter,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  size = 'medium',
}) => {
  const popupRef = useRef<HTMLDivElement>(null);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const renderButton = (action: ButtonAction, className: string) => (
    <button
      key={action.label}
      className={`popup-btn ${className} popup-btn--${action.variant || 'secondary'}`}
      onClick={action.onClick}
      autoFocus={action.autoFocus}
    >
      {action.label}
    </button>
  );

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div
        ref={popupRef}
        className={`popup-container popup-size--${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "popup-title" : undefined}
      >
        {title && (
          <div className="popup-header">
            <h2 id="popup-title" className="popup-title">
              {title}
            </h2>
          </div>
        )}

        <div className="popup-content">{children}</div>

        {customFooter ? (
          <div className="popup-footer-custom">{customFooter}</div>
        ) : (
          (confirmButton || cancelButton) && (
            <div className="popup-actions">
              {cancelButton && renderButton(cancelButton, 'popup-btn-cancel')}
              {confirmButton && renderButton(confirmButton, 'popup-btn-confirm')}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default UniversalPopup;