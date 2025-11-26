// src/components/XmlEditor.tsx

import React, { useState } from 'react';
import SelectableList from './selectable-list';
import { TextTree } from './text-tree';
import './css/main_page.css'
// import type { TextValue } from './ts/types';
import TextEditorPane from './text-editor-pane';
import Operations from './tsx/operations';
import DragDropModal from './tsx/drag-and-drop-modal';
// src/App.tsx



const XmlEditor: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [xmlTree, setXmlTree] = useState<TextTree>();
  const [selectedEltTextKey, setSelectedElt] = useState<string>();

  const handleParse = () => {
    parseText(inputText)
  };

  const handleExport = () => {
    if (xmlTree) {
      setOutputText(xmlTree.xmlToString());
    }

  };

  function handleNewTag(tag: string): void {
    if (tag) {
      if (xmlTree) {
        xmlTree.addNewTag(tag, "English")
      }
    }
    console.log("Add new tag", tag);
  }


  function parseText(text:string) {
    let xmlTree = new TextTree(text)
    setXmlTree(xmlTree)
    setOutputText(`${text}`);
  }


  function getEditorPane() {
    if (xmlTree) {
      return <TextEditorPane selectedEltTextKey={selectedEltTextKey || ""} xmlTree={xmlTree}></TextEditorPane>
    }
    return <></>
  }


  function selectKey(key: string) {
    setSelectedElt(xmlTree?.textMap[key].tagName)
  }


  function handleFileDrop(fileList: FileList): void {
    if (fileList.length > 0) {
      const firstFile = fileList[0]; // or fileList.item(0)
      // Use firstFile here
      console.log(firstFile.name);

      const file = fileList[0]; // Assume fileList exists and has files

      if (file && file.name.endsWith('.xml')) {
        const reader = new FileReader();
        reader.onload = function (event: ProgressEvent<FileReader>) {
          if (event.target) {
            if (event.target.result) {
              let result = event.target.result
              if (typeof result === 'string') {
                // result is safely treated as a string here
                const xmlString: string = result;
                parseText(xmlString)
              }
            }
          }
        };
        reader.readAsText(file);
      }
    }
  }

  return (
    <div >
      <div className="app-header">
        <h2>Civ4 Text XML Editor</h2>
      </div>
      <DragDropModal handleFileDrop={handleFileDrop}></DragDropModal>
      <div className='grid-container'>
        <div className='input-text-container'>
          <h3>Input</h3>
          < textarea
            className="inputText"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={5}
            placeholder="Paste your XML here..."
          />
        </div>
        <Operations onParse={handleParse} onExport={handleExport} onAddTag={handleNewTag}></Operations>
        <div>
          <div className='output-text-container'>
            <h3>Output</h3>
            <textarea
              className="outputText"
              value={outputText}
              readOnly
              rows={5}
              style={{}}
            />
          </div></div>
        <div>
          {(xmlTree) ? (<SelectableList xmlTree={xmlTree} selectItem={selectKey}></SelectableList>) : <></>}
        </div>
        <div>
          <div>{selectedEltTextKey}</div>
          <div>{getEditorPane()}</div>
        </div>
        <div>
          <h3>Log</h3>
        </div>
      </div>
    </div>
  );
};

export default XmlEditor;