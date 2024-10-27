import React from "react";
import { ManipulateType } from "dayjs";
import { useCountDown } from "../util/hook";

interface countDownType {
  targetTime: string;
  expiredMsg: string;
  addTime: number;
  addTimeType: ManipulateType;
}

export default function CountDown({
  targetTime,
  expiredMsg,
  addTime,
  addTimeType,
}: countDownType) {
  const targetDate = useCountDown(targetTime, expiredMsg, addTime, addTimeType);
  return <p>{targetDate}</p>;
}
