import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";

import "./demos/ipc";
import { Router } from "./router";

// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router />
    </Provider>
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");
