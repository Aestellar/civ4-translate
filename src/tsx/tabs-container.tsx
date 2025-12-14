// TabsContainer.tsx
import React, { useCallback, useEffect, useState } from 'react';
import XmlEditor from '../xml-editor';
import type { XMLFile } from '../types';
import type { XMLTree } from '../xml-tree';


interface TabsContainerProps {
  files: XMLFile[];
}

const TabsContainer: React.FC<TabsContainerProps> = ({ files }) => {
  const [activeTab, setActiveTab] = useState<string>("");
  useEffect(() => {
  if (files.length > 0 && !files.some(f => f.name === activeTab)) {
    // Either no active tab, or active tab is no longer in files → select first
    setActiveTab(files[0].name);
  }
}, [files, activeTab]);


  const [xmlTreeMap, setXmlTreeMap] = useState<Map<string, XMLTree|undefined>>(new Map());

const addXmlTree = useCallback((filename: string, xmlTree: XMLTree) => {
  setXmlTreeMap(prev => {
    const newMap = new Map(prev);
    newMap.set(filename, xmlTree);
    return newMap;
  });
  
}, []);


  if (files.length === 0) {
    return <div className="no-files">No XML files loaded</div>;
  }

  function selectTab(filename:string){
      console.log(`Try to select tab ${filename}`,files, files.filter((x_file)=>{return x_file.name === filename}))
      setActiveTab(filename)
  }

function getFileByName(filename:string){
  const filteredFiles = files.filter((x_file)=>{return x_file.name === filename})
  if(filteredFiles.length>0){
  return filteredFiles[0]
  }
  else{
    return undefined
  }

}


function getCurrentFile(){
  return getFileByName(activeTab)
}

const currentFile=getCurrentFile()

  return (
    <div className="tabs-container">
      <div className="tab-list">
        {files.map((file) => (
          <button
            key={file.name}
            className={`tab-button ${activeTab === file.name ? 'active' : ''}`}
            onClick={() => selectTab(file.name)}
          >
            {file.name}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {currentFile?
        <XmlEditor 
          filename={activeTab} 
          content={currentFile.content}
          updateXMLTree = {addXmlTree}
          loadedXMLTree = {xmlTreeMap.get(activeTab)}
        />:<></>}
      </div>
    </div>
  );
};

export default TabsContainer;