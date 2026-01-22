import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. 상태 초기화
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // 깜빡임 방지용 로딩 상태

  // 2. 앱 실행 시(새로고침 시) 로그인 상태 복구
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("accessToken");
        const savedUser = localStorage.getItem("userInfo");

        // 토큰과 유저 정보가 모두 있어야 진짜 로그인 상태
        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
          setIsLoggedIn(true);
        } else {
          // 하나라도 없으면 로그아웃 처리 (청소)
          handleLogoutCleanup();
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        handleLogoutCleanup();
      } finally {
        setLoading(false); // 로딩 끝
      }
    };

    initializeAuth();
  }, []);

  // 3. 로그인 함수 (Login.js에서 호출)
  // Login.js가 이미 토큰은 localStorage에 저장했으므로, 여기선 상태 업데이트만 담당
  const login = (userData) => {
    // 유저 정보 영구 저장 (새로고침 대비)
    localStorage.setItem("userInfo", JSON.stringify(userData));

    // 상태 업데이트
    setUser(userData);
    setIsLoggedIn(true);
  };

  // 4. 로그아웃 함수 (내부/외부 공용)
  const handleLogoutCleanup = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");

    setUser(null);
    setIsLoggedIn(false);
  };

  const logout = () => {
    handleLogoutCleanup();
    // 필요하다면 메인으로 이동시키는 로직 추가 가능 (보통은 컴포넌트에서 처리)
    // window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, login, logout }}>
      {/* 로딩 중일 때는 아무것도 렌더링하지 않아 깜빡임 방지 */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
