// src/components/XmlEditor.tsx

import React, { useState } from 'react';
import SelectableList from './selectable-list';
import { TextTree } from './text-tree';
import './css/main_page.css'
// import type { TextValue } from './ts/types';
import TextEditorPane from './text-editor-pane';
import Operations from './tsx/operations';
// src/App.tsx



const XmlEditor: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [xmlTree, setXmlTree] = useState<TextTree>();
  const [selectedEltTextKey, setSelectedElt] = useState<string>();

  const handleParse = () => {
    let xmlTree = new TextTree(inputText)
    setXmlTree(xmlTree)
    setOutputText(`[PROCESSED]\n${inputText}`);
  };

  const handleExport = () => {
    if(xmlTree){
      setOutputText(xmlTree.xmlToString());     
    }
  
  };

  function handleNewTag(tag: string): void {
    if(tag){
      if(xmlTree){
        xmlTree.addNewTag(tag,"English")
      }
    }
    console.log("Add new tag",tag);
  }



  function getEditorPane(){
    if(xmlTree){
      return <TextEditorPane selectedEltTextKey={selectedEltTextKey||""} xmlTree={xmlTree}></TextEditorPane>
    }
    return <></>
  }


  function selectKey (key:string) {
      setSelectedElt(xmlTree?.textMap[key].tagName)
    }


  return (
    <div >
      <div className="app-header">
        <h2>XML TEXT Processor</h2>
      </div>
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