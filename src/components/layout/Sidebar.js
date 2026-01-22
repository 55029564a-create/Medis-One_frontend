import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaChartPie,
  FaMicrochip,
  FaBox,
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
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";

// ✅ [중요] 여기에 로그인 화면에서 사용한 로고 파일 경로를 넣어주세요!
// 예시: src/assets/logo.png 파일이 있다면 아래와 같이 import 합니다.
// 경로가 다르다면 "../" 개수를 조절해서 맞춰주세요.
import logoImage from "../../assets/logo.png";

// 🎨 MedisOne 테마 컬러
const THEME_COLOR = "#8C85FF";
const BG_COLOR = "#FFFFFF";
const TEXT_COLOR = "#888";
const ACTIVE_TEXT_COLOR = "#8C85FF";
const ACTIVE_BG_COLOR = "#F3F1FF";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // 사이드바 열림 상태
  const [activeMenu, setActiveMenu] = useState(null); // 현재 열린 상위 메뉴
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null); // 외부 클릭 감지용 Ref

  const { user, logout } = useAuth();

  // --- 1. 외부 클릭 시 사이드바 닫기 ---
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

  // --- 2. 토글 핸들러 ---
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setActiveMenu(null);
  };

  // --- 3. 메뉴 드롭다운 토글 ---
  const toggleSubMenu = (menuName) => {
    if (!isOpen) {
      setIsOpen(true);
      setActiveMenu(menuName);
    } else {
      setActiveMenu(activeMenu === menuName ? null : menuName);
    }
  };

  // --- 4. 로그아웃 핸들러 ---
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
      {/* ================= HEADER (로고 & 토글) ================= */}
      <div style={styles.header} onClick={toggleSidebar}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            flex: 1,
            overflow: "hidden",
            justifyContent: isOpen ? "flex-start" : "center", // 닫혔을 때 중앙 정렬
          }}
        >
          {/* ▼▼▼ [수정됨] import한 로고 이미지 사용 ▼▼▼ */}
          <img
            src={logoImage} // 위에서 import한 변수명
            alt="MedisOne Logo"
            style={{
              height: "40px", // 로고 높이 고정
              objectFit: "contain",
              flexShrink: 0,
              transition: "all 0.3s ease",
              // 열려있을 땐 원래 크기, 닫혀있을 땐 작게(아이콘처럼) 보이도록 설정
              width: isOpen ? "140px" : "40px",
              // 닫혔을 때 이미지 위치 조정 (필요시 수정)
              marginLeft: isOpen ? "0" : "0",
            }}
          />
          {/* ▲▲▲ 수정 끝 ▲▲▲ */}
        </div>

        {/* 접기/펼치기 아이콘 (보조) */}
        {isOpen && (
          <button style={styles.toggleBtn}>
            <FaAngleDoubleLeft color="#ccc" />
          </button>
        )}
      </div>

      {/* ================= MENU LIST ================= */}
      <div style={styles.menuContainer}>
        <ul style={styles.ul}>
          {/* 1. 대시보드 */}
          <MenuItem
            to="/dashboard"
            icon={<MdDashboard />}
            label="Dashboard"
            isOpen={isOpen}
            isActive={location.pathname === "/dashboard"}
          />

          <div style={styles.divider}></div>

          {/* 2. 자재 관리 */}
          <MenuDropdown
            title="Material"
            icon={<FaBoxOpen />}
            isOpen={isOpen}
            isExpanded={activeMenu === "material"}
            isActive={location.pathname.startsWith("/material")}
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

          {/* 3. 재고 관리 */}
          <MenuDropdown
            title="Inventory"
            icon={<FaWarehouse />}
            isOpen={isOpen}
            isExpanded={activeMenu === "inventory"}
            isActive={location.pathname.startsWith("/inventory")}
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

          {/* 4. 생산 관리 */}
          <MenuDropdown
            title="Production"
            icon={<FaIndustry />}
            isOpen={isOpen}
            isExpanded={activeMenu === "production"}
            isActive={location.pathname.startsWith("/production")}
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

          {/* [신규] 5. Process (공정 실행 - 현장) */}
          <MenuDropdown
            title="Process"
            icon={<FaMicrochip />}
            isOpen={isOpen}
            isExpanded={activeMenu === "process"}
            isActive={location.pathname.startsWith("/process")}
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

          {/* 6. 품질/설비 */}
          <MenuDropdown
            title="Quality"
            icon={<FaCogs />}
            isOpen={isOpen}
            isExpanded={activeMenu === "quality"}
            isActive={
              location.pathname.startsWith("/quality") ||
              location.pathname.startsWith("/equipment")
            }
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

          {/* [신규] 7. 이력 추적 (Traceability) */}
          <MenuDropdown
            title="Traceability"
            icon={<FaSitemap />}
            isOpen={isOpen}
            isExpanded={activeMenu === "traceability"}
            isActive={location.pathname.startsWith("/traceability")}
            onClick={() => toggleSubMenu("traceability")}
          >
            <SubMenuItem
              to="/traceability/dhr"
              label="이력 추적 (DHR)"
              currentPath={location.pathname}
            />
          </MenuDropdown>

          {/* 8. 지원 업무 */}
          <MenuDropdown
            title="Support"
            icon={<FaUtensils />}
            isOpen={isOpen}
            isExpanded={activeMenu === "support"}
            isActive={location.pathname.startsWith("/support")}
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

          {/* 9. 관리자 */}
          <MenuDropdown
            title="Admin"
            icon={<FaUserCog />}
            isOpen={isOpen}
            isExpanded={activeMenu === "admin"}
            isActive={location.pathname.startsWith("/admin")}
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

      {/* ================= BOTTOM (Banner & Profile) ================= */}

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

// --- Sub Components (기존과 동일) ---

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
  toggleBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "5px",
    display: "flex",
    alignItems: "center",
    marginLeft: "10px",
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
    "&:hover": {
      backgroundColor: "#FAFAFA",
    },
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
    boxShadow: "0 8px 20px rgba(140, 133, 255, 0.25)",
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
    marginTop: "10px",
    width: "100%",
    transition: "transform 0.1s",
  },
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
    "&:hover": {
      backgroundColor: "#f5f5f5",
      color: "#FF4444",
    },
  },
};

export default Sidebar;
