import React, { useState } from "react";
// 경로 구조에 맞춘 공통 컴포넌트 임포트
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
// 방금 만든 글로벌 스타일 불러오기
import { Colors, CommonStyles } from "../../styles/GlobalStyle";

const ProductionRate = () => {
  // 가동율 데이터 (Mock Data)
  const [rates, setRates] = useState([
    {
      line: "Line-A",
      product: "27인치 패널",
      target: 1000,
      current: 950,
      status: "RUN",
    },
    {
      line: "Line-B",
      product: "메인보드",
      target: 2000,
      current: 1200,
      status: "RUN",
    },
    {
      line: "Line-C",
      product: "케이스",
      target: 500,
      current: 500,
      status: "STOP",
    },
    {
      line: "Line-D",
      product: "전원부",
      target: 1500,
      current: 400,
      status: "WARN",
    },
  ]);

  // 달성률 계산 함수
  const getPercentage = (current, target) => {
    return Math.round((current / target) * 100);
  };

  // 달성률에 따른 색상 결정
  const getProgressColor = (percent) => {
    if (percent >= 95) return Colors.success; // 초록
    if (percent >= 70) return Colors.primary; // 파랑
    if (percent >= 40) return Colors.warning; // 노랑
    return Colors.danger; // 빨강
  };

  return (
    <div style={CommonStyles.pageContainer}>
      <h2 style={{ marginBottom: "20px", color: Colors.dark }}>
        📈 라인별 생산 효율(가동률)
      </h2>

      {/* 1. 요약 카드 영역 */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {rates.map((item, index) => {
          const percent = getPercentage(item.current, item.target);
          return (
            <div
              key={index}
              style={{ ...CommonStyles.card, flex: 1, minWidth: "200px" }}
            >
              <div style={CommonStyles.flexBetween}>
                <h4 style={{ margin: 0, color: Colors.secondary }}>
                  {item.line}
                </h4>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color:
                      item.status === "RUN" ? Colors.success : Colors.secondary,
                  }}
                >
                  {item.status}
                </span>
              </div>

              <h3 style={{ margin: "10px 0", fontSize: "24px" }}>{percent}%</h3>

              {/* 프로그레스 바 (게이지) */}
              <div
                style={{
                  width: "100%",
                  height: "10px",
                  backgroundColor: "#eee",
                  borderRadius: "5px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: "100%",
                    backgroundColor: getProgressColor(percent),
                    transition: "width 0.5s ease-in-out",
                  }}
                ></div>
              </div>
              <p style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
                목표: {item.target} / 현재: {item.current}
              </p>
            </div>
          );
        })}
      </div>

      {/* 2. 상세 데이터 테이블 */}
      <div style={CommonStyles.card}>
        <div style={{ ...CommonStyles.flexBetween, marginBottom: "15px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>상세 리스트</h3>
          <Button color={Colors.primary}>엑셀 다운로드</Button>
        </div>

        <Table
          headers={[
            "라인명",
            "생산품목",
            "목표수량",
            "현재수량",
            "달성률",
            "상태",
          ]}
          data={rates.map((r) => ({
            ...r,
            // 테이블 안에도 퍼센트 색상 적용
            percent: (
              <span
                style={{
                  fontWeight: "bold",
                  color: getProgressColor(getPercentage(r.current, r.target)),
                }}
              >
                {getPercentage(r.current, r.target)}%
              </span>
            ),
            // 상태 뱃지
            statusBadge: (
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  color: "#fff",
                  backgroundColor:
                    r.status === "RUN" ? Colors.success : Colors.secondary,
                }}
              >
                {r.status}
              </span>
            ),
          }))}
        />
      </div>
    </div>
  );
};

export default ProductionRate;
