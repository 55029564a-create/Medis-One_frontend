import React, { useState, useEffect } from "react";
import {
  FaBullhorn,
  FaSearch,
  FaPen,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaTimes,
  FaCheck,
  //  상세 보기 디자인에 필요한 아이콘들
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";

const COLORS = {
  primary: "#8C85FF",
  bg: "#F5F6FA",
  text: "#333",
  subText: "#888",
  border: "#E0E0E0",
  white: "#FFFFFF",
  danger: "#FF5252",
  headerBg: "#F8F9FD",
};

const Notice = () => {
  const [notices, setNotices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 글쓰기 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: "",
    writer: "관리자",
    content: "",
    important: false,
  });

  // 상세 보기 모달 상태 변수
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // 1. 데이터 조회
  const fetchNotices = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8111/api/support/notices",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const sortedData = data.sort((a, b) => {
          const aImp = a.important;
          const bImp = b.important;
          if (aImp === bImp) {
            return b.id - a.id;
          }
          return aImp ? -1 : 1;
        });
        setNotices(sortedData);
      }
    } catch (error) {
      console.error("API 에러:", error);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // 제목 클릭 시 상세 내용 가져오는 함수
  const handleNoticeClick = async (id) => {
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      // 상세 조회 API 호출 (조회수 증가됨)
      const response = await fetch(
        `http://localhost:8111/api/support/notices/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedNotice(data); // 데이터 저장
        setIsDetailOpen(true); // 상세 모달 열기
        fetchNotices(); // 목록 새로고침 (증가된 조회수 반영)
      }
    } catch (error) {
      console.error("상세 조회 에러:", error);
    }
  };

  // 2. 글쓰기 저장
  const handleSave = async () => {
    if (!newNotice.title || !newNotice.content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8111/api/support/notices",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(newNotice),
        },
      );

      if (response.ok) {
        alert("공지사항이 등록되었습니다.");
        setIsModalOpen(false);
        setNewNotice({
          title: "",
          writer: "관리자",
          content: "",
          important: false,
        });
        fetchNotices();
      } else {
        if (response.status === 401 || response.status === 403) {
          alert("권한이 없습니다. 다시 로그인해주세요.");
        } else {
          alert(`저장 실패! (에러코드: ${response.status})`);
        }
      }
    } catch (error) {
      console.error("저장 중 에러", error);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotices = notices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(notices.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div style={styles.container}>
      {/* 헤더 (기존 유지) */}
      <div style={styles.headerRow}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaBullhorn size={24} color={COLORS.primary} />
          <h2 style={styles.pageTitle}>공지사항</h2>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={styles.searchBox}>
            <FaSearch color="#aaa" />
            <input
              type="text"
              placeholder="제목, 작성자 검색"
              style={styles.searchInput}
            />
          </div>
          <button
            style={styles.writeButton}
            onClick={() => setIsModalOpen(true)}
          >
            <FaPen size={12} /> 글쓰기
          </button>
        </div>
      </div>

      {/* 테이블 영역 */}
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
            {currentNotices.map((item) => (
              <NoticeRow
                key={item.id}
                item={item}
                // 클릭 시 상세 보기 함수 연결
                onTitleClick={() => handleNoticeClick(item.id)}
              />
            ))}
            {notices.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#888",
                  }}
                >
                  등록된 공지사항이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        <div style={styles.pagination}>
          <button
            style={styles.pageBtn}
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <FaChevronLeft size={10} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              style={
                currentPage === number
                  ? { ...styles.pageBtn, ...styles.activePageBtn }
                  : styles.pageBtn
              }
              onClick={() => handlePageChange(number)}
            >
              {number}
            </button>
          ))}
          <button
            style={styles.pageBtn}
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <FaChevronRight size={10} />
          </button>
        </div>
      </div>

      {/* 글쓰기 모달 */}
      {isModalOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>📝 공지사항 작성</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={styles.closeBtn}
              >
                <FaTimes />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <input
                  type="checkbox"
                  id="important"
                  checked={newNotice.important}
                  onChange={(e) =>
                    setNewNotice({ ...newNotice, important: e.target.checked })
                  }
                  style={{
                    marginRight: "8px",
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                  }}
                />
                <label
                  htmlFor="important"
                  style={{
                    cursor: "pointer",
                    fontWeight: "bold",
                    color: COLORS.danger,
                  }}
                >
                  중요 공지 (필독) 설정
                </label>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>제목</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="공지 제목을 입력하세요"
                  value={newNotice.title}
                  onChange={(e) =>
                    setNewNotice({ ...newNotice, title: e.target.value })
                  }
                />
              </div>
              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>작성자</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={newNotice.writer}
                    onChange={(e) =>
                      setNewNotice({ ...newNotice, writer: e.target.value })
                    }
                  />
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>내용</label>
                <textarea
                  rows="5"
                  style={styles.textarea}
                  placeholder="공지 내용을 입력하세요..."
                  value={newNotice.content}
                  onChange={(e) =>
                    setNewNotice({ ...newNotice, content: e.target.value })
                  }
                ></textarea>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={styles.cancelBtn}
              >
                취소
              </button>
              <button onClick={handleSave} style={styles.saveBtn}>
                <FaCheck style={{ marginRight: "5px" }} /> 등록하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상세 보기 모달 */}
      {isDetailOpen && selectedNotice && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "90%",
                }}
              >
                {selectedNotice.important && (
                  <span style={styles.badgeImportant}>필독</span>
                )}
                {/* 제목이 너무 길면 잘리게 처리 */}
                <h3
                  style={{
                    margin: 0,
                    color: "#333",
                    fontSize: "18px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {selectedNotice.title}
                </h3>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                style={styles.closeBtn}
              >
                <FaTimes />
              </button>
            </div>

            {/* 메타 정보 (작성자, 날짜, 조회수) */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 15px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                fontSize: "13px",
                color: "#666",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", gap: "15px" }}>
                <span
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <FaUser size={12} /> {selectedNotice.writer}
                </span>
                <span
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <FaCalendarAlt size={12} /> {selectedNotice.date}
                </span>
              </div>
              <span
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <FaEye size={12} /> {selectedNotice.views}
              </span>
            </div>

            {/* 본문 내용 */}
            <div
              style={{
                minHeight: "250px",
                padding: "15px",
                lineHeight: "1.6",
                color: "#333",
                fontSize: "15px",
                whiteSpace: "pre-wrap",
                border: `1px solid ${COLORS.border}`,
                borderRadius: "8px",
                overflowY: "auto",
                maxHeight: "400px",
              }}
            >
              {selectedNotice.content}
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => setIsDetailOpen(false)}
                style={styles.saveBtn}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 테이블 행 컴포넌트 ---
const NoticeRow = ({ item, onTitleClick }) => {
  const [hover, setHover] = useState(false);
  const isImportant = item.important;

  return (
    <tr
      style={{
        ...styles.tbodyTr,
        backgroundColor: hover ? "#F8F9FA" : "white",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <td style={{ ...styles.td, color: COLORS.subText }}>{item.id}</td>
      <td style={{ ...styles.td, textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isImportant && <span style={styles.badgeImportant}>필독</span>}
          {/* 제목 클릭 시 상세 보기 함수 실행 */}
          <span
            onClick={onTitleClick}
            style={{
              color: COLORS.text,
              fontWeight: isImportant ? "bold" : "normal",
              cursor: "pointer",
              textDecoration: hover ? "underline" : "none",
            }}
          >
            {item.title}
          </span>
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
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
    overflow: "hidden",
    paddingBottom: "20px",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
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
  td: { textAlign: "center", padding: "0 15px" },
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
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  // 모달 크기 살짝 키움 (상세 보기 편하게)
  modal: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    width: "600px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: "15px",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#999",
  },
  modalBody: { display: "flex", flexDirection: "column", gap: "15px" },
  formGroup: { display: "flex", flexDirection: "column", flex: 1 },
  label: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "5px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    fontSize: "14px",
  },
  textarea: {
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    fontSize: "14px",
    resize: "none",
  },
  row: { display: "flex", gap: "15px" },
  modalFooter: {
    marginTop: "25px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    paddingTop: "20px",
    borderTop: `1px solid ${COLORS.border}`,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#f0f0f0",
    color: "#333",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
};

export default Notice;
