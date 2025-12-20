// TabsContainer.tsx
import React, { useCallback, useState } from 'react';
import XmlEditor from '../xml-editor';
import type { MessageType, XMLFile } from '../types';
import { XMLTree } from '../xml-tree';
import '../css/tabs-container.css';
import FilesOperationsPanel from './FilesOperationsPanel';
import type { LogMessage } from '../ts/types';
import { getLocalTime } from '../utils/utils';


// --- Main Component ---
interface TabsContainerProps {
  referenceFiles: XMLFile[];
  editableFiles: XMLFile[];
  onEditableFiles: (editableFiles: XMLFile[]) => void
  onReferenceFiles: (referenceFiles: XMLFile[]) => void
  onSaveFile: (filename: string, loadedXMLTree: XMLTree) => void
  onSaveAll: () => void
}

// Special tab ID for the operations panel
const FILES_PANEL_TAB = "__FILES_PANEL__";

const TabsContainer: React.FC<TabsContainerProps> = ({ referenceFiles, editableFiles, onEditableFiles, onReferenceFiles, onSaveFile, onSaveAll }) => {
  const [activeTab, setActiveTab] = useState<string>(FILES_PANEL_TAB);
  const [xmlTreeMap, setXmlTreeMap] = useState<Map<string, XMLTree | undefined>>(new Map());
  const [messages, setMessages] = useState<LogMessage[]>([])

  const addXmlTree = useCallback((filename: string, xmlTree: XMLTree) => {
    setXmlTreeMap(prev => {
      const newMap = new Map(prev);
      newMap.set(filename, xmlTree);
      return newMap;
    });
  }, []);

  const tabItems = [
    { id: FILES_PANEL_TAB, label: "📁 Files & Operations", isPanel: true },
    ...editableFiles.map(file => ({ id: file.name, label: file.name, isPanel: false }))
  ];

  const currentFile = editableFiles.find(f => f.name === activeTab);

  function addMessage(text: string, messageType: MessageType = 'normal') {
    let message: LogMessage = {
      time: getLocalTime(),
      text,
      fullText: "",
      messageType
    };
    setMessages(prevMessages => [...prevMessages, message]);
  }

function handleUnificate(langSchema: any) {
    editableFiles.forEach((file)=>{
      let xmlTree = xmlTreeMap.get(file.name)
      if (xmlTree){
        xmlTree.unifyLanguageOrder(langSchema.split(";"))
      }
      else{
          xmlTree = new XMLTree(file.content, addMessage);
          xmlTree.unifyLanguageOrder(langSchema.split(";"))
          addXmlTree(file.name,xmlTree)        
      }
    // if(xmlTree) xmlTree.unifyLanguageOrder(langSchema.split(";"))
    })

  }

  function getXmlEditor(activeTab: string, currentFile: XMLFile | undefined) {
    let xmlTree = xmlTreeMap.get(activeTab)
    if (!xmlTree) {
      if (currentFile) {
        try {
          xmlTree = new XMLTree(currentFile.content, addMessage);
          addXmlTree(currentFile.name,xmlTree)
        }
        catch (err) {
          addMessage(`Parse error: ${err instanceof Error ? err.message : 'Unknown'}`);
        }
      }
    }

    if (xmlTree && currentFile) {
      return (<XmlEditor
        filename={activeTab}
        content={currentFile.content}
        updateXMLTree={addXmlTree}
        loadedXMLTree={xmlTree}
        onSaveFile={onSaveFile}
      />)
    }
    else {
      return (
        <div className="error-placeholder">File not found.</div>
      )
    }
  }

  return (
    <div className="tabs-container">
      {/* Tab Bar */}
      <div className="tab-list">
        {tabItems.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''} `}
            onClick={() => {
              let xmlTree = xmlTreeMap.get(activeTab)
              if (xmlTree) {
                if (currentFile) { currentFile.content = xmlTree.xmlToString() }
              }
              setActiveTab(tab.id)
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === FILES_PANEL_TAB ? (
          <FilesOperationsPanel
            onEditableFiles={onEditableFiles}
            onReferenceFiles={onReferenceFiles}
            referenceFiles={referenceFiles}
            editableFiles={editableFiles}
            onSaveAll={onSaveAll}
            onUnificate={handleUnificate}
            messages={messages}
          />
        ) : getXmlEditor(activeTab, currentFile)}
      </div>
    </div>
  );
};

export default TabsContainer;