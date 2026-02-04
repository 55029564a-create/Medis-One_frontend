import client from "./client";

// --- [공정 마스터 관리] ---

// 공정 목록 조회
export const getProcesses = async () => {
  const response = await client.get("/production/processes");
  return response.data;
};

// 공정 등록
export const createProcess = async (data) => {
  const response = await client.post("/production/processes", data);
  return response.data;
};

// 공정 수정
export const updateProcess = async (id, data) => {
  const response = await client.put(`/production/processes/${id}`, data);
  return response.data;
};

// 공정 삭제
export const deleteProcess = async (id) => {
  const response = await client.delete(`/production/processes/${id}`);
  return response.data;
};

// [라인 모니터링] - 실제 API 호출로 변경
export const getLineStatus = async () => {
  const response = await client.get("/production/lines/status");
  return response.data;
};
