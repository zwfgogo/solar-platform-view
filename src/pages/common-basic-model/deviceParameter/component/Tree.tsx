/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React from 'react'
import { makeConnect } from '../../../umi.helper'
import { useTreeExpand } from '../../../../hooks/useTreeExpand'
import { Tree } from 'wanke-gui'

const _Tree = (props) => {
  const {defaultExpanded, companyTree, treeKey, dispatch} = props
  const { expanded, onExpand } = useTreeExpand({
    nodeList: companyTree,
    defaultExpanded
  });
  
  const selectTree = (kye, {node: options}) => {
    const id = options.id
    if (!(options.children && options.children.length)) {
      props.action('updateQuery', {
        id: id
      })
      props.action('updateState', {
        treeRecord: options,
        treeKey: options.key,
        treeId:options.id,
        isSameFirm:options.isSameFirm,
      })
      props.action('selectTree')
      props.updateState({ canEdit: false })
    }
  }
  return (
    <Tree
      showLine
      expandedKeys={expanded}
      onExpand={onExpand}
      defaultCheckedKeys={defaultExpanded}
      onSelect={selectTree}
      treeData={companyTree}
      selectedKeys={[treeKey]}
    />
  )
}

const mapStateToProps = ({companyTree, defaultExpanded, query: {id}, treeKey}) => ({
  companyTree,
  defaultExpanded,
  firmId: id,
  treeKey
})

export default makeConnect('deviceParameter', mapStateToProps)(_Tree)
