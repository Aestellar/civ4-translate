// Operations.tsx

import React, { useState } from 'react';
import type { IReactChildren } from '../ts/IReactChildren';
import '../css/operations.css'

// Define the shape of the operations map if needed later
type OperationHandler = () => void;

interface IOperations extends IReactChildren {
  onParse: OperationHandler;
  onExport: OperationHandler;
  onAddTag: (tag:string)=>void
}

const Operations: React.FC<IOperations> = ({
  onParse,
  onExport,
  onAddTag
}) => {

  const [newTag, setNewTag] = useState("")

function updateNewTagName(event:any){
  setNewTag(event.target.value)
}

function addTag(){
  onAddTag(newTag)
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
        onClick={addTag}
        className="add-tag-button">
        AddTag
      </button>
      <input type="text" placeholder='Type new tag name' onChange={updateNewTagName}></input>
    </div>
  );
};

export default Operations;