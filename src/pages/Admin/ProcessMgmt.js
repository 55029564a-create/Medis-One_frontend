import React, { useState } from "react";
// 아이콘 라이브러리
import {
  FaUsers,
  FaClock,
  FaChartLine,
  FaExclamationTriangle,
  FaUserCircle,
  FaCog,
  FaEdit,
} from "react-icons/fa";

import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import { Colors, CommonStyles } from "../../styles/GlobalStyle";

// 대시보드 스타일 정의
const DashboardStyles = {
  card: {
    backgroundColor: "#fff",
    borderRadius: "15px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    border: "none",
    marginBottom: "20px", // 카드 간 간격 추가
  },
  kpiIconBox: (color) => ({
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    backgroundColor: `${color}20`,
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    marginBottom: "10px",
  }),
  timeBlock: (status) => ({
    flex: 1,
    height: "30px",
    backgroundColor:
      status === "RUN"
        ? Colors.success
        : status === "STOP"
          ? Colors.secondary
          : status === "ERR"
            ? Colors.danger
            : "#eee",
    margin: "0 1px",
    borderRadius: "2px",
    position: "relative",
    cursor: "pointer",
  }),
};

const ProductionManagement = () => {
  // ==============================
  // 1. 공정 모니터링 데이터 (ProductionRate)
  // ==============================
  const [lines, setLines] = useState([
    {
      id: "Line-A",
      product: "27인치 패널",
      worker: "김철수 (PL)",
      personnel: 4,
      target: 1000,
      current: 950,
      startTime: "08:30",
      workTime: "7h 30m",
      status: "RUN",
      timeline: ["RUN", "RUN", "RUN", "STOP", "RUN", "RUN", "RUN", "RUN"],
    },
    {
      id: "Line-B",
      product: "메인보드",
      worker: "이영희",
      personnel: 3,
      target: 2000,
      current: 1200,
      startTime: "09:00",
      workTime: "6h 00m",
      status: "RUN",
      timeline: ["RUN", "RUN", "STOP", "STOP", "RUN", "RUN", "RUN", "RUN"],
    },
    {
      id: "Line-C",
      product: "케이스",
      worker: "박민수",
      personnel: 2,
      target: 500,
      current: 500,
      startTime: "09:00",
      workTime: "4h 00m",
      status: "STOP",
      timeline: ["RUN", "RUN", "RUN", "RUN", "STOP", "STOP", "STOP", "STOP"],
    },
    {
      id: "Line-D",
      product: "전원부",
      worker: "최지훈",
      personnel: 3,
      target: 1500,
      current: 400,
      startTime: "08:30",
      workTime: "3h 20m",
      status: "ERR",
      timeline: ["RUN", "RUN", "ERR", "ERR", "STOP", "STOP", "STOP", "STOP"],
    },
  ]);

  // ==============================
  // 2. 공정 마스터 데이터 (ProcessMgmt)
  // ==============================
  const [processes, setProcesses] = useState([
    {
      code: "L-01",
      name: "Main Assembly Line A",
      capa: "1,500 / day",
      manager: "김반장",
      status: "Active",
    },
    {
      code: "L-02",
      name: "Sub Assembly Line B",
      capa: "1,000 / day",
      manager: "이조장",
      status: "Active",
    },
    {
      code: "L-03",
      name: "Packaging Line",
      capa: "3,000 / day",
      manager: "박포장",
      status: "Maintenance",
    },
  ]);

  // ==============================
  // 3. Helper 함수 (계산 로직)
  // ==============================
  const totalPersonnel = lines.reduce((acc, cur) => acc + cur.personnel, 0);
  const avgRate = Math.round(
    lines.reduce((acc, cur) => acc + (cur.current / cur.target) * 100, 0) /
      lines.length,
  );
  const activeLines = lines.filter((l) => l.status === "RUN").length;

  const getPercentage = (current, target) =>
    Math.round((current / target) * 100);

  const getProgressColor = (percent) => {
    if (percent >= 95) return Colors.success;
    if (percent >= 70) return Colors.primary;
    if (percent >= 40) return Colors.warning;
    return Colors.danger;
  };

  const timeLabels = ["09", "10", "11", "12", "13", "14", "15", "16"];

  return (
    <div style={{ ...CommonStyles.pageContainer, backgroundColor: "#F8F9FE" }}>
      {/* ─────────────────────────────────────────────
          HEADER
      ───────────────────────────────────────────── */}
      <div style={CommonStyles.flexBetween}>
        <div>
          <h2 style={{ marginBottom: "5px", color: "#2c3e50" }}>
            🏭 통합 공정 관리
          </h2>
          <p
            style={{ color: "#7f8c8d", fontSize: "14px", marginBottom: "30px" }}
          >
            실시간 가동 현황 모니터링 및 공정 기준 정보 관리
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "12px", color: "#999" }}>
            Last updated: 10:42 AM
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          SECTION 1: KPI Cards
      ───────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {/* KPI 1 */}
        <div style={DashboardStyles.card}>
          <div style={CommonStyles.flexBetween}>
            <div>
              <div style={DashboardStyles.kpiIconBox(Colors.success)}>
                <FaChartLine />
              </div>
              <span style={{ color: "#8898aa", fontSize: "14px" }}>
                가동 중 라인
              </span>
              <h3 style={{ fontSize: "24px", margin: "5px 0" }}>
                {activeLines} / {lines.length}
              </h3>
            </div>
          </div>
        </div>
        {/* KPI 2 */}
        <div style={DashboardStyles.card}>
          <div>
            <div style={DashboardStyles.kpiIconBox(Colors.primary)}>
              <FaUsers />
            </div>
            <span style={{ color: "#8898aa", fontSize: "14px" }}>
              총 투입 인원
            </span>
            <h3 style={{ fontSize: "24px", margin: "5px 0" }}>
              {totalPersonnel}명
            </h3>
          </div>
        </div>
        {/* KPI 3 */}
        <div style={DashboardStyles.card}>
          <div>
            <div style={DashboardStyles.kpiIconBox("#FF9800")}>
              <FaClock />
            </div>
            <span style={{ color: "#8898aa", fontSize: "14px" }}>
              평균 달성률
            </span>
            <h3 style={{ fontSize: "24px", margin: "5px 0" }}>{avgRate}%</h3>
          </div>
        </div>
        {/* KPI 4 */}
        <div style={DashboardStyles.card}>
          <div>
            <div style={DashboardStyles.kpiIconBox(Colors.danger)}>
              <FaExclamationTriangle />
            </div>
            <span style={{ color: "#8898aa", fontSize: "14px" }}>
              설비/품질 이슈
            </span>
            <h3 style={{ fontSize: "24px", margin: "5px 0" }}>1건</h3>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          SECTION 2: Line Monitoring Table
      ───────────────────────────────────────────── */}
      <div style={DashboardStyles.card}>
        <div style={{ ...CommonStyles.flexBetween, marginBottom: "20px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>
            📈 라인별 실시간 가동 현황
          </h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "12px",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: Colors.success,
                  marginRight: 5,
                }}
              ></div>
              가동
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "12px",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: Colors.secondary,
                  marginRight: 5,
                }}
              ></div>
              휴식/정지
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "12px",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: Colors.danger,
                  marginRight: 5,
                }}
              ></div>
              장애
            </div>
          </div>
        </div>

        <Table
          headers={[
            "라인명",
            "책임자 (인원)",
            "작업 시간",
            "타임테이블 (09~17)",
            "진행률 (목표/현재)",
            "상태",
          ]}
          data={lines.map((line) => ({
            id: line.id,
            lineInfo: (
              <div>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                  {line.id}
                </div>
                <div style={{ fontSize: "12px", color: "#888" }}>
                  {line.product}
                </div>
              </div>
            ),
            workerInfo: (
              <div style={{ display: "flex", alignItems: "center" }}>
                <FaUserCircle
                  size={24}
                  color="#ccc"
                  style={{ marginRight: "8px" }}
                />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500" }}>
                    {line.worker}
                  </div>
                  <div style={{ fontSize: "11px", color: "#666" }}>
                    외 {line.personnel - 1}명
                  </div>
                </div>
              </div>
            ),
            timeInfo: (
              <div style={{ fontSize: "13px" }}>
                <div>{line.workTime}</div>
                <div style={{ fontSize: "11px", color: "#888" }}>
                  Start: {line.startTime}
                </div>
              </div>
            ),
            timetable: (
              <div style={{ width: "180px" }}>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    marginBottom: "4px",
                  }}
                >
                  {line.timeline.map((status, idx) => (
                    <div
                      key={idx}
                      style={DashboardStyles.timeBlock(status)}
                      title={`${timeLabels[idx]}:00 - ${status}`}
                    ></div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "10px",
                    color: "#aaa",
                  }}
                >
                  <span>09</span>
                  <span>12</span>
                  <span>17</span>
                </div>
              </div>
            ),
            progress: (
              <div style={{ width: "120px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      color: getProgressColor(
                        getPercentage(line.current, line.target),
                      ),
                    }}
                  >
                    {getPercentage(line.current, line.target)}%
                  </span>
                  <span style={{ fontSize: "10px", color: "#888" }}>
                    {line.current}/{line.target}
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "6px",
                    backgroundColor: "#edf2f7",
                    borderRadius: "3px",
                  }}
                >
                  <div
                    style={{
                      width: `${getPercentage(line.current, line.target)}%`,
                      height: "100%",
                      backgroundColor: getProgressColor(
                        getPercentage(line.current, line.target),
                      ),
                      borderRadius: "3px",
                    }}
                  ></div>
                </div>
              </div>
            ),
            status: (
              <span
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color:
                    line.status === "RUN"
                      ? Colors.success
                      : line.status === "STOP"
                        ? "#555"
                        : Colors.danger,
                  backgroundColor:
                    line.status === "RUN"
                      ? "#e8f5e9"
                      : line.status === "STOP"
                        ? "#f5f5f5"
                        : "#ffebee",
                  border: `1px solid ${
                    line.status === "RUN"
                      ? Colors.success
                      : line.status === "STOP"
                        ? "#ddd"
                        : Colors.danger
                  }`,
                }}
              >
                {line.status === "RUN"
                  ? "가동중"
                  : line.status === "STOP"
                    ? "대기"
                    : "점검필요"}
              </span>
            ),
          }))}
        />
      </div>

      {/* ─────────────────────────────────────────────
          SECTION 3: Process Master Management (Added)
      ───────────────────────────────────────────── */}
      <div style={DashboardStyles.card}>
        <div style={{ ...CommonStyles.flexBetween, marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                backgroundColor: Colors.secondary,
                padding: "8px",
                borderRadius: "8px",
                display: "flex",
              }}
            >
              <FaCog color="#666" />
            </div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
                margin: 0,
              }}
            >
              공정 마스터 관리
            </h3>
          </div>
          <Button color={Colors.primary}>+ 공정 추가</Button>
        </div>

        <Table
          headers={[
            "공정 코드",
            "공정명",
            "일일 생산능력(Capa)",
            "담당자",
            "상태",
            "관리",
          ]}
          data={processes.map((p) => ({
            code: (
              <span style={{ fontWeight: "bold", color: "#555" }}>
                {p.code}
              </span>
            ),
            name: p.name,
            capa: p.capa,
            manager: (
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <FaUserCircle color="#ccc" /> {p.manager}
              </div>
            ),
            status: (
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  backgroundColor:
                    p.status === "Active" ? "#d4edda" : "#f8d7da",
                  color: p.status === "Active" ? "#155724" : "#721c24",
                }}
              >
                {p.status}
              </span>
            ),
            manage: (
              <Button
                color={Colors.secondary}
                style={{ padding: "6px 10px", fontSize: "12px", color: "#333" }}
              >
                <FaEdit style={{ marginRight: "4px" }} /> 수정
              </Button>
            ),
          }))}
        />
      </div>
    </div>
  );
};

export default ProductionManagement;
