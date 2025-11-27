
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
  const [manualSelect, setManualSelect] = useState(false);   


  // 🔑 Keep filtered DATA (not JSX)
  const filteredEntries = Object.entries(xmlTree.textMap)
    .filter(([key]) => key.toLowerCase().includes(query.toLowerCase()))
    .filter(([, civ]) => civ.hasText(contentQuery));

const items = filteredEntries .map(([key, civ])=>{
        return  <div key={key}>
        <p>{civ.tagName}</p>
      </div>
    })


  // ✅ Auto-select 
  if (!manualSelect&&filteredEntries.length>= 1) {
    const [key] = filteredEntries[0];
    if (selectedItem !== key) {
      select(key, false);
    }
  }

 function select(selectedKey:string, manual:boolean){
  if(manual){setManualSelect(true)}
    setSelectedItem(selectedKey||"")
    selectItem(selectedKey, )
 }

 function handleTXTKEYFilterChange(event: any){
    setManualSelect(false)
    setQuery(event.target.value);
 }

  function handleContentFilterChange(event: any) {
    setManualSelect(false)
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
                onClick={() => select(item.key || "", true)}
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