import React, { useEffect } from 'react'
import Flow from '../../../public/components/Flow'

import navigateHoc from '../../../public/navigateHoc'
import PageProps from '../../../interfaces/PageProps'
import PowerManagement from './list/PowerManagement'
import PowerManagementInfo from './info/PowerManagementInfo'
import './index.less'

interface Props extends PageProps {

}

const StationEntry: React.FC<Props> = function (this: null, props) {

  return (
    <>
      <Flow pageName="list" component={PowerManagement} default={true} pageId={props.pageId} />
      <Flow pageName="info" component={PowerManagementInfo} />
    </>
  )
}

export default navigateHoc(StationEntry)
