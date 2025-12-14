import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MainWindow from './main-window'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MainWindow/>
  </StrictMode>,
)
