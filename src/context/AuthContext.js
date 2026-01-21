import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 초기값을 localStorage에서 가져옴 (새로고침 해도 유지되도록)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  // 로그인 함수
  const login = () => {
    localStorage.setItem("isLoggedIn", "true"); // 저장소에 기록
    setIsLoggedIn(true);
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem("isLoggedIn"); // 저장소에서 삭제
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 다른 컴포넌트에서 쉽게 쓰기 위한 훅
export const useAuth = () => useContext(AuthContext);
