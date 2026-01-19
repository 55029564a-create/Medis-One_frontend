import React, { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = () => {
  const { pathname } = useLocation(); // 현재 페이지 경로 감지
  const scrollRef = useRef(null); // 스크롤 영역을 제어하기 위한 Ref

  // [기능 추가] 페이지(경로)가 바뀔 때마다 스크롤을 맨 위로 올림
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <div style={styles.screenContainer}>
      {/* 전역 스타일: 스크롤바 투명 처리 */}
      <style>{`
        body, html {
          margin: 0; padding: 0;
          width: 100%; height: 100%;
          overflow: hidden; /* 브라우저 전체 스크롤 차단 */
        }
        .scroll-area::-webkit-scrollbar { display: none; }
        .scroll-area {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* 1. 사이드바 */}
      <Sidebar />

      {/* 2. 메인 래퍼 */}
      <div style={styles.mainWrapper}>
        {/* 헤더 (고정) */}
        <div style={styles.headerWrapper}>
          <Header />
        </div>

        {/* 콘텐츠 영역 (스크롤 생성 위치) 
           ref={scrollRef}를 연결해서 스크롤을 제어합니다.
        */}
        <main
          ref={scrollRef}
          className="scroll-area"
          style={styles.contentArea}
        >
          <div style={styles.contentInner}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const styles = {
  // 전체 화면 컨테이너
  screenContainer: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: "#F5F6FA",
  },

  // 우측 영역 (헤더 + 콘텐츠)
  mainWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minWidth: 0, // [중요] Flex 자식이 부모보다 커지는 것 방지
    minHeight: 0, // [중요] 높이 계산 오류 방지
  },

  // 헤더
  headerWrapper: {
    flexShrink: 0, // 어떤 상황에도 찌그러지지 않음
    zIndex: 10,
  },

  // 콘텐츠 스크롤 영역
  contentArea: {
    flex: 1, // 남은 공간 차지
    display: "block", // [중요] flex 대신 block으로 변경하여 불필요한 늘어남 방지
    overflowY: "auto", // 세로 스크롤
    overflowX: "hidden",
    position: "relative",
    minHeight: 0, // [핵심] 이 속성이 없으면 자식 크기만큼 늘어나려 함
  },

  // 내부 패딩
  contentInner: {
    padding: "30px",
    width: "100%",
    boxSizing: "border-box",
    // height나 minHeight 관련 속성 일절 제거함
  },
};

export default Layout;
