import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

const TabContext = createContext();

export const TabProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // [핵심] 삭제 중인 탭을 추적하는 Ref (렌더링 없이 즉시 값 저장)
  const removingRef = useRef(null);

  // 1. 초기값: 로컬스토리지 사용
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

  // 탭 추가 (좀비 부활 방지 로직 적용)
  const addTab = (path, name) => {
    // 1) 이미 존재하는지 체크
    if (tabs.find((t) => t.path === path)) return;

    // 2) [중요] 방금 삭제 버튼을 누른 탭이라면 추가하지 않음 (부활 차단)
    if (removingRef.current === path) return;

    setTabs((prev) => [...prev, { path, name }]);
  };

  // 탭 닫기 (크롬 스타일 + 안전한 이동)
  const removeTab = (targetPath) => {
    if (targetPath === "/dashboard") return; // 대시보드 삭제 불가

    // [중요] 삭제 중임을 표시 (App.js의 addTab이 감지하도록)
    removingRef.current = targetPath;

    // 현재 탭 목록 복사
    const currentTabs = [...tabs];
    const targetIndex = currentTabs.findIndex((t) => t.path === targetPath);
    if (targetIndex === -1) return;

    // 만약 '현재 보고 있는 화면'을 닫으려고 한다면? -> 먼저 이동해야 함
    if (location.pathname === targetPath) {
      let nextPath = "/dashboard"; // 갈 곳 없으면 홈으로

      // [Chrome Logic]
      // 1. 오른쪽 탭이 있는가? (중간을 닫았을 때 오른쪽 화면 보여주기)
      if (targetIndex + 1 < currentTabs.length) {
        nextPath = currentTabs[targetIndex + 1].path;
      }
      // 2. 오른쪽이 없고, 왼쪽 탭이 있는가? (맨 끝을 닫았을 때 왼쪽 화면 보여주기)
      else if (targetIndex - 1 >= 0) {
        nextPath = currentTabs[targetIndex - 1].path;
      }

      // 페이지 이동
      navigate(nextPath);
    }

    // 탭 목록에서 제거 (즉시 반영)
    setTabs((prev) => prev.filter((t) => t.path !== targetPath));

    // 잠시 후 삭제 상태 해제 (충분한 시간 뒤에)
    setTimeout(() => {
      removingRef.current = null;
    }, 500);
  };

  // 순서 변경 (DND용)
  const reorderTabs = (startIndex, endIndex) => {
    const result = Array.from(tabs);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setTabs(result);
  };

  return (
    <TabContext.Provider
      value={{ tabs, setTabs, addTab, removeTab, reorderTabs }}
    >
      {children}
    </TabContext.Provider>
  );
};

export const useTabs = () => useContext(TabContext);
