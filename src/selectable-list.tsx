
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

  // Extract items from xmlTree (assuming it's an array of strings)
    const items =  Object.entries(xmlTree.textMap)
    .filter(([key])=>{
      return key.toLowerCase().includes(query.toLowerCase())
    })
    .filter(([,civ])=>{
      let civText = civ.getContentText()
      return civText.toLowerCase().includes(contentQuery.toLowerCase())
    })
    .map(([key, civ])=>{
        return  <div key={key}>
          <p>{civ.tagName}</p>
        </div>
})

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