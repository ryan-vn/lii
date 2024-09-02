import { FC } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
// import { IndexPage } from "./pages";
import App from "./pages/App";
import Login from "./pages/Login";

export const Router: FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/">
          <Route index element={<App />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};
