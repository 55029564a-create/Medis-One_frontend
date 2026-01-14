import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js"; // 아까 만든 App 불러오기

// 1. 스타일드 컴포넌트 전역 스타일 (아까 만드신 거)
// 만약 파일 안 만들었으면 이 줄은 지우거나 주석 처리하세요!
import GlobalStyle from "./styles/GlobalStyle";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    {/* 2. 전역 스타일 적용 (모든 페이지에 공통 적용됨) */}
    <GlobalStyle />

    {/* 3. 앱 실행 */}
    <App />
  </React.StrictMode>
);
