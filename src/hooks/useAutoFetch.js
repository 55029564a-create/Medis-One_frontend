import { useState, useEffect, useCallback } from "react";

/**
 * @param {Function} fetchFunction 데이터를 가져오는 비동기 함수
 * @param {number} intervalMs 자동 갱신 간격 (ms). 0 또는 null이면 자동 갱신 안 함.
 * @param {Array} dependencies 데이터 갱신에 필요한 의존성 배열 (예: 검색어, 페이지 번호)
 */
const useAutoFetch = (fetchFunction, intervalMs = 0, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 데이터 가져오기 함수 (수동 호출 가능)
  const fetchData = useCallback(async () => {
    try {
      // loading 처리는 상황에 따라 다를 수 있음 (백그라운드 갱신 시 로딩 스피너 안 보이게 하려면 주석 처리)
      // setLoading(true);
      const result = await fetchFunction();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]); // dependencies는 fetchFunction 내부에서 처리하거나 상위에서 useCallback으로 감싸야 함

  // 1. 초기 마운트 및 의존성 변경 시 실행
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  // 2. 자동 갱신 타이머 설정 (intervalMs가 있을 때만)
  useEffect(() => {
    if (!intervalMs || intervalMs <= 0) return; // 간격이 없으면 자동 갱신 안 함

    const interval = setInterval(() => {
      fetchData();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [fetchData, intervalMs]);

  return { data, loading, error, lastUpdated, refresh: fetchData };
};

export default useAutoFetch;
