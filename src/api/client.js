import axios from "axios";

// 1. Axios 인스턴스 생성 (기본 설정)
const client = axios.create({
  // [중요] 백엔드 서버 주소 (localhost:3000)
  baseURL: "http://localhost:3000/api",

  // 요청 타임아웃 (10초) - 너무 짧으면 데이터 로딩 중에 끊길 수 있음
  timeout: 10000,

  headers: {
    "Content-Type": "application/json",
  },
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

// 3. [응답 인터셉터] 서버로부터 응답을 받은 직후에 실행
client.interceptors.response.use(
  (response) => {
    // 2xx 범위의 상태 코드는 여기로 들어옴 (성공)
    return response;
  },
  async (error) => {
    // 2xx 외의 범위 (에러 발생)
    const { config, response } = error;

    // A. 서버 응답이 아예 없는 경우 (네트워크 오류 등)
    if (!response) {
      alert("서버와 연결할 수 없습니다.\n네트워크 상태를 확인해주세요.");
      return Promise.reject(error);
    }

    // B. 인증 에러 (401 Unauthorized) 처리
    if (response.status === 401) {
      // 1. 기존 토큰 삭제 (쓰레기 값 제거)
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole"); // 저장된 유저 정보가 있다면 같이 삭제

      // 2. 경고 메시지 (중복 alert 방지 로직이 필요하다면 추가 가능)
      alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");

      // 3. 로그인 페이지로 강제 이동
      // (React Router를 쓰지 않고 window.location을 쓰는 게 가장 확실함)
      window.location.href = "/";
    }

    // C. 권한 없음 (403 Forbidden)
    if (response.status === 403) {
      alert("접근 권한이 없습니다.");
    }

    // D. 서버 내부 오류 (500)
    if (response.status === 500) {
      console.error("서버 에러 발생:", response.data);
      // alert("서버에서 오류가 발생했습니다. 관리자에게 문의하세요.");
    }

    return Promise.reject(error);
  },
);

export default client;
