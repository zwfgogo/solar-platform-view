import React from 'react'
import Flow from '../../public/components/Flow'
import RightsUserList from './rights-user-list/RightsUserList'
import RightsStation from './rights-station/RightsStation'

const RightsUserEntry = ({pageId}) => {
  return (
    <>
      <Flow pageName="list" component={RightsUserList} default={true} pageId={pageId}/>
      <Flow pageName="RightsStation" component={RightsStation}/>
    </>
  )
}

export default RightsUserEntry
