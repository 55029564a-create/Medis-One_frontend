import React, { useState, useEffect, useRef } from "react";
import {
  FaThermometerHalf,
  FaClock,
  FaExclamationTriangle,
  FaTv,
  FaChartLine,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaServer,
  FaIndustry,
  FaClipboardList,
  FaArrowRight,
  FaTimes,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// 🎨 디자인 테마
const COLORS = {
  primary: "#6366F1",
  primaryLight: "#EEF2FF",
  bg: "#F3F4F6",
  white: "#FFFFFF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  text: "#111827",
  subText: "#6B7280",
  border: "#E5E7EB",
  rackSelectBg: "#F9FAFB",
  rackFailBg: "#FEF2F2",
  overlay: "rgba(0, 0, 0, 0.6)",
};

// [설정] 룸 데이터 (생산량 200대로 통일)
const ROOM_CONFIG = [
  {
    id: "ROOM_24",
    name: 'A-Zone (24" Standard)',
    rackCount: 10, // 랙 10개
    rackCapacity: 20, // 랙당 20대
    cols: 5,
    baseTemp: 48.0,
    limitTemp: 51.0,
    target: 200, // 10 * 20 = 200대
  },
  {
    id: "ROOM_18",
    name: 'B-Zone (18" Compact)',
    rackCount: 5, // [수정] 랙 5개로 축소
    rackCapacity: 40, // 랙당 40대
    cols: 8,
    baseTemp: 42.0,
    limitTemp: 45.0,
    target: 200, // [수정] 5 * 40 = 200대
  },
];

// 현재 시간 기준 진행률
const calculateRealTimeProgress = () => {
  const now = new Date();
  let start = new Date();
  start.setHours(9, 0, 0, 0);
  if (now < start) start.setDate(start.getDate() - 1);
  const elapsedMs = now - start;
  const totalMs = 24 * 60 * 60 * 1000;
  return Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
};

// [수정] 차트 데이터 생성 시 랜덤성 강화
const generateHistory = (baseTemp, isFail) => {
  // 시작 온도를 약간 다르게 설정
  const startOffset = Math.random() * 3 - 1.5;

  return Array.from({ length: 20 }, (_, i) => {
    // 시간 흐름에 따른 변화 + 노이즈
    let temp =
      baseTemp +
      startOffset +
      Math.sin(i * 0.4) * 0.5 +
      (Math.random() * 0.4 - 0.2);

    // 불량이면 뒤로 갈수록 온도 급상승
    if (isFail && i > 12) temp += (i - 12) * 0.8;

    return { time: i, temp: parseFloat(temp.toFixed(1)) };
  });
};

const AgingStatus = () => {
  const [selectedRoomId, setSelectedRoomId] = useState("ROOM_24");
  const [selectedRackId, setSelectedRackId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [currentChamberTemp, setCurrentChamberTemp] = useState(45.0);
  const [globalProgress, setGlobalProgress] = useState(
    calculateRealTimeProgress(),
  );
  const [chamberHistory, setChamberHistory] = useState([]);
  const [racks, setRacks] = useState([]);

  // 1. 초기 데이터 생성 (랜덤성 대폭 강화)
  useEffect(() => {
    const allRacks = [];
    ROOM_CONFIG.forEach((room) => {
      for (let i = 1; i <= room.rackCount; i++) {
        const slots = Array.from({ length: room.rackCapacity }, (_, j) => {
          const slotId = j + 1;
          const isDefective = Math.random() < 0.05; // 5% 불량 확률

          // [핵심 수정] 초기 온도를 베이스 온도 ±2.5도 범위로 분산
          const initialRandomTemp = room.baseTemp + (Math.random() * 5 - 2.5);

          return {
            id: slotId,
            lineName: `R${i}-${Math.ceil(slotId / room.cols)}-${String(((slotId - 1) % room.cols) + 1).padStart(2, "0")}`,
            panelId: `PNL-${room.id === "ROOM_24" ? "A" : "B"}${i}-${String(slotId).padStart(3, "0")}`,
            status: "TESTING",
            temp: parseFloat(initialRandomTemp.toFixed(1)), // 랜덤 시작 온도
            offset: Math.random() * 1000, // 움직임 패턴 오프셋
            isDefective: isDefective,
            history: generateHistory(room.baseTemp, isDefective),
          };
        });

        allRacks.push({
          uniqId: `${room.id}_RACK_${i}`,
          roomId: room.id,
          name: `Rack #${String(i).padStart(2, "0")}`,
          status: "NORMAL",
          baseTemp: room.baseTemp,
          limitTemp: room.limitTemp,
          capacity: room.rackCapacity,
          cols: room.cols,
          slots: slots,
        });
      }
    });
    setRacks(allRacks);

    // 챔버 온도 히스토리도 약간 리얼하게 생성
    setChamberHistory(generateHistory(45.0, false));

    const firstRack = allRacks.find((r) => r.roomId === "ROOM_24");
    if (firstRack) setSelectedRackId(firstRack.uniqId);
  }, []);

  // 2. 룸 변경 핸들러
  useEffect(() => {
    if (racks.length > 0) {
      const currentRackObj = racks.find((r) => r.uniqId === selectedRackId);
      if (!currentRackObj || currentRackObj.roomId !== selectedRoomId) {
        const firstRackInRoom = racks.find((r) => r.roomId === selectedRoomId);
        if (firstRackInRoom) {
          setSelectedRackId(firstRackInRoom.uniqId);
          setSelectedSlot(null);
        }
      }
    }
  }, [selectedRoomId]);

  // 3. 실시간 시뮬레이션 (1분 주기)
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalProgress(calculateRealTimeProgress());

      const nowTime = Date.now();
      // 챔버 온도도 랜덤하게 흔들림
      const newChamberTemp = parseFloat(
        (
          45.0 +
          Math.sin(nowTime / 600000) * 0.8 +
          (Math.random() - 0.5)
        ).toFixed(1),
      );
      setCurrentChamberTemp(newChamberTemp);
      setChamberHistory((prev) => [
        ...prev.slice(1),
        { time: nowTime, temp: newChamberTemp },
      ]);

      setRacks((prevRacks) =>
        prevRacks.map((rack) => {
          let hasFailInRack = false;

          const updatedSlots = rack.slots.map((slot) => {
            let nextTemp;

            if (slot.isDefective) {
              // 불량품: 온도 계속 상승
              nextTemp = slot.temp + Math.random() * 0.4;
              if (nextTemp > rack.limitTemp + 4) nextTemp = rack.limitTemp + 4;
            } else {
              // [수정] 정상품: 각자의 패턴(offset)대로 조금씩 다르게 움직임
              // 사인파에 랜덤 노이즈를 섞어서 기계적인 움직임 방지
              const noise = (Math.random() - 0.5) * 0.3;
              nextTemp =
                rack.baseTemp +
                Math.sin(nowTime / 60000 + slot.offset) * 0.8 +
                noise;
            }

            let nextStatus = "TESTING";
            if (nextTemp >= rack.limitTemp) {
              nextStatus = "FAIL";
              hasFailInRack = true;
            }

            const newHistory = [
              ...slot.history.slice(1),
              { time: nowTime, temp: parseFloat(nextTemp.toFixed(1)) },
            ];

            return {
              ...slot,
              temp: parseFloat(nextTemp.toFixed(1)),
              status: nextStatus,
              history: newHistory,
            };
          });

          return {
            ...rack,
            slots: updatedSlots,
            status: hasFailInRack ? "WARNING" : "NORMAL",
          };
        }),
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // 상태 동기화
  useEffect(() => {
    if (selectedSlot && selectedRackId) {
      const currentR = racks.find((r) => r.uniqId === selectedRackId);
      if (currentR) {
        const updatedSlot = currentR.slots.find(
          (s) => s.id === selectedSlot.id,
        );
        if (updatedSlot) setSelectedSlot(updatedSlot);
      }
    }
  }, [racks]);

  const currentRack = racks.find((r) => r.uniqId === selectedRackId);
  const currentRoom = ROOM_CONFIG.find((r) => r.id === selectedRoomId);
  const filteredRackList = racks.filter((r) => r.roomId === selectedRoomId);

  const totalSlotsInRoom = filteredRackList.reduce(
    (acc, r) => acc + r.slots.length,
    0,
  );
  const totalFailsInRoom = filteredRackList.reduce(
    (acc, r) => acc + r.slots.filter((s) => s.status === "FAIL").length,
    0,
  );
  const activeSlotsInRoom = totalSlotsInRoom - totalFailsInRoom;

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .blink { animation: blinker 2s linear infinite; }
        @keyframes blinker { 50% { opacity: 0.4; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* 1. 헤더 */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoBox}>
            <FaIndustry size={20} color="white" />
          </div>
          <div>
            <h1 style={styles.pageTitle}>Aging Monitoring System</h1>
            <p style={styles.pageSubtitle}>Real-time Burn-in Process Control</p>
          </div>
        </div>
        <div style={styles.roomTabs}>
          {ROOM_CONFIG.map((room) => (
            <button
              key={room.id}
              style={
                selectedRoomId === room.id
                  ? styles.roomTabActive
                  : styles.roomTab
              }
              onClick={() => setSelectedRoomId(room.id)}
            >
              {room.name}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.scrollBody} className="no-scrollbar">
        {/* 2. 대시보드 요약 */}
        <div style={styles.topDashboard}>
          <div style={styles.chamberCard}>
            <div style={styles.cardHeader}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div style={styles.iconBox}>
                  <FaThermometerHalf />
                </div>
                <span style={styles.cardTitle}>
                  Chamber Env ({currentRoom?.name})
                </span>
              </div>
              <div style={styles.tempBadge}>{currentChamberTemp}°C</div>
            </div>
            <div style={{ width: "100%", height: "100px", marginTop: "10px" }}>
              <ResponsiveContainer>
                <AreaChart data={chamberHistory}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.primary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="temp"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTemp)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={styles.summaryGrid}>
            <SummaryCard
              label="Batch Progress"
              value={`${globalProgress.toFixed(1)}%`}
              sub="Sync: 09:00 AM"
              icon={<FaClock />}
              color={COLORS.primary}
            />
            <SummaryCard
              label="Production Goal"
              value={`${totalSlotsInRoom} / ${currentRoom?.target}`}
              sub={`Achieved: ${((totalSlotsInRoom / currentRoom?.target) * 100).toFixed(0)}%`}
              icon={<FaClipboardList />}
              color={COLORS.success}
              valueSize="18px"
            />
            <SummaryCard
              label="Failures"
              value={`${totalFailsInRoom} EA`}
              sub={`Rate: ${totalSlotsInRoom > 0 ? ((totalFailsInRoom / totalSlotsInRoom) * 100).toFixed(2) : 0}%`}
              icon={<FaTimesCircle />}
              color={COLORS.danger}
            />
            <SummaryCard
              label="Active Units"
              value={`${activeSlotsInRoom} EA`}
              sub="Operating Normally"
              icon={<FaCheckCircle />}
              color={COLORS.warning}
            />
          </div>
        </div>

        {/* 3. 메인 콘텐츠 */}
        <div style={styles.mainLayout}>
          <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <span>Rack List</span>
              <span style={{ fontSize: "12px", color: COLORS.subText }}>
                Total {filteredRackList.length} Units
              </span>
            </div>
            <div style={styles.rackListContainer} className="no-scrollbar">
              {filteredRackList.map((rack) => {
                const isActive = rack.uniqId === selectedRackId;
                const isWarning = rack.status === "WARNING";

                return (
                  <div
                    key={rack.uniqId}
                    onClick={() => setSelectedRackId(rack.uniqId)}
                    style={{
                      ...styles.rackListItem,
                      backgroundColor: isActive
                        ? COLORS.white
                        : isWarning
                          ? COLORS.rackFailBg
                          : "transparent",
                      border: isActive
                        ? `1px solid ${COLORS.primary}`
                        : isWarning
                          ? `1px solid ${COLORS.danger}`
                          : "1px solid transparent",
                      boxShadow: isActive
                        ? "0 2px 4px rgba(99, 102, 241, 0.1)"
                        : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <FaServer
                          size={14}
                          color={isActive ? COLORS.primary : COLORS.subText}
                        />
                        <span
                          style={{
                            fontWeight: isActive ? "700" : "500",
                            color: isActive ? COLORS.primary : COLORS.text,
                            fontSize: "14px",
                          }}
                        >
                          {rack.name}
                        </span>
                      </div>
                      {isWarning && (
                        <FaExclamationTriangle
                          color={COLORS.danger}
                          size={14}
                          className="blink"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={styles.rightColumn}>
            {currentRack ? (
              <>
                <div style={styles.rackHeaderCard}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div style={styles.iconBox}>
                      <FaTv />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          color: COLORS.text,
                        }}
                      >
                        {currentRack.name}
                      </div>
                      <div style={{ fontSize: "12px", color: COLORS.subText }}>
                        Capacity: {currentRack.capacity} EA · Avg Temp:{" "}
                        {currentRack.baseTemp}°C ·{" "}
                        <strong style={{ color: COLORS.danger }}>
                          Limit: {currentRack.limitTemp}°C
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={styles.slotGridContainer} className="no-scrollbar">
                  <div
                    style={{
                      ...styles.slotGrid,
                      gridTemplateColumns: `repeat(${currentRack.cols}, 1fr)`,
                    }}
                  >
                    {currentRack.slots.map((slot) => {
                      const isFail = slot.status === "FAIL";
                      const isSelected = selectedSlot?.id === slot.id;

                      return (
                        <div
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          style={{
                            ...styles.slot,
                            backgroundColor: isFail
                              ? "#FEF2F2"
                              : isSelected
                                ? COLORS.primaryLight
                                : COLORS.white,
                            borderColor: isFail
                              ? COLORS.danger
                              : isSelected
                                ? COLORS.primary
                                : COLORS.border,
                            boxShadow: isSelected
                              ? `0 0 0 2px ${COLORS.primary}`
                              : "none",
                            aspectRatio:
                              currentRoom.id === "ROOM_24" ? "1.6" : "1.3",
                          }}
                        >
                          <div style={styles.slotHeader}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "600",
                                color: COLORS.subText,
                              }}
                            >
                              {String(slot.id).padStart(2, "0")}
                            </span>
                            {isFail && (
                              <FaExclamationTriangle
                                size={12}
                                color={COLORS.danger}
                              />
                            )}
                          </div>
                          <div
                            style={{
                              fontSize:
                                currentRoom.id === "ROOM_24" ? "20px" : "16px",
                              fontWeight: "800",
                              textAlign: "center",
                              color: isFail ? COLORS.danger : COLORS.text,
                              marginTop: "2px",
                            }}
                          >
                            {slot.temp.toFixed(1)}°
                          </div>
                          <div
                            style={{
                              fontSize: "10px",
                              color: COLORS.subText,
                              textAlign: "center",
                              marginTop: "2px",
                            }}
                          >
                            PNL-{String(slot.id).padStart(3, "0")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div style={styles.emptyState}>Select a Rack</div>
            )}
          </div>
        </div>
      </div>

      {/* 모달 */}
      {selectedSlot && currentRack && (
        <div style={styles.modalOverlay} onClick={() => setSelectedSlot(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <FaSearch color={COLORS.primary} size={18} />
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: COLORS.text,
                  }}
                >
                  Deep Analysis: {selectedSlot.panelId}
                </span>
                {selectedSlot.status === "FAIL" && (
                  <span style={styles.failBadgeLarge}>FAILURE DETECTED</span>
                )}
              </div>
              <button
                style={styles.closeButton}
                onClick={() => setSelectedSlot(null)}
              >
                <FaTimes size={18} color={COLORS.subText} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalChartBox}>
                <div
                  style={{
                    marginBottom: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: COLORS.text,
                  }}
                >
                  Temperature History
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={selectedSlot.history}>
                    <defs>
                      <linearGradient
                        id="modalChartColor"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS.primary}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.primary}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E5E7EB"
                    />
                    <XAxis dataKey="time" hide />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                    />
                    <ReferenceLine
                      y={currentRack.limitTemp}
                      stroke={COLORS.danger}
                      strokeDasharray="3 3"
                      label={{
                        value: "Limit",
                        fill: COLORS.danger,
                        fontSize: 12,
                        position: "right",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="temp"
                      stroke={COLORS.primary}
                      strokeWidth={3}
                      fill="url(#modalChartColor)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.modalInfoBox}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Rack Location</span>
                  <span style={styles.infoValue}>{selectedSlot.lineName}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Current Temp</span>
                  <span
                    style={{
                      ...styles.infoValue,
                      color:
                        selectedSlot.status === "FAIL"
                          ? COLORS.danger
                          : COLORS.text,
                      fontSize: "18px",
                    }}
                  >
                    {selectedSlot.temp.toFixed(1)}°C
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Status</span>
                  <span
                    style={{
                      ...styles.infoValue,
                      color:
                        selectedSlot.status === "FAIL"
                          ? COLORS.danger
                          : COLORS.success,
                      fontWeight: "800",
                    }}
                  >
                    {selectedSlot.status}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Threshold</span>
                  <span style={{ ...styles.infoValue, color: COLORS.danger }}>
                    Max {currentRack.limitTemp}°C
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 요약 카드
const SummaryCard = ({
  label,
  value,
  sub,
  icon,
  color,
  valueSize = "20px",
}) => (
  <div style={styles.summaryCard}>
    <div
      style={{
        ...styles.summaryIcon,
        color: color,
        backgroundColor: `${color}15`,
      }}
    >
      {icon}
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: "2px",
      }}
    >
      <div
        style={{
          fontSize: valueSize,
          fontWeight: "800",
          color: COLORS.text,
          lineHeight: "1.2",
          marginTop: "10px",
        }}
      >
        {value}
      </div>
      <div
        style={{ fontSize: "12px", color: COLORS.subText, fontWeight: "600" }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "11px",
          color: color,
          fontWeight: "600",
          marginTop: "2px",
        }}
      >
        {sub}
      </div>
    </div>
  </div>
);

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: COLORS.bg,
    overflowX: "hidden",
  },
  header: {
    height: "64px",
    backgroundColor: COLORS.white,
    borderBottom: `1px solid ${COLORS.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    flexShrink: 0,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  logoBox: {
    width: "32px",
    height: "32px",
    backgroundColor: COLORS.primary,
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    margin: 0,
    fontSize: "18px",
    color: COLORS.text,
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },
  pageSubtitle: {
    margin: 0,
    fontSize: "12px",
    color: COLORS.subText,
    fontWeight: "500",
  },

  roomTabs: {
    display: "flex",
    gap: "8px",
    height: "100%",
    alignItems: "center",
  },
  roomTab: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    border: "1px solid transparent",
    borderRadius: "8px",
    cursor: "pointer",
    color: COLORS.subText,
    fontWeight: "600",
    fontSize: "13px",
    transition: "all 0.2s",
  },
  roomTabActive: {
    padding: "8px 16px",
    backgroundColor: COLORS.primaryLight,
    border: `1px solid ${COLORS.primary}30`,
    borderRadius: "8px",
    cursor: "pointer",
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: "13px",
  },

  scrollBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    paddingBottom: "40px",
  },

  topDashboard: {
    display: "flex",
    gap: "20px",
    padding: "20px 24px 0 24px",
    height: "200px",
    flexShrink: 0,
  },
  chamberCard: {
    flex: 1.2,
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    border: `1px solid ${COLORS.border}`,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
  },
  cardTitle: { fontWeight: "700", fontSize: "15px", color: COLORS.text },
  tempBadge: {
    fontSize: "24px",
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: "-1px",
  },
  summaryGrid: {
    flex: 2,
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: "16px",
  },

  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: `1px solid ${COLORS.border}`,
  },
  summaryIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },

  mainLayout: { display: "flex", flex: 1, padding: "20px 24px", gap: "20px" },

  sidebar: {
    width: "220px",
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    height: "600px",
  },
  sidebarHeader: {
    padding: "16px 20px",
    borderBottom: `1px solid ${COLORS.border}`,
    fontWeight: "700",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: COLORS.text,
  },
  rackListContainer: { padding: "12px", overflowY: "auto", flex: 1 },
  rackListItem: {
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  rightColumn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  rackHeaderCard: {
    height: "56px",
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    padding: "0 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: `1px solid ${COLORS.border}`,
  },
  iconBox: {
    width: "32px",
    height: "32px",
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  slotGridContainer: {
    height: "540px",
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: `1px solid ${COLORS.border}`,
    overflowY: "auto",
  },
  slotGrid: { display: "grid", gap: "12px", alignContent: "start" },
  slot: {
    borderRadius: "12px",
    padding: "10px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    border: "1px solid",
    transition: "all 0.1s",
  },
  slotHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: COLORS.subText,
    fontWeight: "500",
    minHeight: "300px",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.overlay,
    backdropFilter: "blur(4px)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "fadeIn 0.2s ease-out",
  },
  modalContent: {
    width: "600px",
    backgroundColor: COLORS.white,
    borderRadius: "20px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    animation: "slideUp 0.3s ease-out",
    border: `1px solid ${COLORS.border}`,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: "15px",
  },
  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "5px",
  },
  modalBody: { display: "flex", gap: "30px" },
  modalChartBox: { flex: 2, height: "300px" },
  modalInfoBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    justifyContent: "center",
    borderLeft: `1px solid ${COLORS.border}`,
    paddingLeft: "30px",
  },

  infoRow: { display: "flex", flexDirection: "column", gap: "4px" },
  infoLabel: { fontSize: "12px", color: COLORS.subText, fontWeight: "600" },
  infoValue: { fontSize: "16px", color: COLORS.text, fontWeight: "700" },

  failBadgeLarge: {
    backgroundColor: COLORS.danger,
    color: "white",
    fontSize: "12px",
    padding: "4px 10px",
    borderRadius: "6px",
    fontWeight: "800",
  },
};

export default AgingStatus;
