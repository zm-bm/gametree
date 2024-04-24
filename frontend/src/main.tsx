import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux';

import { store } from './store';
import App from './components/App.tsx'
import './styles/index.css'
import "@react-sigma/core/lib/react-sigma.min.css"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
