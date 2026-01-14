import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 로그아웃 처리 로직이 들어갈 곳
    alert("로그아웃 되었습니다.");
    navigate("/"); // 로그인 화면으로 이동
  };

  return (
    <header style={headerStyle}>
      <h2>의료 디스플레이 MES 시스템</h2>
      <button onClick={handleLogout} style={buttonStyle}>
        로그아웃
      </button>
    </header>
  );
};

// --- 간단 스타일 ---
const headerStyle = {
  height: "60px",
  backgroundColor: "#fff",
  borderBottom: "1px solid #ddd",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 20px",
};

const buttonStyle = {
  padding: "5px 15px",
  backgroundColor: "#ff4d4f",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default Header;
