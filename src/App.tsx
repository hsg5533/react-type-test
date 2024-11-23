import React, { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko"; // 한국어 가져오기
import "./App.css";

import {
  useDebounce,
  useDebounced,
  useDelay,
  useInterval,
  useModal,
  useThrottle,
  useTimeout,
} from "./util/hook";

import LeftArrow from "./component/LeftArrow";
import RightArrow from "./component/RightArrow";
import ArchiveContainer from "./component/ArchiveContainer";
import SignUpForm from "./component/SignUpForm";
import MouseTracker from "./component/MouseTracker";

dayjs.extend(relativeTime);
dayjs.locale("ko");

export default function App() {
  const [value, setValue] = useState(0);
  const [debounced, setDebounced] = useState(0);
  const [newTitle, setNewTitle] = useState("");
  const [targetIdx, setTargetIdx] = useState(0);
  const [modalFlag, setModalFlag] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(
    dayjs().format("YYYY년 MM월 DD일 dd A hh시 mm분 ss초 SSS")
  );
  const [post, setPost] = React.useState([
    {
      title: "한강 피크닉",
      date: dayjs().format("YYYY-MM-DD dd A hh:mm:ss"),
      like: 0,
    },
    {
      title: "영종도 바다뷰 카페 추천!",
      date: dayjs().format("YYYY-MM-DD dd A hh:mm:ss"),
      like: 0,
    },
    {
      title: "스타벅스 신메뉴 먹어보기",
      date: dayjs().format("YYYY-MM-DD dd A hh:mm:ss"),
      like: 0,
    },
    {
      title: "강남 타코 맛집",
      date: dayjs().format("YYYY-MM-DD dd A hh:mm:ss"),
      like: 0,
    },
  ]);

  useModal(1000, setModalVisible);

  useInterval(() => {
    setDate(dayjs().format("YYYY년 MM월 DD일 dd A hh시 mm분 ss초 SSS"));
  }, 1);

  useDebounced(() => setDebounced(value), 1000, value);

  useTimeout(() => alert("useTimeout"), 3000);

  const test = useDelay(() => {
    console.log("useDelay 작동");
  }, 500);

  const requestSomething = () => {
    console.log("콜백함수 호출");
  };

  const throttleHandler = useThrottle(() => {
    console.log("스크롤 이벤트");
    requestSomething();
  }, 500);

  const debounceHandler = useDebounce(() => {
    console.log("debounce test");
  }, 500);

  React.useEffect(() => {
    window.onbeforeunload = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener("scroll", throttleHandler);
    return () => {
      window.removeEventListener("scroll", throttleHandler);
    };
  }, [throttleHandler]);

  return (
    <div className="App" style={{ height: "1000vh" }}>
      <header>
        <h1 className="logo">Sypear Blog</h1>
      </header>
      <main>
        <div className="post-wrapper">
          {post.map((item, idx) => {
            return (
              <article className="post" key={idx}>
                <h1
                  className="post-title"
                  onClick={() => {
                    if (targetIdx !== idx) {
                      setTargetIdx(idx);
                      setModalFlag(true);
                    } else {
                      setModalFlag(!modalFlag);
                    }
                  }}
                >
                  {item.title}
                </h1>
                <span className="post-date">{item.date}</span>
                <span
                  className="post-like white-button"
                  onClick={() => {
                    const copyPost = [...post];
                    copyPost[idx].like++;
                    setPost(copyPost);
                  }}
                >
                  ❤️ LIKE <strong>{item.like}</strong>
                </span>
                <button
                  type="button"
                  className="post-delete-button black-button"
                  onClick={() => {
                    const copyPost = [...post];
                    copyPost.splice(idx, 1);
                    setPost(copyPost);
                    setModalFlag(false);
                  }}
                >
                  삭제
                </button>
              </article>
            );
          })}
        </div>
        <div className="post-manage-wrapper">
          <div className="post-manage">
            <input
              className="input-title"
              type="text"
              placeholder="등록할 글 제목을 입력해주세요."
              onChange={(e) => {
                setNewTitle(e.target.value);
              }}
              value={newTitle}
            ></input>
            <button
              className="black-button"
              onClick={() => {
                const copyPost = [...post];
                copyPost.unshift({
                  title: newTitle,
                  date: dayjs().format("YYYY-MM-DD dd A hh:mm:ss"),
                  like: 0,
                });
                setPost(copyPost);
                setNewTitle("");
              }}
            >
              등록
            </button>
          </div>
          <button
            className="white-button"
            onClick={() => {
              const copyPost = [...post];
              copyPost.sort((a, b) => {
                return a.title > b.title ? 1 : -1;
              });
              setPost(copyPost);
            }}
          >
            가나다순 정렬
          </button>
        </div>
        {modalFlag === true ? (
          <div className="content-wrapper">
            <article className="content">
              <h1 className="content-title">{post[targetIdx].title}</h1>
              <span className="content-date">{post[targetIdx].date}</span>
            </article>
          </div>
        ) : null}
        value값:{value} debounce값:{debounced}
        <br />
        <button
          style={{ marginRight: 5 }}
          onClick={() => {
            setValue(value + 1);
          }}
        >
          +1
        </button>
        <button
          style={{ marginLeft: 5 }}
          onClick={() => {
            setValue(value - 1);
          }}
        >
          -1
        </button>
      </main>
      <button
        onClick={() => {
          console.log("버튼 클릭됨");
          test();
        }}
      >
        useDelay 사용
      </button>
      <button onClick={debounceHandler}>debounce 사용</button>
      <h1>Modal Example</h1>
      <button onClick={() => setModalVisible(true)}>Show Modal</button>
      {modalVisible && (
        <div className="modal">
          <p>This is a modal!</p>
        </div>
      )}
      <LeftArrow />
      <RightArrow />
      <SignUpForm />
      <ArchiveContainer />
      <MouseTracker />
      <footer>
        <h1 className="project-name">Simple React Blog</h1>
        <span className="project-desc">
          React 기초 학습을 위한 간단한 블로그 만들기
        </span>
      </footer>
    </div>
  );
}
