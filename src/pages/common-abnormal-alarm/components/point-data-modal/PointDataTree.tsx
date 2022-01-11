import React, { useEffect, useImperativeHandle, useState } from 'react'
import { AutoSizer, Tree } from 'wanke-gui'
import utils from '../../../../public/js/utils'
import { loadTreeChildApi } from '../../../../services/global2'
import { Tree_Type } from '../../../constants'
import { findTreeItem } from '../../../page.helper'

const updateTreeData = (list: any[], key: React.Key, children: any[]): any[] => {
  return list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        children: children?.map((item, index) => ({ ...item, key: `${key}-${index}` })),
      };
    }
    if (node.children?.length) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children),
      };
    }
    return node;
  });
}

export interface PointDataTreeRef {
  selectNode: (deviceId: number) => void
  clearSelect: () => void
}

interface Props {
  treeData: any[]
  onSelect: (device: any) => void
}

const PointDataTree = React.forwardRef<PointDataTreeRef, Props>((props, ref) => {
  const { treeData: propTreeData } = props
  const [treeData, setTreeData] = useState([])
  const [expandedKeys, setExpandedKeys] = useState([])
  const [selectKeys, setSelectKeys] = useState([])

  useEffect(() => {
    setTreeData(propTreeData)
    setExpandedKeys(propTreeData.length ? [propTreeData[0].key] : [])
    setSelectKeys([])
  }, [JSON.stringify(propTreeData)])

  // tree选择
  const handleTreeSelect = (keys, e) => {
    if (keys.length) {
      props.onSelect(e.node)
      setSelectKeys(keys);
    }
  }

  const handlerTree = (treeList => {
    if (!treeList || !treeList.length) {
      return [];
    }

    return treeList.map(item => {
      const leaf = { ...item };
      leaf.checkable = false;
      leaf.selectable = true;

      if (leaf.type === Tree_Type.batteryGroup) {
        // 电池组类型
        if (leaf.children && leaf.children.length && leaf.children[0]?.type === Tree_Type.singleBattery) {
          leaf.hasChild = true;
        }
      } else if (leaf.type === Tree_Type.batteryPackage && leaf.children && leaf.children.length) {
        leaf.hasChild = true;
      }

      leaf.isLeaf = !leaf.hasChild && !leaf?.children?.length || leaf.type == Tree_Type.singleBattery;

      if (leaf.children) {
        leaf.children = handlerTree(leaf.children);
      }

      return leaf;
    });
  })

  useImperativeHandle(ref, () => ({
    selectNode: (deviceId) => {
      const target = findTreeItem(treeData, (node) => node.id === deviceId)
      if (target) {
        handleTreeSelect([target.key], { node: target })
      }
    },
    clearSelect: () => {
      setSelectKeys([]);
    }
  }))

  return (
    <AutoSizer>
      {
        ({ width, height }) => {
          return (
            <Tree
              filterable
              scrollX
              showIcon
              showLine
              height={height}
              treeData={handlerTree(treeData)}
              onSelect={handleTreeSelect}
              selectedKeys={selectKeys}
              expandedKeys={expandedKeys}
              onExpand={expandedKeys => setExpandedKeys(expandedKeys as string[])}
              searchProps={{
                placeholder: utils.intl('请输入关键字'),
                style: {
                  marginBottom: 5
                }
              }}
              loadData={(node: any) =>
                new Promise<void>(resolve => {
                  const { key, id, children, hasChild } = node
                  if (children && children.length || !hasChild) {
                    resolve();
                    return;
                  } else if (hasChild) {
                    loadTreeChildApi({ parentId: id, activity: true })
                      .then(data => {
                        setTreeData(tList => updateTreeData(tList, key, data || []))
                        resolve();
                      })
                  }
                })}
            />
          )
        }
      }
    </AutoSizer>
  )
})

export default PointDataTree
