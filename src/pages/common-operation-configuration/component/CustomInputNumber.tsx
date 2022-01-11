/**
 * 自定义数字框
 */
 import React from 'react'
 import { InputNumber } from 'wanke-gui';
 import "./customInputNumber.less"
 
 interface CustomInputNumberProps {
  addonAfter?: React.ReactNode,
   [key: string]: any;
 }
 
 const CustomInputNumber: React.FC<CustomInputNumberProps> = (props) => {

  const { addonAfter, style, ...restProps } = props
 
   return (
     <div className="customInputNumber-box" style={style}>
       <InputNumber 
        {...restProps}
       />
       <span className="customInputNumber-addonAfter">{ addonAfter }</span>
     </div>
   )
 }
 
 export default CustomInputNumber