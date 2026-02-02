import axios from "axios";

// ✅ [연결 설정] 8111 포트 및 IPv4 명시
const BASE_URL = "http://127.0.0.1:8111/api/material";

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ✅ [인증] 토큰 자동 첨부
client.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 1. 자재 정보 조회 (스캔)
export const getMaterialInfo = async (lotId) => {
  try {
    const response = await client.get(`/info/${lotId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 2. 입출고 등록 (백엔드 경로: /inbound, /outbound)
export const registerMaterialInOut = async (data) => {
  // 프론트의 type("IN"/"OUT")에 따라 경로 분기
  const path =
    data.type === "IN" || data.type === "INBOUND" ? "/inbound" : "/outbound";
  const response = await client.post(path, data);
  return response.data;
};

// 3. 이력 조회 (백엔드 경로: /find-history)
export const getRecentHistory = async () => {
  const response = await client.get("/find-history");
  return response.data;
};

// 4. 전체 이력 조회 (검색)
export const getMaterialHistory = async (searchTerm) => {
  const response = await client.get("/find-history", {
    params: { keyword: searchTerm }, // 백엔드 param: keyword
  });
  return response.data;
};

// 5. 통계 조회 (백엔드 경로: /today-stats)
export const getTodayStats = async () => {
  const response = await client.get("/today-stats");
  return response.data;
};

// 6. 사원/공정 목록 (백엔드에 없음 -> 에러 방지용 빈 배열 반환)
// ※ 나중에 백엔드에 해당 API가 생기면 경로만 수정하면 됩니다.
export const getEmployeeList = async () => {
  return [];
};

export const getProcessList = async () => {
  // UI 테스트를 위해 임시 데이터를 원하시면 여기를 수정, 지금은 안전하게 빈배열
  return [];
};
