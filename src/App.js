import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// 1. 공통 레이아웃 (헤더, 사이드바가 있는 틀)
// 아직 파일이 없다면 일단 이 파일 안에 임시로 만들어둡니다.
import Layout from "./components/layout/Layout";

// 2. 페이지 컴포넌트 불러오기 (Import)
// 아직 파일 안 만들었으면 에러 나니까, 파일 생성 후 주석 푸세요!

// [0. 로그인 & 대시보드]
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";

// [1. 입/출고 관리]
import MaterialInout from "./pages/Material/MaterialInout"; // 입출고 등록/조회
import MaterialStatus from "./pages/Material/MaterialStatus"; // 현황

// [2. 설비 상태 관리]
import MachineList from "./pages/Equipment/MachineList"; // 설비 리스트/상태

// [3. 제품 관리 (불량/생산율)]
import QualityDefect from "./pages/Quality/QualityDefect"; // 불량률/불량현황
import ProductionRate from "./pages/Quality/ProductionRate"; // 생산율/타임테이블

// [4. 생산 관리]
import WorkOrder from "./pages/Production/WorkOrder"; // 작업지시서
import WorkReport from "./pages/Production/WorkReport"; // 생산/결과보고
import ProductionSchedule from "./pages/Production/ProductionSchedule"; // 생산일정

// [5. 재고 관리]
import InventoryCurrent from "./pages/Inventory/InventoryCurrent"; // 실시간 재고/입출고내역

// [6, 7. 지원 업무 (공지사항 & 식단표)]
import Notice from "./pages/Support/Notice"; // ★ 말씀하신 Notice.js
import CafeteriaMenu from "./pages/Support/CafeteriaMenu"; // ★ 말씀하신 CafeteriaMenu.js

// [관리자 기능]
import EmployeeMgmt from "./pages/Admin/EmployeeMgmt"; // 사원관리
import ProcessMgmt from "./pages/Admin/ProcessMgmt"; // 공정관리

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. 로그인 페이지 (레이아웃 없음, 단독 실행) */}
        <Route path="/" element={<Login />} />

        {/* 2. 메인 업무 페이지들 (레이아웃 포함) */}
        {/* Layout 컴포넌트 안에 있는 <Outlet /> 위치에 아래 페이지들이 표시됨 */}
        <Route element={<Layout />}>
          {/* 0. 대시보드 */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* 1. 입/출고 관리 */}
          <Route path="/material/inout" element={<MaterialInout />} />
          <Route path="/material/status" element={<MaterialStatus />} />

          {/* 2. 설비 상태 관리 */}
          <Route path="/equipment" element={<MachineList />} />

          {/* 3. 제품 관리 */}
          <Route path="/quality/defect" element={<QualityDefect />} />
          <Route path="/quality/rate" element={<ProductionRate />} />

          {/* 4. 생산 관리 */}
          <Route path="/production/order" element={<WorkOrder />} />
          <Route path="/production/report" element={<WorkReport />} />
          <Route path="/production/schedule" element={<ProductionSchedule />} />

          {/* 5. 재고 관리 */}
          <Route path="/inventory" element={<InventoryCurrent />} />

          {/* 6. 공지사항 */}
          <Route path="/notice" element={<Notice />} />

          {/* 7. 식단표 */}
          <Route path="/cafeteria" element={<CafeteriaMenu />} />

          {/* 관리자 전용 */}
          <Route path="/admin/employee" element={<EmployeeMgmt />} />
          <Route path="/admin/process" element={<ProcessMgmt />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
