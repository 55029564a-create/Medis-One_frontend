import React, { useState, useEffect } from "react";
import {
  FaThermometerHalf,
  FaClock,
  FaExclamationTriangle,
  FaTv,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaServer,
  FaIndustry,
  FaClipboardList,
  FaTimes,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  XAxis,
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

// 🔴 [수정 완료] 지시하신 사양대로 18인치/24인치 설정 고정
const ROOM_CONFIG = [
  // === 18인치 모델 (5 Racks x 40 Slots = 200대) ===
  {
    id: "ZOLL-18",
    name: 'Zoll X Series 18"',
    target: 200,
    rackCount: 5,
    cols: 8,
    baseTemp: 45.0,
    limitTemp: 48.0,
  },
  {
    id: "CPLS-18",
    name: 'Corpuls3 18"',
    target: 200,
    rackCount: 5,
    cols: 8,
    baseTemp: 45.0,
    limitTemp: 48.0,
  },
  {
    id: "PRQ-18",
    name: 'Propaq M 18"',
    target: 200,
    rackCount: 5,
    cols: 8,
    baseTemp: 45.0,
    limitTemp: 48.0,
  },

  // === 24인치 모델 (10 Racks x 20 Slots = 200대) ===
  {
    id: "ZOLL-24",
    name: 'Zoll X Series 24"',
    target: 200,
    rackCount: 10,
    cols: 5,
    baseTemp: 48.0,
    limitTemp: 51.0,
  },
  {
    id: "CPLS-24",
    name: 'Corpuls3 24"',
    target: 200,
    rackCount: 10,
    cols: 5,
    baseTemp: 48.0,
    limitTemp: 51.0,
  },
  {
    id: "PRQ-24",
    name: 'Propaq M 24"',
    target: 200,
    rackCount: 10,
    cols: 5,
    baseTemp: 48.0,
    limitTemp: 51.0,
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

// 차트 데이터 생성
const generateHistory = (baseTemp, isFail) => {
  const startOffset = Math.random() * 3 - 1.5;
  return Array.from({ length: 20 }, (_, i) => {
    let temp =
      baseTemp +
      startOffset +
      Math.sin(i * 0.4) * 0.5 +
      (Math.random() * 0.4 - 0.2);
    if (isFail && i > 12) temp += (i - 12) * 0.8;
    return { time: i, temp: parseFloat(temp.toFixed(1)) };
  });
};

const AgingStatus = () => {
  const [selectedRoomId, setSelectedRoomId] = useState(ROOM_CONFIG[0].id);
  const [selectedRackId, setSelectedRackId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [currentChamberTemp, setCurrentChamberTemp] = useState(45.0);
  const [globalProgress, setGlobalProgress] = useState(
    calculateRealTimeProgress(),
  );
  const [chamberHistory, setChamberHistory] = useState([]);
  const [racks, setRacks] = useState([]);

  // 1. 초기 데이터 생성
  useEffect(() => {
    const allRacks = [];
    ROOM_CONFIG.forEach((room) => {
      // 랙당 용량 계산 (200 / 5 = 40, 200 / 10 = 20)
      const capacityPerRack = Math.ceil(room.target / room.rackCount);

      for (let i = 1; i <= room.rackCount; i++) {
        const slots = Array.from({ length: capacityPerRack }, (_, j) => {
          const slotId = j + 1;
          const isDefective = Math.random() < 0.03;
          const initialRandomTemp = room.baseTemp + (Math.random() * 5 - 2.5);

          return {
            id: slotId,
            lineName: `R${i}-${Math.ceil(slotId / room.cols)}-${String(((slotId - 1) % room.cols) + 1).padStart(2, "0")}`,
            panelId: `PNL-${String(slotId).padStart(3, "0")}`,
            status: "TESTING",
            temp: parseFloat(initialRandomTemp.toFixed(1)),
            offset: Math.random() * 1000,
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
          capacity: capacityPerRack,
          cols: room.cols,
          slots: slots,
        });
      }
    });
    setRacks(allRacks);
    setChamberHistory(generateHistory(45.0, false));

    const firstRack = allRacks.find((r) => r.roomId === ROOM_CONFIG[0].id);
    if (firstRack) setSelectedRackId(firstRack.uniqId);
  }, []);

  // 2. 룸 변경 시 첫 번째 랙 자동 선택
  useEffect(() => {
    if (racks.length > 0) {
      const firstRackInRoom = racks.find((r) => r.roomId === selectedRoomId);
      if (firstRackInRoom) {
        setSelectedRackId(firstRackInRoom.uniqId);
        setSelectedSlot(null);
      }
    }
  }, [selectedRoomId, racks]);

  // 3. 실시간 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalProgress(calculateRealTimeProgress());
      const nowTime = Date.now();

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
              nextTemp = slot.temp + Math.random() * 0.4;
              if (nextTemp > rack.limitTemp + 4) nextTemp = rack.limitTemp + 4;
            } else {
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

            return {
              ...slot,
              temp: parseFloat(nextTemp.toFixed(1)),
              status: nextStatus,
              history: [
                ...slot.history.slice(1),
                { time: nowTime, temp: parseFloat(nextTemp.toFixed(1)) },
              ],
            };
          });

          return {
            ...rack,
            slots: updatedSlots,
            status: hasFailInRack ? "WARNING" : "NORMAL",
          };
        }),
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

      {/* 헤더 */}
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

        {/* 모델 선택 드롭다운 */}
        <div style={styles.roomSelectWrapper}>
          <span
            style={{
              fontSize: "12px",
              color: COLORS.subText,
              fontWeight: "600",
            }}
          >
            Select Model:
          </span>
          <select
            style={styles.roomSelect}
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
          >
            {ROOM_CONFIG.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.scrollBody} className="no-scrollbar">
        {/* 대시보드 요약 */}
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

        {/* 메인 콘텐츠 */}
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
                            aspectRatio: currentRack.cols === 5 ? "1.6" : "1.3", // 24인치는 넓게, 18인치는 좁게
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
                              fontSize: "18px",
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
                            {slot.panelId}
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

  roomSelectWrapper: { display: "flex", alignItems: "center", gap: "10px" },
  roomSelect: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    outline: "none",
    minWidth: "200px",
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
