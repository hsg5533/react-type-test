import React, { useState } from "react";
import CommonColor from "../util/color";
import { useInterval } from "../util/hook";

export default function LeftArrow() {
  const [isVisible, setIsVisible] = useState(true);

  useInterval(() => {
    setIsVisible((prev) => !prev);
  }, 500);

  return (
    <div style={{ backgroundColor: "transparent" }}>
      <p
        style={{
          fontSize: 22,
          color: isVisible ? CommonColor.errandRed : CommonColor.lightGray3,
        }}
      >
        ←
      </p>
    </div>
  );
}
