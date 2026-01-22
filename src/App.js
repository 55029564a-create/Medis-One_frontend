import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// [보안 & 상태관리] 인증 및 탭(Keep-Alive) 컨텍스트
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TabProvider, useTabs } from "./context/TabContext"; // 탭 상태 관리
import PrivateRoute from "./components/route/PrivateRoute";

// [레이아웃]
import Layout from "./components/layout/Layout";

// ===================== [페이지 Import] =====================
// *경로가 변경된 부분들(Process 폴더 등)을 정확히 반영했습니다.

// 1. 인증
import Login from "./pages/Auth/Login";
import MyPage from "./pages/Auth/MyPage";

// 2. 대시보드
import Dashboard from "./pages/Dashboard/Dashboard";

// 3. 자재 관리
import MaterialInout from "./pages/Material/MaterialInout";
import MaterialHistory from "./pages/Material/MaterialHistory";
import LotTracking from "./pages/Material/LotTracking";

// 4. 재고 관리
import InventoryCurrent from "./pages/Inventory/InventoryCurrent";
import InventoryHistory from "./pages/Inventory/InventoryHistory";

// 5. 생산 관리
import WorkOrder from "./pages/Production/WorkOrder";
import ProductionSchedule from "./pages/Production/ProductionSchedule";
import WorkReport from "./pages/Production/WorkReport";
import ProductManagement from "./pages/ProductManagement"; // (경로 확인 완료)

// 6. 프로세스 (Process - 신규 경로 반영)
import ProcessAssembly from "./pages/Process/ProcessAssembly";
import ProcessBonding from "./pages/Process/ProcessBonding";
import AgingStatus from "./pages/Process/AgingStatus";

// 7. 설비 관리
import MachineList from "./pages/Equipment/MachineList";
import MachineDetail from "./pages/Equipment/MachineDetail";

// 8. 품질 관리
import QualityDefect from "./pages/Quality/QualityDefect";
import ProductionRate from "./pages/Quality/ProductionRate";
import CalibrationReport from "./pages/Quality/CalibarationReport"; // (오타명 유지)
import ReliabilityTest from "./pages/Quality/ReliabilityTest";

// 9. 이력 추적
import DeviceHistory from "./pages/Traceability/DeviceHistory";

// 10. 시스템/관리자
import EmployeeMgmt from "./pages/Admin/EmployeeMgmt";
import ProcessMgmt from "./pages/Admin/ProcessMgmt";
import WorkOrderMgmt from "./pages/Admin/WorkOrderMgmt";
import ProductionOrder from "./pages/Admin/ProductionOrder";

// 11. 지원 업무
import Notice from "./pages/Support/Notice";
import CafeteriaMenu from "./pages/Support/CafeteriaMenu";

// 12. 모바일
import MobileTracking from "./pages/Mobile/MobileTracking";

// 📝 [설정] 상태 유지를 위한 라우트 설정 (Keep-Alive Route Config)
// 여기에 정의된 페이지들은 탭을 닫기 전까지 데이터가 초기화되지 않습니다.
const ROUTE_CONFIG = [
  { path: "/dashboard", element: <Dashboard />, name: "대시보드" },
  { path: "/mypage", element: <MyPage />, name: "마이페이지" },

  // 자재
  { path: "/material/inout", element: <MaterialInout />, name: "자재 입출고" },
  {
    path: "/material/history",
    element: <MaterialHistory />,
    name: "입/출고 이력",
  },
  { path: "/material/lot", element: <LotTracking />, name: "LOT 추적" },

  // 재고
  {
    path: "/inventory/current",
    element: <InventoryCurrent />,
    name: "재고 현황",
  },
  {
    path: "/inventory/history",
    element: <InventoryHistory />,
    name: "재고 이력",
  },

  // 생산
  { path: "/production/order", element: <WorkOrder />, name: "작업 지시" },
  {
    path: "/production/schedule",
    element: <ProductionSchedule />,
    name: "생산 일정",
  },
  { path: "/production/report", element: <WorkReport />, name: "생산 실적" },
  {
    path: "/production/product",
    element: <ProductManagement />,
    name: "품목 관리",
  },

  // 프로세스 (경로 업데이트됨)
  {
    path: "/process/assembly",
    element: <ProcessAssembly />,
    name: "조립 공정",
  },
  { path: "/process/bonding", element: <ProcessBonding />, name: "본딩 공정" },
  { path: "/process/aging", element: <AgingStatus />, name: "에이징 현황" },

  // 설비 (리스트만 Keep-Alive, 상세페이지는 별도 처리)
  { path: "/equipment", element: <MachineList />, name: "설비 모니터링" },

  // 품질
  { path: "/quality/defect", element: <QualityDefect />, name: "불량 관리" },
  { path: "/quality/rate", element: <ProductionRate />, name: "생산 효율" },
  {
    path: "/quality/calibration",
    element: <CalibrationReport />,
    name: "캘리브레이션",
  },
  {
    path: "/quality/reliability",
    element: <ReliabilityTest />,
    name: "신뢰성 테스트",
  },

  // 추적
  {
    path: "/traceability/dhr",
    element: <DeviceHistory />,
    name: "이력 추적(DHR)",
  },

  // 관리자
  { path: "/admin/employees", element: <EmployeeMgmt />, name: "사원 관리" },
  { path: "/admin/process", element: <ProcessMgmt />, name: "공정 관리" },
  {
    path: "/admin/work-order",
    element: <WorkOrderMgmt />,
    name: "작업 지시(Admin)",
  },
  {
    path: "/admin/production-order",
    element: <ProductionOrder />,
    name: "생산 지시(Admin)",
  },

  // 지원
  { path: "/support/notice", element: <Notice />, name: "공지사항" },
  { path: "/support/cafeteria", element: <CafeteriaMenu />, name: "식단표" },
];

function App() {
  return (
    <AuthProvider>
      <TabProvider>
        {" "}
        {/* 탭 상태 관리(Keep-Alive) 공급자 추가 */}
        <AppRoutes />
      </TabProvider>
    </AuthProvider>
  );
}

// 실제 라우팅 로직
const AppRoutes = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      {/* 1. 공개 라우트 (로그인/모바일) - Keep-Alive 적용 X */}
      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route path="/mobile/tracking" element={<MobileTracking />} />
      <Route path="/mobile/tracking/:id" element={<MobileTracking />} />

      {/* 2. 보호된 라우트 (레이아웃 + Keep-Alive 적용) */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          {/* [핵심] "*" 경로로 모든 요청을 받아서, 
             KeepAliveManager가 URL에 맞는 페이지를 찾아 '숨김/표시' 처리함
          */}
          <Route path="*" element={<KeepAliveManager />} />
        </Route>
      </Route>
    </Routes>
  );
};

// [핵심] 페이지 상태 유지 관리자 컴포넌트
const KeepAliveManager = () => {
  const location = useLocation();
  const { tabs, addTab } = useTabs();

  // URL 변경 시, 탭 목록에 자동 추가 (Header와 연동)
  useEffect(() => {
    const currentPath = location.pathname;

    // 1. 일반 페이지 매칭
    const config = ROUTE_CONFIG.find((r) => r.path === currentPath);
    if (config) {
      addTab(config.path, config.name);
    }
    // 2. 설비 상세 페이지 (동적 라우트 예외 처리)
    else if (currentPath.startsWith("/equipment/detail/")) {
      addTab(currentPath, "설비 상세");
    }
  }, [location.pathname, addTab]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        let PageComponent = null;

        // 1. 일반 페이지 찾기
        const config = ROUTE_CONFIG.find((r) => r.path === tab.path);

        if (config) {
          PageComponent = config.element;
        }
        // 2. 동적 라우트 페이지 처리 (설비 상세)
        else if (tab.path.startsWith("/equipment/detail/")) {
          // 상세 페이지는 상태 유지를 하더라도 ID가 바뀌면 내용이 바뀌어야 하므로
          // 완벽한 유지보다는 현재 탭에 맞는 컴포넌트를 렌더링
          return (
            <div
              key={tab.path}
              style={{
                display: isActive ? "block" : "none",
                height: "100%",
                overflow: "auto",
              }}
            >
              <MachineDetail />
            </div>
          );
        }

        if (!PageComponent) return null;

        return (
          <div
            key={tab.path}
            style={{
              display: isActive ? "block" : "none", // 화면에서 제거하지 않고 숨김 처리
              height: "100%",
              overflow: "auto", // 스크롤 유지
            }}
          >
            {PageComponent}
          </div>
        );
      })}
    </div>
  );
};

export default App;
