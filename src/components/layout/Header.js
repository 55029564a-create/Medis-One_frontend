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

// Icons (날씨 아이콘 추가)
import {
  FaSignOutAlt,
  FaClock,
  FaUserCircle,
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
  FaBolt,
  FaSmog, // 날씨용 아이콘들
} from "react-icons/fa";

const COLORS = {
  primary: "#8C85FF",
  text: "#333",
  bg: "#FFFFFF",
  border: "#E0E0E0",
  activeTabBg: "#F3F1FF",
  activeTabBorder: "#8C85FF",
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
      <span style={{ pointerEvents: "none", whiteSpace: "nowrap" }}>
        {tab.name}
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

  // --- 날씨 & 시간 상태 ---
  const [currentTime, setCurrentTime] = useState(new Date());
  // [수정] 초기 상태를 '로딩중'이 아닌 '대기' 상태로, 에러 시 명확히 표시
  const [weather, setWeather] = useState({
    temp: null,
    status: "Loading",
    iconCode: "Loading",
  });

  // 시계
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 날씨 API 호출
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const API_KEY = "a401c48e03c0bffe9e70d13ad9a63ecb"; // 만료 시 교체 필요
        const city = "Cheonan";
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`,
        );

        if (!response.ok) {
          throw new Error("API Error"); // 응답 코드가 200이 아니면 에러 처리
        }

        const data = await response.json();
        const weatherMain = data.weather[0].main;

        // 상태 한글 변환
        let statusText = "맑음";
        if (weatherMain === "Clouds") statusText = "흐림";
        else if (weatherMain === "Rain") statusText = "비";
        else if (weatherMain === "Snow") statusText = "눈";
        else if (weatherMain === "Thunderstorm") statusText = "뇌우";
        else if (weatherMain === "Drizzle") statusText = "이슬비";
        else if (
          weatherMain === "Mist" ||
          weatherMain === "Haze" ||
          weatherMain === "Fog"
        )
          statusText = "안개";

        setWeather({
          temp: Math.round(data.main.temp),
          status: statusText,
          iconCode: weatherMain, // 아이콘 결정을 위한 영문 코드 저장
        });
      } catch (error) {
        // [수정] 에러 발생 시 임의의 값(-3도)을 넣지 않고 에러 상태 표시
        console.error("Weather API Error:", error);
        setWeather({
          temp: null,
          status: "API 점검중",
          iconCode: "Error",
        });
      }
    };
    fetchWeather();
  }, []);

  // 날씨 아이콘 렌더링 함수
  const getWeatherIcon = (code) => {
    switch (code) {
      case "Clear":
        return <FaSun color="#FFA726" size={16} />;
      case "Clouds":
        return <FaCloud color="#90A4AE" size={16} />;
      case "Rain":
        return <FaCloudRain color="#42A5F5" size={16} />;
      case "Drizzle":
        return <FaCloudRain color="#64B5F6" size={16} />;
      case "Thunderstorm":
        return <FaBolt color="#FFD600" size={16} />;
      case "Snow":
        return <FaSnowflake color="#81D4FA" size={16} />;
      case "Mist":
      case "Haze":
      case "Fog":
        return <FaSmog color="#B0BEC5" size={16} />;
      case "Error":
        return <FaExclamationTriangle color="#FF5252" size={14} />; // 에러 아이콘
      default:
        return <FaSun color="#ccc" size={16} />; // 로딩/기본
    }
  };

  const handleLogoutClick = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      logout();
      navigate("/");
    }
  };

  const formattedDate = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, "0")}-${String(currentTime.getDate()).padStart(2, "0")} (${"일월화수목금토"[currentTime.getDay()]})`;
  const formattedTime = `${String(currentTime.getHours()).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(2, "0")}:${String(currentTime.getSeconds()).padStart(2, "0")}`;
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
      {/* 1. Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.leftSection}>
          <div style={styles.infoGroup}>
            <FaMapMarkerAlt color={COLORS.primary} size={14} />
            <span style={styles.infoText}>천안</span>
            <div style={styles.divider} />

            {/* [수정] 날씨 아이콘 및 텍스트 렌더링 */}
            {getWeatherIcon(weather.iconCode)}
            <span
              style={{
                ...styles.infoText,
                color: weather.temp === null ? "#FF5252" : "#555", // 에러 시 빨간 글씨
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
                    {user.dept} / {user.role}
                  </span>
                </div>
                <FaUserCircle size={32} color="#e0e0e0" />
              </div>
              <button onClick={handleLogoutClick} style={styles.logoutButton}>
                <FaSignOutAlt size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Tab Bar */}
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
        >
          <FaHome size={18} />
        </div>
        <div style={styles.tabDivider} />

        <button style={styles.scrollBtn} onClick={() => scroll("left")}>
          <FaChevronLeft />
        </button>

        {/* DND 영역 */}
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

        {/* 탭 목록 보기 */}
        <div style={{ position: "relative" }}>
          <button style={styles.listBtn} onClick={() => setShowList(!showList)}>
            <FaList />
          </button>
          {showList && (
            <div style={styles.dropdownMenu}>
              <div style={styles.dropdownHeader}>
                Opened Pages ({draggableTabs.length})
              </div>
              {draggableTabs.map((tab) => (
                <div
                  key={tab.path}
                  style={styles.dropdownItem}
                  onClick={() => {
                    navigate(tab.path);
                    setShowList(false);
                  }}
                >
                  {tab.name}
                </div>
              ))}
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

  // Tab Bar
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
    padding: "2px",
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
  dropdownMenu: {
    position: "absolute",
    top: "40px",
    right: 0,
    width: "200px",
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
    "&:hover": { backgroundColor: "#F3F1FF", color: COLORS.primary },
  },
};

export default Header;
