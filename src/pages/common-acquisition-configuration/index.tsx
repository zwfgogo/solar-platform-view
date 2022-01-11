/**
 * 采集点号配置
 */

 import React from 'react'
 import Flow from '../../public/components/Flow'
 import AcquisitionConfigurationPage from './AcquisitionConfigurationPage'
 import RemotePulsePage from './RemotePulsePage'
 
 const AcquisitionConfiguration = ({ pageId }) => {
   return (
     <>
       <Flow pageName="AcquisitionConfiguration" component={AcquisitionConfigurationPage} default pageId={pageId} />
       <Flow pageName="RemotePulse" component={RemotePulsePage} pageId={pageId} />
     </>
   )
 }
 
 export default AcquisitionConfiguration