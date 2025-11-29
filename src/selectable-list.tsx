
import { useState, useMemo, useEffect, useCallback } from "react";
import { TextTree } from "./text-tree";
import type { IReactChildren } from "./ts/IReactChildren";
import './css/selectable_list.css';

interface ISelectableList extends IReactChildren {
  xmlTree: TextTree;
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
      <p>{civ.tagName}</p>
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


// import { useState } from "react";
// import { TextTree } from "./text-tree";
// import type { IReactChildren } from "./ts/IReactChildren"
// import './css/selectable_list.css'


// interface ISelectableList extends IReactChildren{
// xmlTree:TextTree,
// selectItem:(tagName:string)=>void
// }

// const SelectableList:React.FC<ISelectableList>  = ({xmlTree, selectItem}) => {
//   const [selectedItem, setSelectedItem] = useState("");
//   const [query, setQuery] = useState('');
//   const [contentQuery, setContentQuery] = useState(''); 
//   const [manualSelect, setManualSelect] = useState(false);   


//   // 🔑 Keep filtered DATA (not JSX)
//   const filteredEntries = Object.entries(xmlTree.textMap)
//     .filter(([key]) => key.toLowerCase().includes(query.toLowerCase()))
//     .filter(([, civ]) => civ.hasText(contentQuery));

// const items = filteredEntries .map(([key, civ])=>{
//         return  <div key={key}>
//         <p>{civ.tagName}</p>
//       </div>
//     })


//   // ✅ Auto-select 
//   if (!manualSelect&&filteredEntries.length>= 1) {
//     const [key] = filteredEntries[0];
//     if (selectedItem !== key) {
//       select(key, false);
//     }
//   }

//  function select(selectedKey:string, manual:boolean){
//   if(manual){setManualSelect(true)}
//     setSelectedItem(selectedKey||"")
//     selectItem(selectedKey, )
//  }

//  function handleTXTKEYFilterChange(event: any){
//     setManualSelect(false)
//     setQuery(event.target.value);
//  }

//   function handleContentFilterChange(event: any) {
//     setManualSelect(false)
//     setContentQuery(event.target.value);
//   }

//   return (

//     <div>
//         <div className="query-filter">
//           <input type="text" placeholder="Filter by TXT_KEY" onChange={handleTXTKEYFilterChange} />
//         </div>
//         <div className="query-filter">
//           <input type="text" placeholder="Filter by content" onChange={handleContentFilterChange} />
//         </div>
//       <div>
//         <div className='list-container'>
//           <ul className="select-list" style={{ listStyle: 'none', padding: 0 }}>
//             {items.map((item, index) => (
//               <li
//                 key={index}
//                 onClick={() => select(item.key || "", true)}
//                 className={(selectedItem === item.key && selectedItem !== "") ? 'selected' : ''}>
//                 {item}
//               </li>
//             ))}
//           </ul>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default SelectableList;