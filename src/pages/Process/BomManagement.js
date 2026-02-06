import React, { useState, useEffect } from "react";
import {
  FaBox,
  FaChevronRight,
  FaHistory,
  FaPrint,
  FaFileExcel,
  FaTrashAlt,
  FaEdit,
} from "react-icons/fa";
import { getProductList, getKitDetail, deleteBom } from "../../api/bomApi";
import BomDetailCard from "../../components/BOM/BomDetailCard";
import BomModal from "../../components/BOM/BomModal";
import BomHistoryModal from "../../components/BOM/BomHistoryModal";

const COLORS = {
  primary: "#8C85FF",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  text: "#333",
  border: "#E0E0E0",
  danger: "#FF4444",
};

const BomManagement = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [kitData, setKitData] = useState(null);

  // [신규] 현재 선택된 키트 탭 (0: 전면, 1: 후면)
  const [activeKitIndex, setActiveKitIndex] = useState(0);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProductList();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectProduct = async (prod) => {
    setSelectedProduct(prod);
    setActiveKitIndex(0); // 제품 바뀌면 첫 번째 키트로 초기화
    refreshDetail(prod.id);
  };

  const refreshDetail = async (prodId) => {
    try {
      const data = await getKitDetail(prodId);
      setKitData(data);
    } catch (e) {
      setKitData(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    if (
      !window.confirm(
        `[${selectedProduct.name}]의 모든 BOM 정보를 삭제하시겠습니까?`,
      )
    )
      return;
    try {
      await deleteBom(selectedProduct.id);
      alert("삭제되었습니다.");
      refreshDetail(selectedProduct.id);
    } catch (e) {
      alert("삭제 실패: 생산 이력이 존재할 수 있습니다.");
    }
  };

  // 현재 보고 있는 키트 데이터 추출
  const activeKit = kitData?.kits?.[activeKitIndex];

  return (
    <div style={styles.container}>
      {/* 1. Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🧩 BOM 관리 (Kitting)</h2>
          <p style={styles.subtitle}>
            제품별 생산 키트(전면/후면) 및 자재 구성 관리
          </p>
        </div>
        <div style={styles.actions}>
          {selectedProduct && kitData && (
            <>
              <button style={styles.btn} onClick={() => setIsHistoryOpen(true)}>
                <FaHistory /> 이력
              </button>
              <button
                style={styles.btn}
                onClick={() => alert("출력 기능 준비중")}
              >
                <FaPrint /> 출력
              </button>
              <button
                style={styles.btn}
                onClick={() => alert("엑셀 다운로드 준비중")}
              >
                <FaFileExcel /> 엑셀
              </button>

              <div style={styles.divider}></div>

              <button style={styles.deleteBtn} onClick={handleDelete}>
                <FaTrashAlt /> 삭제
              </button>
              {/* 현재 탭에 해당하는 키트 수정 버튼 */}
              <button
                style={styles.primaryBtn}
                onClick={() => setIsModalOpen(true)}
              >
                <FaEdit />{" "}
                {activeKit ? `${activeKit.kitName} 수정` : "BOM 등록"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Content */}
      <div style={styles.content}>
        {/* Left: Product Tree */}
        <div style={styles.leftPanel}>
          <div style={styles.panelHeader}>📦 제품 목록</div>
          <div style={styles.listContainer}>
            {products.map((p) => (
              <div
                key={p.id}
                style={{
                  ...styles.listItem,
                  backgroundColor:
                    selectedProduct?.id === p.id
                      ? `${COLORS.primary}15`
                      : "transparent",
                  borderLeft:
                    selectedProduct?.id === p.id
                      ? `3px solid ${COLORS.primary}`
                      : "3px solid transparent",
                }}
                onClick={() => handleSelectProduct(p)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    {p.code}
                  </div>
                </div>
                <FaChevronRight
                  color={COLORS.primary}
                  size={12}
                  style={{ opacity: selectedProduct?.id === p.id ? 1 : 0 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Detail Card */}
        <div style={styles.rightPanel}>
          {selectedProduct && kitData ? (
            <BomDetailCard
              data={kitData}
              activeIndex={activeKitIndex}
              onTabChange={setActiveKitIndex}
            />
          ) : (
            <div style={styles.emptyState}>
              <FaBox size={50} color="#E0E0E0" />
              <p>좌측 목록에서 제품을 선택해주세요.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && selectedProduct && activeKit && (
        <BomModal
          product={selectedProduct}
          targetKit={activeKit} // 현재 탭의 키트 정보 전달
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setIsModalOpen(false);
            refreshDetail(selectedProduct.id);
          }}
        />
      )}
      {isHistoryOpen && selectedProduct && (
        <BomHistoryModal
          productId={selectedProduct.id}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    padding: "20px",
    backgroundColor: COLORS.bg,
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: { margin: 0, fontSize: "22px", fontWeight: "800", color: "#333" },
  subtitle: { margin: "5px 0 0", fontSize: "14px", color: "#888" },
  actions: { display: "flex", gap: "8px", alignItems: "center" },
  content: { display: "flex", gap: "20px", flex: 1, overflow: "hidden" },
  leftPanel: {
    width: "280px",
    minWidth: "280px",
    backgroundColor: "white",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
  },
  rightPanel: { flex: 1, overflow: "hidden" },
  panelHeader: {
    padding: "20px",
    borderBottom: `1px solid ${COLORS.border}`,
    fontWeight: "bold",
    fontSize: "15px",
    color: "#333",
  },
  listContainer: { flex: 1, overflowY: "auto", padding: "10px" },
  listItem: {
    padding: "12px 15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    marginBottom: "2px",
    transition: "0.2s",
  },
  emptyState: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#999",
    fontSize: "15px",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
  },
  btn: {
    padding: "8px 14px",
    border: `1px solid ${COLORS.border}`,
    background: "white",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#555",
  },
  primaryBtn: {
    padding: "8px 16px",
    border: "none",
    background: COLORS.primary,
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "bold",
    boxShadow: "0 4px 6px rgba(140, 133, 255, 0.2)",
  },
  deleteBtn: {
    padding: "8px 14px",
    border: `1px solid ${COLORS.danger}`,
    background: "white",
    color: COLORS.danger,
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "bold",
  },
  divider: {
    width: "1px",
    height: "20px",
    backgroundColor: "#ddd",
    margin: "0 5px",
  },
};

export default BomManagement;
