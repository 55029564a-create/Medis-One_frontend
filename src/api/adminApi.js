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
