// src/components/inputBlock.tsx
import React from 'react';
import '../css/ioBlock.css'; // Optional: for styling

export interface InputBlockProps {
  onShowInput: () => void;
  onImportInput: () => void;
}

const InputBlock: React.FC<InputBlockProps> = ({
  onShowInput,onImportInput
//   onCopyinput,
}) => {
  return (
    <div className={`input-block-container`}>
            <h3>Input</h3>
      <div className="input-block"> 
        <div className="input-actions">
          <button className="input-btn input-btn-show" onClick={onShowInput}>
            Show input window
          </button>
          <button className="input-btn input-btn-import" onClick={onImportInput}>
            Import from input
          </button>          
        </div>
      </div>
    </div>
  );
};

export default InputBlock;