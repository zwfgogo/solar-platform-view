import React, { useState, useEffect, useRef } from "react";
import classnames from "classnames";
import styles from "./style/full-screen-btn.less";
import { WankeFullScreenOutlined, WankeOutFullScreenOutlined, GfExitFullscreenOutlined, WankeFullscreen1Outlined, WankeFullscreen2Outlined, WankeFullscreenOut2Outlined } from 'wanke-icon'
import $ from 'jquery'
import { triggerEvent } from "../util/utils";

function checkFull() {
  return (
    document.fullscreenElement ||
    // @ts-ignore
    document.msFullscreenElement ||
    // @ts-ignore
    document.mozFullScreenElement ||
    // @ts-ignore
    document.webkitFullscreenElement ||
    false
  );
}

interface Props {
  targetId?: string;
  className?: string;
}

const FullScreenBtn: React.FC<Props> = ({ targetId, className }) => {
  const [fullScreen, setFullScreen] = useState(false);
  const fullScreenRef = useRef(false)
  const fullScreenCountRef = useRef(0)

  const handleFullScreen = (el: any) => {
    fullScreenCountRef.current = 0
    var rfs =
      el.requestFullscreen ||
      el.msRequestFullScreen ||
      el.mozRequestFullScreen ||
      el.webkitRequestFullScreen;
    if (typeof rfs !== "undefined" && rfs) {
      rfs.call(el);
      setFullScreen(!fullScreen);
      $('#dd').css({ 'z-index': '3', 'background-color': '#fff' })
      $(`#${targetId}`).css({
        'position': 'fixed',
        'top': '0px',
        'left': '0px',
        'right': '0px',
        'z-index': '200',
        'bottom': '0px'
      })
      $('#page-and-crumb').css({
        'z-index': '200',
      })
    }
  };
  const exitFullScreen = (el: any) => {
    var cfs = el.exitFullScreen || el.msExitFullscreen || el.mozCancelFullScreen || el.webkitExitFullscreen
    if (typeof cfs !== "undefined" && cfs) {
      cfs.call(el);
      setFullScreen(!fullScreen);
      $('#dd').css({ 'z-index': '-1' })
      $('#dd').removeAttr('style')
      $(`#${targetId}`).removeAttr('style')
      $('#page-and-crumb').removeAttr('style')
      setTimeout(() => {
        triggerEvent('resize', window)
      }, 300)
    }
  };

  const toggleFullScreen = () => {
    const targetEl = targetId
      ? document.getElementById(targetId)
      : document.documentElement;
    // console.log(fullScreen, targetEl);
    fullScreen ? exitFullScreen(document) : handleFullScreen(document.documentElement);
  };

  const onResize = () => {
    const isFull = checkFull();
    console.log("resize", isFull);
    setFullScreen(isFull);
  };

  const onCloseFullScreen = () => {
    exitFullScreen(document)
    setFullScreen(false)
  }
  fullScreenRef.current = fullScreen

  const handleFullScreenChange = (e) => {
    if (fullScreenCountRef.current && fullScreenRef.current) {
      exitFullScreen(document)
      setFullScreen(false)
    }
    fullScreenCountRef.current++
  }

  useEffect(() => {
    window.addEventListener("close-fullscreen", onCloseFullScreen);
    window.addEventListener('fullscreenchange', handleFullScreenChange)
    return () => {
      window.removeEventListener("close-fullscreen", onCloseFullScreen);
      window.removeEventListener('fullscreenchange', handleFullScreenChange)
    };
  }, []);

  return (
    <div
      className={classnames(styles["full-screen-btn"], {
        [className]: !!className
      })}
      onClick={toggleFullScreen}
    >
      {fullScreen && (<WankeFullscreenOut2Outlined />)}
      {!fullScreen && (<WankeFullscreen2Outlined />)}
    </div>
  );
};

export default FullScreenBtn;
