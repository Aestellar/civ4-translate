// TextEditorPane.tsx
import React, { useState } from 'react';
import type { TextValue } from './ts/types'; // or define inline
import { TextTree } from './text-tree';
import type { ISettings } from './ts/ISettings';
interface TextEditorPaneProps {
  selectedEltTextKey: string | null;
  xmlTree: TextTree;
  settings:ISettings
}

const TextEditorPane: React.FC<TextEditorPaneProps> = ({
  selectedEltTextKey,
  xmlTree,
  settings
}) => {
  if (!selectedEltTextKey || !xmlTree || !xmlTree.textMap[selectedEltTextKey]) {
    return null;
  }
  const [count, setCount ] = useState(0)


  const selectedObj = xmlTree.textMap[selectedEltTextKey];
  const langs = selectedObj.languages;


  function getActualLang(){
    let hiddenTagsList =  settings.hiddenTags.split(",")
    let actualLangs = Object.entries(langs).filter(([lang, ])=>{return !hiddenTagsList.includes(lang)})
    return actualLangs;
  }


  const handleTextChange = (lang: string, field: keyof TextValue, value: string) => {

    const current = selectedObj.languages[lang] || { text: '' };
    const updated: TextValue = {
      text: current.text,
      gender: current.gender,
      plural: current.plural,
      [field]: value,
    };
    selectedObj.setLanguageData(lang, updated);

    setCount(count+1)
  };



  return (
    <>
      {getActualLang().map(([key, txtData]) => (
        <div key={key} className="language-section">
          <div className='language-header'> <p>{key} {selectedObj.getLangOrder(key)}</p></div>
          
        <div>
            <textarea
              className="lang-textarea"
              value={txtData.text}
              onChange={(e) => handleTextChange(key, 'text', e.target.value)}
            />
            <span className='gender-plural-text-container'>
              <span className="text-entries">
                <span>Gender</span>
                <input
                  type="text"
                  value={txtData.gender?txtData.gender:""}
                  onChange={(e) => handleTextChange(key, 'gender', e.target.value)}
                />
              </span>
              <span className="text-entries">
                <span>Plural</span>
                <input
                  type="text"
                  value={txtData.plural?txtData.plural:""}
                  onChange={(e) => handleTextChange(key, 'plural', e.target.value)}
                />
              </span>
            </span>
        </div>
        </div>
      ))}
    </>
  );
};

export default TextEditorPane;