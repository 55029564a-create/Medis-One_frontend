import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PrivateRoute = () => {
  const { isLoggedIn } = useAuth();

  // 로그인 했으면 자식 라우트(Outlet) 보여주고, 아니면 로그인 페이지로 쫓아냄
  return isLoggedIn ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
