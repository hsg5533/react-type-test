import React from "react";
import ChildComponent from "./ChildComponent";
import CountDown from "./CountDown";

// 부모 컴포넌트
/**
 * React.memo를 사용하면 부모컴포넌트가 변경될 때
 * 자식컴포넌트에 대한 props나 state변경이 없다면
 * 컴포넌트를 랜더링하지 않음
 * */
const ParentComponent = React.memo(() => {
  console.log("ParentComponent rendering");
  const [count, setCount] = React.useState(0);

  // useCallback을 사용하여 함수 메모이제이션
  const handleClick: React.MouseEventHandler<HTMLButtonElement> =
    React.useCallback(() => {
      console.log("Button clicked!");
      // 여기서 상태를 업데이트하거나 다른 작업 수행
      setCount((prevCount) => prevCount + 1);
    }, []); // 빈 배열: 콜백 함수는 항상 동일하므로 의존성 배열이 필요하지 않음

  return (
    <div>
      <h1>Count: {count}</h1>
      {/* memo를 사용하여 자식 컴포넌트 감싸기 */}
      <ChildComponent onClick={handleClick} />
      <CountDown
        targetTime={new Date().toString()}
        expiredMsg={"마감되었습니다"}
        addTime={1}
        addTimeType={"hours"}
      />
    </div>
  );
});

export default ParentComponent;
