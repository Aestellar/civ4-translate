import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import XmlEditor from './xml-editors'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <XmlEditor/>
  </StrictMode>,
)
