/**
 * 异常规则配置
 */
 import React from 'react'
 import Flow from '../../public/components/Flow'
import AlarmRulesEditPage from './components/AlarmRulesEditPage'
 import AlarmRulesPage from './components/AlarmRulesPage'
 
 const AlarmTypes = ({ pageId }) => {
   return (
     <>
       <Flow pageName="AlarmRulesPage" component={AlarmRulesPage} default={true} pageId={pageId} />
       <Flow pageName="AlarmRulesEditPage" component={AlarmRulesEditPage} />
     </>
   )
 }
 
 export default AlarmTypes