// src/components/XmlEditor.tsx

import React, { useCallback, useState } from 'react';
import SelectableList from './selectable-list';
import { TextTree } from './text-tree';
import './css/main_page.css'
// import type { TextValue } from './ts/types';
import TextEditorPane from './text-editor-pane';
import Operations from './tsx/operations';
import DragDropModal from './tsx/drag-and-drop-modal';
// src/App.tsx

import type { ISettings } from './ts/ISettings';
import UniversalPopup from './tsx/UniversalPopup';
import { getLocalTime } from './utils/utils';
import type { LogMessage } from './ts/types';
import LogPanel from './tsx/LogPanel';
import OutputBlock from './tsx/outputBlock';



const XmlEditor: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [xmlTree, setXmlTree] = useState<TextTree>();
  const [selectedEltTextKey, setSelectedElt] = useState<string>();


  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showOutput, setShowOutput] = useState<boolean>(false);
  const [showAddTagButton, setShowAddTagButton] = useState<boolean>(false);


  const [settings, setSettings] = useState<ISettings>({
    theme: 'light',
    notifications: true,
    hiddenTags: ""
  });
  const [newTag, setNewTag] = useState("")
  const [exportTime, setExportTime] = useState("")
  const [baseNewTag, setBaseFornewTag] = useState("English")  

  const [messages, setMessages] = useState<LogMessage[]>([]) 

function addMessage(text:string){
  let message:LogMessage = {time:getLocalTime(),text, fullText:""}
  setMessages(prevMessages => [...prevMessages, message]);
}

  const handleSaveSettings = () => {
    // Save logic (e.g., API, localStorage)
    console.log('Saving settings:', settings);
    // Close handled by SettingsPopup
  };

  const handleParse = () => {
    parseText(inputText)
  };

  const handleExport = () => {
    if (xmlTree) {
      setOutputText(xmlTree.xmlToString())
      copyOutput()
      setExportTime(getLocalTime())
      addMessage("Exported")
    }
  };

  function handleNewTag(tag: string, baseTag:string): void {
    if (tag) {
      if (xmlTree) {
        xmlTree.addNewTag(tag, baseTag)
      }
    }
    console.log("Add new tag", tag);
  }
  function handleAddTag(): void {
      setShowAddTagButton(true)
  }

  function parseText(text: string) {
    let xmlTree = new TextTree(text, addMessage)
    setXmlTree(xmlTree)
    setOutputText(`${text}`);
  }


  function getEditorPane() {
    if (xmlTree) {
      return <TextEditorPane selectedEltTextKey={selectedEltTextKey || ""} xmlTree={xmlTree} settings={settings}></TextEditorPane>
    }
    return <></>
  }

const selectItem = useCallback((key: string) => {
  setSelectedElt(key);
}, []); // 👈 empty deps if it doesn't depend on changing state

// Then pass it:
// <SelectableList xmlTree={xmlTree} selectItem={selectItem} />
//   function selectKey(key: string) {
//     setSelectedElt(xmlTree?.textMap[key].tagName)
//   }


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

  function updateHiddenTags(e: React.ChangeEvent<HTMLInputElement>): void {
    let hiddenTags: string = e.target.value;
    setSettings(prev => ({ ...prev, hiddenTags: hiddenTags }))
  }

  function formatOutputText(): React.ReactNode {
    // Split by any <...> pattern using regex
    const parts = outputText.split(/<(?:[^>]+)>/);
    return (
        <div>
            {parts.filter((part)=>part.trim()).map((part, index) => (
                <p key={index}>{part.trim()}</p>
            ))}
        </div>
    );
  }

function copyOutput(){
  navigator.clipboard.writeText(outputText)
}

  return (
    <div >
      <div className="app-header">
        {/* <h2>Civ4 Text XML Editor</h2> */}
      </div>
      <div>    <div>
        <UniversalPopup
          isOpen={showAddTagButton}
          title="Add new language"
          onClose={() => setShowAddTagButton(false)}
          confirmButton={{
            label: 'Confirm',
            onClick: () => {handleNewTag(newTag, baseNewTag); setShowAddTagButton(false)},
            variant: 'primary',
            autoFocus: true
          }}
          cancelButton={{
            label: 'Exit',
            onClick: () => setShowAddTagButton(false)
          }}
          closeOnEscape={true}
        >
          <input value={newTag} type="text" placeholder='Type new tag name' onChange={(e)=>{setNewTag(e.target.value)}}></input>
          <input value={baseNewTag} type="text" placeholder='Base tag for copy' onChange={(e)=>{setBaseFornewTag(e.target.value)}}></input>          
          <></>
        </UniversalPopup>

        <UniversalPopup
          isOpen={showSettings}
          title="Settings"
          onClose={() => setShowSettings(false)}
          confirmButton={{
            label: 'Confirm',
            onClick: () => {handleSaveSettings(); setShowSettings(false)},
            variant: 'primary',
            autoFocus: true
          }}
          cancelButton={{
            label: 'Exit',
            onClick: () => {setShowAddTagButton(false); setShowSettings(false)}
          }}
          closeOnEscape={true}>
          <div>
            <label className='hide-langs'>
              Hidden languages
              <div>
                <input
                type="text"
                value={settings.hiddenTags}
                placeholder='Type tags to hide, separate by ;'
                // checked={settings.notifications}
                onChange={(e) => updateHiddenTags(e)}
              />
              </div>
            </label>
          </div>
        </UniversalPopup>
        <UniversalPopup
          isOpen={showOutput}
          size="wide"
          title="Output"
          onClose={() => setShowOutput(false)}
          cancelButton={{
            label: 'Exit',
            onClick: () => { setShowOutput(false)}
          }}
          closeOnEscape={true}>
            <div>
              <div>{formatOutputText()}</div>
            </div>
        </UniversalPopup>
      </div></div>
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

        <Operations onParse={handleParse}
          onExport={handleExport}
          onAddTag={handleAddTag}
          onShowSettings={() => setShowSettings(true)}
        ></Operations>
        <OutputBlock onShowOutput={() => setShowOutput(true)}
          onCopyOutput={() => copyOutput()}
          exportTime={exportTime}>

        </OutputBlock>


        <div>
          {(xmlTree) ? (<SelectableList xmlTree={xmlTree} selectItem={selectItem}></SelectableList>) : <></>}
        </div>

        <div>
          <div>{selectedEltTextKey}</div>
          <div>{getEditorPane()}</div>
        </div>
        <div>
          <h3>Log</h3>
          <LogPanel messages={messages}></LogPanel>
        </div>
      </div>
    </div>
  );
};

export default XmlEditor;