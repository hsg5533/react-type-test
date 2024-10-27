import React, { useEffect } from "react";
import { getPostList } from "../util/api";
import { useRequest } from "../util/hook";

export default function ArchiveContainer() {
  const [onRequest, loading, data, error] = useRequest(getPostList);

  useEffect(() => {
    onRequest(); // 컴포넌트가 마운트될 때 피드 데이터를 요청
  }, [onRequest]);

  if (loading) {
    // 로딩 상태일 때 로딩 메시지를 렌더링
    return <div>Loading...</div>;
  }

  if (error) {
    // 에러가 발생하면 에러를 던짐
    <div>{error.message}</div>;
  }

  if (!data) {
    // 데이터가 없을 경우 대체 메시지를 렌더링
    return <div>No data available</div>;
  }

  return <div>{JSON.stringify(data)}</div>;
}
