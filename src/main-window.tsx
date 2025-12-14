// src/components/OutputBlock.tsx
import React, { useState } from 'react';
import type { XMLFile } from './types';
import FileListHandler from './tsx/FileListHandler';
import TabsContainer from './tsx/tabs-container';



const MainWindow: React.FC = () => {
    const [files, setFiles] = useState<XMLFile[]>([])

    function onFilesProcessed(files: XMLFile[]){
        setFiles(files)

    }

  return (
    <div>
        <FileListHandler onFilesProcessed={onFilesProcessed} hasLoadedFiles={files.length > 0}></FileListHandler>
        {files.length?<TabsContainer files={files}></TabsContainer>:<></>}
    </div>
  );
};

export default MainWindow;