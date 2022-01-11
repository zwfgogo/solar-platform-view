/**
 * 简单的富文本编辑(非受控)
 */
import React, { useCallback, useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react'
import _ from 'lodash'
import $ from 'jquery'
import "./richText.less"

interface RichTextProps {
  style?: React.CSSProperties;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  [key: string]: any
}

let nowRange = null;

const RichText: React.FC<RichTextProps> = (props, ref) => {
  const { style, disabled = false, onChange, value, ...rest } = props
  const richDom = useRef();

  useImperativeHandle(ref, () => ({
    // changeVal 就是暴露给父组件的方法
    dom: richDom
  }));


  // useEffect(() => {
  //   setTimeout(() => {
  //     const selection = window.getSelection();
  //     const ele = richDom.current;
  //     const range = document.createRange();//创建一个rang对象
  //     range.selectNodeContents(ele);
  //     const content = nowRange ? nowRange?.node : ele.lastChild;
  //     console.log('nowRange.node', nowRange)
  //     if (content) {
  //       // console.log('content', content, nowRange)
  //       range.setStart(ele.lastChild, 0);
  //       range.setEnd(ele.lastChild, ele.lastChild.length);
  //       range.collapse(false);//起始位置和终止位置是否相同的布尔值
  //       selection.removeAllRanges();//移除选中区域的range对象
  //       selection.addRange(range);//给选中区域添加range对象
  //     } else {
  //     }
  //   }, 0)
  //   // const selection = window.getSelection();
  //   // const ele = richDom.current;
  //   // const range = document.createRange();//创建一个rang对象
  //   // const content = nowRange ? nowRange.node : ele.lastChild;
  //   // if (content) {
  //   //   // console.log('content', nowRange)
  //   //   range.setStart(content, 0);
  //   //   range.setEnd(content, nowRange ? nowRange.endOffset : content.length);
  //   //   range.collapse(false);//起始位置和终止位置是否相同的布尔值
  //   //   selection.removeAllRanges();//移除选中区域的range对象
  //   //   selection.addRange(range);//给选中区域添加range对象
  //   // } 


  // }, [value])


  const handleChange = (e) => {
    onChange && onChange(e.target.innerHTML)
  }

  // const handleClick = (e) => {
  //   const selection = window.getSelection();
  //   nowRange = selection.getRangeAt(0);
  //   // console.log('startRange', startRange);
  //   // nowRange = {
  //   //   endOffset: startRange.endOffset,
  //   //   node: startRange.endContainer,
  //   // };
  // }

  // const getCursortPosition = (textDom) => {
  //   if (window.getSelection) {
  //     const selection = window.getSelection();
  //     const range = selection.getRangeAt(0);
  //     if (range) {
  //       const domStr = '<span contenteditable="false" class="view-box">下水道</span>';
  //       // console.log('dom', $(domStr)[0]);
  //       range.insertNode($(domStr)[0]);
  //     }
  //     // console.log('window', range);
  //     // const ranges = [];
  //     // for(let i = 0; i < selection.rangeCount; i ++){
  //     //   ranges.push(selection.getRangeAt(i));
  //     // }

  //     // ranges.
  //     // console.log('ranges', ranges)
  //   } else if (document.getSelection) {
  //     const range = document.getSelection();
  //     console.log('document', range);
  //   }
  // }


  return (
    <div
      {...rest}
      className="richText-box"
      style={style}
      contenteditable={disabled ? "false" : "true"}
      ref={richDom}
      onInput={handleChange}
    >
    </div>
  )
}

export default forwardRef(RichText)

