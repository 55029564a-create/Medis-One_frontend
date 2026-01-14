import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // 아까 만든 App 불러오기

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    {/* 3. 앱 실행 */}
    <App />
  </React.StrictMode>
);
