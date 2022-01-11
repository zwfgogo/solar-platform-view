import React, { useRef, useEffect, useState, useImperativeHandle } from "react";
import styles from "./styles/scrolling.less";

const moveHeightPerSecond = 40;
const animationList = [styles["myscroll"], styles["myscroll1"]]

export interface ScrollingRefProps {
  resetScrolling: () => void
}

interface Props {
  children?: any
}

const Scrolling = React.forwardRef<ScrollingRefProps, Props>((props, ref) => {
  const [isScrolling, setScrolling] = useState(false);
  const [listStyle, setListStyle] = useState({});
  const containerRef = useRef(null);
  const scrollListRef = useRef(null);
  const [animationIndex, setAnimationIndex] = useState(0)

  useImperativeHandle(ref, () => ({
    resetScrolling: () => {
      setAnimationIndex(animationIndex === 0 ? 1 : 0)
    }
  }))

  const handleScroll = () => {
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
  }

  useEffect(() => {
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('resize', handleScroll)
    }
  }, []);

  useEffect(() => {
    handleScroll()
  }, [animationIndex])

  useEffect(() => {
    handleScroll();
  }, [props.children]);

  const startAnimation = () => {
    const style:React.CSSProperties = { ...listStyle };
    const time = scrollListRef.current.clientHeight / moveHeightPerSecond;
    const animationName = animationList[animationIndex]
    style.animation = `${animationName} ${time}s infinite linear`
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
});

export default Scrolling;
