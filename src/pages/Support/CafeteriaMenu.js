import React, { useState, useEffect } from "react";
import {
  FaUtensils,
  FaCloudSun,
  FaSun,
  FaMoon,
  FaCoffee,
  FaStar,
  FaCalendarCheck,
} from "react-icons/fa";

// 🎨 MedisOne 디자인 시스템 (원본 유지)
const COLORS = {
  primary: "#8C85FF",
  secondary: "#F3F1FF",
  bg: "#F5F6FA",
  text: "#333",
  subText: "#888",
  border: "#E0E0E0",
  white: "#FFFFFF",
  highlight: "#E3F2FD",
  breakfast: "#FFB74D",
  lunch: "#FF5252",
  dinner: "#5C6BC0",
  snack: "#8D6E63",
  latenight: "#7B1FA2",
};

const CafeteriaMenu = () => {
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [todayStr, setTodayStr] = useState("");

  // 날짜 및 데이터 생성 로직 (오늘 기준 7일)
  useEffect(() => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const today = new Date();
    setTodayStr(
      `${today.getMonth() + 1}/${today.getDate()} (${days[today.getDay()]})`,
    );

    const newWeeklyMenu = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(today.getDate() + i);

      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const dayNum = ("0" + date.getDate()).slice(-2);
      const dayIndex = date.getDay(); // 0:일, 1:월 ... 6:토
      const dayName = days[dayIndex];

      // 요일별 메뉴 데이터 베이스
      const menuDB = {
        1: {
          // 월요일
          breakfast: {
            rice: "쌀밥",
            soup: "미역국",
            main: "스크램블에그",
            side: "멸치볶음",
            kimchi: "배추김치",
          },
          lunch: {
            rice: "현미밥",
            soup: "김치찌개",
            main: "제육볶음",
            side: "계란찜",
            kimchi: "깍두기",
          },
          dinner: {
            rice: "차조밥",
            soup: "아욱국",
            main: "오징어볶음",
            side: "동그랑땡",
            kimchi: "배추김치",
          },
          snack: "햄치즈 샌드위치 & 쥬스",
          latenight: {
            rice: "쌀밥",
            soup: "육개장",
            main: "떡갈비구이",
            side: "어묵볶음",
            kimchi: "깍두기",
          },
        },
        2: {
          // 화요일
          breakfast: {
            rice: "야채죽",
            soup: "동치미",
            main: "장조림",
            side: "오징어젓갈",
            kimchi: "배추김치",
          },
          lunch: {
            rice: "흑미밥",
            soup: "얼큰짬뽕국",
            main: "등심탕수육",
            side: "군만두",
            kimchi: "단무지무침",
          },
          dinner: {
            rice: "쌀밥",
            soup: "된장국",
            main: "안동찜닭",
            side: "도토리묵",
            kimchi: "배추김치",
          },
          snack: "뉴욕핫도그 & 콜라",
          latenight: {
            rice: "쌀밥",
            soup: "순두부찌개",
            main: "고등어구이",
            side: "마늘쫑",
            kimchi: "석박지",
          },
        },
        3: {
          // 수요일
          breakfast: {
            rice: "쌀밥",
            soup: "북엇국",
            main: "두부부침",
            side: "김자반",
            kimchi: "배추김치",
          },
          lunch: {
            rice: "보리밥",
            soup: "콩나물국",
            main: "전주비빔밥",
            side: "약고추장",
            kimchi: "백김치",
          },
          dinner: {
            rice: "쌀밥",
            soup: "부대찌개",
            main: "생선까스",
            side: "타르타르",
            kimchi: "깍두기",
          },
          snack: "크로플 & 아메리카노",
          latenight: {
            rice: "주먹밥",
            soup: "해물라면",
            main: "소세지야채볶음",
            side: "단무지",
            kimchi: "배추김치",
          },
        },
        4: {
          // 목요일
          breakfast: {
            rice: "토스트",
            soup: "양송이스프",
            main: "베이컨구이",
            side: "그린샐러드",
            kimchi: "피클",
          },
          lunch: {
            rice: "기장밥",
            soup: "근대국",
            main: "춘천닭갈비",
            side: "감자채볶음",
            kimchi: "쌈무",
          },
          dinner: {
            rice: "카레라이스",
            soup: "우동국물",
            main: "치킨너겟",
            side: "양배추샐러드",
            kimchi: "배추김치",
          },
          snack: "소보로빵 & 바나나우유",
          latenight: {
            rice: "쌀밥",
            soup: "설렁탕",
            main: "메밀전병",
            side: "오징어젓갈",
            kimchi: "깍두기",
          },
        },
        5: {
          // 금요일
          breakfast: {
            rice: "쌀밥",
            soup: "소고기무국",
            main: "계란말이",
            side: "진미채",
            kimchi: "배추김치",
          },
          lunch: {
            rice: "잡곡밥",
            soup: "육개장",
            main: "가자미구이",
            side: "잡채",
            kimchi: "배추김치",
          },
          dinner: {
            rice: "쌀밥",
            soup: "사골순대국",
            main: "수육보쌈",
            side: "야채스틱",
            kimchi: "보쌈김치",
          },
          snack: "국물떡볶이 & 김말이",
          latenight: {
            rice: "쌀밥",
            soup: "김치콩나물국",
            main: "돈육장조림",
            side: "김구이",
            kimchi: "깍두기",
          },
        },
        6: {
          // 토요일 (특식, 석식/야식 미운영)
          breakfast: {
            rice: "쌀밥",
            soup: "시금치국",
            main: "감자조림",
            side: "콩자반",
            kimchi: "배추김치",
          },
          lunch: {
            rice: "새우볶음밥",
            soup: "계란국",
            main: "짜장소스",
            side: "깐풍기",
            kimchi: "짜사이",
          },
          dinner: {
            rice: "-",
            soup: "-",
            main: "미운영",
            side: "-",
            kimchi: "-",
          },
          snack: "츄러스 & 초코우유",
          latenight: {
            rice: "-",
            soup: "-",
            main: "미운영",
            side: "-",
            kimchi: "-",
          },
        },
        0: {
          // 일요일 (휴무 - 데이터 없음)
          breakfast: {},
          lunch: {},
          dinner: {},
          snack: "",
          latenight: {},
        },
      };

      // 해당 요일의 메뉴 가져오기
      const dailyMenu = menuDB[dayIndex];

      return {
        day: dayName,
        date: `${month}/${dayNum}`,
        fullDate: date,
        isHoliday: dayIndex === 0, // 일요일 휴무
        breakfast: dailyMenu.breakfast,
        lunch: dailyMenu.lunch,
        dinner: dailyMenu.dinner,
        snack: dailyMenu.snack,
        latenight: dailyMenu.latenight,
      };
    });
    setWeeklyMenu(newWeeklyMenu);
  }, []);

  return (
    <div style={styles.container}>
      {/* 1. 헤더 (원본 디자인 유지) */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={styles.titleIcon}>
            <FaUtensils size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ margin: 0, color: COLORS.text, fontSize: "20px" }}>
              주간 식단표
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "13px",
                color: COLORS.subText,
              }}
            >
              맛있고 건강한 한 주를 책임집니다. (오늘: {todayStr})
            </p>
          </div>
        </div>
        <div style={styles.legend}>
          <LegendItem icon={<FaSun />} color={COLORS.lunch} label="중식 메인" />
          <LegendItem
            icon={<FaStar />}
            color={COLORS.latenight}
            label="야식 운영"
          />
        </div>
      </div>

      {/* 2. 식단 리스트 (수정됨: 세로 배치) */}
      <div style={styles.listContainer}>
        {weeklyMenu.map((menu, index) => (
          <DayCard key={index} menu={menu} isToday={index === 0} />
        ))}
      </div>
    </div>
  );
};

// --- [컴포넌트] 요일별 카드 ---
const DayCard = ({ menu, isToday }) => {
  if (menu.isHoliday) {
    return (
      <div style={{ ...styles.card, ...styles.holidayCard }}>
        <div style={styles.cardHeaderHoliday}>
          <span style={{ fontSize: "16px", color: COLORS.subText }}>
            {menu.date} ({menu.day})
          </span>
        </div>
        <div style={styles.holidayBody}>
          <FaCalendarCheck size={24} color="#ddd" />
          <span
            style={{
              marginLeft: "10px",
              fontSize: "14px",
              color: "#aaa",
              fontWeight: "bold",
            }}
          >
            휴무
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...styles.card,
        border: isToday ? `2px solid ${COLORS.primary}` : "1px solid #eee",
        boxShadow: isToday
          ? "0 4px 12px rgba(140, 133, 255, 0.2)"
          : "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      {/* 왼쪽 날짜 영역 (세로 배치에 맞게 변경) */}
      <div
        style={{
          ...styles.cardDateSection,
          backgroundColor: isToday ? COLORS.primary : "#F9FAFB",
          color: isToday ? "#fff" : COLORS.text,
        }}
      >
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>{menu.day}</div>
        <div style={{ fontSize: "12px", opacity: 0.8 }}>{menu.date}</div>
        {isToday && <span style={styles.todayBadge}>TODAY</span>}
      </div>

      {/* 오른쪽 식단 정보 영역 */}
      <div style={styles.cardBody}>
        <div style={styles.mealRow}>
          <MealItem
            title="조식"
            icon={<FaCloudSun />}
            color={COLORS.breakfast}
            data={menu.breakfast}
          />
          <MealItem
            title="중식"
            icon={<FaSun />}
            color={COLORS.lunch}
            data={menu.lunch}
            isMainMeal
          />
          <MealItem
            title="석식"
            icon={<FaMoon />}
            color={COLORS.dinner}
            data={menu.dinner}
          />
          <MealItem
            title="야식"
            icon={<FaStar />}
            color={COLORS.latenight}
            data={menu.latenight}
          />
        </div>

        {/* 간식 영역 (요청: 넓지 않게 -> 높이를 줄여서 컴팩트하게) */}
        <div style={styles.snackRow}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FaCoffee color={COLORS.snack} size={14} />
            <span
              style={{ fontSize: "12px", fontWeight: "bold", color: "#666" }}
            >
              간식
            </span>
          </div>
          <span
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#333",
              marginLeft: "10px",
            }}
          >
            {menu.snack}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- [컴포넌트] 식사 항목 ---
const MealItem = ({ title, icon, color, data, isMainMeal }) => {
  // 토요일 석식/야식 미운영 처리 (데이터가 있는지 확인)
  const isClosed = data.main === "미운영";

  return (
    <div style={styles.mealItem}>
      {/* 타이틀 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          marginBottom: "6px",
        }}
      >
        <span style={{ color: isClosed ? "#ddd" : color, fontSize: "14px" }}>
          {icon}
        </span>
        <span
          style={{
            fontSize: "12px",
            fontWeight: "bold",
            color: isClosed ? "#ddd" : "#666",
          }}
        >
          {title}
        </span>
      </div>

      {/* 메뉴 내용 (요청: 세로 정렬 -> 줄바꿈 처리) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <div
          style={{
            fontSize: isMainMeal ? "14px" : "13px",
            fontWeight: "bold",
            color: isClosed ? "#aaa" : isMainMeal ? COLORS.text : "#444",
          }}
        >
          {data.main}
        </div>
        {/* 부메뉴들도 세로로 쌓이게 처리 */}
        {!isClosed && (
          <div
            style={{
              fontSize: "12px",
              color: COLORS.subText,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>{data.soup}</span>
            <span>{data.rice}</span>
            {data.side && <span>{data.side}</span>}
            {data.kimchi && <span>{data.kimchi}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

const LegendItem = ({ icon, color, label }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "11px",
      color: "#666",
    }}
  >
    <span style={{ color: color }}>{icon}</span> {label}
  </div>
);

// --- 스타일 ---
const styles = {
  container: {
    padding: "20px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  titleIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: COLORS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(140, 133, 255, 0.3)",
  },
  legend: { display: "flex", gap: "15px" },

  // [수정됨] 가로 Grid -> 세로 List 컨테이너
  listContainer: {
    display: "flex",
    flexDirection: "column", // 세로 배치
    gap: "15px",
  },

  // 카드 스타일
  card: {
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    overflow: "hidden",
    display: "flex", // 좌우 배치 (날짜 | 메뉴들)
    minHeight: "120px",
  },
  holidayCard: {
    backgroundColor: "#f9f9f9",
    border: "1px dashed #ddd",
    minHeight: "60px",
    alignItems: "center",
    padding: "0 20px",
    flexDirection: "row",
  },
  holidayBody: {
    display: "flex",
    alignItems: "center",
    marginLeft: "20px",
  },

  // 날짜 영역 (왼쪽)
  cardDateSection: {
    width: "80px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRight: "1px solid #eee",
    padding: "10px",
    flexShrink: 0,
  },
  todayBadge: {
    marginTop: "6px",
    fontSize: "10px",
    fontWeight: "bold",
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: "2px 6px",
    borderRadius: "8px",
  },

  // 메뉴 영역 (오른쪽)
  cardBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  // 식사 줄 (조식, 중식, 석식, 야식)
  mealRow: {
    display: "flex",
    flex: 1,
    borderBottom: "1px solid #f5f5f5",
  },
  mealItem: {
    flex: 1, // 공간 균등 분할
    padding: "15px 10px",
    borderRight: "1px solid #f5f5f5",
  },

  // 간식 줄 (하단 컴팩트하게)
  snackRow: {
    padding: "8px 15px",
    backgroundColor: "#fafafa",
    display: "flex",
    alignItems: "center",
  },
};

export default CafeteriaMenu;
