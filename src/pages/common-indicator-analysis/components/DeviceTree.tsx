import React, { useEffect, useRef } from 'react'
import { Input, Tree } from 'wanke-gui'
import AutoSizer from '../../../components/AutoSizer'
import _ from 'lodash'
import { useTreeExpand } from '../../../hooks/useTreeExpand'
import { Tree_Type } from '../../constants'
import { traverseTree } from '../../page.helper'
import utils from '../../../public/js/utils'

interface Props {
  treeList: any[]
  selectedKeys?: string[]
  onSelect?: (keys: any[], selectedItem?: any) => void
}

const DeviceTree: React.FC<Props> = function (props) {
  const { treeList = [] } = props
  const { expanded, onExpand } = useTreeExpand({
    nodeList: treeList,
    defaultExpandAll: true
  });

  const handleSelect = (keys) => {
    if (keys.length === 0) {
      props.onSelect(keys)
      return
    }
    const key = keys[0]
    const selectedItem = traverseTree(props.treeList, (item) => {
      if (key == item.key) {
        return item
      }
      return null
    })
    props.onSelect(keys, selectedItem)
  }
  
  return (
    <AutoSizer>
      {
        ({ width, height }) => {
          if (height == 0) {
            return null
          }
          return (
            <Tree
              scrollX
              filterable
              showIcon={true}
              showLine
              checkable={false}
              expandedKeys={expanded}
              selectedKeys={props.selectedKeys}
              onSelect={handleSelect}
              onExpand={onExpand}
              height={height}
              treeData={treeList}
              onClick={e => e.stopPropagation()}
              searchProps={{
                placeholder: utils.intl('请输入关键字查询'),
                style: {
                  marginBottom: 5
                }
              }}
            >
            </Tree>
          )
        }
      }
    </AutoSizer>
  )
}

export default DeviceTree
