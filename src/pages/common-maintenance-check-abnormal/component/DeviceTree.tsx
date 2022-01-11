import React, { useState } from 'react'
import { Tree } from 'wanke-gui'
import CommonTitle from '../../../components/CommonTitle'
import { useTreeExpand } from '../../../hooks/useTreeExpand'
import utils from '../../../public/js/utils'

interface Props {
  baseData: any[]
  extraData: any[]
  onChange?: (baseKeys: any, extraKeys: any) => void
}

const DeviceTree: React.FC<Props> = (props) => {
  const { baseData, extraData } = props
  const [baseKeys, setBaseKeys] = useState([])
  const [extraKeys, setExtraKeys] = useState([])
  const { expanded: bExpanded, onExpand: bOnExpand } = useTreeExpand({
    nodeList: baseData,
    defaultExpandAll: true
  });
  const { expanded: eExpanded, onExpand: eOnExpand } = useTreeExpand({
    nodeList: extraData,
    defaultExpandAll: true
  });

  const handleCheck = (keys: any, isBase: boolean) => {
    if (isBase) {
      setBaseKeys(keys)
      props.onChange?.(keys, extraKeys)
    } else {
      setExtraKeys(keys)
      props.onChange?.(baseKeys, keys)
    }
  }
  
  return (
    <>
      <Tree
        checkable
        selectable={false}
        expandedKeys={bExpanded}
        onExpand={bOnExpand}
        treeData={formatTree(baseData)}
        checkedKeys={baseKeys}
        onCheck={keys => handleCheck(keys, true)}
      />
      <CommonTitle
        className="device-modal-title"
        title={utils.intl('关联数据')}
        fontSize={16}
        fontWeight='bold'
        style={{ marginBottom: 8, paddingTop: 16 }}
      />
      <Tree
        checkable
        selectable={false}
        expandedKeys={eExpanded}
        onExpand={eOnExpand}
        treeData={formatTree(extraData)}
        checkedKeys={extraKeys}
        onCheck={keys => handleCheck(keys, false)}
      />
    </>
  )
}

export default DeviceTree

function formatTree(tree) {
  return tree?.map(item => ({
    ...item,
    title: <span style={{ fontWeight: 'bold', fontSize: 16 }}>{item.title}</span>
  }))
}
