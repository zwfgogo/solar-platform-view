import React from 'react'
import Flow from '../../public/components/Flow'

import vppList from './vppList/index'
import vppAdd from './vppAdd/index'
import vppMonitor from './vppMonitor/index'
import vppEchartDetail from './vppEchartDetail/index'
import vppRecord from './vppRecord/index'
import vppRecordDetail from './vppRecordDetail/index'
import vppBill from './vppBill/index'
import vppBillDetail from './vppBillDetail/index'

//vpp
const Vpp = ({pageId}) => {
    return (
    <>
        <Flow pageName="vppList" component={vppList} default={true} pageId={pageId}/>
        <Flow pageName="vppAdd" component={vppAdd}/>
        <Flow pageName="vppMonitor" component={vppMonitor}/>
        <Flow pageName="vppEchartDetail" component={vppEchartDetail}/>
        <Flow pageName="vppRecord" component={vppRecord}/>
        <Flow pageName="vppRecordDetail" component={vppRecordDetail}/>
        <Flow pageName="vppBill" component={vppBill}/>
        <Flow pageName="vppBillDetail" component={vppBillDetail}/>
    </>
  )
}

export default Vpp
