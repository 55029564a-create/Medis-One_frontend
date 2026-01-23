import React, { useState, useEffect, useRef } from "react";
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

// 🎨 MedisOne 테마 컬러
const THEME_COLOR = "#8C85FF";
const BG_COLOR = "#FFFFFF";
const TEXT_COLOR = "#888";
const ACTIVE_TEXT_COLOR = "#8C85FF";
const ACTIVE_BG_COLOR = "#F3F1FF";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setActiveMenu(null);
  };

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
    <div
      ref={sidebarRef}
      style={{
        ...styles.sidebar,
        width: isOpen ? "260px" : "80px",
      }}
    >
      {/* ================= HEADER ================= */}
      <div style={styles.header} onClick={toggleSidebar}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
          }}
        >
          <div style={styles.logoIcon}>
            <MdDashboard size={24} color="#fff" />
          </div>
          <div
            style={{
              opacity: isOpen ? 1 : 0,
              width: isOpen ? "auto" : 0,
              overflow: "hidden",
              whiteSpace: "nowrap",
              transition: "opacity 0.2s",
            }}
          >
            <h2 style={styles.logoText}>MedisOne</h2>
          </div>
        </div>
        {isOpen && (
          <button style={styles.toggleBtn}>
            <FaAngleDoubleLeft color="#ccc" />
          </button>
        )}
      </div>
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
      {/* ================= BOTTOM (Profile) ================= */}
      {/* 배너 제거됨 */}
      <div style={styles.profileSection}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
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
            <div style={{ flex: 1, overflow: "hidden" }}>
              <p
                style={{
                  margin: 0,
                  fontWeight: "bold",
                  fontSize: "14px",
                  color: "#333",
                  whiteSpace: "nowrap",
                }}
              >
                {user ? user.name : "Guest User"}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  color: "#999",
                  whiteSpace: "nowrap",
                }}
              >
                {user ? `${user.dept} / ${user.role}` : "Please Login"}
              </p>
            </div>
          )}
          {isOpen && (
            <button
              onClick={handleLogout}
              style={styles.logoutBtn}
              title="로그아웃"
            >
              <FaSignOutAlt size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Sub Components ---
const MenuItem = ({ to, icon, label, isOpen, isActive }) => (
  <li style={{ listStyle: "none", marginBottom: "5px" }}>
    <Link
      to={to}
      style={{
        ...styles.link,
        justifyContent: isOpen ? "flex-start" : "center",
        color: isActive ? ACTIVE_TEXT_COLOR : TEXT_COLOR,
        backgroundColor: isActive ? ACTIVE_BG_COLOR : "transparent",
        borderRight: isActive && !isOpen ? `3px solid ${THEME_COLOR}` : "none",
      }}
    >
      <span
        style={{
          fontSize: "20px",
          display: "flex",
          alignItems: "center",
          minWidth: "20px",
        }}
      >
        {icon}
      </span>
      {isOpen && (
        <span
          style={{
            marginLeft: "15px",
            fontWeight: isActive ? "700" : "500",
            whiteSpace: "nowrap",
          }}
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
  isActive,
  onClick,
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
      <span
        style={{
          fontSize: "20px",
          display: "flex",
          alignItems: "center",
          minWidth: "20px",
        }}
      >
        {icon}
      </span>
      {isOpen && (
        <>
          <span
            style={{
              marginLeft: "15px",
              flex: 1,
              fontWeight: isActive ? "700" : "500",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </span>
          <span style={{ fontSize: "10px", color: "#aaa" }}>
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </>
      )}
    </div>
    {isOpen && isExpanded && <ul style={styles.subUl}>{children}</ul>}
  </li>
);

const SubMenuItem = ({ to, label, currentPath }) => {
  const isSubActive = currentPath === to;
  return (
    <li style={{ listStyle: "none", marginBottom: "2px" }}>
      <Link
        to={to}
        style={{
          ...styles.subLink,
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

// --- Styles ---
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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    borderBottom: "1px solid #f9f9f9",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    backgroundColor: THEME_COLOR,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(140, 133, 255, 0.3)",
    flexShrink: 0,
  },
  logoText: {
    margin: 0,
    color: "#333",
    fontSize: "20px",
    fontWeight: "800",
    fontFamily: "'Nunito', sans-serif",
  },
  toggleBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "5px",
    display: "flex",
    alignItems: "center",
  },
  menuContainer: {
    flex: 1,
    padding: "15px",
    overflowY: "auto",
    scrollbarWidth: "none",
  },
  ul: { padding: 0, margin: 0 },
  divider: { height: "1px", backgroundColor: "#f0f0f0", margin: "15px 0" },
  link: {
    display: "flex",
    alignItems: "center",
    padding: "12px 15px",
    borderRadius: "12px",
    textDecoration: "none",
    transition: "all 0.2s ease-in-out",
    marginBottom: "2px",
    "&:hover": { backgroundColor: "#FAFAFA" },
  },
  subUl: {
    padding: "5px 0 5px 20px",
    margin: 0,
    borderLeft: "2px solid #f5f5f5",
    marginLeft: "25px",
  },
  subLink: {
    display: "flex",
    alignItems: "center",
    padding: "10px 15px",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "13px",
    transition: "all 0.2s",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    marginRight: "10px",
    flexShrink: 0,
  },

  // Banner 스타일 삭제됨

  profileSection: {
    padding: "20px",
    borderTop: "1px solid #f0f0f0",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
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
    transition: "background 0.2s, color 0.2s",
    "&:hover": { backgroundColor: "#f5f5f5", color: "#FF4444" },
  },
};

export default Sidebar;
