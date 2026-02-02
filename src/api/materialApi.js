import client from "./client"; // 방금 보내주신 그 파일 import

// =========================================================
// 1. 자재 정보 조회 (스캔)
// =========================================================
export const getMaterialInfo = async (lotId) => {
  // GET /api/material/info/{lotId}
  const response = await client.get(`/material/info/${lotId}`);
  return response.data;
};

// =========================================================
// 2. 입출고 등록
// =========================================================
export const registerMaterialInOut = async (data) => {
  // 프론트 type에 따라 경로 분기
  const path =
    data.type === "IN" || data.type === "INBOUND"
      ? "/material/inbound"
      : "/material/outbound";

  // POST /api/material/inbound 또는 /outbound
  const response = await client.post(path, data);
  return response.data;
};

// =========================================================
// 3. 최근 이력 조회
// =========================================================
export const getRecentHistory = async () => {
  // GET /api/material/find-history
  const response = await client.get("/material/find-history");
  return response.data;
};

// =========================================================
// 4. 전체 이력 조회 (검색)
// =========================================================
export const getMaterialHistory = async (searchTerm) => {
  const response = await client.get("/material/find-history", {
    params: { keyword: searchTerm },
  });
  return response.data;
};

// =========================================================
// 5. 통계 조회
// =========================================================
export const getTodayStats = async () => {
  // GET /api/material/today-stats
  const response = await client.get("/material/today-stats");
  return response.data;
};

// =========================================================
// 6. 사원 목록 조회
// =========================================================
export const getEmployeeList = async () => {
  // GET /api/material/employees
  const response = await client.get("/material/employees");
  return response.data;
};

// =========================================================
// 7. 공정 목록 조회
// =========================================================
export const getProcessList = async () => {
  // GET /api/material/processes
  const response = await client.get("/material/processes");
  return response.data;
};
