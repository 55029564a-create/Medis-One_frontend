import React, { useState, useEffect } from "react";
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

// 🌳 메뉴 구조 데이터 (여기만 수정하면 메뉴가 바뀝니다)
const MENU_STRUCTURE = [
  {
    id: "material",
    title: "Material",
    icon: <FaBoxOpen size={20} />,
    subItems: [
      { to: "/material/inout", label: "자재 입출고" },
      { to: "/material/history", label: "입/출고 이력" },
    ],
  },
  {
    id: "inventory",
    title: "Inventory",
    icon: <FaWarehouse size={20} />,
    subItems: [
      { to: "/inventory/current", label: "재고 현황" },
      { to: "/inventory/history", label: "재고 이력" },
    ],
  },
  {
    id: "production",
    title: "Production",
    icon: <FaIndustry size={20} />,
    subItems: [
      { to: "/production/schedule", label: "생산 계획" },
      { to: "/production/work-order", label: "작업 지시서" },
      { to: "/production/report", label: "생산 보고" },
    ],
  },
  {
    id: "process",
    title: "Process",
    icon: <FaMicrochip size={20} />,
    subItems: [
      { to: "/process/bom", label: "BOM 관리" },
      { to: "/equipment", label: "설비 모니터링" },
      { to: "/process/line-monitoring", label: "BM / NCR 모니터링" },
    ],
  },
  {
    id: "quality",
    title: "Quality",
    icon: <FaCogs size={20} />,
    subItems: [
      { to: "/quality/defect", label: "불량 관리" },
      { to: "/quality/calibration", label: "캘리브레이션" },
      { to: "/quality/bonding", label: "본딩(Bonding)" },
      { to: "/quality/aging", label: "에이징(Aging)" },
      { to: "/quality/reliability", label: "신뢰성 테스트" },
    ],
  },
  {
    id: "traceability",
    title: "Traceability",
    icon: <FaSitemap size={20} />,
    subItems: [
      { to: "/traceability/lot", label: "LOT 추적" },
      { to: "/traceability/dhr", label: "이력 추적 (DHR)" },
    ],
  },
  {
    id: "support",
    title: "Support",
    icon: <FaUtensils size={20} />,
    subItems: [
      { to: "/support/notice", label: "공지사항" },
      { to: "/support/cafeteria", label: "식단표" },
    ],
  },
  {
    id: "admin",
    title: "Admin",
    icon: <FaUserCog size={20} />,
    // role: "ADMIN", // 추후 권한 관리가 필요하면 추가
    subItems: [
      { to: "/admin/employees", label: "사원 관리" },
      { to: "/admin/process", label: "공정 관리" },
      { to: "/admin/production-order", label: "생산 지시 관리" },
      { to: "/admin/work-order", label: "작업 지시 관리" },
      { to: "/admin/notices", label: "공지사항 관리" },
    ],
  },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ✨ [Logic] URL 변경 시 해당 메뉴 자동 펼치기
  useEffect(() => {
    if (isOpen) {
      const currentPath = location.pathname;
      const foundMenu = MENU_STRUCTURE.find((menu) =>
        menu.subItems.some((sub) => sub.to === currentPath),
      );
      if (foundMenu) {
        setActiveMenu(foundMenu.id);
      }
    }
  }, [location.pathname, isOpen]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    // 닫을 때는 메뉴를 접지 않고, 다시 열 때 기억하도록 하거나
    // UX에 따라 if (!isOpen) setActiveMenu(null); 로직을 조정 가능
  };

  const toggleSubMenu = (menuId) => {
    if (!isOpen) {
      setIsOpen(true);
      setActiveMenu(menuId);
    } else {
      setActiveMenu(activeMenu === menuId ? null : menuId);
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

      {/* ================= MENU LIST ================= */}
      <ul style={styles.menuList}>
        {MENU_STRUCTURE.map((menu) => {
          // 현재 URL이 하위 메뉴 중 하나와 일치하는지 확인 (부모 메뉴 하이라이트용)
          const isParentActive = menu.subItems.some(
            (sub) => sub.to === location.pathname,
          );

          return (
            <MenuDropdown
              key={menu.id}
              title={menu.title}
              icon={menu.icon}
              isOpen={isOpen}
              isExpanded={activeMenu === menu.id}
              isActive={isParentActive} // ✨ 자식 메뉴가 활성화되면 부모도 활성화 스타일 적용
              onClick={() => toggleSubMenu(menu.id)}
            >
              {menu.subItems.map((subItem) => (
                <SubMenuItem
                  key={subItem.to}
                  to={subItem.to}
                  label={subItem.label}
                  currentPath={location.pathname}
                />
              ))}
            </MenuDropdown>
          );
        })}
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
                {`${user?.dept || "부서미정"} | ${
                  user?.role === "ADMIN" ? "관리자" : "사원"
                }`}
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

// --- Sub Components (그대로 유지하되, 약간의 로직 보완) ---

const MenuDropdown = ({
  title,
  icon,
  isOpen,
  isExpanded,
  isActive, // Parent active state
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
        // 활성화(클릭됨) 상태이거나 자식 메뉴가 선택된 경우 색상 변경
        color: isActive || isExpanded ? ACTIVE_TEXT_COLOR : TEXT_COLOR,
        backgroundColor:
          isActive || isExpanded ? ACTIVE_BG_COLOR : "transparent",
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
              fontWeight: isActive || isExpanded ? "700" : "500",
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

// --- Styles (기존 스타일 유지) ---
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
