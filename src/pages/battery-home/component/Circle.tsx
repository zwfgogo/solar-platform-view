/**
 * 驾驶舱自定义Card组件
 */

 import React, { ReactElement } from 'react';
import utils from '../../../public/js/utils';
 import "./component.less"
 
 export interface CardProps {
   style?: React.CSSProperties,
   title?: React.ReactNode,
   type: 'high' | 'middle' | 'low'
 }

 export const typeMap = {
   high: { zh: utils.intl('高风险'), color: '247,78,87' },
   middle: { zh: utils.intl('中风险'), color: '235,146,20' },
   low: { zh: utils.intl('低风险'), color: '116,207,71' },
 }
 
 const Card: React.FC<CardProps> = (props) => {
   const { style = {}, type = 'low', title } = props
 
 
   return (
     <div className="page-circle-box" style={{
       ...style,
       border: `2px solid rgba(${typeMap[type].color},1)`,
       boxShadow: `0px 0px 30px rgba(${typeMap[type].color},0.4)`
     }}>
       <div className="page-circle" style={{
         boxShadow: `0px 0px 60px rgba(${typeMap[type].color},0.4)`
       }}>
         <div style={{ color: "rgba(255,255,255,0.45)" }}>{typeMap[type].zh}</div>
         <div>{title}</div>
       </div>
     </div>
   )
 }
 
 export default Card
 