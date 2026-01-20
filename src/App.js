import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// 레이아웃
import Layout from "./components/common/layout/Layout"; // 경로 확인 (common 폴더 안에 있다면 수정)

// 페이지들
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";

// 자재
import MaterialInout from "./pages/Material/MaterialInout";
import MaterialHistory from "./pages/Material/MaterialHistory";
import InventoryCurrent from "./pages/Inventory/InventoryCurrent";

// 생산
import WorkOrder from "./pages/Production/WorkOrder";
import ProductionSchedule from "./pages/Production/ProductionSchedule";
import WorkReport from "./pages/Production/WorkReport";

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

// [NEW] 모바일 전용 페이지 (경로 확인 필수: src/pages/Mobile/MobileTracking.js)
import MobileTracking from "./pages/Mobile/MobileTracking";

function App() {
  return (
    <Routes>
      {/* 1. 로그인 페이지 (레이아웃 없음) */}
      <Route path="/" element={<Login />} />

      {/* 2. 관리자/PC용 페이지 (사이드바 + 헤더 레이아웃 적용) */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 자재 */}
        <Route path="/material/inout" element={<MaterialInout />} />
        <Route path="/material/history" element={<MaterialHistory />} />
        <Route path="/inventory" element={<InventoryCurrent />} />

        {/* 생산 */}
        <Route path="/production/order" element={<WorkOrder />} />
        <Route path="/production/schedule" element={<ProductionSchedule />} />
        <Route path="/production/report" element={<WorkReport />} />

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

      {/* 3. [NEW] 모바일 추적 페이지 (레이아웃 없음 - 전체화면) */}
      {/* :id 부분에 LOT 번호가 들어갑니다. (예: /mobile/tracking/LOT-1234) */}
      <Route path="/mobile/tracking/:id" element={<MobileTracking />} />

      {/* 4. 잘못된 경로 접속 시 로그인으로 리다이렉트 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
