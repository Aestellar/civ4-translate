
import { useState, useMemo, useEffect, useCallback } from "react";
import { XMLTree } from "./xml-tree";
import type { IReactChildren } from "./ts/IReactChildren";
import './css/selectable_list.css';

interface ISelectableList extends IReactChildren {
  xmlTree: XMLTree;
  selectItem: (tagName: string) => void;
}

const SelectableList: React.FC<ISelectableList> = ({ xmlTree, selectItem }) => {
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [contentQuery, setContentQuery] = useState<string>("");
  const [manualSelect, setManualSelect] = useState<boolean>(false);

  // 🔑 1. MEMOIZE filtered data — only recompute when inputs change
  const filteredEntries = useMemo(() => {
    return Object.entries(xmlTree.textMap)
      .filter(([key]) => key.toLowerCase().includes(query.toLowerCase()))
      .filter(([, civ]) => civ.hasText(contentQuery));
  }, [xmlTree.textMap, query, contentQuery]);

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
