
import { useState, useMemo, useEffect, useCallback } from "react";
import { XMLTree } from "./xml-tree";
import type { IReactChildren } from "./ts/IReactChildren";
import './css/selectable_list.css';

interface ISelectableList extends IReactChildren {
  xmlTree: XMLTree;
  selectItem: (tagName: string) => void;
  treeVersion:number
}

const SelectableList: React.FC<ISelectableList> = ({ xmlTree, selectItem,treeVersion}) => {
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [contentQuery, setContentQuery] = useState<string>("");
  const [manualSelect, setManualSelect] = useState<boolean>(false);

  // 🔑 1. MEMOIZE filtered data — only recompute when inputs change
  // const filteredEntries = useMemo(() => {

  //   return Object.entries(xmlTree.textMap)
  //     .filter(([key]) => key.toLowerCase().includes(query.toLowerCase()))
  //     .filter(([, civ]) => civ.hasText(contentQuery));
  // }, [xmlTree.textMap, query, contentQuery]);


const filteredEntries = useMemo(() => {
  if (!xmlTree) return [];

  // Split query into parts
  const queryParts = query
    .trim()
    .split(/\s+/)
    .filter(part => part.length > 0);

  // Separate custom filters (Lang=Lang) from tag tokens
  const tagTokens: string[] = [];
  const equalityFilters: [string, string][] = [];

  for (const part of queryParts) {
    if (/^[A-Za-z]+=[A-Za-z]+$/.test(part)) {
      const [lang1, lang2] = part.split('=');
      equalityFilters.push([lang1, lang2]);
    } else {
      tagTokens.push(part);
    }
  }

  return Object.entries(xmlTree.textMap)
    .filter(([key, civ]) => {
      // 🔍 1. Tag filter: all tag tokens must appear in key
      const matchesTag = tagTokens.every(token =>
        key.toLowerCase().includes(token.toLowerCase())
      );

      if (!matchesTag) return false;

      // 🔍 2. Content filter (your existing contentQuery)
      if (contentQuery && !civ.hasText(contentQuery)) {
        return false;
      }

      // 🔍 3. Equality filters: all must be satisfied
      const matchesEquality = equalityFilters.every(([lang1, lang2]) =>
        civ.hasEqualText(lang1, lang2)
      );

      return matchesEquality;
    });
}, [xmlTree?.textMap, query, contentQuery,treeVersion]);



  

  // 🎯 2. AUTO-SELECT logic → move to useEffect (NOT during render!)
  useEffect(() => {
    if (!manualSelect && filteredEntries.length > 0) {
      const [firstKey] = filteredEntries[0];
      if (selectedItem !== firstKey) {
        setSelectedItem(firstKey);
        selectItem(firstKey);
      }
    }
  }, [filteredEntries, manualSelect, selectedItem, selectItem]);

  // 🖱️ 3. STABLE handler for selection
  const handleSelect = useCallback((key: string) => {
    setSelectedItem(key);
    setManualSelect(true);
    selectItem(key);
  }, [selectItem]);

  // 🧹 4. Reset manualSelect when filters change
  const handleTXTKEYFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setManualSelect(false);
  }, []);

  const handleContentFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setContentQuery(e.target.value);
    setManualSelect(false);
  }, []);

  // ✂️ 5. Render list items (memoized if needed, but usually fine inline)
  const renderListItems = filteredEntries.map(([key, civ]) => (
    <li
      key={key}
      onClick={() => handleSelect(key)}
      className={selectedItem === key ? 'selected' : ''}
    >
      <p>{civ.tagName.replace("TXT_KEY_","")}</p>
    </li>
  ));

  return (
    <div> 
      <div className="query-filter">
        <input
          type="text"
          placeholder="Filter by TXT_KEY"
          value={query}
          onChange={handleTXTKEYFilterChange}
        />
      </div>
      <div className="query-filter">
        <input
          type="text"
          placeholder="Filter by content"
          value={contentQuery}
          onChange={handleContentFilterChange}
        />
      </div>

      <div className="list-container">
        <ul className="select-list" style={{ listStyle: 'none', padding: 0 }}>
          {renderListItems}
        </ul>
      </div>
    </div>
  );
};

export default SelectableList;
