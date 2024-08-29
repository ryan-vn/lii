import axios from 'axios';
import React, { useEffect, useState } from 'react';
import EChartsComponent from './components/echarts';

function App() {

  useEffect(() => {
    window.ipcRenderer.on('selected-file', (event, path) => {
      console.log(`Selected file: ${path}`);
    });

    window.ipcRenderer.on('file-changed', (event, path) => {
      console.log(`File changed: ${path}`);
      // 在这里添加处理文件变化的逻辑
    });

    return () => {
      window.ipcRenderer.off('selected-file', () => { });
      window.ipcRenderer.off('file-changed', () => { });
    };
  }, []);

  const openDialog = () => {
    window.ipcRenderer.send('open-file-dialog');
  };

  const parseFile = () => {
    window.ipcRenderer.send('select-tsm-file');
  };

  return (
    <div className="App">
      <h1>File Change Listener</h1>
      <button onClick={openDialog}>Open File</button>

      <button onClick={parseFile}>Parse lua</button>
      <EChartsComponent />
    </div>
  );
}

export default App;
