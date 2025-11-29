// Operations.tsx

import React from 'react';
import type { IReactChildren } from '../ts/IReactChildren';
import '../css/operations.css'

// Define the shape of the operations map if needed later
type OperationHandler = () => void;

interface IOperations extends IReactChildren {
  onParse: OperationHandler
  onExport: OperationHandler
  onAddTag: OperationHandler
  onShowSettings:OperationHandler

}

const Operations: React.FC<IOperations> = ({
  onParse,
  onExport,
  onAddTag,
  onShowSettings,
}) => {


function addTag(){
  onAddTag()
}

  return (
    <div className='operations-container'>
      <h3>Operations</h3>
      <button
        onClick={onParse}
        className="parse-button">
        Parse
      </button>
      <button
        onClick={onExport}
        className="export-button">
        Export
      </button>
      <button
        onClick={onShowSettings}
        className="settings-button">
        Settings
      </button>      
      <button
        onClick={addTag}
        className="add-tag-button">
        AddTag
      </button>
    </div>
  );
};

export default Operations;