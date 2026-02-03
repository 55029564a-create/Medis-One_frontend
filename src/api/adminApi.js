// src/api/adminApi.js
import client from "./client"; // 작성해주신 axios 인스턴스 import

// 사원 목록 조회
export const getEmployees = async () => {
  const response = await client.get("/admin/emp-manage");
  return response.data;
};

// 사원 등록
export const createEmployee = async (employeeData) => {
  // 백엔드 SignUpReqDto 필드명과 맞춰야 함
  const response = await client.post("/admin/emp-manage/signup", employeeData);
  return response.data;
};

// [추가] 사원 정보 수정 (PUT)
export const updateEmployee = async (id, employeeData) => {
  // 백엔드: @PutMapping("/admin/emp-manage/{id}")
  const response = await client.put(`/admin/emp-manage/${id}`, employeeData);
  return response.data;
};

// [추가] 사원 퇴사 처리 (PUT)
export const resignEmployee = async (id) => {
  // 백엔드: @PutMapping("/admin/emp-manage/{id}/resign")
  const response = await client.put(`/admin/emp-manage/${id}/resign`);
  return response.data;
};
