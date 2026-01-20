import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// 레이아웃
import Layout from "./components/layout/Layout";

// 페이지들 (경로 확인 필수!)
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

function App() {
  return (
    <Routes>
      {/* 로그인 페이지 (별도 레이아웃) */}
      <Route path="/" element={<Login />} />

      {/* 메인 레이아웃이 적용되는 페이지들 */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* 자재 */}

        <Route path="/material/inout" element={<MaterialInout />} />
        <Route path="/material/history" element={<MaterialHistory />} />

        {/* 재고 */}
        <Route path="/inventory/Current" element={<InventoryCurrent />} />
        <Route path="/inventory/history" element={<MaterialHistory />} />

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

      {/* 없는 페이지 접속 시 로그인으로 보냄 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
