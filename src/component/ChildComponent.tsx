import React from "react";

// 자식 컴포넌트
const ChildComponent = React.memo(
  ({
    onClick,
  }: {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  }) => {
    console.log("ChildComponent rendering");
    return <button onClick={onClick}>Click me (ChildComponent)</button>;
  }
);

export default ChildComponent;
