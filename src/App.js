import React, { useEffect, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import styled from "styled-components";

// [보안 & 상태관리]
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TabProvider, useTabs } from "./context/TabContext";
import PrivateRoute from "./components/route/PrivateRoute";

// [레이아웃]
import Layout from "./components/layout/Layout";
// ===================== [페이지 Lazy Import] =====================
// 초기 로딩 속도 개선을 위해 React.lazy 적용

// 1. 인증
const Login = lazy(() => import("./pages/Auth/Login"));

// 2. 대시보드
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));

// 3. 자재 관리
const MaterialInout = lazy(() => import("./pages/Material/MaterialInout"));
const MaterialHistory = lazy(() => import("./pages/Material/MaterialHistory"));
const LotTracking = lazy(() => import("./pages/Traceability/LotTracking"));

// 4. 재고 관리
const InventoryCurrent = lazy(
  () => import("./pages/Inventory/InventoryCurrent"),
);
const InventoryHistory = lazy(
  () => import("./pages/Inventory/InventoryHistory"),
);

// 5. 생산 관리
const BomManagement = lazy(() => import("./pages/Production/BomManagement"));
const WorkOrder = lazy(() => import("./pages/Process/WorkOrder"));
const ProductionSchedule = lazy(
  () => import("./pages/Production/ProductionSchedule"),
);
const WorkReport = lazy(() => import("./pages/Process/WorkReport"));
const ProductMgmt = lazy(() => import("./pages/Production/ProductMgmt"));

// 6. 프로세스
const ProcessBonding = lazy(() => import("./pages/Quality/ProcessBonding"));
const AgingStatus = lazy(() => import("./pages/Quality/AgingStatus"));

// 7. 설비 관리
const EquipmentList = lazy(() => import("./pages/Equipment/EquipmentList"));
const EquipmentDetail = lazy(() => import("./pages/Equipment/EquipmentDetail"));

// 8. 품질 관리
const QualityDefect = lazy(() => import("./pages/Quality/QualityDefect"));
const ProductionRate = lazy(() => import("./pages/Quality/ProductionRate"));
const CalibrationReport = lazy(
  () => import("./pages/Quality/CalibarationReport"),
);
const ReliabilityTest = lazy(() => import("./pages/Quality/ReliabilityTest"));

// 9. 이력 추적
const DeviceHistory = lazy(() => import("./pages/Traceability/DeviceHistory"));

// 10. 시스템/관리자
const EmployeeMgmt = lazy(() => import("./pages/Admin/EmployeeMgmt"));
const ProcessMgmt = lazy(() => import("./pages/Admin/ProcessMgmt"));
const WorkOrderMgmt = lazy(() => import("./pages/Admin/WorkOrderMgmt"));
const ProductionOrder = lazy(() => import("./pages/Admin/ProductionOrder"));

// 11. 지원 업무
const Notice = lazy(() => import("./pages/Support/Notice"));
const CafeteriaMenu = lazy(() => import("./pages/Support/CafeteriaMenu"));

// 12. 모바일
const MobileTracking = lazy(() => import("./pages/Mobile/MobileTracking"));

// --- Loading Component ---
const LoadingScreen = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  color: #666;
`;

// 📝 라우트 설정
const ROUTE_CONFIG = [
  { path: "/dashboard", element: <Dashboard />, name: "대시보드" },
  // 자재
  { path: "/material/inout", element: <MaterialInout />, name: "자재 입출고" },
  {
    path: "/material/history",
    element: <MaterialHistory />,
    name: "입/출고 이력",
  },
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
  { path: "/production/bom", element: <BomManagement />, name: "BOM 관리" },
  {
    path: "/production/schedule",
    element: <ProductionSchedule />,
    name: "생산 일정",
  },
  {
    path: "/production/product",
    element: <ProductMgmt />,
    name: "제품 관리",
  },
  // 프로세스
  { path: "/process/order", element: <WorkOrder />, name: "작업 지시서" },
  { path: "/process/report", element: <WorkReport />, name: "생산 보고" },
  // 설비
  { path: "/equipment", element: <EquipmentList />, name: "설비 모니터링" },
  // 품질
  { path: "/quality/defect", element: <QualityDefect />, name: "불량 관리" },
  { path: "/quality/rate", element: <ProductionRate />, name: "생산 효율" },
  { path: "/quality/bonding", element: <ProcessBonding />, name: "본딩 공정" },
  { path: "/quality/aging", element: <AgingStatus />, name: "에이징 현황" },
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
  { path: "/traceability/lot", element: <LotTracking />, name: "LOT 추적" },
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
        <Suspense fallback={<LoadingScreen>Loading...</LoadingScreen>}>
          <AppRoutes />
        </Suspense>
      </TabProvider>
    </AuthProvider>
  );
}

const AppRoutes = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      {/* 공개 라우트 */}
      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route path="/mobile/tracking" element={<MobileTracking />} />
      <Route path="/mobile/tracking/:id" element={<MobileTracking />} />

      {/* 보호된 라우트 (Keep-Alive 적용) */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="*" element={<KeepAliveManager />} />
        </Route>
      </Route>
    </Routes>
  );
};

// [Keep-Alive Manager]
const KeepAliveManager = () => {
  const location = useLocation();
  const { tabs, addTab } = useTabs();

  // 탭 추가 로직
  useEffect(() => {
    const currentPath = location.pathname;
    const config = ROUTE_CONFIG.find((r) => r.path === currentPath);

    if (config) {
      addTab(config.path, config.name);
    } else if (currentPath.startsWith("/equipment/detail/")) {
      addTab(currentPath, "설비 상세");
    }
  }, [location.pathname, addTab]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        let pageElement = null;

        // 1. 일반 페이지 매칭
        const config = ROUTE_CONFIG.find((r) => r.path === tab.path);
        if (config) {
          pageElement = config.element;
        }
        // 2. 동적 페이지 매칭 (설비 상세) -> 🔥 여기를 수정하세요!
        else if (tab.path.startsWith("/equipment/detail/")) {
          // URL에서 ID 추출 (예: /equipment/detail/EQ-10 -> EQ-10)
          const machineId = tab.path.split("/").pop();
          // 추출한 ID를 props로 전달
          pageElement = <EquipmentDetail machineId={machineId} />;
        }

        if (!pageElement) return null;

        return (
          <div
            key={tab.path}
            style={{
              display: isActive ? "block" : "none",
              height: "100%",
              overflow: "auto",
            }}
          >
            <Suspense fallback={<LoadingScreen>Loading Tab...</LoadingScreen>}>
              {pageElement}
            </Suspense>
          </div>
        );
      })}
    </div>
  );
};

export default App;
