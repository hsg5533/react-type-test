import React, { useState, useEffect } from "react";

const TimeComponent = React.memo(({ props }: { props: string }) => {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    setValue(props);
  }, [props]);

  return (
    <div>
      <p style={{ fontSize: 18, color: "#ff0000" }}>
        현재시간을 알려주는 컴포넌트입니다.
      </p>
      <p>{"현재시간은 " + value + " 입니다"}</p>
    </div>
  );
});

export default TimeComponent;
