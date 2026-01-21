import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// [보안] 로그인 상태 관리 및 보호 라우트
import { AuthProvider, useAuth } from "./context/AuthContext"; // 경로 확인 필요
import PrivateRoute from "./components/route/PrivateRoute"; // 경로 확인 필요

// 레이아웃
import Layout from "./components/layout/Layout";

// 페이지들 - 인증
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";

// 자재
import MaterialInout from "./pages/Material/MaterialInout";
import MaterialHistory from "./pages/Material/MaterialHistory";

// 재고
import InventoryCurrent from "./pages/Inventory/InventoryCurrent";
import InventoryHistory from "./pages/Inventory/InventoryHistory";

// 생산
import WorkOrder from "./pages/Production/WorkOrder";
import ProductionSchedule from "./pages/Production/ProductionSchedule";
import WorkReport from "./pages/Production/WorkReport";
import ProductManagement from "./pages/ProductManagement";

// 설비 & 품질
import MachineList from "./pages/Equipment/MachineList";
import QualityDefect from "./pages/Quality/QualityDefect";
import ProductionRate from "./pages/Quality/ProductionRate";

// 지원
import Notice from "./pages/Support/Notice";
import CafeteriaMenu from "./pages/Support/CafeteriaMenu";

// 관리자
import EmployeeMgmt from "./pages/Admin/EmployeeMgmt";
import ProcessMgmt from "./pages/Admin/ProcessMgmt";
import WorkOrderMgmt from "./pages/Admin/WorkOrderMgmt";
import ProductionOrder from "./pages/Admin/ProductionOrder";

// [NEW] 모바일 전용 페이지
import MobileTracking from "./pages/Mobile/MobileTracking";

function App() {
  return (
    // 1. 앱 전체에 로그인 상태 공급 (새로고침 해도 유지됨)
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

// 2. 실제 라우팅 로직 분리 (useAuth 훅을 사용하기 위함)
const AppRoutes = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      {/* ----------------------------------------------------
        1. 로그인 페이지 처리 
        ----------------------------------------------------
        - 이미 로그인 상태라면 -> Dashboard로 이동
        - 아니라면 -> Login 페이지 표시
      */}
      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* ----------------------------------------------------
        2. 보호된 페이지 (로그인 필수) 
        ----------------------------------------------------
        - PrivateRoute가 감싸고 있어 로그인 안 하면 접근 불가
        - Layout이 적용되어 사이드바/헤더가 보임
      */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* 자재 */}
          <Route path="/material/inout" element={<MaterialInout />} />
          <Route path="/material/history" element={<MaterialHistory />} />

          {/* 재고 */}
          <Route path="/inventory/Current" element={<InventoryCurrent />} />
          <Route path="/inventory/history" element={<InventoryHistory />} />
          {/* (참고: 기존 코드에서 element가 MaterialHistory로 되어 있어 InventoryHistory로 수정했습니다) */}

          {/* 생산 */}
          <Route path="/production/order" element={<WorkOrder />} />
          <Route path="/production/schedule" element={<ProductionSchedule />} />
          <Route path="/production/report" element={<WorkReport />} />
          <Route path="/production/product" element={<ProductManagement />} />

          {/* 설비 & 품질 */}
          <Route path="/equipment" element={<MachineList />} />
          <Route path="/quality/defect" element={<QualityDefect />} />
          <Route path="/quality/rate" element={<ProductionRate />} />

          {/* 지원 업무 */}
          <Route path="/support/notice" element={<Notice />} />
          <Route path="/support/cafeteria" element={<CafeteriaMenu />} />

          {/* 관리자 */}
          <Route path="/admin/employees" element={<EmployeeMgmt />} />
          <Route path="/admin/process" element={<ProcessMgmt />} />
          <Route path="/admin/workOrder" element={<WorkOrderMgmt />} />
          <Route path="/admin/productionOrder" element={<ProductionOrder />} />
        </Route>
      </Route>

      {/* ----------------------------------------------------
        3. 모바일 / 공개 페이지
        ----------------------------------------------------
        - Layout 없음 (전체 화면)
        - 필요하다면 이 Route도 PrivateRoute 안으로 넣어서 잠글 수 있음
      */}
      <Route path="/mobile/tracking/:id" element={<MobileTracking />} />

      {/* ----------------------------------------------------
        4. 예외 처리 (404)
        ----------------------------------------------------
        - 잘못된 주소로 들어오면 홈(/)으로 보냄 -> 거기서 로그인 여부 판단
      */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
