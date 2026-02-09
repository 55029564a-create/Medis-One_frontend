import axios from "axios";

// 1. 기본 설정
const client = axios.create({
  // 🔥 [중요] 포트 번호를 8111로 꼭 맞춰주세요!
  baseURL: "http://192.168.0.85:8111/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ----------------------------------------------------------------------

// 2. [요청 인터셉터] 모든 API 요청이 날아가기 직전에 실행
client.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 토큰 꺼내기
    const token = localStorage.getItem("accessToken");

    // 토큰이 있으면 헤더에 'Bearer 토큰' 형태로 추가
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

// 3. [Response Interceptor] 401 에러 핸들링 (토큰 재발급 로직)
client.interceptors.response.use(
  (response) => {
    return response; // 성공 시 그대로 반환
  },
  async (error) => {
    const { config, response } = error;

    // A. 서버 연결 실패 등 응답 자체가 없는 경우
    if (!response) {
      alert("서버와 연결할 수 없습니다. 네트워크를 확인해주세요.");
      return Promise.reject(error);
    }

    // B. [핵심] 401 에러 처리 (토큰 만료 시)
    if (response.status === 401 && !config._retry) {
      config._retry = true; // 무한 루프 방지 플래그

      try {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!accessToken || !refreshToken) {
          throw new Error("No tokens found");
        }

        // 2. 백엔드에 토큰 재발급 요청
        // [수정 완료] 포트 번호를 3000 -> 8111 (백엔드 포트)로 변경
        const res = await axios.post(
          "http://192.168.0.85:8111/api/auth/refresh",
          {
            accessToken: accessToken,
            refreshToken: refreshToken,
          },
        );

        // 3. 새로운 토큰 저장
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          res.data;
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // 4. 실패했던 요청의 헤더 업데이트
        config.headers.Authorization = `Bearer ${newAccessToken}`;

        // 5. 실패했던 요청 재실행
        return client(config);
      } catch (refreshError) {
        // 재발급 실패 시 로그아웃 처리
        console.error("토큰 재발급 실패:", refreshError);

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userInfo");

        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = "/";

        return Promise.reject(refreshError);
      }
    }

    // C. 그 외 에러 처리
    if (response.status === 403) {
      alert("이 작업을 수행할 권한이 없습니다.");
    } else if (response.status === 500) {
      console.error("서버 내부 오류:", response.data);
    }

    return Promise.reject(error);
  },
);

export default client;
