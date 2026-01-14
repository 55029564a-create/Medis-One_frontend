// src/components/layout/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
// 헤더랑 사이드바 만들었으면 import 하세요
// import Header from './Header';
// import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div style={{ display: "flex" }}>
      {/* <Sidebar />  <-- 여기에 사이드바 배치 */}

      <div style={{ flex: 1 }}>
        {/* <Header /> <-- 여기에 헤더 배치 */}

        {/* 실제 페이지 내용이 바뀌는 부분 */}
        <main style={{ padding: "20px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
