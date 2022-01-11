/**
 * 异常类型配置
 */

 import React from 'react'
 import Flow from '../../public/components/Flow'
 import AlarmTypesPage from './components/AlarmTypesPage'
 
 const AlarmTypes = ({ pageId }) => {
   return (
     <>
       <Flow pageName="AlarmTypesPage" component={AlarmTypesPage} default={true} pageId={pageId} />
     </>
   )
 }
 
 export default AlarmTypes