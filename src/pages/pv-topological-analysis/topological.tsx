
import React from 'react'
import Flow from '../../public/components/Flow'

import TopologicalList from './topologicalList/index'
import TopologicalDetail from './topologicalDetail/index'


//拓扑分析
const Topological = ({pageId}) => {
    return (
    <>
        <Flow pageName="topologicalList" component={TopologicalList} default={true} pageId={pageId}/>
        <Flow pageName="topologicalDetail" component={TopologicalDetail}/>
    </>
  )
}

export default Topological