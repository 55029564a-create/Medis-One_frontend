import axios from "axios";

// 🕵️‍♂️ 토큰 찾기 탐정 (어디에 저장했든 찾아냅니다)
const getAccessToken = () => {
  // 1. 가장 흔한 케이스: 'user'라는 JSON 안에 들어있는 경우
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      // 이름이 accessToken일지, token일지 몰라서 다 체크
      const foundToken = user.accessToken || user.token || user.jwt;
      if (foundToken) return foundToken;
    } catch (e) {
      console.log("JSON 파싱 실패 (무시함)");
    }
  }

  // 2. 그냥 'accessToken'이라는 이름으로 저장된 경우
  const directToken = localStorage.getItem("accessToken");
  if (directToken) return directToken;

  // 3. 'token'이라는 이름으로 저장된 경우
  const simpleToken = localStorage.getItem("token");
  if (simpleToken) return simpleToken;

  return null; // 🏳️ 못 찾음 (로그인 안 된 상태)
};

const jwtAxios = axios.create();

// 요청 인터셉터: 나갈 때마다 토큰 주머니에 넣기
jwtAxios.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    // 👇 [디버깅용] 콘솔창(F12)을 켜면 토큰을 찾았는지 보입니다!
    console.log("🔑 API 요청 토큰 상태:", token ? "장착 완료" : "없음(NULL)");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default jwtAxios;
