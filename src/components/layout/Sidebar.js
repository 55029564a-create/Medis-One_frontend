import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // 사이드바 전체 열림/닫힘
  const [activeMenu, setActiveMenu] = useState(null); // 현재 열려있는 대메뉴 (예: 'production')
  const location = useLocation(); // 현재 주소 (하이라이트용)

  // 사이드바 전체 토글
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (isOpen) setActiveMenu(null); // 사이드바 닫으면 메뉴도 다 닫기
  };

  // 대메뉴 클릭 시 하위 메뉴 토글
  const toggleSubMenu = (menuName) => {
    if (!isOpen) setIsOpen(true); // 사이드바가 닫혀있으면 일단 켬
    setActiveMenu(activeMenu === menuName ? null : menuName); // 같으면 닫고, 다르면 열기
  };

  return (
    <div style={{ ...sidebarStyle, width: isOpen ? "250px" : "60px" }}>
      {/* 헤더 */}
      <div style={headerStyle}>
        {isOpen && <h3 style={{ margin: 0, fontWeight: "800" }}>MES System</h3>}
        <button onClick={toggleSidebar} style={toggleButtonStyle}>
          {isOpen ? "◀" : "▶"}
        </button>
      </div>

      <ul style={ulStyle}>
        {/* 1. 대시보드 (하위메뉴 없음) */}
        <li>
          <Link
            to="/dashboard"
            style={{
              ...linkStyle,
              backgroundColor:
                location.pathname === "/dashboard" ? "#444" : "transparent",
            }}
          >
            <span style={iconStyle}>📊</span>
            {isOpen && <span>대시보드</span>}
          </Link>
        </li>

        {/* 2. 자재 관리 (클릭하면 열림) */}
        <MenuItem
          title="자재 관리"
          icon="📦"
          isOpen={isOpen}
          isExpanded={activeMenu === "material"}
          onClick={() => toggleSubMenu("material")}
        >
          <SubLink to="/material/inout" label="- 자재 입출고" />
          <SubLink to="/material/status" label="- 입출고 이력" />
          <SubLink to="/inventory" label="- 재고 현황" />
        </MenuItem>

        {/* 3. 생산 관리 */}
        <MenuItem
          title="생산 관리"
          icon="🏭"
          isOpen={isOpen}
          isExpanded={activeMenu === "production"}
          onClick={() => toggleSubMenu("production")}
        >
          <SubLink to="/production/order" label="- 작업 지시" />
          <SubLink to="/production/schedule" label="- 생산 계획" />
          <SubLink to="/production/report" label="- 생산 실적" />
        </MenuItem>

        {/* 4. 설비/품질 */}
        <MenuItem
          title="설비 및 품질"
          icon="⚙️"
          isOpen={isOpen}
          isExpanded={activeMenu === "quality"}
          onClick={() => toggleSubMenu("quality")}
        >
          <SubLink to="/equipment" label="- 설비 모니터링" />
          <SubLink to="/quality/defect" label="- 불량 등록" />
          <SubLink to="/quality/rate" label="- 생산 효율" />
        </MenuItem>

        {/* 5. 지원 업무 */}
        <MenuItem
          title="지원 업무"
          icon="🍱"
          isOpen={isOpen}
          isExpanded={activeMenu === "support"}
          onClick={() => toggleSubMenu("support")}
        >
          <SubLink to="/support/notice" label="- 공지사항" />
          <SubLink to="/support/cafeteria" label="- 식단표" />
        </MenuItem>

        {/* 6. 시스템 관리 */}
        <MenuItem
          title="시스템 관리"
          icon="👨‍💼"
          isOpen={isOpen}
          isExpanded={activeMenu === "admin"}
          onClick={() => toggleSubMenu("admin")}
        >
          <SubLink to="/admin/employees" label="- 사원 관리" />
          <SubLink to="/admin/process" label="- 공정 관리" />
        </MenuItem>
      </ul>
    </div>
  );
};

// --- 보조 컴포넌트 (코드 중복 줄이기) ---

// 대메뉴 아이템
const MenuItem = ({ title, icon, isOpen, isExpanded, onClick, children }) => (
  <>
    <li
      onClick={onClick}
      style={{
        ...linkStyle,
        cursor: "pointer",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={iconStyle}>{icon}</span>
        {isOpen && <span>{title}</span>}
      </div>
      {isOpen && (
        <span style={{ fontSize: "10px", color: "#888" }}>
          {isExpanded ? "▲" : "▼"}
        </span>
      )}
    </li>
    {/* 하위 메뉴 영역 (열렸을 때만 보임) */}
    {isOpen && isExpanded && (
      <ul style={{ backgroundColor: "#222", padding: "5px 0" }}>{children}</ul>
    )}
  </>
);

// 소메뉴 링크
const SubLink = ({ to, label }) => (
  <li>
    <Link
      to={to}
      style={{
        ...linkStyle,
        paddingLeft: "50px",
        fontSize: "13px",
        height: "40px",
        color: "#bbb",
      }}
    >
      {label}
    </Link>
  </li>
);

// --- 스타일 ---
const sidebarStyle = {
  height: "100vh",
  backgroundColor: "#333",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  transition: "width 0.3s ease",
  overflowX: "hidden",
  whiteSpace: "nowrap",
  flexShrink: 0, // 화면 줄어들어도 사이드바 찌그러짐 방지
};
const headerStyle = {
  padding: "20px",
  borderBottom: "1px solid #555",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  height: "60px",
};
const toggleButtonStyle = {
  background: "none",
  border: "1px solid #777",
  color: "#fff",
  borderRadius: "4px",
  cursor: "pointer",
  padding: "5px 8px",
  fontSize: "12px",
};
const ulStyle = { listStyle: "none", padding: 0, margin: 0 };
const linkStyle = {
  display: "flex",
  alignItems: "center",
  padding: "12px 20px",
  color: "#ddd",
  textDecoration: "none",
  height: "50px",
  transition: "0.2s",
};
const iconStyle = { marginRight: "15px", fontSize: "18px" };

export default Sidebar;
