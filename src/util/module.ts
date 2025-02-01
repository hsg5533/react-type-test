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
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number = 250
) {
  let timer: NodeJS.Timeout; // 타이머 ID 저장
  let result: ReturnType<T>; // 마지막 결과값 저장
  return (...param: Parameters<T>) => {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      result = func(...param); // 전달된 함수(func)를 호출하고 그 결과를 result 에 저장
    }, wait);
    return result; // 실행된 결과를 반환
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

export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  delay: number
) {
  let last = 0;
  let timer: NodeJS.Timeout;
  let result: ReturnType<T>;
  return (...param: Parameters<T>) => {
    const now = Date.now();
    const wait = delay - (now - last);
    if (wait <= 0) {
      last = now;
      result = func(...param);
      timer && clearTimeout(timer);
      return result;
    }
    if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        result = func(...param);
      }, wait);
    }
    return result;
  };
}
