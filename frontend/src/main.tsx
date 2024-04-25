import React, { createContext } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux';
import './styles/index.css'

import App from './components/App.tsx'
import { store } from './store';
import { TreeNode, buildOpeningTree } from './chess.ts';

import eco from './eco_nested.json'
const openings = buildOpeningTree(eco)
export const OpeningsContext = createContext<TreeNode>(openings);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OpeningsContext.Provider value={openings}>
      <Provider store={store}>
        <App />
      </Provider>
    </OpeningsContext.Provider>
  </React.StrictMode>,
)
