import React from "react";
import { Colors } from "../../styles/GlobalStyle";

const CafeteriaMenu = () => {
  // 데이터: 야식(latenight)도 이제 객체 형태로 {밥, 국, 메인, 반찬}을 가집니다.
  const weeklyMenu = [
    {
      day: "월",
      date: "01/13",
      breakfast: {
        rice: "쌀밥",
        soup: "소고기무국",
        main: "두부조림",
        side: "배추김치",
      },
      lunch: {
        rice: "현미밥",
        soup: "된장찌개",
        main: "제육볶음",
        side: "쌈채소/쌈장",
        kimchi: "깍두기",
      },
      dinner: {
        rice: "차조밥",
        soup: "콩나물국",
        main: "오징어덮밥",
        side: "계란찜",
        kimchi: "배추김치",
      },
      snack: "토스트 & 우유",
      latenight: {
        rice: "쌀밥",
        soup: "얼큰육개장",
        main: "너비아니구이",
        side: "깍두기",
      }, // 정식 식사
    },
    {
      day: "화",
      date: "01/14",
      breakfast: {
        rice: "쌀밥",
        soup: "북엇국",
        main: "스크램블",
        side: "깍두기",
      },
      lunch: {
        rice: "흑미밥",
        soup: "크림스프",
        main: "수제등심돈가스",
        side: "샐러드",
        kimchi: "피클",
      },
      dinner: {
        rice: "기장밥",
        soup: "참치찌개",
        main: "고등어구이",
        side: "도시락김",
        kimchi: "총각김치",
      },
      snack: "핫도그 & 주스",
      latenight: {
        rice: "볶음밥",
        soup: "계란국",
        main: "자장소스",
        side: "단무지무침",
      },
    },
    {
      day: "수",
      date: "01/15",
      breakfast: {
        rice: "쌀밥",
        soup: "사골곰탕",
        main: "미트볼조림",
        side: "석박지",
      },
      lunch: {
        rice: "볶음밥",
        soup: "짬뽕국물",
        main: "찹쌀탕수육",
        side: "군만두",
        kimchi: "단무지",
      },
      dinner: {
        rice: "쌀밥",
        soup: "순두부찌개",
        main: "돼지불백",
        side: "상추겉절이",
        kimchi: "배추김치",
      },
      snack: "찐만두",
      latenight: {
        rice: "주먹밥",
        soup: "우동국물",
        main: "국물떡볶이",
        side: "김말이튀김",
      },
    },
    {
      day: "목",
      date: "01/16",
      breakfast: {
        rice: "쌀밥",
        soup: "누룽지탕",
        main: "생선까스",
        side: "오징어젓갈",
      },
      lunch: {
        rice: "보리밥",
        soup: "청국장",
        main: "뚝배기불고기",
        side: "잡채",
        kimchi: "열무김치",
      },
      dinner: {
        rice: "쌀밥",
        soup: "미역국",
        main: "춘천닭갈비",
        side: "쌈무",
        kimchi: "배추김치",
      },
      snack: "츄러스",
      latenight: {
        rice: "쌀밥",
        soup: "김치콩나물국",
        main: "소시지야채볶음",
        side: "조미김",
      },
    },
    {
      day: "금",
      date: "01/17",
      breakfast: {
        rice: "식빵/잼",
        soup: "시리얼/우유",
        main: "삶은계란",
        side: "과일",
      },
      lunch: {
        rice: "전주비빔밥",
        soup: "맑은장국",
        main: "계란후라이",
        side: "약고추장",
        kimchi: "백김치",
      },
      dinner: {
        rice: "쌀밥",
        soup: "부대찌개",
        main: "라면사리",
        side: "어묵볶음",
        kimchi: "깍두기",
      },
      snack: "과일샐러드",
      latenight: {
        rice: "쌀밥",
        soup: "설렁탕",
        main: "소면사리",
        side: "석박지",
      },
    },
    {
      day: "토",
      date: "01/18",
      breakfast: {
        rice: "쌀밥",
        soup: "황태해장국",
        main: "감자채볶음",
        side: "김치",
      },
      lunch: {
        rice: "김치볶음밥",
        soup: "우동국물",
        main: "치킨텐더",
        side: "콘샐러드",
        kimchi: "피클",
      },
      dinner: {
        rice: "자율배식",
        soup: "간편식",
        main: "-",
        side: "-",
        kimchi: "-",
      },
      snack: "초코파이",
      latenight: { rice: "-", soup: "-", main: "-", side: "-" },
    },
    {
      day: "일",
      date: "01/19",
      isHoliday: true,
    },
  ];

  const today = "화";

  return (
    <div
      style={{
        padding: "10px",
        height: "calc(100vh - 60px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#333",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          🍱 주간 상세 식단표
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          gap: "6px",
          width: "100%",
          minHeight: "0",
        }}
      >
        {weeklyMenu.map((menu, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              border:
                menu.day === today
                  ? `2px solid ${Colors.primary}`
                  : "1px solid #ccc",
              borderRadius: "6px",
              backgroundColor: menu.isHoliday ? "#f2f2f2" : "white",
              overflow: "hidden",
              boxShadow:
                menu.day === today ? "0 4px 15px rgba(0,0,0,0.2)" : "none",
              zIndex: menu.day === today ? 10 : 1,
            }}
          >
            {/* 1. 날짜 헤더 */}
            <div
              style={{
                textAlign: "center",
                padding: "6px",
                backgroundColor:
                  menu.day === today ? Colors.primary : "#e9ecef",
                color: menu.day === today ? "white" : "#333",
                borderBottom: "1px solid #ddd",
                height: "40px",
              }}
            >
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  color:
                    menu.day === "일"
                      ? Colors.danger
                      : menu.day === "토"
                      ? "#007bff"
                      : "inherit",
                }}
              >
                {menu.day}
              </span>
              <span
                style={{ fontSize: "12px", marginLeft: "4px", opacity: 0.9 }}
              >
                {menu.date}
              </span>
            </div>

            {/* 2. 식단 내용 */}
            {menu.isHoliday ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#aaa",
                }}
              >
                <div style={{ fontSize: "30px", marginBottom: "10px" }}>🏖️</div>
                <div style={{ fontWeight: "bold", fontSize: "16px" }}>휴무</div>
              </div>
            ) : (
              <div
                style={{ flex: 1, display: "flex", flexDirection: "column" }}
              >
                {/* 조식 */}
                <MealSection title="조식" color="#fff9db">
                  <MenuText items={menu.breakfast} />
                </MealSection>

                {/* 중식 (강조) */}
                <MealSection title="중식" color="#e3f2fd" isMain>
                  <MenuText items={menu.lunch} isMain />
                </MealSection>

                {/* 간식 (얇게) */}
                <SimpleMealSection
                  title="간식"
                  color="#ffffff"
                  item={menu.snack}
                />

                {/* 석식 */}
                <MealSection title="석식" color="#f8f9fa">
                  <MenuText items={menu.dinner} />
                </MealSection>

                {/* 야식 (정식 식사) */}
                <MealSection title="야식(심야)" color="#e2e6ea" isLast>
                  <MenuText items={menu.latenight} />
                </MealSection>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------
// 컴포넌트: 정식 식사 구역 (조/중/석/야)
// -----------------------------------------------------------------
const MealSection = ({ title, color, isMain, isLast, children }) => (
  <div
    style={{
      flex: 1, // 모든 식사 구역 크기 균등 분할
      backgroundColor: color,
      borderBottom: isLast ? "none" : "1px solid #ddd",
      padding: "6px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      overflow: "hidden",
    }}
  >
    {/* 타이틀 */}
    <div
      style={{
        fontSize: "12px",
        fontWeight: "bold",
        color: "#495057",
        marginBottom: "4px",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span>{title}</span>
      {isMain && (
        <span style={{ fontSize: "10px", color: "#0056b3" }}>★Main</span>
      )}
    </div>
    {/* 메뉴 내용 */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  </div>
);

// 컴포넌트: 간식 구역 (얇게)
const SimpleMealSection = ({ title, color, item }) => (
  <div
    style={{
      height: "35px", // 고정 높이로 얇게
      flexShrink: 0,
      backgroundColor: color,
      borderBottom: "1px solid #ddd",
      padding: "0 6px",
      display: "flex",
      alignItems: "center",
      fontSize: "12px",
    }}
  >
    <span style={{ fontWeight: "bold", marginRight: "6px", color: "#888" }}>
      {title}
    </span>
    <span
      style={{
        fontWeight: "bold",
        color: "#555",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      {item}
    </span>
  </div>
);

// 컴포넌트: 메뉴 텍스트 렌더링 (글자 크기 키움!)
const MenuText = ({ items, isMain }) => {
  if (!items || items.rice === "-")
    return <div style={{ color: "#ccc", fontSize: "12px" }}>-</div>;

  // 폰트 사이즈 대폭 확대
  const baseSize = "13px";
  const mainSize = "14px";

  return (
    <div
      style={{
        fontSize: baseSize,
        lineHeight: "1.35",
        color: "#333",
        textAlign: "left",
      }}
    >
      {/* 밥, 국 */}
      <div
        style={{
          display: "flex",
          gap: "5px",
          fontSize: "12px",
          color: "#555",
          marginBottom: "2px",
        }}
      >
        <span>{items.rice},</span>
        <span>{items.soup}</span>
      </div>

      {/* 메인 반찬 (가장 크게) */}
      <div
        style={{
          fontSize: mainSize,
          fontWeight: "800", // 아주 굵게
          color: isMain ? "#d63384" : "#0056b3",
          margin: "2px 0",
        }}
      >
        {items.main}
      </div>

      {/* 서브 반찬 */}
      <div style={{ fontSize: "12px" }}>{items.side}</div>
      {items.kimchi && (
        <div style={{ fontSize: "12px", color: "#777" }}>{items.kimchi}</div>
      )}
    </div>
  );
};

export default CafeteriaMenu;
