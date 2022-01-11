/**
 * 运营指标配置
 */

 import React from 'react'
 import Flow from '../../public/components/Flow'
 import OperationConfigurationPage from './OperationConfiguration'
 
 const OperationConfiguration = ({ pageId }) => {
   return (
     <>
       <Flow pageName="OperationConfiguration" component={OperationConfigurationPage} default={true} pageId={pageId} />
     </>
   )
 }
 
 export default OperationConfiguration