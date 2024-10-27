import { baseUrl } from "./endpoint";
import { ApiExceptionError } from "./error";
import { RequestMethod } from "./type";

export function getCurrentPosition() {
  return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
}

export function calculateTimeParts(time: number) {
  const day = Math.floor(time / 1000 / 60 / 60 / 24);
  const hour = Math.floor((time / 1000 / 60 / 60) % 24);
  const minute = Math.floor((time / 1000 / 60) % 60);
  const second = Math.floor((time / 1000) % 60);
  const dayString = day > 0 ? `${day}일 ` : "";
  const hourString = hour > 0 ? `${hour}시간 ` : "";
  const minuteString = minute > 0 ? `${minute}분 ` : "";
  const secondString = second > 0 ? `${second}초 ` : "";
  return `${dayString}${hourString}${minuteString}${secondString}`.trim();
}

export function serialize(obj: Record<string, any> = {}) {
  const str: string[] = [];
  for (let p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  }
  return str.join("&");
}

export function getCookie(cookieName: string) {
  const cookies = document.cookie.split(";");
  for (var i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    const cookieParts = cookie.split("=");
    const name = cookieParts[0];
    const value = cookieParts.slice(1).join("=");
    if (name === cookieName) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export async function request(
  url: string,
  query: object = {},
  params: object = {},
  method: RequestMethod = "GET"
) {
  try {
    const response = await fetch(`${baseUrl}${url}?${serialize(query)}`, {
      method: method,
      headers: {
        Referer: baseUrl,
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken") || "",
      },
      credentials: "include",
      body: method === "GET" ? null : JSON.stringify(params),
    });
    return await response.json();
  } catch (err) {
    if (err instanceof Error) {
      throw new ApiExceptionError(err.message);
    }
  }
}

/**
 * 주어진 함수에 지연 실행 기능을 추가하는 debounce 함수입니다.
 * debounce 함수는 특정 시간 동안 계속 호출되는 함수가 있더라도, 그 함수가 여러 번 호출되는 것을 방지하고,
 * 일정 시간(`wait`) 동안 추가 호출이 없을 때까지 주어진 함수(`func`)의 실행을 지연시킵니다.
 * 마지막으로 호출된 시점에서 특정 시간 이후에 실행되도록 합니다.
 *
 * @template T 지연시킬 함수의 타입
 * @param func 지연 실행할 함수
 * @param wait 지연 시간 (밀리초)
 * @returns 지연된 함수와 함께 cancel 및 flush 메서드를 제공합니다.
 * @example
 * const debouncedFunction = debounce(() => console.log("실행"), 300);
 * debouncedFunction();
 */
export function debouncePress<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 250
) {
  let lastArgs: any, result: any; // 마지막 호출의 인자, 결과값 저장
  let lastCallTime: number | undefined; // 마지막 호출 시간을 기록
  let timerId: NodeJS.Timeout | undefined; // 타이머 ID 저장
  // 전달된 func 가 함수가 아니면 TypeError 를 발생시킵니다.
  if (typeof func !== "function") {
    throw new TypeError("Expected a function");
  }
  // 주어진 시간이 지나면 호출을 허용할지 여부를 결정하는 함수
  const shouldInvoke = (time: number) => {
    const timeSinceLastCall = time - (lastCallTime || 0); // 마지막 호출 후 경과 시간 계산
    // 처음 호출하거나, 지정된 시간(wait)이 지났거나, 시간이 음수가 되면 true 반환
    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0
    );
  };
  // 타이머가 만료되었을 때 실행되는 함수
  const timerExpired = () => {
    const time = Date.now(); // 현재 시간
    // 지정된 시간이 지났으면 함수를 실제로 호출
    if (shouldInvoke(time)) {
      timerId = undefined; // 타이머를 해제
      if (lastArgs) {
        const args = lastArgs; // 마지막 인자를 저장
        lastArgs = undefined; // 인자를 초기화
        result = func.apply(undefined, args); // 전달된 함수(func)를 호출하고 그 결과를 result 에 저장
        return result;
      }
      lastArgs = undefined; // 인자를 초기화
      return result;
    }
    // 아직 시간이 남았으면 다시 타이머를 설정해 남은 시간 동안 대기
    timerId = setTimeout(timerExpired, wait - (time - (lastCallTime || 0)));
  };
  wait = +wait || 0; // 대기 시간을 숫자로 변환하거나 기본값을 0으로 설정
  // 최종적으로 반환할 화살표 함수 (디바운스된 함수)
  return (...args: Parameters<T>): ReturnType<T> => {
    const time = Date.now(); // 현재 시간
    const isInvoking = shouldInvoke(time); // 이번 호출이 실행 가능한지 확인
    lastArgs = args; // 호출된 인자를 저장
    lastCallTime = time; // 마지막 호출 시간 기록
    // 호출이 가능하다면 타이머를 설정하고 함수를 대기시킵니다.
    if (isInvoking && timerId === undefined) {
      timerId = setTimeout(timerExpired, wait); // 지정된 시간이 지나면 함수가 실행되도록 타이머 설정
      return result; // 아직 실행되지 않았으므로 이전 결과 반환
    }
    // 타이머가 없다면 새로 설정 (이미 실행 중일 때는 타이머가 설정되지 않음)
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result; // 이전에 실행된 결과를 반환
  };
}

/**
 * 객체인지 여부를 확인하는 함수
 * @param obj 확인할 값
 * @returns 주어진 값이 객체이면 true, 아니면 false
 * @example
 * isObject({}) // true
 * isObject([]) // false
 * isObject(null) // false
 */
export function isObject<T extends { [key: string]: any }>(obj: T): boolean {
  return obj !== null && typeof obj === "object" && !Array.isArray(obj);
}

/**
 * 상태 변화 감지 함수: 이전 상태(prev)와 현재 상태(current)를 비교하여 변화를 반환함
 * @param prev 이전 상태 객체
 * @param current 현재 상태 객체
 * @returns 변경된 속성만 포함된 객체
 * @example
 * const prevState = { name: 'John', age: 30, hobbies: ['reading', 'gaming'] };
 * const currentState = { name: 'John', age: 31, hobbies: ['reading', 'traveling'] };
 * stateChanged(prevState, currentState)
 * // { age: 31, hobbies: ['reading', 'traveling'] }
 */
export function stateChanged<T extends { [key: string]: any }>(
  prev: T,
  current: T
) {
  const changes = {} as Partial<T>;
  Object.keys(current).forEach((key) => {
    const typedKey = key as keyof T;
    const prevValue = prev[typedKey];
    const currentValue = current[typedKey];
    // 두 값이 배열일 경우 배열 요소를 비교
    if (Array.isArray(prevValue) && Array.isArray(currentValue)) {
      const arrayChanges: any[] = [];
      // 배열 길이가 다른 경우, 바로 변경된 배열로 기록
      if (prevValue.length !== currentValue.length) {
        changes[typedKey] = currentValue;
      } else {
        // 배열의 각 요소를 순회하며 객체일 경우 stateChanged로 재귀적으로 비교
        prevValue.forEach((prevItem: any, index: number) => {
          const currentItem = currentValue[index];
          if (isObject(prevItem) && isObject(currentItem)) {
            // 배열 내부 객체를 깊이 비교
            const itemChanges = stateChanged(prevItem, currentItem);
            if (Object.keys(itemChanges).length > 0) {
              arrayChanges[index] = itemChanges;
            }
          } else if (prevItem !== currentItem) {
            // 객체가 아닐 경우 단순 값 비교
            arrayChanges[index] = currentItem; // 변경된 값만 반영
          } else {
            arrayChanges[index] = prevItem; // 변경되지 않은 값 유지
          }
        });
        // 변경된 내용이 있으면 changes에 기록
        if (arrayChanges.length > 0) {
          changes[typedKey] = arrayChanges as T[keyof T];
        }
      }
    }
    // 두 값이 객체일 경우 객체 내부를 비교
    else if (isObject(prevValue) && isObject(currentValue)) {
      const nestedChanges = stateChanged(prevValue, currentValue);
      if (Object.keys(nestedChanges).length > 0) {
        changes[typedKey] = nestedChanges as T[keyof T];
      }
    }
    // 기본 값이 다를 경우 변화 기록
    else if (currentValue !== prevValue) {
      changes[typedKey] = currentValue;
    }
  });
  return changes;
}
