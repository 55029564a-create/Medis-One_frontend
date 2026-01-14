import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div style={{ display: "flex" }}>
      {/* 1. 왼쪽 사이드바 */}
      <Sidebar />

      {/* 2. 오른쪽 메인 영역 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header />

        {/* 실제 페이지 내용이 들어가는 곳 */}
        <main
          style={{
            padding: "20px",
            backgroundColor: "#f5f5f5",
            height: "calc(100vh - 60px)",
            overflow: "auto",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
