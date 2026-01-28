import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaThermometerHalf,
  FaWind,
  FaBolt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaStopCircle,
  FaPlayCircle,
  FaTools,
  FaHistory,
  FaMicroscope,
  FaLayerGroup,
  FaCompressArrowsAlt,
} from "react-icons/fa";
import { MdCleaningServices, MdOutlineViewInAr } from "react-icons/md";

// 🎨 MedisOne Soft Theme
const COLORS = {
  primary: "#8C85FF",
  success: "#00C851",
  warning: "#FFBB33",
  danger: "#FF4444",
  stop: "#9E9E9E",
  bg: "#F5F6FA",
  text: "#333",
  subText: "#888",
  cardBg: "#FFF",
  border: "#E0E0E0",
};

const EquipmentList = () => {
  const navigate = useNavigate();

  // 🏭 [한글화 완료] 디스플레이 공정 설비 데이터
  const machines = [
    {
      id: "EQ-10",
      process: "전처리 공정", // Pre-Process
      name: "플라즈마 세정기 #01", // Plasma Cleaner
      type: "CLEANER",
      status: "RUN",
      metrics: [
        { label: "가스 유량", value: "50 sccm", icon: <FaWind /> },
        { label: "RF 파워", value: "2.5 kW", icon: <FaBolt /> },
      ],
      operator: "김세정",
      uptime: "08:12",
    },
    {
      id: "EQ-20",
      process: "메인 공정", // Main Process
      name: "광학 본딩기 A호기", // Optical Bonder
      type: "BONDER",
      status: "RUN",
      metrics: [
        { label: "진공도", value: "-98 kPa", icon: <FaWind /> },
        { label: "갭(Gap) 두께", value: "0.15 mm", icon: <FaLayerGroup /> },
      ],
      operator: "이민호",
      uptime: "04:30",
    },
    {
      id: "EQ-30",
      process: "후처리 공정", // Post Process
      name: "오토클레이브 (탈포)", // Autoclave
      type: "AUTOCLAVE",
      status: "RUN",
      metrics: [
        { label: "가압력", value: "5.0 bar", icon: <FaCompressArrowsAlt /> },
        { label: "챔버 온도", value: "60°C", icon: <FaThermometerHalf /> },
      ],
      operator: "박지성",
      uptime: "12:00",
    },
    {
      id: "EQ-40",
      process: "신뢰성 테스트", // Reliability
      name: "에이징 챔버 #1", // Aging Chamber
      type: "AGING",
      status: "ERROR",
      metrics: [
        { label: "내부 온도", value: "45°C", icon: <FaThermometerHalf /> },
        { label: "진행 시간", value: "2시간 10분", icon: <FaHistory /> },
      ],
      operator: "시스템",
      uptime: "02:10",
    },
    {
      id: "EQ-50",
      process: "신뢰성 테스트",
      name: "에이징 챔버 #2",
      type: "AGING",
      status: "RUN",
      metrics: [
        { label: "내부 온도", value: "45°C", icon: <FaThermometerHalf /> },
        { label: "진행 시간", value: "4시간 00분", icon: <FaHistory /> },
      ],
      operator: "시스템",
      uptime: "04:00",
    },
    {
      id: "EQ-60",
      process: "최종 검사", // Final Insp
      name: "비전 외관 검사기", // Vision Inspector
      type: "VISION",
      status: "STOP",
      metrics: [
        { label: "수율 (Yield)", value: "99.5%", icon: <FaCheckCircle /> },
        {
          label: "금일 검사량",
          value: "1,200 EA",
          icon: <MdOutlineViewInAr />,
        },
      ],
      operator: "최유나",
      uptime: "00:00",
    },
  ];

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <div style={styles.titleIcon}>
            <FaLayerGroup size={22} color="#fff" />
          </div>
          <div>
            <h2 style={styles.pageTitle}>라인 설비 모니터링</h2>
            <p style={styles.subTitle}>Module Assembly Line A-01 실시간 현황</p>
          </div>
        </div>
        <div style={styles.legend}>
          <StatusLegend color={COLORS.success} label="가동중" />
          <StatusLegend color={COLORS.danger} label="점검필요" />
          <StatusLegend color={COLORS.stop} label="비가동" />
        </div>
      </div>

      {/* 설비 카드 그리드 */}
      <div style={styles.grid}>
        {machines.map((machine) => (
          <EquipmentCard
            key={machine.id}
            data={machine}
            onClick={() => navigate(`/equipment/detail/${machine.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

// --- 컴포넌트: 설비 카드 ---
const EquipmentCard = ({ data, onClick }) => {
  const getStatusColor = (s) => {
    if (s === "RUN") return COLORS.success;
    if (s === "ERROR") return COLORS.danger;
    return COLORS.stop;
  };
  const statusColor = getStatusColor(data.status);

  // 상태 한글 변환
  const getStatusText = (s) => {
    if (s === "RUN") return "가동중";
    if (s === "ERROR") return "점검필요";
    return "비가동";
  };

  const getIcon = (type) => {
    switch (type) {
      case "CLEANER":
        return <MdCleaningServices />;
      case "BONDER":
        return <FaLayerGroup />;
      case "AUTOCLAVE":
        return <FaCompressArrowsAlt />;
      case "AGING":
        return <FaHistory />;
      case "VISION":
        return <FaMicroscope />;
      default:
        return <FaTools />;
    }
  };

  return (
    <div
      style={{ ...styles.card, borderTop: `4px solid ${statusColor}` }}
      onClick={onClick}
    >
      <div style={styles.cardHeader}>
        <span style={styles.processBadge}>{data.process}</span>
        {/* 상태 아이콘 + 텍스트 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontWeight: "bold",
            fontSize: "12px",
            color: statusColor,
          }}
        >
          {data.status === "RUN" && <FaPlayCircle size={14} />}
          {data.status === "ERROR" && <FaExclamationTriangle size={14} />}
          {data.status === "STOP" && <FaStopCircle size={14} />}
          {getStatusText(data.status)}
        </div>
      </div>

      <div style={styles.nameSection}>
        <div
          style={{
            ...styles.iconBox,
            backgroundColor: `${COLORS.primary}15`,
            color: COLORS.primary,
          }}
        >
          {getIcon(data.type)}
        </div>
        <div>
          <h3 style={styles.machineName}>{data.name}</h3>
          <span style={styles.machineId}>{data.id}</span>
        </div>
      </div>

      <div style={styles.metricGrid}>
        {data.metrics.map((m, i) => (
          <div key={i} style={styles.metricItem}>
            <span style={styles.metricLabel}>
              {m.icon} {m.label}
            </span>
            <span style={styles.metricValue}>{m.value}</span>
          </div>
        ))}
      </div>

      <div style={styles.cardFooter}>
        <div style={styles.footerItem}>
          <span style={styles.footerLabel}>담당자</span>
          <span style={styles.footerValue}>{data.operator}</span>
        </div>
        <div style={{ ...styles.footerItem, textAlign: "right" }}>
          <span style={styles.footerLabel}>가동 시간</span>
          <span style={styles.footerValue}>{data.uptime}</span>
        </div>
      </div>
    </div>
  );
};

// --- 컴포넌트: 범례 ---
const StatusLegend = ({ color, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
    <div
      style={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        backgroundColor: color,
      }}
    ></div>
    <span
      style={{ fontSize: "12px", color: COLORS.subText, fontWeight: "600" }}
    >
      {label}
    </span>
  </div>
);

// --- 스타일 정의 ---
const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "30px",
  },
  titleGroup: { display: "flex", alignItems: "center", gap: "12px" },
  titleIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    backgroundColor: COLORS.primary,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(140,133,255,0.4)",
  },
  pageTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: COLORS.text,
    margin: 0,
  },
  subTitle: { fontSize: "13px", color: COLORS.subText, marginTop: "2px" },
  legend: {
    display: "flex",
    gap: "15px",
    backgroundColor: "white",
    padding: "8px 16px",
    borderRadius: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },

  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    ":hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    },
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  processBadge: {
    fontSize: "11px",
    fontWeight: "700",
    color: COLORS.subText,
    backgroundColor: "#F5F5F5",
    padding: "4px 8px",
    borderRadius: "6px",
  },

  nameSection: { display: "flex", alignItems: "center", gap: "12px" },
  iconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  machineName: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: COLORS.text,
  },
  machineId: { fontSize: "12px", color: COLORS.subText },

  metricGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    backgroundColor: "#F8F9FA",
    padding: "12px",
    borderRadius: "10px",
  },
  metricItem: { display: "flex", flexDirection: "column", gap: "2px" },
  metricLabel: {
    fontSize: "11px",
    color: COLORS.subText,
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  metricValue: { fontSize: "14px", fontWeight: "700", color: COLORS.text },

  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: "12px",
    marginTop: "auto",
  },
  footerItem: { display: "flex", flexDirection: "column" },
  footerLabel: { fontSize: "10px", color: COLORS.subText, marginBottom: "2px" },
  footerValue: { fontSize: "12px", fontWeight: "600", color: COLORS.text },
};

export default EquipmentList;
