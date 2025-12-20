// src/components/OutputBlock.tsx
import React, { useState } from 'react';
import type { XMLFile } from './types';
import TabsContainer from './tsx/tabs-container';
import type { XMLTree } from './xml-tree';
import { downloadXMLFiles } from './utils/downloadXMLFiles';
import { createZipFromXMLFiles, downloadBlob } from './utils/fileProcessingUtils';


const MainWindow: React.FC = () => {
    const [editablefiles, setEditableFiles] = useState<XMLFile[]>([])
    const [referenceFiles, setReferenceFiles] = useState<XMLFile[]>([])


    function onEditableFiles(editableFiles: XMLFile[]){
        setEditableFiles(editableFiles)
    }

    function onReferenceFiles(referenceFiles: XMLFile[]){
        setReferenceFiles(referenceFiles)
    }
    

   function onSaveFile (filename: string,xmlTree: XMLTree):void{
      downloadXMLFiles([{ name: filename, content: xmlTree.xmlToString() }], false); // → direct XML
      }  

      
  async function onSaveAll (): Promise<void> {
        if (editablefiles.length === 0) return;
        try {
          const blob = await createZipFromXMLFiles(editablefiles);
          downloadBlob(blob, 'editable_files.zip');
        } catch (err) {
          console.error('Failed to save ZIP:', err);
          alert('Failed to export files');
        }

      }  

  return (
    <div>
        {/* <FileListHandler onFilesProcessed={onFilesProcessed}></FileListHandler> */}
        {<TabsContainer onEditableFiles={onEditableFiles} onReferenceFiles={onReferenceFiles} editableFiles={editablefiles} referenceFiles={referenceFiles}
         onSaveFile={onSaveFile}
          onSaveAll={onSaveAll}>
            </TabsContainer>}
    </div>
  );
};

export default MainWindow;