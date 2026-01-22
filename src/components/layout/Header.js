import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // [중요] Context 불러오기
import {
  FaSignOutAlt,
  FaClock,
  FaCloudSun,
  FaSnowflake,
  FaUserCircle,
  FaMapMarkerAlt,
} from "react-icons/fa";

const COLORS = {
  primary: "#8C85FF",
  text: "#333",
  subText: "#666",
  bg: "#FFFFFF",
  border: "#E0E0E0",
  icon: "#555",
};

const Header = () => {
  const navigate = useNavigate();

  // [변경] Context에서 로그인 상태, 유저 정보, 로그아웃 함수를 한방에 가져옴
  const { isLoggedIn, user, logout } = useAuth();

  // 날씨, 시간 상태
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({
    temp: "-",
    condition: "Loading...",
  });

  // 1. 실시간 시계
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. 날씨 API
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const API_KEY = "a401c48e03c0bffe9e70d13ad9a63ecb";
        const city = "Cheonan";
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`,
        );
        const data = await response.json();
        setWeather({
          temp: Math.round(data.main.temp),
          condition: data.weather[0].main === "Clear" ? "맑음" : "흐림",
        });
      } catch (error) {
        setWeather({ temp: -3, condition: "N/A" });
      }
    };
    fetchWeather();
  }, []);

  // [변경] 로그아웃 핸들러 (Context의 logout 사용)
  const handleLogoutClick = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      logout(); // Context에서 상태 지우고 로컬스토리지 비움
      navigate("/");
    }
  };

  const formattedDate = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, "0")}-${String(currentTime.getDate()).padStart(2, "0")} (${"일월화수목금토"[currentTime.getDay()]})`;
  const formattedTime = `${String(currentTime.getHours()).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(2, "0")}:${String(currentTime.getSeconds()).padStart(2, "0")}`;

  return (
    <header style={styles.headerContainer}>
      {/* 왼쪽: 날씨, 위치, 시간 */}
      <div style={styles.leftSection}>
        <div style={styles.infoGroup}>
          <FaMapMarkerAlt color={COLORS.primary} size={14} />
          <span style={styles.infoText}>천안</span>
          <div style={styles.divider} />
          {parseInt(weather.temp) < 0 ? (
            <FaSnowflake color="#90CAF9" size={14} />
          ) : (
            <FaCloudSun color="#FFA726" size={16} />
          )}
          <span style={styles.infoText}>
            {weather.condition} {weather.temp}°C
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

      {/* 오른쪽: 유저 정보 표시 */}
      <div style={styles.rightSection}>
        {isLoggedIn && user ? (
          <>
            <div style={styles.userSection}>
              <div style={styles.userInfo}>
                {/* [핵심] user 객체의 정보 표시 */}
                <span style={styles.userName}>{user.name} 님</span>
                <span style={styles.userRole}>
                  {user.dept} / {user.role}
                </span>
              </div>
              <FaUserCircle size={32} color="#e0e0e0" />
            </div>

            <button
              onClick={handleLogoutClick}
              style={styles.logoutButton}
              title="로그아웃"
            >
              <FaSignOutAlt size={14} />
            </button>
          </>
        ) : (
          <button onClick={() => navigate("/")} style={styles.loginButton}>
            로그인
          </button>
        )}
      </div>
    </header>
  );
};

// 스타일 (기존과 동일)
const styles = {
  headerContainer: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    height: "64px",
    backgroundColor: COLORS.bg,
    borderBottom: `1px solid ${COLORS.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 25px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
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
    height: "40px",
  },
  timeGroup: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    padding: "0 16px",
    borderRadius: "8px",
    gap: "10px",
    height: "40px",
    border: "1px solid #e5e5e5",
  },
  infoText: { fontSize: "14px", fontWeight: "600", color: "#555" },
  timeWrapper: { display: "flex", alignItems: "baseline", gap: "8px" },
  dateText: { fontSize: "13px", color: "#777", fontWeight: "500" },
  timeText: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#333",
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "0.5px",
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
  userName: { fontSize: "14px", fontWeight: "bold", color: COLORS.text },
  userRole: { fontSize: "11px", color: COLORS.primary, fontWeight: "600" },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    backgroundColor: "#fff",
    color: "#FF5252",
    border: "1px solid #FFCDD2",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(255, 82, 82, 0.1)",
  },
  loginButton: {
    padding: "8px 20px",
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Header;
