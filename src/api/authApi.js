import client from "./client"; // 방금 보내주신 그 파일 import

// 로그인 (/api/auth/login)
export const login = async (loginData) => {
  // client.js에 이미 baseURL(http://localhost:8111/api)이 설정되어 있으므로
  // 여기서는 뒤에 붙는 주소만 적으면 됩니다.
  const response = await client.post("/auth/login", loginData);
  return response.data;
};

// 로그아웃 (필요시)
export const logout = () => {
  localStorage.clear();
  window.location.href = "/";
};
