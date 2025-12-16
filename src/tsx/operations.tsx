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
  onShowSettings: OperationHandler
  onUnificate:OperationHandler
  onAddNewTextKey:OperationHandler
}

const Operations: React.FC<IOperations> = ({
  onAddTag,
  onShowSettings,
  onUnificate,
  onAddNewTextKey
}) => {


  function addTag() {
    onAddTag()
  }

  return (
    <div className='operations-container'>
      <h3>Operations</h3>
      <div className='operations-block'>
        {/* <button
          onClick={onParse}
          className="parse-button">
          Parse
        </button>
        <button
          onClick={onExport}
          className="export-button">
          Export
        </button> */}
        <button
          onClick={onShowSettings}
          className="settings-button">
          Settings
        </button>
        <button
          onClick={addTag}
          className="add-tag-button">
          Add Language
        </button>
        <button
          onClick={onUnificate}
          className="add-tag-button">
          Unify Languages
        </button>
        <button
          onClick={onAddNewTextKey}
          className="add-new-text-key-button">
          Add new TXT_KEY
        </button>        
      </div>

    </div>
  );
};

export default Operations;