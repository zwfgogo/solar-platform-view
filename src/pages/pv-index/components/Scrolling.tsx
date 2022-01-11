import React, { useRef, useEffect, useState } from "react";
import styles from "./styles/scrolling.less";

const moveHeightPerSecond = 40;

interface Props {}

const Scrolling: React.FC<Props> = props => {
  const [isScrolling, setScrolling] = useState(false);
  const [listStyle, setListStyle] = useState({});
  const containerRef = useRef(null);
  const scrollListRef = useRef(null);

  useEffect(() => {
    if (
      containerRef.current.clientHeight >=
      scrollListRef.current.clientHeight / 2
    ) {
      setScrolling(false);
      setListStyle({});
    } else {
      setScrolling(true);
      startAnimation();
    }
  }, [props.children]);

  const startAnimation = () => {
    const style:React.CSSProperties = { ...listStyle };
    const time = scrollListRef.current.clientHeight / moveHeightPerSecond;
    style.animation = `${styles["myscroll"]} ${time}s infinite linear`
    setListStyle(style);
  };

  const controlAnimation = (start: boolean) => {
    const style:React.CSSProperties = { ...listStyle };
    if(start) {
      style.animationPlayState = 'running';
    } else {
      style.animationPlayState = 'paused';
    }
    setListStyle(style);
  }

  return (
    <div
      className={styles["scroll-container"]}
      ref={containerRef}
      onMouseOver={() => controlAnimation(false)}
      onMouseLeave={() => controlAnimation(true)}
    >
      <div
        className={styles["scroll-list"]}
        ref={scrollListRef}
        style={listStyle}
      >
        <div className={styles["scroll-item"]}>{props.children}</div>
        <div
          className={styles["scroll-item"]}
          style={{ visibility: isScrolling ? "visible" : "hidden" }}
        >
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default Scrolling;
