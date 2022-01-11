import React, { useEffect } from 'react'
import Flow from '../../../public/components/Flow'

import navigateHoc from '../../../public/navigateHoc'
import PageProps from '../../../interfaces/PageProps'
import LoadManagement from './list/LoadManagement'

interface Props extends PageProps {

}

const StationEntry: React.FC<Props> = function (this: null, props) {

  return (
    <>
      <Flow pageName="loadList" component={LoadManagement} default={true} pageId={props.pageId} />
    </>
  )
}

export default navigateHoc(StationEntry)
