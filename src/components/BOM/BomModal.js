import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaTrash, FaSearch } from "react-icons/fa";
import { saveBom, getAllMaterials } from "../../api/bomApi";

const BomModal = ({ product, targetKit, onClose, onSave }) => {
  // targetKit 정보를 기반으로 초기값 설정
  const [kitName, setKitName] = useState(targetKit?.kitName || "");
  const [reason, setReason] = useState("");
  const [addedItems, setAddedItems] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (targetKit?.materials) {
      setAddedItems(
        targetKit.materials.map((m) => ({
          materialId: m.materialId,
          code: m.code,
          name: m.name,
          qty: m.qty,
        })),
      );
    }
    getAllMaterials().then(setAllMaterials).catch(console.error);
  }, [targetKit]);

  const handleAddItem = (mat) => {
    if (addedItems.find((item) => item.materialId === mat.id))
      return alert("이미 추가된 자재입니다.");
    setAddedItems([
      ...addedItems,
      { materialId: mat.id, code: mat.code, name: mat.name, qty: 1 },
    ]);
  };

  const handleRemoveItem = (id) => {
    setAddedItems(addedItems.filter((item) => item.materialId !== id));
  };

  const handleChangeQty = (id, val) => {
    setAddedItems(
      addedItems.map((item) =>
        item.materialId === id ? { ...item, qty: parseInt(val) || 0 } : item,
      ),
    );
  };

  const handleSave = async () => {
    if (!kitName) return alert("키트명을 입력해주세요.");
    if (!reason) return alert("변경 사유를 입력해주세요.");
    if (addedItems.length === 0)
      return alert("최소 1개 이상의 자재를 추가해주세요.");

    try {
      await saveBom({
        productId: product.id,
        kitName: kitName, // 키트 이름으로 백엔드에서 식별함
        description: reason,
        items: addedItems.map((i) => ({
          materialId: i.materialId,
          quantity: i.qty,
        })),
      });
      alert("저장되었습니다.");
      onSave();
    } catch (e) {
      alert("저장 실패: " + e.message);
    }
  };

  const filteredMaterials = allMaterials.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>BOM 구성 - {targetKit.kitName}</h3>
          <button onClick={onClose} style={styles.closeBtn}>
            <FaTimes />
          </button>
        </div>

        <div style={styles.body}>
          <div style={styles.section}>
            <label style={styles.label}>키트 명칭 (자동 지정)</label>
            <input
              style={{ ...styles.input, background: "#f5f5f5" }}
              value={kitName}
              readOnly
            />

            <label style={styles.label}>변경 사유</label>
            <input
              style={styles.input}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="예: 설계 변경으로 인한 자재 조정"
            />
          </div>

          <div style={styles.row}>
            <div style={styles.col}>
              <div style={styles.subHeader}>🔍 자재 검색</div>
              <input
                style={styles.searchInput}
                placeholder="자재명/코드 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div style={styles.list}>
                {filteredMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    style={styles.listItem}
                    onClick={() => handleAddItem(mat)}
                  >
                    <div style={{ fontWeight: "bold" }}>{mat.name}</div>
                    <div style={{ fontSize: "11px", color: "#888" }}>
                      {mat.code}
                    </div>
                    <FaPlus style={{ marginLeft: "auto", color: "#8C85FF" }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.col}>
              <div style={styles.subHeader}>
                📋 구성 목록 ({addedItems.length})
              </div>
              <div style={{ ...styles.list, background: "#F9F9F9" }}>
                {addedItems.map((item) => (
                  <div key={item.materialId} style={styles.addedItem}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px" }}>{item.name}</div>
                      <div style={{ fontSize: "11px", color: "#888" }}>
                        {item.code}
                      </div>
                    </div>
                    <input
                      type="number"
                      style={styles.qtyInput}
                      value={item.qty}
                      onChange={(e) =>
                        handleChangeQty(item.materialId, e.target.value)
                      }
                    />
                    <button
                      onClick={() => handleRemoveItem(item.materialId)}
                      style={styles.delBtn}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.btn}>
            취소
          </button>
          <button onClick={handleSave} style={styles.primaryBtn}>
            저장
          </button>
        </div>
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
    zIndex: 1000,
  },
  modal: {
    background: "white",
    borderRadius: "12px",
    width: "800px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  header: {
    padding: "20px",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#999",
  },
  body: { padding: "20px", overflowY: "auto", flex: 1 },
  section: {
    marginBottom: "20px",
    paddingBottom: "20px",
    borderBottom: "1px solid #eee",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#555",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    boxSizing: "border-box",
  },
  row: { display: "flex", gap: "20px", height: "400px" },
  col: { flex: 1, display: "flex", flexDirection: "column" },
  subHeader: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#333",
  },
  searchInput: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    boxSizing: "border-box",
  },
  list: {
    flex: 1,
    border: "1px solid #eee",
    borderRadius: "8px",
    overflowY: "auto",
    padding: "5px",
  },
  listItem: {
    padding: "10px",
    borderBottom: "1px solid #f5f5f5",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  addedItem: {
    padding: "10px",
    background: "white",
    marginBottom: "5px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  qtyInput: {
    width: "60px",
    padding: "5px",
    textAlign: "right",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  delBtn: {
    background: "none",
    border: "none",
    color: "#FF4444",
    cursor: "pointer",
  },
  footer: {
    padding: "20px",
    borderTop: "1px solid #eee",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  btn: {
    padding: "10px 20px",
    border: "1px solid #ddd",
    background: "white",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  primaryBtn: {
    padding: "10px 20px",
    border: "none",
    background: "#8C85FF",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default BomModal;
