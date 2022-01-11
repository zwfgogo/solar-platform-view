/**
 * 告警级别配置-运营商普通用户
 */

 import React from 'react'
 import Flow from '../../public/components/Flow'
 import LevelConfigUserPage from './components/LevelConfigUserPage'
 
 const LevelConfigUser = ({ pageId }) => {
   return (
     <>
       <Flow pageName="LevelConfigUserPage" component={LevelConfigUserPage} default={true} pageId={pageId} />
     </>
   )
 }
 
 export default LevelConfigUser