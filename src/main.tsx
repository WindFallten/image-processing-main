import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import "the-new-css-reset/css/reset.css";
import './index.css'
import {ConfigProvider} from "antd";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <ConfigProvider
          theme={{
              token: {
                  // Seed Token
                  colorPrimary: '#F4801A',
                  borderRadius: 2,

                  // Alias Token
                  colorBgContainer: '#ffffff',
              },
          }}
      >
        <App />
      </ConfigProvider>
  </React.StrictMode>,
)
