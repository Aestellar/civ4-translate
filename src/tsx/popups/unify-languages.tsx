// src/components/popups/UnifyLanguagesPopup.tsx
import React from 'react';
import UniversalPopup from '../UniversalPopup'; // 👈 adjust path as needed

interface UnifyLanguagesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (langSchema: string) => void;
  initialLangSchema: string;
}

const UnifyLanguagesPopup: React.FC<UnifyLanguagesPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialLangSchema
}) => {
  const [langSchema, setLangSchema] = React.useState(initialLangSchema);

  React.useEffect(() => {
    if (isOpen) {
      setLangSchema(initialLangSchema);
    }
  }, [isOpen, initialLangSchema]);

  const handleConfirm = () => {
    onConfirm(langSchema.trim());
    onClose();
  };

  return (
    <UniversalPopup
      isOpen={isOpen}
      title="Unify Languages"
      onClose={onClose}
      confirmButton={{
        label: 'Confirm',
        onClick: handleConfirm,
        variant: 'primary',
        autoFocus: true
      }}
      cancelButton={{
        label: 'Exit',
        onClick: onClose
      }}
      closeOnEscape={true}
    >
      <div className="unify-languages-content">
        <input
          value={langSchema}
          type="text"
          placeholder="English;Russian etc"
          onChange={(e) => setLangSchema(e.target.value)}
          className="unify-languages-input"
        />
      </div>
    </UniversalPopup>
  );
};

export default UnifyLanguagesPopup;