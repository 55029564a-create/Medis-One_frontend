import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSignOutAlt,
  FaClock,
  FaCloudSun,
  FaUserCircle,
  FaMapMarkerAlt,
} from "react-icons/fa";

// 🎨 MedisOne 디자인 시스템 컬러
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

  // 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({
    temp: "-",
    condition: "Loading...",
  });

  // 1. 로그인 체크
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(true); // 테스트용
  }, []);

  // 2. 실시간 시계
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. 날씨 API (더미)
  useEffect(() => {
    setTimeout(() => {
      setWeather({ temp: 21, condition: "맑음" });
    }, 500);
  }, []);

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      navigate("/");
    }
  };

  // 날짜 포맷
  const formattedDate = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, "0")}-${String(currentTime.getDate()).padStart(2, "0")} (${"일월화수목금토"[currentTime.getDay()]})`;
  const formattedTime = `${String(currentTime.getHours()).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(2, "0")}:${String(currentTime.getSeconds()).padStart(2, "0")}`;

  return (
    <header style={styles.headerContainer}>
      {/* --- [왼쪽] 정보 영역 (날씨, 위치, 시간) --- */}
      <div style={styles.leftSection}>
        {/* 1. 날씨 & 위치 */}
        <div style={styles.infoGroup}>
          <FaMapMarkerAlt color={COLORS.primary} size={14} />
          <span style={styles.infoText}>천안</span>
          <div style={styles.divider} />
          <FaCloudSun color="#FFA726" size={16} />
          <span style={styles.infoText}>
            {weather.condition} {weather.temp}°C
          </span>
        </div>

        {/* 2. 실시간 시계 */}
        <div style={styles.timeGroup}>
          <FaClock color={COLORS.primary} size={14} />
          <div style={styles.timeWrapper}>
            <span style={styles.dateText}>{formattedDate}</span>
            <span style={styles.timeText}>{formattedTime}</span>
          </div>
        </div>
      </div>

      {/* --- [오른쪽] 사용자 영역 (프로필, 로그아웃) --- */}
      <div style={styles.rightSection}>
        {isLoggedIn ? (
          <>
            <div style={styles.userSection}>
              <div style={styles.userInfo}>
                <span style={styles.userName}>관리자님</span>
                <span style={styles.userRole}>Master Account</span>
              </div>
              <FaUserCircle size={32} color="#e0e0e0" />
            </div>

            <button
              onClick={handleLogout}
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

// --- 스타일 객체 ---
const styles = {
  headerContainer: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    height: "64px",
    backgroundColor: COLORS.bg,
    borderBottom: `1px solid ${COLORS.border}`,

    // [핵심] 양쪽 끝으로 배분 (왼쪽 그룹 <---> 오른쪽 그룹)
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    padding: "0 25px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    width: "100%",
    boxSizing: "border-box",
  },

  // --- 왼쪽 그룹 스타일 ---
  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  // 정보 박스 (날씨)
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

  // 시간 박스 (별도 디자인)
  timeGroup: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#F0F2F5", // 날씨보다 조금 더 진하거나 다른 톤
    padding: "0 16px",
    borderRadius: "8px",
    gap: "10px",
    height: "40px",
    border: "1px solid #e5e5e5",
  },

  infoText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#555",
  },

  // [수정] 폰트 개선
  timeWrapper: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
  },
  dateText: {
    fontSize: "13px",
    color: "#777",
    fontWeight: "500",
  },
  timeText: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#333",
    // [핵심] 숫자 너비 고정 (폰트는 예쁘게, 흔들림은 없게)
    fontVariantNumeric: "tabular-nums",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif",
    letterSpacing: "0.5px",
  },

  divider: {
    width: "1px",
    height: "12px",
    backgroundColor: "#ccc",
    margin: "0 2px",
  },

  // --- 오른쪽 그룹 스타일 ---
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textAlign: "right",
  },

  userInfo: {
    display: "flex",
    flexDirection: "column",
  },

  userName: {
    fontSize: "14px",
    fontWeight: "bold",
    color: COLORS.text,
  },

  userRole: {
    fontSize: "11px",
    color: COLORS.primary, // 포인트 컬러
    fontWeight: "600",
  },

  logoutButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    backgroundColor: "#fff",
    color: "#FF5252",
    border: "1px solid #FFCDD2",
    borderRadius: "8px", // 더 둥글게
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
