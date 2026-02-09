import axios from "axios";

// ============================================================
// 1. [핵심] 주소 자동 감지 로직
// ============================================================
// 현재 브라우저 주소창의 도메인(localhost 또는 192.168.0.85 등)을 가져옵니다.
const hostname = window.location.hostname;
const BACKEND_PORT = "8111"; // 백엔드 포트

// 이렇게 하면 상황에 따라 주소가 자동으로 바뀝니다!
// 예: http://localhost:8111/api 또는 http://192.168.0.85:8111/api
const BASE_URL = `http://${hostname}:${BACKEND_PORT}/api`;

console.log("🚀 API Base URL:", BASE_URL); // 콘솔에서 확인 가능

const client = axios.create({
  baseURL: BASE_URL, // 🔥 하드코딩된 IP 대신 변수 사용
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ----------------------------------------------------------------------

// 2. [Request Interceptor] 토큰 실어 보내기
client.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (!config.headers) {
      config.headers = {};
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ----------------------------------------------------------------------

// 3. [Response Interceptor] 401 에러 핸들링 (토큰 재발급)
client.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { config, response } = error;

    // A. 서버 연결 불가
    if (!response) {
      return Promise.reject(error);
    }

    // B. [핵심] 401 에러 (토큰 만료) -> 재발급 시도
    if (response.status === 401 && !config._retry) {
      config._retry = true;

      try {
        const accessToken =
          localStorage.getItem("accessToken") || localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!accessToken || !refreshToken) {
          throw new Error("토큰이 없습니다.");
        }

        // 1. 재발급 요청 (🔥 여기도 동적 주소 BASE_URL 사용!)
        const res = await axios.post(
          `${BASE_URL}/auth/refresh`, // 하드코딩된 IP 제거
          {
            accessToken: accessToken,
            refreshToken: refreshToken,
          },
        );

        // 2. 새로운 토큰 저장
        const newAccessToken = res.data.accessToken || res.data.token;
        const newRefreshToken = res.data.refreshToken;

        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
        }
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // 3. 실패했던 요청의 헤더 교체
        config.headers.Authorization = `Bearer ${newAccessToken}`;

        // 4. 재요청 (기존 client 설정 그대로 사용)
        return client(config);
      } catch (refreshError) {
        console.error("토큰 재발급 실패:", refreshError);

        localStorage.clear();
        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = "/";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default client;
