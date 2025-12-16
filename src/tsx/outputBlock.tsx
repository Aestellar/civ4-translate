// src/components/OutputBlock.tsx
import React from 'react';
import '../css/ioBlock.css'; // Optional: for styling

export interface OutputBlockProps {
  exportTime?: string; // or Date, number — adjust as needed
  onShowOutput: () => void;
  onCopyOutput: () => void;
}

const OutputBlock: React.FC<OutputBlockProps> = ({
  exportTime,
  onShowOutput,
  onCopyOutput,
}) => {
  return (
    <div className={`output-block-container`}>
            <h3>Output</h3>
      <div className="output-block">

        {exportTime && <div className="output-info">Export time: {exportTime}</div>}
        
        <div className="output-actions">
          <button className="output-btn output-btn-show" onClick={onShowOutput}>
            Show Output
          </button>
          <button className="output-btn output-btn-copy" onClick={onCopyOutput}>
            Copy Output
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutputBlock;