import React from "react";
import Table from "../../components/common/Table";

const Notice = () => {
  const notices = [
    {
      id: 1,
      title: "[필독] 설 연휴 기간 설비 점검 안내",
      writer: "시설팀",
      date: "2026-01-10",
      views: 120,
    },
    {
      id: 2,
      title: "1월 사내 식당 메뉴표 공지",
      writer: "총무팀",
      date: "2026-01-12",
      views: 85,
    },
    {
      id: 3,
      title: "MES 시스템 업데이트 일정 안내 (1/20)",
      writer: "IT개발팀",
      date: "2026-01-14",
      views: 240,
    },
    {
      id: 4,
      title: "신규 입사자 보안 교육 실시",
      writer: "인사팀",
      date: "2026-01-14",
      views: 45,
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>📢 사내 공지사항</h2>

      <div
        style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        }}
      >
        <Table
          headers={["No", "제목", "작성부서", "작성일", "조회수"]}
          data={notices}
        />
      </div>
    </div>
  );
};

export default Notice;
