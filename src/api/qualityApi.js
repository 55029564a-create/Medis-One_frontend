import client from "./client";

// 날짜(date)를 인자로 받아서 백엔드에 요청
export const getDefectLogs = async (date) => {
  try {
    const response = await client.get("/qa/current-logs", {
      params: { date: date }, // 예: ?date=2026-02-05
    });
    return response.data;
  } catch (error) {
    console.error("불량 로그 조회 실패:", error);
    return [];
  }
};

// 나머지 함수들은 이번 화면에서는 안 쓰지만 유지
export const getDefectTypeStats = async () => {
  /* ... */
};
export const getLineDefectStats = async () => {
  /* ... */
};
