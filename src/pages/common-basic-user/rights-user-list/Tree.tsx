/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React from 'react'

import { r_u_user_list } from '../../constants'

import { makeConnect } from '../../umi.helper'
import { Tree } from 'wanke-gui'
import { useTreeExpand } from '../../../hooks/useTreeExpand'

const _Tree = (props) => {
  const { defaultExpanded, companyTree, treeKey } = props

  const { expanded, onExpand } = useTreeExpand({
    nodeList: companyTree,
    defaultExpanded
  });

  const selectTree = (kye, { node: options }) => {
    const id = options.id
    if (id !== -1) {
      props.action('selectTree', {
        firmId: id,
        activity: options.activity
      })
      props.action('updateQuery', {
        firmId: id
      })
      props.action('updateState', {
        firmTitle: options.title,
        treeKey: options.key
      })
    }
  }
  return companyTree && companyTree.length > 0 ? (
    <Tree
      showLine
      expandedKeys={expanded}
      onExpand={onExpand}
      defaultCheckedKeys={defaultExpanded}
      onSelect={selectTree}
      treeData={companyTree}
      selectedKeys={[treeKey]}
    />
  ) : null
}

const mapStateToProps = ({ companyTree, defaultExpanded, query: { id }, treeKey }) => ({
  companyTree,
  defaultExpanded,
  firmId: id,
  treeKey
})

export default makeConnect(r_u_user_list, mapStateToProps)(_Tree)
