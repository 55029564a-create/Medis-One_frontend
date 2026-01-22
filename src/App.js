import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// [보안] 인증 컨텍스트 & 보호된 라우트
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/route/PrivateRoute";

// [레이아웃]
import Layout from "./components/layout/Layout";

// ===================== [페이지 Import] =====================

// 1. 인증 (Auth)
import Login from "./pages/Auth/Login";
import MyPage from "./pages/Auth/MyPage";

// 2. 대시보드 (Dashboard)
import Dashboard from "./pages/Dashboard/Dashboard";

// 3. 자재 관리 (Material)
import MaterialInout from "./pages/Material/MaterialInout";
import MaterialHistory from "./pages/Material/MaterialHistory";
import LotTracking from "./pages/Material/LotTracking";

// 4. 재고 관리 (Inventory)
import InventoryCurrent from "./pages/Inventory/InventoryCurrent";
import InventoryHistory from "./pages/Inventory/InventoryHistory";

// 5. 생산 관리 (Production)
import WorkOrder from "./pages/Production/WorkOrder";
import ProductionSchedule from "./pages/Production/ProductionSchedule";
import WorkReport from "./pages/Production/WorkReport";
import ProductManagement from "./pages/ProductManagement"; // 품목 관리 (위치: pages root)

// 6. 프로세스 (Process)
import ProcessAssembly from "./pages/Process/ProcessAssembly"; // 조립 공정
import ProcessBonding from "./pages/Process/ProcessBonding"; // 본딩 공정
import AgingStatus from "./pages/Process/AgingStatus"; // 에이징

// 7. 설비 관리 (Equipment)
import MachineList from "./pages/Equipment/MachineList";
import MachineDetail from "./pages/Equipment/MachineDetail";

// 8. 품질 관리 (Quality)
import QualityDefect from "./pages/Quality/QualityDefect";
import ProductionRate from "./pages/Quality/ProductionRate";
import CalibrationReport from "./pages/Quality/CalibarationReport"; // 캘리브레이션 (파일명 오타 반영)
import ReliabilityTest from "./pages/Quality/ReliabilityTest"; // 신뢰성

// 9. 이력 추적 (Traceability)
import DeviceHistory from "./pages/Traceability/DeviceHistory"; // DHR

// 10. 시스템/관리자 (Admin)
import EmployeeMgmt from "./pages/Admin/EmployeeMgmt";
import ProcessMgmt from "./pages/Admin/ProcessMgmt";
import WorkOrderMgmt from "./pages/Admin/WorkOrderMgmt";
import ProductionOrder from "./pages/Admin/ProductionOrder";

// 11. 지원 업무 (Support)
import Notice from "./pages/Support/Notice";
import CafeteriaMenu from "./pages/Support/CafeteriaMenu";

// 12. 모바일 (Mobile)
import MobileTracking from "./pages/Mobile/MobileTracking";

function App() {
  return (
    // 전체 앱에 인증 상태 공급
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

// 라우팅 로직 분리
const AppRoutes = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      {/* ----------------------------------------------------------------
         1. 공개 라우트 (로그인 불필요)
      ---------------------------------------------------------------- */}
      {/* 루트 접속 시: 로그인 되어있으면 대시보드, 아니면 로그인 페이지 */}
      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* 모바일 트래킹 (단독 페이지, 레이아웃 없음) */}
      <Route path="/mobile/tracking" element={<MobileTracking />} />
      <Route path="/mobile/tracking/:id" element={<MobileTracking />} />

      {/* ----------------------------------------------------------------
         2. 보호된 라우트 (로그인 필수 + 레이아웃 적용)
      ---------------------------------------------------------------- */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          {/* === 대시보드 === */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mypage" element={<MyPage />} />
          {/* === 자재 관리 === */}
          <Route path="/material/inout" element={<MaterialInout />} />
          <Route path="/material/history" element={<MaterialHistory />} />
          <Route path="/material/lot" element={<LotTracking />} />
          {/* === 재고 관리 === */}
          <Route path="/inventory/current" element={<InventoryCurrent />} />
          <Route path="/inventory/history" element={<InventoryHistory />} />
          {/* === 생산 관리 === */}
          <Route path="/production/order" element={<WorkOrder />} />{" "}
          {/* 작업지시 */}
          <Route path="/production/schedule" element={<ProductionSchedule />} />
          <Route path="/production/report" element={<WorkReport />} />{" "}
          {/* 생산실적 */}
          <Route
            path="/production/product"
            element={<ProductManagement />}
          />{" "}
          {/* 품목관리 */}
          {/* === 프로세스 === */}
          <Route path="/process/assembly" element={<ProcessAssembly />} />
          <Route path="/process/bonding" element={<ProcessBonding />} />
          <Route path="/process/aging" element={<AgingStatus />} />
          {/* === 설비 관리 === */}
          <Route path="/equipment" element={<MachineList />} />
          <Route
            path="/equipment/detail/:id"
            element={<MachineDetail />}
          />{" "}
          {/* 설비 상세 */}
          {/* === 품질 관리 === */}
          <Route path="/quality/defect" element={<QualityDefect />} />
          <Route path="/quality/rate" element={<ProductionRate />} />
          <Route path="/quality/calibration" element={<CalibrationReport />} />
          <Route path="/quality/reliability" element={<ReliabilityTest />} />
          {/* === 이력 추적 (Traceability) === */}
          <Route path="/traceability/dhr" element={<DeviceHistory />} />
          {/* === 시스템/관리자 === */}
          <Route path="/admin/employees" element={<EmployeeMgmt />} />
          <Route path="/admin/process" element={<ProcessMgmt />} />
          <Route path="/admin/work-order" element={<WorkOrderMgmt />} />
          <Route path="/admin/production-order" element={<ProductionOrder />} />
          {/* === 지원 업무 === */}
          <Route path="/support/notice" element={<Notice />} />
          <Route path="/support/cafeteria" element={<CafeteriaMenu />} />
        </Route>
      </Route>

      {/* ----------------------------------------------------------------
         3. 예외 처리 (404)
      ---------------------------------------------------------------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
