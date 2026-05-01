# Medis-One

디스플레이 패널 모듈 조립 공정 통합 관리 MES-WEB 시스템입니다.  
생산, 자재, 재고, 품질, 설비 데이터를 통합 관리하고, LOT 기반 제조 이력 추적과 실시간 대시보드를 제공하는 제조 공정 관리 솔루션입니다.

제조 현장의 생산 흐름과 작업자/관리자 업무 구조를 바탕으로, 실제 공정관리 업무에서 필요한 데이터 흐름을 웹 시스템으로 구현하는 데 중점을 두었습니다.

## 담당 역할

Frontend Lead / Full Stack / MES 도메인 흐름 설계

- 제조 현장 경험을 바탕으로 MES 업무 흐름 분석 및 화면 구조 설계
- 생산, 자재, 재고, 품질, 설비, LOT 추적 흐름을 사용자 관점에서 정리
- 관리자와 작업자 역할에 따른 화면 동선 및 기능 흐름 구성
- 공정 흐름에 맞춘 메뉴 구조, 페이지 구성, 사용자 시나리오 정리
- React 기반 프론트엔드 환경 구축 및 공통 레이아웃 설계
- 사이드바, 헤더, 공통 컴포넌트 등 UI 시스템 구성
- 자재 입출고, 재고 현황, 생산 관리, 품질 관리, LOT 추적 화면 구현
- Spring Boot 백엔드 API와 프론트엔드 화면 기능 연결
- Axios 기반 데이터 조회, 등록, 수정 흐름 연동
- 실제 시연 흐름에 맞춰 데이터 표시 방식 및 화면 이동 구조 정리
- 최종 시연 발표 담당 및 MES 업무 흐름 설명

## Tech Stack

- Frontend: React, JavaScript, Axios
- Backend: Spring Boot, Java, Spring Security
- Database: MySQL
- Middleware / Collector: C#
- Tools: Git, GitHub, Figma, Notion, Swagger

## 주요 기능

### 1. 통합 대시보드

- 생산 현황, 설비 가동률, 불량률 등 핵심 KPI 시각화
- 공장 전체 상태를 한눈에 확인할 수 있는 관리자 관제 화면 구성
- 실시간 모니터링 기반 의사결정 지원

### 2. 자재 입출고 관리

- 자재 입고 및 출고 등록
- 자재 LOT 기반 이력 관리
- 생산 투입에 필요한 자재 흐름 추적
- 입출고 내역 조회 UI 제공

### 3. 재고 관리

- 현재 재고 현황 조회
- 재고 변동 이력 확인
- 자재 흐름과 생산 투입 상태를 함께 파악할 수 있도록 구성

### 4. 생산 관리

- 생산 계획 및 작업 지시 관리
- 작업 지시서 기반 생산 진행 상태 확인
- 생산 실적 및 불량 수량 확인

### 5. 품질 관리

- 공정별 불량 데이터 관리
- 불량 유형 및 원인 분석 화면 구성
- 신뢰성 테스트 및 품질 이력 관리

### 6. LOT 추적

- 원자재 LOT부터 완제품 S/N까지 제조 이력 추적
- 생산 공정, 작업자, 설비, 자재 정보를 연결하여 추적성 확보
- 품질 이슈 발생 시 원인 추적이 가능하도록 화면 구성

## 프로젝트에서 중점적으로 해결한 문제

### 제조 현장 흐름을 반영한 MES 화면 구성

MES 시스템은 단순히 데이터를 등록하고 조회하는 화면이 아니라, 현장에서 실제로 발생하는 생산 지시, 자재 투입, 작업 실적, 불량 발생, 재고 변동, LOT 추적 흐름이 자연스럽게 연결되어야 합니다. 제조 현장에서의 공정관리 경험을 바탕으로 관리자와 작업자가 어떤 순서로 시스템을 사용해야 하는지 정리하고, 그 흐름에 맞춰 화면 구조와 메뉴 구성을 설계했습니다.

### 관리자와 작업자 관점 분리

관리자는 공장 전체 현황, 생산 계획, 품질 이슈, 자재 흐름을 빠르게 파악해야 하고, 작업자는 작업 지시 확인과 실적 등록에 집중해야 합니다. 두 사용자의 목적이 다르기 때문에 역할별 화면 흐름을 분리하고, 각 사용자에게 필요한 정보가 우선적으로 보이도록 구성했습니다.

### LOT 기반 제조 이력 추적 흐름 이해 및 구현

의료용 디스플레이 제조 공정에서는 원자재 LOT부터 완제품 S/N까지 이어지는 추적성이 중요합니다. 자재 입고, 생산 투입, 생산 실적, 완제품 출하 흐름을 하나의 제조 이력으로 연결해 볼 수 있도록 LOT 추적 화면을 구성했습니다.

### 백엔드 API 연동 기반 실제 업무 데이터 표시

정적인 화면 구현에 그치지 않고 Spring Boot 백엔드 API와 프론트엔드 화면을 연결하여 생산, 자재, 재고, 품질 데이터를 조회하고 표시했습니다. Axios를 활용해 데이터 조회와 등록 흐름을 연동하고, 시연 과정에서 실제 MES 업무 흐름이 자연스럽게 보이도록 화면과 데이터를 정리했습니다.

## 프로젝트를 통해 배운 점

- 제조 시스템에서는 화면 디자인보다 업무 흐름과 데이터 연결 구조가 중요하다는 점을 배웠습니다.
- MES의 핵심인 생산, 자재, 품질, 설비, LOT 추적 흐름을 프로젝트를 통해 이해했습니다.
- React 기반 업무 시스템에서 공통 레이아웃과 컴포넌트 구조를 설계하는 경험을 했습니다.
- 제조 현장 경험을 바탕으로 실제 작업자와 관리자가 어떤 정보를 필요로 하는지 고려하며 화면을 구성할 수 있었습니다.

## Related Repositories

| 구분 | 저장소 |
|---|---|
| Frontend | 현재 저장소 |
| Backend | [Medis-One_backend](https://github.com/55029564a-create/Medis-One_backend) |
| Collector | [Medis-One_collector](https://github.com/55029564a-create/Medis-One_collector) |
| Machine | [Medis-One_machine](https://github.com/55029564a-create/Medis-One_machine) |

---

# 🚀 프로젝트 로컬 환경 세팅 가이드

> 진행 환경: VS Code 터미널 / Command Prompt 기준

## 🎨 1. 프론트엔드

### 1. 레포지토리 클론

```bash
git clone https://github.com/55029564a-create/Medis-One_frontend.git
```

### 2. 프로젝트 폴더로 이동

```bash
cd Medis-One_frontend
```

### 3. 패키지 설치

```bash
npm install
```

### 4. 프로젝트 실행

```bash
npm start
```

또는 Vite 기반 프로젝트인 경우:

```bash
npm run dev
```

---

## ⚙️ 2. 백엔드

### 1. 레포지토리 클론

```bash
git clone https://github.com/55029564a-create/Medis-One_backend.git
```

### 2. 프로젝트 폴더로 이동

```bash
cd Medis-One_backend
```

### 3. 프로젝트 실행

Spring Boot 프로젝트 실행 방식에 맞게 실행합니다.

```bash
# Windows
gradlew bootRun

# macOS / Linux
./gradlew bootRun
```

또는 IDE에서 `Application` 파일을 실행합니다.

---

## 🗄️ 3. 데이터베이스

- MySQL 사용
- 생산, 자재, 재고, 품질, 설비, LOT 추적 데이터 관리
- 프로젝트 실행 전 DB 계정 및 테이블 세팅이 필요합니다.

---

## ⚙️ 4. Collector / Machine

### Collector

```bash
git clone https://github.com/55029564a-create/Medis-One_collector.git
```

### Machine

```bash
git clone https://github.com/55029564a-create/Medis-One_machine.git
```

C# 기반 수집기 및 설비 시뮬레이션 관련 프로젝트입니다.  
설비 데이터 수집 및 MES 시스템 연동 흐름을 확인하는 용도로 사용합니다.
