import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. 유저 정보 먼저 가져오기
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("userInfo");
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  // 2. [핵심 수정] 로그인 상태 초기값 설정 시, '유저 정보'가 없으면 가차없이 false 처리
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const isLogged = localStorage.getItem("isLoggedIn") === "true";
    const hasUserInfo = localStorage.getItem("userInfo") !== null;

    // 둘 다 있어야 진짜 로그인 상태임!
    return isLogged && hasUserInfo;
  });

  // 상태가 꼬였을 때를 대비한 안전장치 (유저 정보 없으면 강제 로그아웃)
  useEffect(() => {
    if (isLoggedIn && !user) {
      logout();
    }
  }, [isLoggedIn, user]);

  // 로그인 함수
  const login = (userData) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userInfo", JSON.stringify(userData));
    setIsLoggedIn(true);
    setUser(userData);
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userInfo");
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
