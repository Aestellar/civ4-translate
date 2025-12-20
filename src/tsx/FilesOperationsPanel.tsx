// FilesOperationsPanel.tsx (updated)
import React, { useCallback, useState, useEffect } from 'react';
import type { XMLFile } from '../types';
import UnifyLanguagesPopup from './popups/unify-languages';
import { processFile} from '../utils/fileProcessingUtils';
import FileDropZone from './FileDropZone';
import type { LogMessage } from '../ts/types';
import LogPanel from './LogPanel';

interface FilesOperationsPanelProps {
  referenceFiles: XMLFile[];
  editableFiles: XMLFile[];
  onEditableFiles: (editableFiles: XMLFile[]) => void;
  onReferenceFiles: (referenceFiles: XMLFile[]) => void;
  onSaveAll:()=>void
  onUnificate:(langschema:string)=>void;
  messages:LogMessage[]
}

const FilesOperationsPanel: React.FC<FilesOperationsPanelProps> = ({ 
  referenceFiles, 
  editableFiles, 
  onEditableFiles,
  onReferenceFiles,
  onSaveAll,
  onUnificate,
  messages
}) => {
  const [refChecked, setRefChecked] = useState<Record<string, boolean>>({});
  const [editableChecked, setEditableChecked] = useState<Record<string, boolean>>({});
  const [showUnificateButton, setShowUnificateButton] = useState<boolean>(false);

  // Sync checked state when files change
  useEffect(() => {
    const newRefChecked: Record<string, boolean> = {};
    referenceFiles.forEach(f => {
      newRefChecked[f.name] = refChecked[f.name] ?? false;
    });
    setRefChecked(newRefChecked);
  }, [referenceFiles]);

  useEffect(() => {
    const newEditableChecked: Record<string, boolean> = {};
    editableFiles.forEach(f => {
      newEditableChecked[f.name] = editableChecked[f.name] ?? false;
    });
    setEditableChecked(newEditableChecked);
  }, [editableFiles]);

  const toggleRef = (name: string) => {
    setRefChecked(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleEditable = (name: string) => {
    setEditableChecked(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // === Select/Deselect All ===
  const toggleAllRef = () => {
    const allChecked = Object.values(refChecked).every(v => v);
    const newChecked: Record<string, boolean> = {};
    referenceFiles.forEach(f => {
      newChecked[f.name] = !allChecked; // toggle to opposite
    });
    setRefChecked(newChecked);
  };

  const toggleAllEditable = () => {
    const allChecked = Object.values(editableChecked).every(v => v);
    const newChecked: Record<string, boolean> = {};
    editableFiles.forEach(f => {
      newChecked[f.name] = !allChecked;
    });
    setEditableChecked(newChecked);
  };

  // === File Processing ===
  const handleFiles = useCallback(async (files: File[], setter: (files: XMLFile[]) => void) => {
    const allXmlFiles: XMLFile[] = [];
    for (const file of files) {
      try {
        const xmlFiles = await processFile(file);
        allXmlFiles.push(...xmlFiles);
      } catch (err) {
        console.error('Error processing file:', file.name, err);
      }
    }
    setter(allXmlFiles); // 👈 append, not replace
  }, []);

  // === Custom Actions ===
  const handleUpdateTags = () => {
    // TODO: Implement your tag update logic
    alert('Update Tags clicked (implement me!)');
    console.log('Updating tags for reference files:', referenceFiles.filter(f => refChecked[f.name]));
  };



  // === Render Helpers ===
  const renderFileList = (
    files: XMLFile[],
    checked: Record<string, boolean>,
    toggle: (name: string) => void
  ) => (
    <ul>
      {files.map((file) => (
        <li key={file.name} className="file-item">
          <label>
            <input
              type="checkbox"
              checked={!!checked[file.name]}
              onChange={() => toggle(file.name)}
            />
            {file.name}
          </label>
        </li>
      ))}
    </ul>
  );

  const renderDropHint = (title: string) => (
    <>
      <h3>{title}</h3>
      <p>Drag & drop XML or ZIP files here</p>
      <p>or</p>
      <button type="button" className="file-input-label">
        Select Files
      </button>
    </>
  );

  // Determine button labels
  const refAllLabel = referenceFiles.length > 0 && Object.values(refChecked).every(v => v)
    ? 'Deselect All'
    : 'Select All';

  const editableAllLabel = editableFiles.length > 0 && Object.values(editableChecked).every(v => v)
    ? 'Deselect All'
    : 'Select All';

  return (
    <div className="files-operations-layout">
      <UnifyLanguagesPopup
        isOpen={showUnificateButton}
        onClose={() => setShowUnificateButton(false)}
        onConfirm={(langSchema) => {onUnificate(langSchema)
        }}
        initialLangSchema={''}
      />

      {/* Reference Files */}
      <div className="file-pane reference-pane">
        <div className="file-controls">
          <button onClick={toggleAllRef} disabled={referenceFiles.length === 0}>
            {refAllLabel}
          </button>
          <button onClick={handleUpdateTags} disabled={referenceFiles.length === 0}>
            🔄 Update Tags
          </button>
        </div>

        <FileDropZone
          title="📁 Reference Files"
          onFilesProcessed={(files) => handleFiles(files, onReferenceFiles)}
        >
          {referenceFiles.length > 0 ? (
            renderFileList(referenceFiles, refChecked, toggleRef)
          ) : (
            renderDropHint("📁 Reference Files")
          )}
        </FileDropZone>
      </div>

      {/* Operations */}
      <div className="operations-pane">
        <h3>⚙️ Operations</h3>
        <button disabled={!referenceFiles.length || !editableFiles.length}>
          Compare Selected
        </button>
        <button onClick={() => setShowUnificateButton(true)}>Unify Languages</button>
      </div>

      {/* Editable Files */}
      <div className="file-pane editable-pane">
        <div className="file-controls">
          <button onClick={toggleAllEditable} disabled={editableFiles.length === 0}>
            {editableAllLabel}
          </button>
          <button onClick={onSaveAll} disabled={editableFiles.length === 0}>
            💾 Save All Files
          </button>
        </div>

        <FileDropZone
          title="📝 Editable Files"
          onFilesProcessed={(files) => handleFiles(files, onEditableFiles)}
        >
          {editableFiles.length > 0 ? (
            renderFileList(editableFiles, editableChecked, toggleEditable)
          ) : (
            renderDropHint("📝 Editable Files")
          )}
        </FileDropZone>
      </div>

      {/* Log Panel */}
      <LogPanel messages={messages}></LogPanel>
    </div>
  );
};

export default FilesOperationsPanel;