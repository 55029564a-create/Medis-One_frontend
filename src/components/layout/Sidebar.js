import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaBoxOpen,
  FaIndustry,
  FaCogs,
  FaUtensils,
  FaUserCog,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaWarehouse,
  FaAngleDoubleLeft,
  FaSitemap,
  FaMicrochip,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

import logoImage from "../../assets/logo.png";

const THEME_COLOR = "#8C85FF";
const BG_COLOR = "#FFFFFF";
const TEXT_COLOR = "#888";
const ACTIVE_TEXT_COLOR = "#8C85FF";
const ACTIVE_BG_COLOR = "#F3F1FF";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null); // 펼쳐진 메뉴 관리
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleSubMenu = (menuName) => {
    if (!isOpen) {
      setIsOpen(true);
      setActiveMenu(menuName);
    } else {
      setActiveMenu(activeMenu === menuName ? null : menuName);
    }
  };

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      logout();
      navigate("/");
    }
  };

  return (
    <div style={{ ...styles.sidebar, width: isOpen ? "260px" : "80px" }}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.logoContainer} onClick={toggleSidebar}>
          <img
            src={logoImage}
            alt="MedisOne Logo"
            style={{
              height: "36px",
              width: isOpen ? "130px" : "40px",
              objectFit: "contain",
              transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "block",
            }}
          />
        </div>
        {isOpen && (
          <button style={styles.toggleBtn} onClick={toggleSidebar}>
            <FaAngleDoubleLeft color="#ccc" />
          </button>
        )}
      </div>

      {/* MENU LIST */}
      <div style={styles.menuContainer}>
        <ul style={styles.ul}>
          {/* 단일 메뉴 (대시보드) */}
          <MenuItem
            to="/dashboard"
            icon={<MdDashboard size={20} />}
            label="Dashboard"
            isOpen={isOpen}
            isActive={location.pathname === "/dashboard"}
          />
          <div style={styles.divider}></div>

          {/* 그룹 메뉴들 */}
          <MenuDropdown
            title="Material"
            icon={<FaBoxOpen size={20} />}
            isOpen={isOpen}
            isExpanded={activeMenu === "material"}
            onClick={() => toggleSubMenu("material")}
          >
            <SubMenuItem
              to="/material/inout"
              label="자재 입출고"
              currentPath={location.pathname}
            />
            <SubMenuItem
              to="/material/history"
              label="입/출고 이력"
              currentPath={location.pathname}
            />
            <SubMenuItem
              to="/material/lot"
              label="LOT 추적"
              currentPath={location.pathname}
            />
          </MenuDropdown>

          <MenuDropdown
            title="Inventory"
            icon={<FaWarehouse size={20} />}
            isOpen={isOpen}
            isExpanded={activeMenu === "inventory"}
            onClick={() => toggleSubMenu("inventory")}
          >
            <SubMenuItem
              to="/inventory/current"
              label="재고 현황"
              currentPath={location.pathname}
            />
            <SubMenuItem
              to="/inventory/history"
              label="재고 이력"
              currentPath={location.pathname}
            />
          </MenuDropdown>

          <MenuDropdown
            title="Production"
            icon={<FaIndustry size={20} />}
            isOpen={isOpen}
            isExpanded={activeMenu === "production"}
            onClick={() => toggleSubMenu("production")}
          >
            <SubMenuItem
              to="/production/schedule"
              label="생산 계획"
              currentPath={location.pathname}
            />
            <SubMenuItem
              to="/production/order"
              label="작업 지시서"
              currentPath={location.pathname}
            />
            <SubMenuItem
              to="/production/report"
              label="생산 실적"
              currentPath={location.pathname}
            />
            <SubMenuItem
              to="/production/product"
              label="제품 관리"
              currentPath={location.pathname}
            />
          </MenuDropdown>

          <MenuDropdown
            title="Process"
            icon={<FaMicrochip size={20} />}
            isOpen={isOpen}
            isExpanded={activeMenu === "process"}
            onClick={() => toggleSubMenu("process")}
          >
            <SubMenuItem
              to="/process/bonding"
              label="본딩(Bonding)"
              currentPath={location.pathname}
            />
            <SubMenuItem
              to="/process/assembly"
              label="조립(Assembly)"
              currentPath={location.pathname}
            />
            <SubMenuItem
              to="/process/aging"
              label="에이징(Aging)"
              currentPath={location.pathname}
            />
          </MenuDropdown>

          <MenuDropdown
            title="Quality"
            icon={<FaCogs size={20} />}
            isOpen={isOpen}
            isExpanded={activeMenu === "quality"}
            onClick={() => toggleSubMenu("quality")}
          >
            <SubMenuItem
              to="/equipment"
              label="설비 모니터링"
              currentPath={location.pathname}
            />
            <SubMenuItem
              to="/quality/defect"
              label="불량 등록/현황"
              currentPath={location.pathname}
            />
            <SubMenuItem
              to="/quality/rate"
              label="생산 효율"
              currentPath={location.pathname}
            />
            <SubMenuItem
              to="/quality/calibration"
              label="캘리브레이션"
              currentPath={location.pathname}
            />
            <SubMenuItem
              to="/quality/reliability"
              label="신뢰성 테스트"
              currentPath={location.pathname}
            />
          </MenuDropdown>

          <MenuDropdown
            title="Traceability"
            icon={<FaSitemap size={20} />}
            isOpen={isOpen}
            isExpanded={activeMenu === "traceability"}
            onClick={() => toggleSubMenu("traceability")}
          >
            <SubMenuItem
              to="/traceability/dhr"
              label="이력 추적 (DHR)"
              currentPath={location.pathname}
            />
          </MenuDropdown>

          <MenuDropdown
            title="Support"
            icon={<FaUtensils size={20} />}
            isOpen={isOpen}
            isExpanded={activeMenu === "support"}
            onClick={() => toggleSubMenu("support")}
          >
            <SubMenuItem
              to="/support/notice"
              label="공지사항"
              currentPath={location.pathname}
            />
            <SubMenuItem
              to="/support/cafeteria"
              label="식단표"
              currentPath={location.pathname}
            />
          </MenuDropdown>

          <MenuDropdown
            title="Admin"
            icon={<FaUserCog size={20} />}
            isOpen={isOpen}
            isExpanded={activeMenu === "admin"}
            onClick={() => toggleSubMenu("admin")}
          >
            <SubMenuItem
              to="/admin/employees"
              label="사원 관리"
              currentPath={location.pathname}
            />
            <SubMenuItem
              to="/admin/process"
              label="공정 관리"
              currentPath={location.pathname}
            />
            <SubMenuItem
              to="/admin/work-order"
              label="작업 지시 관리"
              currentPath={location.pathname}
            />
            <SubMenuItem
              to="/admin/production-order"
              label="생산 지시 관리"
              currentPath={location.pathname}
            />
          </MenuDropdown>
        </ul>
      </div>

      {/* BOTTOM */}
      <div
        style={{
          ...styles.bannerCard,
          opacity: isOpen ? 1 : 0,
          height: isOpen ? "auto" : 0,
          padding: isOpen ? "20px" : 0,
          margin: isOpen ? "0 20px 20px" : 0,
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}
      >
        <div style={styles.bannerIconCircle}>
          <FaIndustry size={20} color="#fff" />
        </div>
        <p
          style={{ margin: "10px 0 5px", fontWeight: "bold", fontSize: "14px" }}
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

      <div style={styles.profileSection}>
        <div
          style={{
            ...styles.profileContainer,
            paddingLeft: 0,
            justifyContent: isOpen ? "flex-start" : "center",
          }}
        >
          <div style={styles.avatarWrapper}>
            <div style={styles.avatar}>
              <img
                src="https://via.placeholder.com/40"
                alt="User"
                style={{ borderRadius: "50%", width: "100%", height: "100%" }}
              />
            </div>
          </div>
          <div style={{ ...styles.profileText, opacity: isOpen ? 1 : 0 }}>
            <p
              style={{
                margin: 0,
                fontWeight: "bold",
                fontSize: "14px",
                color: "#333",
              }}
            >
              {user ? user.name : "Guest User"}
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "#999" }}>
              {user ? `${user.dept} / ${user.role}` : "Please Login"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              ...styles.logoutBtn,
              opacity: isOpen ? 1 : 0,
              width: isOpen ? "30px" : 0,
              pointerEvents: isOpen ? "auto" : "none",
            }}
            title="로그아웃"
          >
            <FaSignOutAlt size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Sub Components (로직 대폭 단순화) ---

// 1. 단일 메뉴 아이템 (예: 대시보드)
const MenuItem = ({ to, icon, label, isOpen, isActive }) => (
  <li style={styles.li}>
    <Link
      to={to}
      style={{
        ...styles.link,
        // isActive일 때만 색상 적용 (심플)
        color: isActive ? ACTIVE_TEXT_COLOR : TEXT_COLOR,
        backgroundColor: isActive ? ACTIVE_BG_COLOR : "transparent",
        fontWeight: isActive ? "700" : "500",
        borderRight:
          isActive && !isOpen
            ? `3px solid ${THEME_COLOR}`
            : "3px solid transparent",
      }}
    >
      <div style={styles.iconBox}>{icon}</div>
      <div
        style={{
          ...styles.textBox,
          opacity: isOpen ? 1 : 0,
          width: isOpen ? "auto" : 0,
        }}
      >
        {label}
      </div>
    </Link>
  </li>
);

// 2. 그룹 메뉴 헤더 (예: Material, Production 등)
const MenuDropdown = ({
  title,
  icon,
  isOpen,
  isExpanded,
  onClick,
  children,
}) => {
  // [중요] isActive prop을 아예 제거했습니다.
  // 부모 메뉴는 오직 '펼쳐졌느냐(isExpanded)'에 따라 화살표만 바뀝니다.
  // 색상은 변하지 않으므로, 하위 메뉴 선택 시 부모 색상이 남는 문제가 원천 차단됩니다.

  return (
    <li style={styles.li}>
      <div
        onClick={onClick}
        style={{
          ...styles.link,
          cursor: "pointer",
          color: TEXT_COLOR, // 항상 기본 색상 (하위 메뉴가 선택되어도 부모는 색 안 바뀜)
          backgroundColor: "transparent", // 항상 투명
          fontWeight: "500",
        }}
      >
        <div style={styles.iconBox}>{icon}</div>
        <div
          style={{
            ...styles.textBox,
            opacity: isOpen ? 1 : 0,
            width: isOpen ? "auto" : 0,
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{title}</span>
          <span
            style={{ fontSize: "10px", color: "#aaa", marginRight: "10px" }}
          >
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </div>
      </div>
      {/* 서브메뉴 렌더링 */}
      {isOpen && isExpanded && <ul style={styles.subUl}>{children}</ul>}
    </li>
  );
};

// 3. 서브 메뉴 아이템 (실제 페이지 링크)
const SubMenuItem = ({ to, label, currentPath }) => {
  const isSubActive = currentPath === to;
  return (
    <li style={{ listStyle: "none", marginBottom: "2px" }}>
      <Link
        to={to}
        style={{
          ...styles.subLink,
          // 여기서만 활성화 스타일 적용 (배경색 + 글자색)
          color: isSubActive ? ACTIVE_TEXT_COLOR : "#888",
          fontWeight: isSubActive ? "700" : "400",
          backgroundColor: isSubActive ? ACTIVE_BG_COLOR : "transparent",
        }}
      >
        <span
          style={{
            ...styles.dot,
            backgroundColor: isSubActive ? ACTIVE_TEXT_COLOR : "#ddd",
          }}
        ></span>
        {label}
      </Link>
    </li>
  );
};

// --- Styles (기존 유지) ---
const styles = {
  sidebar: {
    height: "100vh",
    backgroundColor: BG_COLOR,
    display: "flex",
    flexDirection: "column",
    transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "4px 0 15px rgba(0,0,0,0.03)",
    borderRight: "1px solid #f0f0f0",
    overflowX: "hidden",
    position: "relative",
    zIndex: 100,
    whiteSpace: "nowrap",
  },
  header: {
    height: "80px",
    minHeight: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: "1px solid #f9f9f9",
    position: "relative",
    boxSizing: "border-box",
    padding: 0,
    margin: 0,
  },
  logoContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    overflow: "hidden",
    padding: 0,
    margin: 0,
  },
  toggleBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 10,
  },
  menuContainer: {
    flex: 1,
    padding: "10px 0",
    overflowY: "auto",
    scrollbarWidth: "none",
  },
  ul: { padding: 0, margin: 0 },
  li: { listStyle: "none", marginBottom: "4px" },
  divider: { height: "1px", backgroundColor: "#f0f0f0", margin: "10px 0" },
  link: {
    display: "flex",
    alignItems: "center",
    height: "48px",
    textDecoration: "none",
    transition: "background-color 0.2s, color 0.2s",
    width: "100%",
    position: "relative",
    borderLeft: "3px solid transparent",
  },
  iconBox: {
    width: "80px",
    minWidth: "80px",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  textBox: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    transition: "opacity 0.2s ease, width 0.2s ease",
  },
  subUl: {
    padding: "5px 0 5px 0",
    margin: 0,
    backgroundColor: "#fafafa",
  },
  subLink: {
    display: "flex",
    alignItems: "center",
    height: "40px",
    paddingLeft: "80px",
    textDecoration: "none",
    fontSize: "13px",
    transition: "background-color 0.2s",
  },
  dot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    marginRight: "10px",
    flexShrink: 0,
  },
  bannerCard: {
    backgroundColor: THEME_COLOR,
    borderRadius: "20px",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(140, 133, 255, 0.25)",
    position: "relative",
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
    marginTop: "10px",
    width: "100%",
  },
  profileSection: {
    height: "70px",
    borderTop: "1px solid #f0f0f0",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  profileContainer: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    gap: "12px",
  },
  avatarWrapper: {
    width: "80px",
    minWidth: "80px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#eee",
    flexShrink: 0,
    border: "2px solid #fff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  profileText: {
    flex: 1,
    overflow: "hidden",
    whiteSpace: "nowrap",
    transition: "opacity 0.2s ease",
  },
  logoutBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "50%",
    color: "#999",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.2s",
    marginRight: "10px",
  },
};

export default Sidebar;
