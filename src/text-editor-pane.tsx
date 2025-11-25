// TextEditorPane.tsx
import React, { useState } from 'react';
import type { TextValue } from './ts/types'; // or define inline
import { TextTree } from './text-tree';

interface TextEditorPaneProps {
  selectedEltTextKey: string | null;
  xmlTree: TextTree;
}

const TextEditorPane: React.FC<TextEditorPaneProps> = ({
  selectedEltTextKey,
  xmlTree,
}) => {
  if (!selectedEltTextKey || !xmlTree || !xmlTree.textMap[selectedEltTextKey]) {
    return null;
  }

  const selectedObj = xmlTree.textMap[selectedEltTextKey];
  const langs = selectedObj.languages;

  const [count, setCount ] = useState(0)


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
      {Object.entries(langs).map(([key, txtData]) => (
        <div key={key} className="language-section">
          <p>{key}</p>
          <textarea
            rows={4}
            className="text-entries"
            value={txtData.text}
            onChange={(e) => handleTextChange(key, 'text', e.target.value)}
          />
          {txtData.gender !== undefined && (
            <span className="text-entries">
              <span>Gender</span>
              <input
                type="text"
                value={txtData.gender}
                onChange={(e) => handleTextChange(key, 'gender', e.target.value)}
              />
            </span>
          )}
          {txtData.plural !== undefined && (
            <span className="text-entries">
              <span>Plural</span>
              <input
                type="text"
                value={txtData.plural}
                onChange={(e) => handleTextChange(key, 'plural', e.target.value)}
              />
            </span>
          )}
        </div>
      ))}
    </>
  );
};

export default TextEditorPane;