import React from 'react'

import Flow from '../../public/components/Flow'
import RightsStation from '../common-basic-user/rights-station/RightsStation'
import MenuSelect from './MenuSelect'
import RightsUserList from '../common-basic-user/rights-user-list/RightsUserList'
import RightsRoleList from './rights-role-list/RightsRoleList'
import MenuConfig from './MenuConfig'

const RightsRoleEntry = ({pageId}) => {
  return (
    <>
      <Flow pageName="RightsRoleList" component={RightsRoleList} default={true} pageId={pageId}/>
      <Flow pageName="RightsUserList" component={RightsUserList}/>
      <Flow pageName="RightsStation" component={RightsStation}/>
      <Flow pageName="MenuSelect" component={MenuConfig}/>
    </>
  )
}

export default RightsRoleEntry
