import React, { useState, useEffect } from "react";
import { getReverseBom } from "../../api/bomApi";

const ReverseBomModal = ({ materialId, onClose }) => {
  const [list, setList] = useState([]);

  useEffect(() => {
    getReverseBom(materialId).then(setList).catch(console.error);
  }, [materialId]);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>🔗 역 BOM 조회</h3>
        <p style={{ color: "#666", fontSize: "13px" }}>
          해당 자재가 사용되는 제품 목록입니다.
        </p>
        <ul style={{ paddingLeft: "20px", lineHeight: "1.8" }}>
          {list.length > 0 ? (
            list.map((item, i) => <li key={i}>{item}</li>)
          ) : (
            <li>사용되는 제품이 없습니다.</li>
          )}
        </ul>
        <button onClick={onClose} style={styles.btn}>
          닫기
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1100,
  },
  modal: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "400px",
  },
  btn: {
    width: "100%",
    padding: "10px",
    marginTop: "20px",
    background: "#f5f5f5",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default ReverseBomModal;
