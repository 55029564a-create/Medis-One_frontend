import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return (
    <div style={containerStyle}>
      <div style={loginBoxStyle}>
        <h1 style={{ color: "#8C85FF", marginBottom: "20px" }}>MedisOne</h1>
        <p style={{ marginBottom: "30px", color: "#666" }}>
          로그인이 필요합니다.
        </p>

        {/* 입력 폼 영역 */}
        <div className="form-area">
          {/* 사원 번호 입력 */}
          <div className="input-group">
            <label htmlFor="employeeId" className="input-label">
              사원 번호
            </label>
            <input
              type="text"
              id="employeeId"
              placeholder="사원번호를 입력해주세요."
              className="styled-input"
            />
          </div>

          {/* 비밀 번호 입력 */}
          <div className="input-group">
            <label htmlFor="password" className="input-label">
              비밀 번호
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="비밀번호를 입력해주세요."
                className="styled-input"
                style={{ paddingRight: "3rem" }}
              />

              <button
                type="button"
                className="eye-icon-btn"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Reset Password 링크 */}
          <div className="reset-link-area">
            <a href="#" className="reset-link">
              Reset Password?
            </a>
          </div>

          {/* 로그인 버튼 */}
          <div className="login-btn-area">
            {/* 4. onClick 이벤트 연결 */}
            <button className="login-btn" onClick={handleLogin}>
              로그인 하기
            </button>
          </div>
        </div>
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
  backgroundColor: "#8C85FF",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  marginTop: "10px",
};

export default Login;
