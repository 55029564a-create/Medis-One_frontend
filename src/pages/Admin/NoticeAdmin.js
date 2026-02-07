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
  FaUser,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
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
  edit: "#4CAF50",
};

const NoticeAdmin = () => {
  const [notices, setNotices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [newNotice, setNewNotice] = useState({
    title: "",
    writer: "관리자",
    content: "",
    important: false,
  });

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // 1. 목록 조회
  const fetchNotices = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8111/api/support/notices",
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        },
      );
      if (response.ok) {
        const data = await response.json();
        const sortedData = data.sort((a, b) => {
          if (a.important === b.important) return b.id - a.id;
          return a.important ? -1 : 1;
        });
        setNotices(sortedData);
      }
    } catch (error) {
      console.error("API 에러:", error);
    }
  };

  // ✅ [자동 동기화 적용] 30초마다 목록 갱신
  useEffect(() => {
    fetchNotices(); // 최초 실행

    const interval = setInterval(() => {
      fetchNotices();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // 상세 조회
  const handleNoticeClick = async (id) => {
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8111/api/support/notices/${id}`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setSelectedNotice(data);
        setIsDetailOpen(true);
        fetchNotices();
      }
    } catch (error) {
      console.error("상세 조회 에러:", error);
    }
  };

  // 저장 (등록 + 수정 통합)
  const handleSave = async () => {
    if (!newNotice.title || !newNotice.content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      let url = "http://localhost:8111/api/support/notices";
      let method = "POST";

      if (isEditMode && editingId) {
        url = `http://localhost:8111/api/support/notices/${editingId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(newNotice),
      });

      if (response.ok) {
        alert(isEditMode ? "수정되었습니다." : "등록되었습니다.");
        closeModal();
        fetchNotices();
      } else {
        alert("저장 실패");
      }
    } catch (error) {
      console.error("저장 중 에러", error);
    }
  };

  // 삭제 기능
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("정말 이 공지사항을 삭제하시겠습니까?")) return;

    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8111/api/support/notices/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        },
      );

      if (response.ok) {
        alert("삭제되었습니다.");
        fetchNotices();
      } else {
        alert("삭제 실패");
      }
    } catch (error) {
      console.error("삭제 중 에러", error);
    }
  };

  const openEditModal = (item, e) => {
    e.stopPropagation();
    setIsEditMode(true);
    setEditingId(item.id);
    setNewNotice({
      title: item.title,
      writer: item.writer,
      content: item.content,
      important: item.important,
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setNewNotice({
      title: "",
      writer: "관리자",
      content: "",
      important: false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const filteredNotices = notices.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.writer.toLowerCase().includes(searchLower)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotices = filteredNotices.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaBullhorn size={24} color={COLORS.primary} />
          <h2 style={styles.pageTitle}>공지사항 관리 (Admin)</h2>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={styles.searchBox}>
            <FaSearch color="#aaa" />
            <input
              type="text"
              placeholder="제목, 작성자 검색"
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button style={styles.writeButton} onClick={openCreateModal}>
            <FaPen size={12} /> 글쓰기
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadTr}>
              <th style={{ ...styles.th, width: "60px" }}>No</th>
              <th style={{ ...styles.th, width: "auto" }}>제목</th>
              <th style={{ ...styles.th, width: "100px" }}>작성자</th>
              <th style={{ ...styles.th, width: "120px" }}>작성일</th>
              <th style={{ ...styles.th, width: "80px" }}>조회</th>
              <th style={{ ...styles.th, width: "100px" }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {currentNotices.map((item) => (
              <NoticeRow
                key={item.id}
                item={item}
                onTitleClick={() => handleNoticeClick(item.id)}
                onEdit={(e) => openEditModal(item, e)}
                onDelete={(e) => handleDelete(item.id, e)}
              />
            ))}
            {filteredNotices.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#888",
                  }}
                >
                  {searchTerm
                    ? "검색 결과가 없습니다."
                    : "등록된 공지사항이 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredNotices.length > 0 && (
          <div style={styles.pagination}>
            <button
              style={styles.pageBtn}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <FaChevronLeft size={10} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  style={
                    currentPage === number
                      ? { ...styles.pageBtn, ...styles.activePageBtn }
                      : styles.pageBtn
                  }
                  onClick={() => setCurrentPage(number)}
                >
                  {number}
                </button>
              ),
            )}
            <button
              style={styles.pageBtn}
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <FaChevronRight size={10} />
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>{isEditMode ? "✏️ 공지사항 수정" : "📝 공지사항 작성"}</h3>
              <button onClick={closeModal} style={styles.closeBtn}>
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
                  placeholder="제목 입력"
                  value={newNotice.title}
                  onChange={(e) =>
                    setNewNotice({ ...newNotice, title: e.target.value })
                  }
                />
              </div>
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
              <div style={styles.formGroup}>
                <label style={styles.label}>내용</label>
                <textarea
                  rows="5"
                  style={styles.textarea}
                  placeholder="내용 입력..."
                  value={newNotice.content}
                  onChange={(e) =>
                    setNewNotice({ ...newNotice, content: e.target.value })
                  }
                ></textarea>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={closeModal} style={styles.cancelBtn}>
                취소
              </button>
              <button onClick={handleSave} style={styles.saveBtn}>
                <FaCheck style={{ marginRight: "5px" }} />
                {isEditMode ? "수정완료" : "등록하기"}
              </button>
            </div>
          </div>
        </div>
      )}

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

const NoticeRow = ({ item, onTitleClick, onEdit, onDelete }) => {
  const [hover, setHover] = useState(false);
  const isImportant = item.important;
  return (
    <tr
      style={{
        ...styles.tbodyTr,
        backgroundColor: hover ? "#F8F9FA" : "white",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onTitleClick}
    >
      <td style={{ ...styles.td, color: COLORS.subText }}>{item.id}</td>
      <td style={{ ...styles.td, textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isImportant && <span style={styles.badgeImportant}>필독</span>}
          <span
            style={{
              color: COLORS.text,
              fontWeight: isImportant ? "bold" : "normal",
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
      <td style={styles.td}>
        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          <button onClick={onEdit} style={styles.iconBtnEdit} title="수정">
            <FaEdit />
          </button>
          <button onClick={onDelete} style={styles.iconBtnDelete} title="삭제">
            <FaTrash />
          </button>
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
  iconBtnEdit: {
    border: "none",
    background: "transparent",
    color: "#999",
    cursor: "pointer",
    fontSize: "16px",
    padding: "5px",
    transition: "color 0.2s",
  },
  iconBtnDelete: {
    border: "none",
    background: "transparent",
    color: "#999",
    cursor: "pointer",
    fontSize: "16px",
    padding: "5px",
    transition: "color 0.2s",
  },
};

export default NoticeAdmin;
