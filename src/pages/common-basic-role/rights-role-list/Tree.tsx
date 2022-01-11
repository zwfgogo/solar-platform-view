/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React from 'react'

import { r_o_role_list } from '../../constants'
import { makeConnect } from '../../umi.helper'
import { useTreeExpand } from '../../../hooks/useTreeExpand'
import { Tree } from 'wanke-gui'
import { isBatterySystem } from '../../../core/env'

const _Tree = (props) => {
  const { treeKey, defaultExpanded, companyTree } = props

  const { expanded, onExpand } = useTreeExpand({
    nodeList: companyTree,
    defaultExpanded
  });

  const selectTree = (key, { node: options }) => {
    const id = options.id
    if (id !== -1) {
      props.action('updateQuery', {
        firmId: id
      })
      props.action('selectTree', {
        activity: options.activity,
        firmId: options.firmType.id
      })
      props.action('updateState', {
        firmTitle: options.title,
        treeKey: options.key,
        firmTypeName: isBatterySystem() ? 'Battery' : options.firmType?.name
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

export default makeConnect(r_o_role_list, mapStateToProps)(_Tree)
