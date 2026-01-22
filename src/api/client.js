import axios from "axios";

// 1. Axios 인스턴스 생성 (기본 설정)
const client = axios.create({
  // [중요] 백엔드 서버 주소 (localhost:8111)
  baseURL: "http://localhost:8111/api",

  // 요청 타임아웃 (10초) - 너무 짧으면 데이터 로딩 중에 끊길 수 있음
  timeout: 10000,

  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // CORS 관련 쿠키/헤더 허용
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

    // (선택사항) 개발 모드일 때 요청 로그 찍기
    // console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);

    return config;
  },
  (error) => {
    // 요청 설정 중에 에러가 난 경우
    return Promise.reject(error);
  },
);

// ----------------------------------------------------------------------

// 3. [Response Interceptor] 401 에러 핸들링 (핵심 로직)
client.interceptors.response.use(
  (response) => {
    // 성공적인 응답은 그대로 반환
    return response;
  },
  async (error) => {
    const { config, response } = error;

    // A. 서버 연결 실패 등 응답 자체가 없는 경우
    if (!response) {
      alert("서버와 연결할 수 없습니다. 네트워크를 확인해주세요.");
      return Promise.reject(error);
    }

    // B. [핵심] 401 에러 처리 (토큰 만료 시)
    // config._retry는 재시도 여부를 체크하는 플래그 (무한 루프 방지)
    if (response.status === 401 && !config._retry) {
      config._retry = true; // "나 한번 재시도 했어" 표시

      try {
        // 1. 저장된 토큰들 가져오기
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        // 토큰이 아예 없으면 로그인 페이지로
        if (!accessToken || !refreshToken) {
          throw new Error("No tokens found");
        }

        // 2. 백엔드에 토큰 재발급 요청
        // 주의: client.post 대신 axios.post를 써서 인터셉터 순환 참조 방지
        // 백엔드 AuthController가 RequestBody로 TokenDto(accessToken, refreshToken)를 요구함
        const res = await axios.post("http://localhost:3000/api/auth/refresh", {
          accessToken: accessToken,
          refreshToken: refreshToken,
        });

        // 3. 새로운 토큰 저장
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          res.data;
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // 4. 실패했던 원래 요청의 헤더를 새 토큰으로 교체
        config.headers.Authorization = `Bearer ${newAccessToken}`;

        // 5. 원래 요청 재실행 (이 결과가 최종 반환됨)
        return client(config);
      } catch (refreshError) {
        // 재발급 실패 (Refresh Token도 만료됨 or 서버 오류)
        console.error("토큰 재발급 실패:", refreshError);

        // 1. 스토리지 비우기
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userInfo");

        // 2. 로그인 페이지로 강제 이동
        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = "/";

        return Promise.reject(refreshError);
      }
    }

    // C. 그 외 에러 (403, 500 등)
    if (response.status === 403) {
      alert("접근 권한이 없습니다.");
    } else if (response.status === 500) {
      console.error("서버 에러:", response.data);
    }

    return Promise.reject(error);
  },
);

export default client;
