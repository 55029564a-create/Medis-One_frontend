import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
// 아이콘 사용을 위해 react-icons 라이브러리 활용 (설치 필요: npm install react-icons)
import {
  FaChartPie,
  FaBoxOpen,
  FaIndustry,
  FaCogs,
  FaUtensils,
  FaUserCog,
  FaChevronDown,
  FaChevronUp,
  FaBars,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

// MedisOne 테마 컬러
const THEME_COLOR = "#8C85FF";
const BG_COLOR = "#FFFFFF";
const TEXT_COLOR = "#888";
const ACTIVE_TEXT_COLOR = "#8C85FF";
const ACTIVE_BG_COLOR = "#F3F1FF"; // 연한 보라색 배경

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (isOpen) setActiveMenu(null);
  };

  const toggleSubMenu = (menuName) => {
    if (!isOpen) {
      setIsOpen(true);
      setActiveMenu(menuName);
    } else {
      setActiveMenu(activeMenu === menuName ? null : menuName);
    }
  };

  return (
    <div style={{ ...styles.sidebar, width: isOpen ? "260px" : "80px" }}>
      {/* 1. 헤더 (로고 & 토글) */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* 로고 아이콘 (임시) */}
          <div
            style={{ ...styles.logoIcon, display: isOpen ? "flex" : "none" }}
          >
            <MdDashboard size={24} color="#fff" />
          </div>
          {/* 로고 텍스트 */}
          {isOpen && <h2 style={styles.logoText}>MedisOne</h2>}
          {/* 닫혔을 때 로고 대신 아이콘만 */}
          {!isOpen && (
            <div style={styles.logoIcon}>
              <MdDashboard size={24} color="#fff" />
            </div>
          )}
        </div>
        {/* 토글 버튼 (열렸을 때만 우측 끝에 표시, 닫혔을 땐 상단 로고 클릭 등으로 대체 가능하나 여기선 헤더 영역 클릭으로 처리하거나 별도 버튼 둠) */}
      </div>

      {/* 사이드바 접기/펼치기 버튼 (헤더 하단이나 별도 위치) */}
      <div
        style={{
          padding: "10px",
          display: "flex",
          justifyContent: isOpen ? "flex-end" : "center",
        }}
      >
        <button onClick={toggleSidebar} style={styles.toggleBtn}>
          <FaBars size={16} color="#aaa" />
        </button>
      </div>

      {/* 2. 메뉴 리스트 */}
      <div style={styles.menuContainer}>
        <ul style={styles.ul}>
          {/* 대시보드 */}
          <MenuItem
            to="/dashboard"
            icon={<MdDashboard />}
            label="Dashboard"
            isOpen={isOpen}
            isActive={location.pathname === "/dashboard"}
          />

          <div style={styles.divider}></div>

          {/* 자재 관리 */}
          <MenuDropdown
            title="Material"
            icon={<FaBoxOpen />}
            isOpen={isOpen}
            isExpanded={activeMenu === "material"}
            onClick={() => toggleSubMenu("material")}
            isActive={
              location.pathname.startsWith("/material") ||
              location.pathname.startsWith("/inventory")
            }
          >
            <SubMenuItem to="/material/inout" label="자재 입출고" />
            <SubMenuItem to="/material/history" label="입/출고 이력" />
            <SubMenuItem to="/inventory" label="재고 현황" />
          </MenuDropdown>

          {/* 생산 관리 */}
          <MenuDropdown
            title="Production"
            icon={<FaIndustry />}
            isOpen={isOpen}
            isExpanded={activeMenu === "production"}
            onClick={() => toggleSubMenu("production")}
            isActive={location.pathname.startsWith("/production")}
          >
            <SubMenuItem to="/production/order" label="작업 지시" />
            <SubMenuItem to="/production/schedule" label="생산 계획" />
            <SubMenuItem to="/production/report" label="생산 실적" />
          </MenuDropdown>

          {/* 설비/품질 */}
          <MenuDropdown
            title="Quality"
            icon={<FaCogs />}
            isOpen={isOpen}
            isExpanded={activeMenu === "quality"}
            onClick={() => toggleSubMenu("quality")}
            isActive={
              location.pathname.startsWith("/quality") ||
              location.pathname.startsWith("/equipment")
            }
          >
            <SubMenuItem to="/equipment" label="설비 모니터링" />
            <SubMenuItem to="/quality/defect" label="불량 등록" />
            <SubMenuItem to="/quality/rate" label="생산 효율" />
          </MenuDropdown>

          {/* 지원 업무 */}
          <MenuDropdown
            title="Support"
            icon={<FaUtensils />}
            isOpen={isOpen}
            isExpanded={activeMenu === "support"}
            onClick={() => toggleSubMenu("support")}
            isActive={location.pathname.startsWith("/support")}
          >
            <SubMenuItem to="/support/notice" label="공지사항" />
            <SubMenuItem to="/support/cafeteria" label="식단표" />
          </MenuDropdown>

          {/* 시스템 관리 */}
          <MenuDropdown
            title="Admin"
            icon={<FaUserCog />}
            isOpen={isOpen}
            isExpanded={activeMenu === "admin"}
            onClick={() => toggleSubMenu("admin")}
            isActive={location.pathname.startsWith("/admin")}
          >
            <SubMenuItem to="/admin/employees" label="사원 관리" />
            <SubMenuItem to="/admin/process" label="공정 관리" />
          </MenuDropdown>
        </ul>
      </div>

      {/* 3. 하단 프로모션 배너 (이미지의 Upgrade Now 부분 - MES에선 공지나 상태로 활용) */}
      {isOpen && (
        <div style={styles.bannerCard}>
          <div style={styles.bannerIconCircle}>
            <FaIndustry size={20} color="#fff" />
          </div>
          <p
            style={{
              margin: "10px 0 5px",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            System Status
          </p>
          <p
            style={{
              margin: "0 0 10px",
              fontSize: "11px",
              color: "#fff",
              opacity: 0.8,
            }}
          >
            All systems operational
          </p>
          <button style={styles.bannerBtn}>Check Report</button>
        </div>
      )}

      {/* 4. 하단 프로필 영역 */}
      <div style={styles.profileSection}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            justifyContent: isOpen ? "flex-start" : "center",
            width: "100%",
          }}
        >
          <div style={styles.avatar}>
            <img
              src="https://via.placeholder.com/40"
              alt="User"
              style={{ borderRadius: "50%" }}
            />
          </div>
          {isOpen && (
            <div style={{ overflow: "hidden" }}>
              <p
                style={{
                  margin: 0,
                  fontWeight: "bold",
                  fontSize: "14px",
                  color: "#333",
                }}
              >
                Kim Manager
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: "#999" }}>
                Production Team
              </p>
            </div>
          )}
          {isOpen && (
            <button
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <FaSignOutAlt color="#999" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 서브 컴포넌트 ---

const MenuItem = ({ to, icon, label, isOpen, isActive }) => (
  <li style={{ listStyle: "none", marginBottom: "5px" }}>
    <Link
      to={to}
      style={{
        ...styles.link,
        justifyContent: isOpen ? "flex-start" : "center",
        color: isActive ? ACTIVE_TEXT_COLOR : TEXT_COLOR,
        backgroundColor: isActive ? ACTIVE_BG_COLOR : "transparent",
        borderRight: isActive && !isOpen ? `3px solid ${THEME_COLOR}` : "none", // 닫혔을 때 활성 표시
      }}
    >
      <span style={{ fontSize: "20px", display: "flex", alignItems: "center" }}>
        {icon}
      </span>
      {isOpen && (
        <span
          style={{ marginLeft: "15px", fontWeight: isActive ? "600" : "400" }}
        >
          {label}
        </span>
      )}
    </Link>
  </li>
);

const MenuDropdown = ({
  title,
  icon,
  isOpen,
  isExpanded,
  onClick,
  isActive,
  children,
}) => (
  <li style={{ listStyle: "none", marginBottom: "5px" }}>
    <div
      onClick={onClick}
      style={{
        ...styles.link,
        justifyContent: isOpen ? "flex-start" : "center",
        cursor: "pointer",
        color: isActive ? ACTIVE_TEXT_COLOR : TEXT_COLOR,
        backgroundColor:
          isActive && !isExpanded ? ACTIVE_BG_COLOR : "transparent",
      }}
    >
      <span style={{ fontSize: "20px", display: "flex", alignItems: "center" }}>
        {icon}
      </span>
      {isOpen && (
        <>
          <span
            style={{
              marginLeft: "15px",
              flex: 1,
              fontWeight: isActive ? "600" : "400",
            }}
          >
            {title}
          </span>
          <span style={{ fontSize: "10px" }}>
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </>
      )}
    </div>
    {isOpen && isExpanded && <ul style={styles.subUl}>{children}</ul>}
  </li>
);

const SubMenuItem = ({ to, label }) => (
  <li style={{ listStyle: "none" }}>
    <Link to={to} style={styles.subLink}>
      <span style={styles.dot}></span>
      {label}
    </Link>
  </li>
);

// --- 스타일 객체 ---
const styles = {
  sidebar: {
    height: "100vh",
    backgroundColor: BG_COLOR,
    display: "flex",
    flexDirection: "column",
    transition: "width 0.3s ease",
    boxShadow: "4px 0 10px rgba(0,0,0,0.02)", // 부드러운 그림자
    borderRight: "1px solid #f0f0f0",
    overflowX: "hidden",
    position: "relative",
    zIndex: 100,
  },
  header: {
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 20px",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    backgroundColor: THEME_COLOR,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(140, 133, 255, 0.4)",
  },
  logoText: {
    margin: 0,
    color: "#333",
    fontSize: "20px",
    fontWeight: "800",
    fontFamily: "'Nunito', sans-serif", // 둥근 느낌의 폰트 추천
  },
  toggleBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "5px",
  },
  menuContainer: {
    flex: 1,
    padding: "10px 15px",
    overflowY: "auto",
    scrollbarWidth: "none", // Firefox 스크롤바 숨김
    msOverflowStyle: "none", // IE 스크롤바 숨김
  },
  ul: {
    padding: 0,
    margin: 0,
  },
  divider: {
    height: "1px",
    backgroundColor: "#eee",
    margin: "10px 0",
  },
  link: {
    display: "flex",
    alignItems: "center",
    padding: "12px 15px",
    borderRadius: "12px", // 둥근 모서리
    textDecoration: "none",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  subUl: {
    padding: "5px 0 5px 40px",
    margin: 0,
  },
  subLink: {
    display: "flex",
    alignItems: "center",
    padding: "8px 0",
    textDecoration: "none",
    color: "#999",
    fontSize: "13px",
    transition: "color 0.2s",
  },
  dot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    backgroundColor: "#ddd",
    marginRight: "10px",
  },
  // 하단 배너 스타일
  bannerCard: {
    margin: "0 20px 20px",
    padding: "20px",
    backgroundColor: THEME_COLOR,
    borderRadius: "20px",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    boxShadow: "0 10px 20px rgba(140, 133, 255, 0.3)",
    position: "relative",
    overflow: "hidden",
  },
  bannerIconCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerBtn: {
    backgroundColor: "#fff",
    color: THEME_COLOR,
    border: "none",
    borderRadius: "10px",
    padding: "8px 16px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "5px",
    width: "100%",
  },
  // 프로필 스타일
  profileSection: {
    padding: "20px",
    borderTop: "1px solid #f0f0f0",
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#eee",
    flexShrink: 0,
  },
};

export default Sidebar;
