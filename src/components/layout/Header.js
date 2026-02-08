import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTabs } from "../../context/TabContext";

// [DND-KIT]
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Icons
import {
  FaSignOutAlt,
  FaClock,
  FaMapMarkerAlt,
  FaTimes,
  FaHome,
  FaChevronLeft,
  FaChevronRight,
  FaList,
  FaSun,
  FaCloud,
  FaCloudRain,
  FaSnowflake,
  FaExclamationTriangle,
  FaTrashAlt,
  // 사이드바 메뉴 아이콘들
  FaBoxOpen,
  FaIndustry,
  FaCogs,
  FaUtensils,
  FaUserCog,
  FaWarehouse,
  FaSitemap,
  FaMicrochip,
  FaFileAlt,
} from "react-icons/fa";

// 🎨 디자인 상수
const COLORS = {
  primary: "#8C85FF",
  text: "#333",
  bg: "#FFFFFF",
  border: "#E0E0E0",
  activeTabBg: "#F3F1FF",
  activeTabBorder: "#8C85FF",
  danger: "#FF5252",
};
const THEME_COLOR = "#8C85FF";

// 🌳 메뉴 구조 데이터
const MENU_STRUCTURE = [
  {
    id: "material",
    icon: <FaBoxOpen size={14} />,
    subItems: [
      { to: "/material/inout", label: "자재 입출고" },
      { to: "/material/history", label: "입/출고 이력" },
    ],
  },
  {
    id: "inventory",
    icon: <FaWarehouse size={14} />,
    subItems: [
      { to: "/inventory/current", label: "재고 현황" },
      { to: "/inventory/history", label: "재고 이력" },
    ],
  },
  {
    id: "production",
    icon: <FaIndustry size={14} />,
    subItems: [
      { to: "/production/schedule", label: "생산 계획" },
      { to: "/production/work-order", label: "작업 지시서" },
      { to: "/production/report", label: "생산 보고" },
    ],
  },
  {
    id: "process",
    icon: <FaMicrochip size={14} />,
    subItems: [
      { to: "/process/bom", label: "BOM 관리" },
      { to: "/equipment", label: "설비 모니터링" },
      { to: "/process/line-monitoring", label: "BM / NCR 모니터링" },
    ],
  },
  {
    id: "quality",
    icon: <FaCogs size={14} />,
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
    icon: <FaSitemap size={14} />,
    subItems: [
      { to: "/traceability/lot", label: "LOT 추적" },
      { to: "/traceability/dhr", label: "이력 추적 (DHR)" },
    ],
  },
  {
    id: "support",
    icon: <FaUtensils size={14} />,
    subItems: [
      { to: "/support/notice", label: "공지사항" },
      { to: "/support/cafeteria", label: "식단표" },
    ],
  },
  {
    id: "admin",
    icon: <FaUserCog size={14} />,
    subItems: [
      { to: "/admin/employees", label: "사원 관리" },
      { to: "/admin/process", label: "공정 관리" },
      { to: "/admin/production-order", label: "생산 지시 관리" },
      { to: "/admin/work-order", label: "작업 지시 관리" },
      { to: "/admin/notices", label: "공지사항 관리" },
    ],
  },
];

const getMenuInfo = (path) => {
  for (const menu of MENU_STRUCTURE) {
    const foundSub = menu.subItems.find((sub) => sub.to === path);
    if (foundSub) {
      return { label: foundSub.label, icon: menu.icon };
    }
  }
  return { label: null, icon: <FaFileAlt size={14} /> };
};

// --- [Sub Component] Sortable Tab Item ---
const SortableTab = ({ tab, isActive, onClick, onClose }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.path });

  const menuInfo = getMenuInfo(tab.path);
  const displayName = menuInfo.label || tab.name;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : "auto",
    ...styles.tabItem,
    backgroundColor: isActive ? COLORS.activeTabBg : "transparent",
    color: isActive ? COLORS.primary : "#666",
    border: isActive
      ? `1px solid ${COLORS.activeTabBorder}40`
      : `1px solid transparent`,
    fontWeight: isActive ? "bold" : "normal",
    position: "relative",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        {menuInfo.icon}
        {displayName}
      </span>
      <button
        style={{
          ...styles.closeTabBtn,
          color: isActive ? COLORS.primary : "#bbb",
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <FaTimes size={10} />
      </button>
    </div>
  );
};

// --- [Main Header] ---
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAuth();
  const { tabs, setTabs, removeTab } = useTabs();

  const scrollRef = useRef(null);
  const [showList, setShowList] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({
    temp: null,
    status: "Loading",
    iconCode: "Loading",
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const API_KEY = "a401c48e03c0bffe9e70d13ad9a63ecb";
        const city = "Cheonan";
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`,
        );
        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        const weatherMain = data.weather[0].main;

        let statusText = "맑음";
        if (weatherMain === "Clouds") statusText = "흐림";
        else if (weatherMain === "Rain") statusText = "비";
        else if (weatherMain === "Snow") statusText = "눈";

        setWeather({
          temp: Math.round(data.main.temp),
          status: statusText,
          iconCode: weatherMain,
        });
      } catch (error) {
        setWeather({ temp: null, status: "API 점검", iconCode: "Error" });
      }
    };
    fetchWeather();
  }, []);

  const getWeatherIcon = (code) => {
    switch (code) {
      case "Clear":
        return <FaSun color="#FFA726" size={16} />;
      case "Clouds":
        return <FaCloud color="#90A4AE" size={16} />;
      case "Rain":
        return <FaCloudRain color="#42A5F5" size={16} />;
      case "Snow":
        return <FaSnowflake color="#81D4FA" size={16} />;
      case "Error":
        return <FaExclamationTriangle color="#FF5252" size={14} />;
      default:
        return <FaSun color="#ccc" size={16} />;
    }
  };

  const handleLogoutClick = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      logout();
      navigate("/");
    }
  };

  const handleCloseAllTabs = () => {
    if (window.confirm("모든 탭을 닫고 대시보드로 이동하시겠습니까?")) {
      navigate("/dashboard", { replace: true });
      setTimeout(() => {
        setTabs([]);
      }, 50);
    }
  };

  const formattedDate = `${currentTime.getFullYear()}-${String(
    currentTime.getMonth() + 1,
  ).padStart(2, "0")}-${String(currentTime.getDate()).padStart(
    2,
    "0",
  )} (${"일월화수목금토"[currentTime.getDay()]})`;
  const formattedTime = `${String(currentTime.getHours()).padStart(
    2,
    "0",
  )}:${String(currentTime.getMinutes()).padStart(2, "0")}:${String(
    currentTime.getSeconds(),
  ).padStart(2, "0")}`;
  const isDashboard = location.pathname === "/dashboard";

  // --- DND Logic ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = tabs.findIndex((t) => t.path === active.id);
      const newIndex = tabs.findIndex((t) => t.path === over.id);
      setTabs((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  const draggableTabs = tabs.filter((t) => t.path !== "/dashboard");

  return (
    <header style={styles.headerWrapper}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.leftSection}>
          <div style={styles.infoGroup}>
            <FaMapMarkerAlt color={COLORS.primary} size={14} />
            <span style={styles.infoText}>천안</span>
            <div style={styles.divider} />
            {getWeatherIcon(weather.iconCode)}
            <span
              style={{
                ...styles.infoText,
                color: weather.temp === null ? "#FF5252" : "#555",
              }}
            >
              {weather.temp !== null
                ? `${weather.status} ${weather.temp}°C`
                : weather.status}
            </span>
          </div>
          <div style={styles.timeGroup}>
            <FaClock color={COLORS.primary} size={14} />
            <div style={styles.timeWrapper}>
              <span style={styles.dateText}>{formattedDate}</span>
              <span style={styles.timeText}>{formattedTime}</span>
            </div>
          </div>
        </div>

        <div style={styles.rightSection}>
          {isLoggedIn && user && (
            <>
              <div style={styles.userSection}>
                <div style={styles.userInfo}>
                  <span style={styles.userName}>{user.name} 님</span>
                  <span style={styles.userRole}>
                    {/* ✨ [수정] 영문 Role을 한글로 변환 (사이드바와 동일 로직) */}
                    {user.dept} / {user.role === "ADMIN" ? "관리자" : "사원"}
                  </span>
                </div>

                <div style={styles.avatarCircle}>
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
              </div>
              <button onClick={handleLogoutClick} style={styles.logoutButton}>
                <FaSignOutAlt size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Toolbar (Tabs) */}
      <div style={styles.tabContainer}>
        {/* 홈 버튼 */}
        <div
          style={{
            ...styles.homeTab,
            color: isDashboard ? COLORS.primary : "#999",
            backgroundColor: isDashboard ? COLORS.activeTabBg : "transparent",
            borderBottom: isDashboard
              ? `2px solid ${COLORS.primary}`
              : "2px solid transparent",
          }}
          onClick={() => navigate("/dashboard")}
          title="대시보드"
        >
          <FaHome size={18} />
        </div>
        <div style={styles.tabDivider} />

        <button style={styles.scrollBtn} onClick={() => scroll("left")}>
          <FaChevronLeft />
        </button>

        {/* DND 탭 영역 */}
        <div style={styles.scrollTabs} ref={scrollRef}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={draggableTabs.map((t) => t.path)}
              strategy={horizontalListSortingStrategy}
            >
              {draggableTabs.map((tab) => (
                <SortableTab
                  key={tab.path}
                  tab={tab}
                  isActive={location.pathname === tab.path}
                  onClick={() => navigate(tab.path)}
                  onClose={() => removeTab(tab.path)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <button style={styles.scrollBtn} onClick={() => scroll("right")}>
          <FaChevronRight />
        </button>

        <div style={styles.tabDivider} />

        {/* 우측 컨트롤 버튼 그룹 */}
        <div style={{ display: "flex", gap: "5px", position: "relative" }}>
          {/* 전체 삭제 버튼 */}
          {draggableTabs.length > 0 && (
            <button
              style={styles.closeAllBtn}
              onClick={handleCloseAllTabs}
              title="모든 탭 닫기"
            >
              <FaTrashAlt size={12} />
            </button>
          )}

          {/* 리스트 보기 버튼 */}
          <button style={styles.listBtn} onClick={() => setShowList(!showList)}>
            <FaList />
          </button>

          {showList && (
            <div style={styles.dropdownMenu}>
              <div style={styles.dropdownHeader}>
                Opened Pages ({draggableTabs.length})
              </div>
              {draggableTabs.length === 0 ? (
                <div
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    color: "#ccc",
                    fontSize: "12px",
                  }}
                >
                  열린 탭이 없습니다.
                </div>
              ) : (
                draggableTabs.map((tab) => {
                  const info = getMenuInfo(tab.path);
                  return (
                    <div
                      key={tab.path}
                      style={styles.dropdownItem}
                      onClick={() => {
                        navigate(tab.path);
                        setShowList(false);
                      }}
                    >
                      <span
                        style={{
                          marginRight: "8px",
                          color: "#888",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {info.icon}
                      </span>
                      {info.label || tab.name}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const styles = {
  headerWrapper: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    backgroundColor: "#fff",
    borderBottom: `1px solid ${COLORS.border}`,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
  },
  topBar: {
    height: "60px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 25px",
    borderBottom: "1px solid #f5f5f5",
    width: "100%",
    boxSizing: "border-box",
  },
  leftSection: { display: "flex", alignItems: "center", gap: "12px" },
  infoGroup: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: "0 14px",
    borderRadius: "8px",
    gap: "8px",
    border: "1px solid #eee",
    height: "36px",
  },
  timeGroup: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    padding: "0 16px",
    borderRadius: "8px",
    gap: "10px",
    height: "36px",
    border: "1px solid #e5e5e5",
  },
  infoText: { fontSize: "13px", fontWeight: "600", color: "#555" },
  timeWrapper: { display: "flex", alignItems: "baseline", gap: "8px" },
  dateText: { fontSize: "12px", color: "#777", fontWeight: "500" },
  timeText: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#333",
    fontVariantNumeric: "tabular-nums",
  },
  divider: {
    width: "1px",
    height: "12px",
    backgroundColor: "#ccc",
    margin: "0 2px",
  },
  rightSection: { display: "flex", alignItems: "center", gap: "15px" },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textAlign: "right",
  },
  userInfo: { display: "flex", flexDirection: "column" },
  userName: { fontSize: "13px", fontWeight: "bold", color: COLORS.text },
  userRole: { fontSize: "11px", color: COLORS.primary, fontWeight: "600" },

  avatarCircle: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: THEME_COLOR,
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "14px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },

  logoutButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    backgroundColor: "#fff",
    color: "#FF5252",
    border: "1px solid #FFCDD2",
    borderRadius: "8px",
    cursor: "pointer",
  },
  tabContainer: {
    display: "flex",
    alignItems: "center",
    height: "44px",
    padding: "0 10px",
    backgroundColor: "#FFFFFF",
  },
  homeTab: {
    width: "40px",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabDivider: {
    width: "1px",
    height: "20px",
    backgroundColor: "#ddd",
    margin: "0 10px",
  },
  scrollTabs: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    overflowX: "auto",
    scrollbarWidth: "none",
    height: "100%",
    flex: 1,
    padding: "4px 0",
    scrollBehavior: "smooth",
  },
  tabItem: {
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    height: "32px",
    borderRadius: "16px",
    cursor: "pointer",
    fontSize: "13px",
    whiteSpace: "nowrap",
    userSelect: "none",
    minWidth: "fit-content",
    touchAction: "none",
  },
  closeTabBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    marginLeft: "8px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollBtn: {
    background: "transparent",
    border: "none",
    color: "#999",
    cursor: "pointer",
    padding: "0 5px",
    display: "flex",
    alignItems: "center",
    height: "100%",
    "&:hover": { color: COLORS.primary },
  },
  listBtn: {
    background: "#f5f5f5",
    border: "none",
    color: "#666",
    cursor: "pointer",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  closeAllBtn: {
    background: "#FFF0F0",
    border: `1px solid ${COLORS.danger}40`,
    color: COLORS.danger,
    cursor: "pointer",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    "&:hover": {
      backgroundColor: COLORS.danger,
      color: "#fff",
    },
  },
  dropdownMenu: {
    position: "absolute",
    top: "40px",
    right: 0,
    width: "220px",
    backgroundColor: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    borderRadius: "8px",
    zIndex: 2000,
    overflow: "hidden",
    border: "1px solid #eee",
  },
  dropdownHeader: {
    padding: "10px 15px",
    backgroundColor: "#f9f9f9",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#888",
    borderBottom: "1px solid #eee",
  },
  dropdownItem: {
    padding: "10px 15px",
    fontSize: "13px",
    color: "#333",
    cursor: "pointer",
    borderBottom: "1px solid #f5f5f5",
    display: "flex",
    alignItems: "center",
    "&:hover": { backgroundColor: "#F3F1FF", color: COLORS.primary },
  },
};

export default Header;
