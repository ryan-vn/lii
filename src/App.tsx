import axios from 'axios';
import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState()


  useEffect(()=> {
    axios.get('http://localhost:3000/Horde?_page=2&_per_page=3').then((res) => {
      console.log('data', res)
      setData(res.data)
    })
  },[])

  useEffect(() => {
    window.ipcRenderer.on('selected-file', (event, path) => {
      console.log(`Selected file: ${path}`);
    });

    window.ipcRenderer.on('file-changed', (event, path) => {
      console.log(`File changed: ${path}`);
      // 在这里添加处理文件变化的逻辑
    });

    return () => {
      window.ipcRenderer.off('selected-file', () => {});
      window.ipcRenderer.off('file-changed',() => {});
    };
  }, []);

  const openDialog = () => {
    window.ipcRenderer.send('open-file-dialog');
  };

  return (
    <div className="App">
      <h1>File Change Listener</h1>
      <button onClick={openDialog}>Open File</button>
    </div>
  );
}

export default App;
