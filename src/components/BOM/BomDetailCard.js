import React, { useState } from "react";
import {
  FaSearch,
  FaCube,
  FaLayerGroup,
  FaList,
  FaBoxOpen,
} from "react-icons/fa";
import ReverseBomModal from "../../components/BOM/ReverseBomModal";

// activeIndex와 onTabChange를 props로 받음
const BomDetailCard = ({ data, activeIndex, onTabChange }) => {
  const [reverseId, setReverseId] = useState(null);

  // 현재 활성화된 키트 데이터
  const activeKit =
    data.kits && data.kits.length > 0 ? data.kits[activeIndex] : null;

  return (
    <div style={styles.wrapper}>
      {/* 1. 제품 정보 (Top) */}
      <div style={styles.topCard}>
        <div style={styles.iconBox}>
          <FaCube size={20} color="#555" />
        </div>
        <div>
          <div style={styles.label}>PRODUCT</div>
          <div style={styles.value}>{data.productName}</div>
          <div style={styles.subValue}>{data.productCode}</div>
        </div>
      </div>

      {/* 2. 키트 선택 (Middle) */}
      <div style={styles.midCard}>
        <div style={styles.tabHeader}>
          {data.kits.map((kit, idx) => (
            <button
              key={kit.kitId}
              style={idx === activeIndex ? styles.activeTab : styles.tab}
              onClick={() => onTabChange(idx)}
            >
              <FaBoxOpen style={{ marginRight: "6px" }} /> {kit.kitName}
            </button>
          ))}
        </div>

        {activeKit && (
          <div style={styles.kitInfo}>
            <div style={styles.infoItem}>
              <span style={styles.label}>키트 코드</span>
              <span style={styles.infoValue}>{activeKit.kitCode}</span>
            </div>
            <div style={styles.divider}></div>
            <div style={styles.infoItem}>
              <span style={styles.label}>키트 재고</span>
              <span style={{ ...styles.infoValue, color: "#2196F3" }}>
                {activeKit.currentStock} Set
              </span>
            </div>
            <div style={styles.divider}></div>
            <div style={styles.infoItem}>
              <span style={styles.label}>단위 소요량</span>
              <span style={styles.infoValue}>
                {activeKit.requiredQty} Set / Unit
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. 자재 리스트 (Bottom) */}
      <div style={styles.botCard}>
        <div style={styles.tableHeader}>
          <FaList style={{ marginRight: "8px", color: "#888" }} />
          {activeKit ? `${activeKit.kitName} 구성 자재` : "자재 상세"}
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th>자재코드</th>
                <th>자재명</th>
                <th>유형</th>
                {/* 현재고 컬럼 삭제됨 (요청사항 반영) */}
                <th style={{ textAlign: "right" }}>구성 수량</th>
                <th style={{ textAlign: "center" }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {!activeKit || activeKit.materials.length === 0 ? (
                <tr>
                  <td colSpan="5" style={styles.emptyRow}>
                    등록된 자재가 없습니다.
                  </td>
                </tr>
              ) : (
                activeKit.materials.map((m) => (
                  <tr key={m.bomId} style={styles.tbodyRow}>
                    <td>{m.code}</td>
                    <td style={{ fontWeight: "600" }}>{m.name}</td>
                    <td>
                      <span style={styles.typeBadge}>{m.type}</span>
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        color: "#8C85FF",
                        fontWeight: "bold",
                      }}
                    >
                      {m.qty} EA
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        style={styles.actionBtn}
                        onClick={() => setReverseId(m.materialId)}
                      >
                        <FaSearch /> 역BOM
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reverseId && (
        <ReverseBomModal
          materialId={reverseId}
          onClose={() => setReverseId(null)}
        />
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    gap: "15px",
  },
  topCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  midCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  botCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    overflow: "hidden",
  },

  iconBox: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    backgroundColor: "#F5F5F5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: "11px",
    fontWeight: "bold",
    color: "#999",
    marginBottom: "2px",
  },
  value: { fontSize: "16px", fontWeight: "bold", color: "#333" },
  subValue: { fontSize: "13px", color: "#888" },

  tabHeader: {
    display: "flex",
    gap: "10px",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  tab: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "1px solid #ddd",
    background: "white",
    color: "#555",
    cursor: "pointer",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
  },
  activeTab: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "none",
    background: "#8C85FF",
    color: "white",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 2px 5px rgba(140,133,255,0.3)",
  },

  kitInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    padding: "0 10px",
  },
  infoItem: { display: "flex", flexDirection: "column", alignItems: "center" },
  infoValue: { fontSize: "14px", fontWeight: "bold", color: "#333" },
  divider: { width: "1px", height: "30px", backgroundColor: "#eee" },

  tableHeader: {
    padding: "15px 20px",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#555",
    display: "flex",
    alignItems: "center",
  },
  tableWrapper: { flex: 1, overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  theadRow: {
    backgroundColor: "#FAFAFA",
    borderBottom: "1px solid #eee",
    height: "40px",
    color: "#666",
    textAlign: "left",
  },
  tbodyRow: { borderBottom: "1px solid #f5f5f5", height: "45px" },
  emptyRow: { textAlign: "center", padding: "40px", color: "#999" },
  typeBadge: {
    fontSize: "11px",
    backgroundColor: "#F0F0F0",
    padding: "3px 6px",
    borderRadius: "4px",
    color: "#666",
  },
  actionBtn: {
    padding: "4px 8px",
    fontSize: "11px",
    border: "1px solid #ddd",
    background: "white",
    borderRadius: "4px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
};

export default BomDetailCard;
