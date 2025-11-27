import React, {useEffect } from 'react';
import '../css/SettingsPopup.css';

import type {ReactNode} from 'react';

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  children: ReactNode;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({
  isOpen,
  onClose,
  onSave,
  children
}) => {
  // Optional: Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSave();
    onClose();
  };

  const handleExit = () => {
    onClose();
  };

  return (
    <div className="popup-overlay" onClick={handleExit}>
      <div 
        className="popup-container" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-popup-title"
      >
        <div className="popup-header">
          <h2 id="settings-popup-title">Settings</h2>
        </div>
        
        <div className="popup-content">
          {children}
        </div>
        
        <div className="popup-actions">
          <button 
            className="popup-btn popup-btn-exit" 
            onClick={handleExit}
          >
            Exit
          </button>
          <button 
            className="popup-btn popup-btn-confirm" 
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPopup;