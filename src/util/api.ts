import { getPosts } from "./endpoint";
import { request } from "./module";

export async function getPostList() {
  return await request(getPosts); // 엔드포인트에서 포스트 리스트를 가져옴
}
