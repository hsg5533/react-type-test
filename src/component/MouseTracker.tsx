import React, { useState, useEffect } from "react";
import { useThrottle } from "../util/hook";

const MouseTracker: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // 마우스 움직임을 처리하는 함수
  const handleMouseMove = useThrottle((event: MouseEvent) => {
    setPosition({ x: event.clientX, y: event.clientY });
  }, 5000);

  useEffect(() => {
    // 이벤트 리스너 등록
    window.addEventListener("mousemove", handleMouseMove);

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <div style={{ height: "100vh", textAlign: "center", paddingTop: "20px" }}>
      <h1>Mouse Tracker</h1>
      <p>
        X: {position.x}, Y: {position.y}
      </p>
    </div>
  );
};

export default MouseTracker;
