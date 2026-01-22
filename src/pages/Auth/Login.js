import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // [추가 1] Context 훅 불러오기
import client from "../../api/client";
import "./Login.css";

const Login = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 팝업 관련 상태
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // [추가 2] 전역 로그인 함수 가져오기

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // JWT 디코딩 함수
  // 백엔드 토큰에 들어있는 권한(auth)과 ID(sub)를 꺼내기 위함
  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // [핵심 변경] 실제 로그인 API 호출 로직
  const handleLogin = async () => {
    if (!employeeId || !password) {
      alert("사원번호와 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      // 1. 백엔드 로그인 API 호출
      // 백엔드 DTO: { employeeNumber, password }
      const response = await client.post("/auth/login", {
        employeeNumber: employeeId,
        password: password,
      });

      const { accessToken, refreshToken } = response.data;

      // 2. 토큰을 로컬 스토리지에 저장 (나중에 인터셉터가 갖다 씀)
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // 3. 토큰에서 유저 정보 추출 (Role, ID 등)
      const decoded = parseJwt(accessToken);

      // 주의: 현재 백엔드 토큰에는 '이름(name)'이나 '부서(dept)' 정보가 없습니다.
      // 필요하다면 백엔드 TokenProvider에 클레임을 추가하거나,
      // 로그인 후 내 정보 조회 API(/api/member/me)를 한 번 더 호출해야 합니다.
      const userInfo = {
        id: decoded?.sub || employeeId, // 토큰의 sub (memberId PK)
        employeeNumber: employeeId, // 입력한 사원번호
        role: decoded?.auth || "USER", // 토큰의 auth (예: ROLE_ADMIN)
        // name: "이름모름",              // 현재 알 수 없음
      };

      // 4. 전역 상태 로그인 처리
      login(userInfo);

      // 5. 페이지 이동
      navigate("/dashboard");
    } catch (error) {
      // 에러 처리
      if (error.response && error.response.status === 401) {
        alert("로그인 실패: 사원번호 또는 비밀번호가 일치하지 않습니다.");
      } else {
        alert("로그인 중 오류가 발생했습니다. 서버 상태를 확인해주세요.");
        console.error("Login Error:", error);
      }
    }
  };

  // 엔터키 기능
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  // --- (이하 팝업 관련 및 JSX 코드는 기존과 동일) ---

  // 비밀번호 찾기 클릭 시 초기화 후 열기
  const handleOpenModal = (e) => {
    e.preventDefault();
    setModalStep(1);
    setResetEmail("");
    setAuthCode("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // 인증번호 전송 버튼
  const handleSendCode = () => {
    if (!resetEmail) {
      alert("이메일을 입력해주세요.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setModalStep(2);
      alert(`[TEST] 인증번호가 ${resetEmail}로 발송되었습니다.`);
    }, 1500);
  };

  // 인증번호 확인 버튼
  const handleVerifyCode = () => {
    if (!authCode) {
      alert("인증번호를 입력해주세요.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setModalStep(3);
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-area">
          <img src="/Logo.png" alt="MedisONE Logo" className="logo-img" />
        </div>

        <div className="form-area">
          {/* 사원번호 입력창 */}
          <div className="input-group">
            <label className="input-label">사원 번호</label>
            <div className="input-wrapper">
              <input
                type="text"
                className="styled-input"
                placeholder="사원번호를 입력해주세요."
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          {/* 비밀번호 입력창 */}
          <div className="input-group">
            <label className="input-label">비밀 번호</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="styled-input"
                placeholder="비밀번호를 입력해주세요."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                className="eye-icon-btn"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  // 눈 아이콘 (보임)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  // 눈 아이콘 (숨김)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="reset-link-area">
            <a href="#" className="reset-link" onClick={handleOpenModal}>
              Reset Password?
            </a>
          </div>

          <div className="login-btn-area">
            <button className="login-btn" onClick={handleLogin}>
              로그인 하기
            </button>
          </div>
        </div>
      </div>

      {/* 팝업창 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            {modalStep === 1 && (
              <>
                <div className="modal-title">비밀번호 찾기</div>
                <div className="modal-desc">
                  가입하신 이메일 주소를 입력해주세요.
                  <br />
                  인증번호를 발송해 드립니다.
                </div>
                <input
                  type="email"
                  className="styled-input mb-4"
                  placeholder="name@medisone.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
                <div className="modal-buttons">
                  <button className="btn-cancel" onClick={closeModal}>
                    취소
                  </button>
                  <button className="btn-confirm" onClick={handleSendCode}>
                    {isLoading ? "전송 중..." : "인증번호 전송"}
                  </button>
                </div>
              </>
            )}

            {modalStep === 2 && (
              <>
                <div className="modal-title">인증번호 입력</div>
                <div className="modal-desc">
                  이메일로 전송된 6자리 인증번호를
                  <br />
                  입력해주세요.
                </div>
                <input
                  type="text"
                  className="styled-input mb-4"
                  placeholder="인증번호 6자리"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                />
                <div className="modal-buttons">
                  <button
                    className="btn-cancel"
                    onClick={() => setModalStep(1)}
                  >
                    뒤로
                  </button>
                  <button className="btn-confirm" onClick={handleVerifyCode}>
                    {isLoading ? "확인 중..." : "인증하기"}
                  </button>
                </div>
              </>
            )}

            {modalStep === 3 && (
              <>
                <div className="modal-title">인증 완료</div>
                <div className="modal-desc">
                  본인 인증이 완료되었습니다.
                  <br />
                  이메일로 임시 비밀번호가 발송되었습니다.
                </div>
                <div className="modal-buttons">
                  <button
                    className="btn-confirm"
                    onClick={closeModal}
                    style={{ flex: 1 }}
                  >
                    닫기
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
