import React from "react";
import dayjs, { ManipulateType } from "dayjs";
import { calculateTimeParts, debounce, stateChanged, throttle } from "./module";
import { PromiseCreator, UseRequestReturnType } from "./type";

export function useDebounced(
  callback: () => void,
  delay: number,
  deps: number
) {
  const savedCallback = React.useRef<() => void>();
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  React.useEffect(() => {
    const timer = setTimeout(
      () => savedCallback.current && savedCallback.current(),
      delay
    );
    return () => clearTimeout(timer);
  }, [delay, deps]);
}

export function useInterval(callback: () => void, delay: number) {
  const savedCallback = React.useRef<() => void>();
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  React.useEffect(() => {
    if (delay !== null) {
      const tick = setInterval(
        () => savedCallback.current && savedCallback.current(),
        delay
      );
      return () => clearInterval(tick);
    }
  }, [delay]);
}

export function useDelay(callback: () => void, delay: number) {
  const delayRef = React.useRef<number>();
  const callbackRef = React.useRef<() => void>();
  const timerIdRef = React.useRef<NodeJS.Timeout>();
  React.useEffect(() => {
    return () => timerIdRef.current && clearTimeout(timerIdRef.current);
  }, []);
  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  React.useEffect(() => {
    delayRef.current = delay;
  }, [delay]);
  return () => {
    timerIdRef.current && clearTimeout(timerIdRef.current);
    timerIdRef.current = setTimeout(
      () => callbackRef.current && callbackRef.current(),
      delayRef.current
    );
  };
}

export function useTimeout(callback: () => void, delay: number) {
  const callbackRef = React.useRef<() => void>();
  const timerIdRef = React.useRef<NodeJS.Timeout>();
  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  React.useEffect(() => {
    timerIdRef.current && clearTimeout(timerIdRef.current);
    timerIdRef.current = setTimeout(
      () => callbackRef.current && callbackRef.current(),
      delay
    );
    return () => timerIdRef.current && clearTimeout(timerIdRef.current);
  }, [delay]);
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  wait: number
) {
  // debounce된 함수를 저장할 ref
  const throttledCallback = React.useRef(throttle(callback, wait));
  // debouncedCallback의 current를 반환 (메모이제이션)
  return React.useCallback(throttledCallback.current, [
    throttledCallback.current,
  ]);
}

export function useModal(
  duration: number,
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
) {
  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration, setVisible]);
}

export function useCountDown(
  targetTime: string,
  expiredMsg: string,
  addTime: number,
  addTimeType: ManipulateType
) {
  const targetDate = dayjs(targetTime).add(addTime, addTimeType);
  const [isExpired, setIsExpired] = React.useState(false);
  const [remainingTime, setRemainingTime] = React.useState(0);
  useInterval(() => {
    const timeDifference = targetDate.diff(dayjs());
    timeDifference <= 0 ? setIsExpired(true) : setRemainingTime(timeDifference);
  }, 1000);
  return isExpired ? expiredMsg : calculateTimeParts(remainingTime);
}

export function useDateCountDown(
  targetTime: string,
  expiredMsg: string,
  addTime: number,
  addTimeType: "hours" | "minutes" | "seconds"
) {
  const targetDate = new Date(targetTime);
  const [isExpired, setIsExpired] = React.useState(false);
  const [remainingTime, setRemainingTime] = React.useState(0);
  addTimeType === "hours"
    ? targetDate.setHours(targetDate.getHours() + addTime)
    : addTimeType === "minutes"
    ? targetDate.setMinutes(targetDate.getMinutes() + addTime)
    : targetDate.setSeconds(targetDate.getSeconds() + addTime);
  useInterval(() => {
    const currentTime = new Date();
    const timeDifference = targetDate.getTime() - currentTime.getTime();
    timeDifference <= 0 ? setIsExpired(true) : setRemainingTime(timeDifference);
  }, 1000);
  return isExpired ? expiredMsg : calculateTimeParts(remainingTime);
}

export function useRequest<T, K extends any[]>(
  promiseCreator: PromiseCreator<T, K>
): UseRequestReturnType<T, K> {
  const [loading, setLoading] = React.useState(true); // 로딩 상태를 관리
  const [data, setData] = React.useState<T | null>(null); // 요청 결과 데이터를 관리
  const [error, setError] = React.useState<Error | null>(null); // 에러 상태를 관리
  const onRequest = React.useCallback(async (...params: K) => {
    try {
      const response = await promiseCreator(...params); // promiseCreator를 사용해 데이터 요청
      setData(response); // 요청 결과 데이터를 상태에 저장
    } catch (err) {
      if (err instanceof Error) {
        setError(err); // 에러 발생 시 에러 상태에 저장
      }
    } finally {
      setLoading(false); // 로딩 종료
    }
  }, []);
  const onReset = React.useCallback(() => {
    setLoading(false); // 로딩 상태 초기화
    setData(null); // 데이터 초기화
    setError(null); // 에러 상태 초기화
  }, []);
  return [onRequest, loading, data, error, onReset]; // 훅에서 요청 함수와 상태값들을 반환
}

/**
 * 함수에 debounce 기능을 추가한 커스텀 훅입니다.
 * @param callback 지연 실행할 함수
 * @param wait 지연 시간 (밀리초)
 * @returns debounce된 함수
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  wait: number
) {
  // debounce된 함수를 저장할 ref
  const debouncedCallback = React.useRef(debounce(callback, wait));
  // debouncedCallback의 current를 반환 (메모이제이션)
  return React.useCallback(debouncedCallback.current, [
    debouncedCallback.current,
  ]);
}

export function useStateChanged<T extends { [key: string]: any }>(current: T) {
  const prevRef = React.useRef<Partial<T>>({}); // 이전 상태값
  const changed = React.useRef<Partial<T>>({}); // 변경된 상태값
  React.useEffect(() => {
    // 이전 값이 없으면 최초 작성으로 간주하여 변경점을 감지하지 않도록 함
    if (Object.keys(prevRef.current).length > 0) {
      changed.current = stateChanged(prevRef.current, current);
    }
  }, [current]);
  return { prevRef, changed };
}
