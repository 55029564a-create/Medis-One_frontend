import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 1. 상태 초기화
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // 깜빡임 방지 필수

  // 2. 초기화 (새로고침 시 복구)
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("accessToken");
        const savedUser = localStorage.getItem("user"); // 키 이름 통일 ('user')

        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
          setIsLoggedIn(true);
        } else {
          handleLogoutCleanup();
        }
      } catch (error) {
        console.error("Auth init failed:", error);
        handleLogoutCleanup();
      } finally {
        setLoading(false); // 로딩 끝
      }
    };
    initializeAuth();
  }, []);

  // 3. 로그인 함수
  const login = (userData) => {
    // userData 안에 accessToken, name, dept 등이 다 있다고 가정

    // 로컬 스토리지 저장 (여기서 확실하게 저장하는 것이 좋음)
    localStorage.setItem("accessToken", userData.accessToken);
    localStorage.setItem("user", JSON.stringify(userData)); // 객체 전체 저장

    setUser(userData);
    setIsLoggedIn(true);
  };

  // 4. 로그아웃 (청소)
  const handleLogoutCleanup = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  const logout = () => {
    handleLogoutCleanup();
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, login, logout }}>
      {/* 로딩이 끝나야만 자식 컴포넌트를 보여줌 (깜빡임 방지) */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
