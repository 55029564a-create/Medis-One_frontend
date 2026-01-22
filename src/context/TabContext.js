import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const TabContext = createContext();

export const TabProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. 초기값: 로컬스토리지 사용 (새로고침 유지)
  const [tabs, setTabs] = useState(() => {
    const saved = localStorage.getItem("openedTabs");
    return saved
      ? JSON.parse(saved)
      : [{ path: "/dashboard", name: "대시보드" }];
  });

  // 2. 변경 시 저장
  useEffect(() => {
    localStorage.setItem("openedTabs", JSON.stringify(tabs));
  }, [tabs]);

  const addTab = (path, name) => {
    if (tabs.find((t) => t.path === path)) return;
    setTabs((prev) => [...prev, { path, name }]);
  };

  const removeTab = (path) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter((t) => t.path !== path);
    setTabs(newTabs);
    if (location.pathname === path) {
      const lastTab = newTabs[newTabs.length - 1];
      navigate(lastTab.path);
    }
  };

  // ★ 중요: setTabs를 여기서 export 해야 Header에서 순서를 바꿀 수 있음
  return (
    <TabContext.Provider value={{ tabs, setTabs, addTab, removeTab }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTabs = () => useContext(TabContext);
