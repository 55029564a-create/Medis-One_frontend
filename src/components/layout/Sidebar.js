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
import logoImage from "../../assets/logo.png";

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

  const { user, logout } = useAuth();

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
          <img
            src={logoImage}
            alt="MedisOne Logo"
            style={{
              height: "75px",
              objectFit: "contain",
              flexShrink: 0,
              transition: "all 0.3s ease",
              width: isOpen ? "200px" : "50px",
              marginLeft: 0,
            }}
          />
        </div>
        {isOpen && (
          <button style={styles.toggleBtn}>
            <FaAngleDoubleLeft color="#ccc" />
          </button>
        )}
      </div>

      <ul style={styles.menuList}>
        {/* 1. Material (자재) */}
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
        </MenuDropdown>

        {/* 2. Inventory (재고) */}
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

        {/* 3. Production (생산) */}
        {/* ✨ 수정됨: 생산계획, 제품관리 + 작업지시, 생산보고 이동해옴 */}
        <MenuDropdown
          title="Production"
          icon={<FaIndustry size={20} />}
          isOpen={isOpen}
          isExpanded={activeMenu === "production"}
          onClick={() => toggleSubMenu("production")}
        >
          <SubMenuItem
            to="/production/schedule"
            label="생산 지시서"
            currentPath={location.pathname}
          />
          <SubMenuItem
            to="/production/work-order"
            label="작업 지시서"
            currentPath={location.pathname}
          />
          <SubMenuItem
            to="/production/report"
            label="생산 보고"
            currentPath={location.pathname}
          />
          <SubMenuItem
            to="/production/product"
            label="제품 관리"
            currentPath={location.pathname}
          />
        </MenuDropdown>

        {/* 4. Process (공정) */}
        {/* ✨ 수정됨: BOM 관리 이동해옴, 설비 모니터링 유지 */}
        <MenuDropdown
          title="Process"
          icon={<FaMicrochip size={20} />}
          isOpen={isOpen}
          isExpanded={activeMenu === "process"}
          onClick={() => toggleSubMenu("process")}
        >
          <SubMenuItem
            to="/process/bom"
            label="BOM 관리"
            currentPath={location.pathname}
          />
          <SubMenuItem
            to="/equipment"
            label="설비 모니터링"
            currentPath={location.pathname}
          />
        </MenuDropdown>

        {/* 5. Quality (품질) */}
        <MenuDropdown
          title="Quality"
          icon={<FaCogs size={20} />}
          isOpen={isOpen}
          isExpanded={activeMenu === "quality"}
          onClick={() => toggleSubMenu("quality")}
        >
          <SubMenuItem
            to="/quality/defect"
            label="불량 관리"
            currentPath={location.pathname}
          />
          <SubMenuItem
            to="/quality/calibration"
            label="캘리브레이션"
            currentPath={location.pathname}
          />
          <SubMenuItem
            to="/quality/bonding"
            label="본딩(Bonding)"
            currentPath={location.pathname}
          />
          <SubMenuItem
            to="/quality/aging"
            label="에이징(Aging)"
            currentPath={location.pathname}
          />
          <SubMenuItem
            to="/quality/reliability"
            label="신뢰성 테스트"
            currentPath={location.pathname}
          />
        </MenuDropdown>

        {/* 6. Traceability (추적) */}
        <MenuDropdown
          title="Traceability"
          icon={<FaSitemap size={20} />}
          isOpen={isOpen}
          isExpanded={activeMenu === "traceability"}
          onClick={() => toggleSubMenu("traceability")}
        >
          <SubMenuItem
            to="/traceability/lot"
            label="LOT 추적"
            currentPath={location.pathname}
          />
          <SubMenuItem
            to="/traceability/dhr"
            label="이력 추적 (DHR)"
            currentPath={location.pathname}
          />
        </MenuDropdown>

        {/* 7. Support (지원) */}
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

        {/* 8. Admin (관리자) */}
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
            to="/admin/production-order"
            label="생산 지시 관리"
            currentPath={location.pathname}
          />
          <SubMenuItem
            to="/admin/work-order"
            label="작업 지시 관리"
            currentPath={location.pathname}
          />
          <SubMenuItem
            to="/admin/notices"
            label="공지사항 관리"
            currentPath={location.pathname}
          />
        </MenuDropdown>
      </ul>

      {/* ================= BOTTOM (Profile) ================= */}
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
          <div style={styles.avatarCircle}>
            {user?.name ? user.name.charAt(0) : "G"}
          </div>

          {isOpen && (
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user?.name || "이름 없음"}</div>
              <div style={styles.userDept}>
                {`${user?.dept || "부서미정"} | ${user?.role === "ADMIN" ? "관리자" : "사원"}`}
              </div>
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
    flexShrink: 0,
  },
  toggleBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "5px",
    display: "flex",
    alignItems: "center",
  },
  menuList: {
    flex: 1,
    padding: "15px",
    margin: 0,
    overflowY: "auto",
    overflowX: "hidden",
    scrollbarWidth: "none",
    "&::-webkit-scrollbar": { display: "none" },
  },
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
  profileSection: {
    padding: "20px",
    borderTop: "1px solid #f0f0f0",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    flexShrink: 0,
  },
  avatarCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: THEME_COLOR,
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "16px",
    flexShrink: 0,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  userInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  userName: {
    fontWeight: "bold",
    fontSize: "14px",
    color: "#333",
    whiteSpace: "nowrap",
    marginBottom: "2px",
  },
  userDept: {
    fontSize: "11px",
    color: "#999",
    whiteSpace: "nowrap",
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
