import React, { useState } from "react";
import {
  FaBullhorn,
  FaSearch,
  FaPen,
  FaChevronLeft,
  FaChevronRight,
  FaEye, // 조회수 아이콘
} from "react-icons/fa";

// 🎨 디자인 시스템 (식단표와 통일)
const COLORS = {
  primary: "#8C85FF",
  bg: "#F5F6FA",
  text: "#333",
  subText: "#888",
  border: "#E0E0E0",
  white: "#FFFFFF",
  danger: "#FF5252", // 필독 강조용
  headerBg: "#F8F9FD", // 테이블 헤더 배경
};

const Notice = () => {
  // 데이터 (필독/일반 구분)
  const notices = [
    {
      id: 1,
      title: "설 연휴 기간 설비 점검 안내",
      isImportant: true, // 필독 여부 데이터로 분리 (또는 제목 파싱 가능)
      writer: "시설팀",
      date: "2026-01-10",
      views: 120,
    },
    {
      id: 2,
      title: "1월 사내 식당 메뉴표 공지",
      isImportant: false,
      writer: "총무팀",
      date: "2026-01-12",
      views: 85,
    },
    {
      id: 3,
      title: "MES 시스템 업데이트 일정 안내 (1/20)",
      isImportant: false,
      writer: "IT개발팀",
      date: "2026-01-14",
      views: 240,
    },
    {
      id: 4,
      title: "신규 입사자 보안 교육 실시",
      isImportant: false,
      writer: "인사팀",
      date: "2026-01-14",
      views: 45,
    },
    {
      id: 5,
      title: "사내 동호회 회원 모집 (축구, 볼링)",
      isImportant: false,
      writer: "인사팀",
      date: "2026-01-15",
      views: 32,
    },
  ];

  return (
    <div style={styles.container}>
      {/* 1. 헤더 & 검색 영역 */}
      <div style={styles.headerRow}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaBullhorn size={24} color={COLORS.primary} />
          <h2 style={styles.pageTitle}>공지사항</h2>
        </div>

        {/* 검색창 & 버튼 */}
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={styles.searchBox}>
            <FaSearch color="#aaa" />
            <input
              type="text"
              placeholder="제목, 작성자 검색"
              style={styles.searchInput}
            />
          </div>
          <button style={styles.writeButton}>
            <FaPen size={12} /> 글쓰기
          </button>
        </div>
      </div>

      {/* 2. 테이블 영역 */}
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadTr}>
              <th style={{ ...styles.th, width: "60px" }}>No</th>
              <th style={{ ...styles.th, width: "auto" }}>제목</th>
              <th style={{ ...styles.th, width: "100px" }}>작성자</th>
              <th style={{ ...styles.th, width: "120px" }}>작성일</th>
              <th style={{ ...styles.th, width: "80px" }}>조회</th>
            </tr>
          </thead>
          <tbody>
            {notices.map((item) => (
              <NoticeRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>

        {/* 3. 페이지네이션 (푸터) */}
        <div style={styles.pagination}>
          <button style={styles.pageBtn}>
            <FaChevronLeft size={10} />
          </button>
          <button style={{ ...styles.pageBtn, ...styles.activePageBtn }}>
            1
          </button>
          <button style={styles.pageBtn}>2</button>
          <button style={styles.pageBtn}>3</button>
          <button style={styles.pageBtn}>
            <FaChevronRight size={10} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- [컴포넌트] 테이블 행 ---
const NoticeRow = ({ item }) => {
  const [hover, setHover] = useState(false);

  return (
    <tr
      style={{
        ...styles.tbodyTr,
        backgroundColor: hover ? "#F8F9FA" : "white", // 호버 효과
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <td style={{ ...styles.td, color: COLORS.subText }}>{item.id}</td>
      <td style={{ ...styles.td, textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* 필독 배지 */}
          {item.isImportant && <span style={styles.badgeImportant}>필독</span>}
          <span
            style={{
              color: COLORS.text,
              fontWeight: item.isImportant ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            {item.title}
          </span>
          {/* New 아이콘 (예시: 최근 3일 이내) */}
          {item.id >= 3 && <span style={styles.badgeNew}>N</span>}
        </div>
      </td>
      <td style={{ ...styles.td, color: "#555" }}>{item.writer}</td>
      <td style={{ ...styles.td, color: COLORS.subText }}>{item.date}</td>
      <td style={{ ...styles.td, color: COLORS.subText }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          <FaEye size={12} /> {item.views}
        </div>
      </td>
    </tr>
  );
};

// --- 스타일 ---
const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  pageTitle: {
    margin: 0,
    color: COLORS.text,
    fontSize: "22px",
    fontWeight: "700",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "white",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    padding: "8px 12px",
    gap: "8px",
    width: "250px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "14px",
  },
  writeButton: {
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
    fontWeight: "bold",
  },

  // 카드 (테이블 감싸는 박스)
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
    overflow: "hidden", // 둥근 모서리 유지
    paddingBottom: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  theadTr: {
    backgroundColor: COLORS.headerBg,
    borderBottom: `1px solid ${COLORS.border}`,
    height: "50px",
  },
  th: {
    fontWeight: "bold",
    color: "#555",
    textAlign: "center",
    padding: "0 10px",
  },
  tbodyTr: {
    borderBottom: "1px solid #f0f0f0",
    height: "55px",
    transition: "background-color 0.2s",
  },
  td: {
    textAlign: "center",
    padding: "0 15px",
  },

  // 배지 스타일
  badgeImportant: {
    backgroundColor: "rgba(255, 82, 82, 0.1)",
    color: COLORS.danger,
    fontSize: "11px",
    padding: "3px 6px",
    borderRadius: "4px",
    fontWeight: "bold",
    border: `1px solid ${COLORS.danger}`,
  },
  badgeNew: {
    backgroundColor: COLORS.primary,
    color: "white",
    fontSize: "9px",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },

  // 페이지네이션
  pagination: {
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
    gap: "5px",
  },
  pageBtn: {
    width: "30px",
    height: "30px",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: "white",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#666",
  },
  activePageBtn: {
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    fontWeight: "bold",
  },
};

export default Notice;
