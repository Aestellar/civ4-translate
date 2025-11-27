
import { useState } from "react";
import { TextTree } from "./text-tree";
import type { IReactChildren } from "./ts/IReactChildren"
import './css/selectable_list.css'


interface ISelectableList extends IReactChildren{
xmlTree:TextTree,
selectItem:(tagName:string)=>void
}

const SelectableList:React.FC<ISelectableList>  = ({xmlTree, selectItem}) => {
  const [selectedItem, setSelectedItem] = useState("");
  const [query, setQuery] = useState('');
  const [contentQuery, setContentQuery] = useState(''); 


  // 🔑 Keep filtered DATA (not JSX)
  const filteredEntries = Object.entries(xmlTree.textMap)
    .filter(([key]) => key.toLowerCase().includes(query.toLowerCase()))
    .filter(([, civ]) => civ.hasText(contentQuery));

const items = filteredEntries .map(([key, civ])=>{
        return  <div key={key}>
        <p>{civ.tagName}</p>
      </div>
    })

  // ✅ Auto-select if only one item
  if (filteredEntries.length>= 1) {
    const [key] = filteredEntries[0];
    if (selectedItem !== key) {
      setSelectedItem(key);
      selectItem(key);
    }
  }

 function select(selectedKey:string){
    setSelectedItem(selectedKey||"")
    selectItem(selectedKey)
 }

 function handleTXTKEYFilterChange(event: any){
    setQuery(event.target.value);
 }

  function handleContentFilterChange(event: any) {
    setContentQuery(event.target.value);
  }

  return (

    <div>
        <div className="query-filter">
          <input type="text" placeholder="Filter by TXT_KEY" onChange={handleTXTKEYFilterChange} />
        </div>
        <div className="query-filter">
          <input type="text" placeholder="Filter by content" onChange={handleContentFilterChange} />
        </div>
      <div>
        <div className='list-container'>
          <ul className="select-list" style={{ listStyle: 'none', padding: 0 }}>
            {items.map((item, index) => (
              <li
                key={index}
                onClick={() => select(item.key || "")}
                className={(selectedItem === item.key && selectedItem !== "") ? 'selected' : ''}>
                {item}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default SelectableList;