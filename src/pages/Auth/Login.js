import React from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // 로그인 버튼 누르면 대시보드로 이동
    navigate("/dashboard");
  };

  return (
    <div style={containerStyle}>
      <div style={loginBoxStyle}>
        <h1 style={{ color: "#0056b3", marginBottom: "20px" }}>MES System</h1>
        <p style={{ marginBottom: "30px", color: "#666" }}>
          로그인이 필요합니다.
        </p>

        <input type="text" placeholder="사원번호" style={inputStyle} />
        <br />
        <input type="password" placeholder="비밀번호" style={inputStyle} />
        <br />

        <button onClick={handleLogin} style={buttonStyle}>
          로그인 하기
        </button>
      </div>
    </div>
  );
};

// --- 스타일 (화면에 보이게 하기 위함) ---
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  backgroundColor: "#f0f2f5",
};

const loginBoxStyle = {
  width: "350px",
  padding: "40px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  textAlign: "center",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "4px",
  border: "1px solid #ddd",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#0056b3",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  marginTop: "10px",
};

export default Login;
