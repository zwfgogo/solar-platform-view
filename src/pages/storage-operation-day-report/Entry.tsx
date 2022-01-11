import React from 'react'
import Flow from "../../public/components/Flow"
import PageProps from "../../interfaces/PageProps"
import DayReportList from './DayReportList'
import DayReportDetail from './DayReportDetail'
import Diff from './diff/Diff'
import navigateHoc from "../../public/navigateHoc"

interface Props extends PageProps {
}

const Entry: React.FC<Props> = function (this: null, props) {
  // useEffect(() => {
  //   props.forward('diff', {stationId: 100045, date: '2020-02-10'})
  // }, [])
  console.log(22)
  return (
    <>
      <Flow pageName={'list'} default={true} pageId={props.pageId} component={DayReportList} />
      <Flow pageName={'detail'} component={DayReportDetail} />
      <Flow pageName={'diff'} component={Diff} />
    </>
  )
}

export default Entry
