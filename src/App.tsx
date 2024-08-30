import axios from "axios";
import React, { useEffect, useState } from "react";
import EChartsComponent from "./components/echarts";
import { Button } from "antd";

function App() {
  useEffect(() => {
    window.ipcRenderer.on("selected-file", (event, path) => {
      console.log(`Selected file: ${path}`);
    });

    window.ipcRenderer.on("file-changed", (event, path) => {
      console.log(`File changed: ${path}`);
      // 在这里添加处理文件变化的逻辑
    });

    return () => {
      window.ipcRenderer.off("selected-file", () => {});
      window.ipcRenderer.off("file-changed", () => {});
    };
  }, []);

  const [serverList, setServerList] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/region")
      .then((res) => setServerList(res.data));
  }, []);

  const openDialog = () => {
    window.ipcRenderer.send("open-file-dialog");
  };

  const parseFile = () => {
    window.ipcRenderer.send("select-tsm-file", { serverList });
  };

  return (
    <div className="App">
      <h1>File Change Listener</h1>

      <Button onClick={openDialog} type="primary">
        Open File
      </Button>

      <Button onClick={parseFile} type="primary">
        Button
      </Button>
      <EChartsComponent />
    </div>
  );
}

export default App;
