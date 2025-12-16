// src/components/OutputBlock.tsx
import React from 'react';
import '../css/ioBlock.css'; // Optional: for styling
import '../css/buttons.css'; // Optional: for styling

export interface OutputBlockProps {
  // exportTime?: string; // or Date, number — adjust as needed
  onShowOutput: () => void;
  onCopyOutput: () => void;
  onSaveAsFileOutput: () => void; 
}

const OutputBlock: React.FC<OutputBlockProps> = ({
  // exportTime,
  onShowOutput,
  onCopyOutput,
  onSaveAsFileOutput,
}) => {
  return (
    <div className={`output-block-container`}>
            <h3>Output</h3>
      <div className="output-block">

        {/* {exportTime && <div className="output-info">Export time: {exportTime}</div>} */}
        
        <div className="output-actions">
          <button className="civ-tex-btn  btn-normal" onClick={onShowOutput}>
            Show Output
          </button>
          <button className="civ-tex-btn  btn-neutral" onClick={onCopyOutput}>
            Copy Output
          </button>
          <button className="civ-tex-btn  btn-io " onClick={onSaveAsFileOutput}>
            Save As File
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default OutputBlock;