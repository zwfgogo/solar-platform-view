/**
 * 告警级别配置-运营商管理员
 */

import React from 'react'
import Flow from '../../public/components/Flow'
import LevelConfigAdminPage from './components/LevelConfigAdminPage'
import ReceiverConfig from './components/ReceiverConfig'

const LevelConfigAdmin = ({ pageId }) => {
  return (
    <>
      <Flow pageName="LevelConfigAdminPage" component={LevelConfigAdminPage} default={true} pageId={pageId} />
      <Flow pageName="ReceiverConfig" component={ReceiverConfig} />
    </>
  )
}

export default LevelConfigAdmin