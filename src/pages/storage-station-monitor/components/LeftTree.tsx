import React, { useEffect, useRef, useState } from 'react'
import { Input, Tree } from 'wanke-gui'
import { Tree_Type, Mode } from '../../../pages/constants'
import { ActionProp } from '../../../interfaces/MakeConnectProps'
import { findTreeItem, getChangedKeys, traverseTree } from '../../../pages/page.helper'
import { getKeys, identity } from '../../common-basic-station/station.helper'
import AutoSizer from '../../../components/AutoSizer'
import { copy, triggerEvent } from '../../../util/utils'
import utils from '../../../public/js/utils'
import MakeConnectProps from '../../../interfaces/MakeConnectProps';
import _ from 'lodash'
import createServices from '../../../util/createServices'

// let TreeNode = Tree.TreeNode
const { Search } = Input;

interface Props extends ActionProp {
  setSelectedKeys: (v) => void
  setCheckedKeys: (v) => void
  setMode: (v) => void
  setTreeType: (v) => void
  treeList: any[];
  selectedKeys: any[];
  checkedKeys: any[];
  editable: boolean;
  setCheckboxDisplay?: (v) => void;
  onSelect?: (keys: any[]) => void
  onFinishSelected?: (item: any) => void
}

const LeftTree: React.FC<Props> = function (props) {
  const lastSelectedKey = useRef<string>()
  const [treeList, setTreeList] = useState(props.treeList)
  const [disabled, setDisabled] = useState(false)

  const onSelect = (keys, event) => {
    props.onSelect?.(keys)
    if (keys.length == 0) {
      return
    }
    const key = keys[0]
    const selectedItem = traverseTree(treeList, (item) => {
      if (key == identity(item)) {
        return item
      }
      return null
    })
    props.onFinishSelected?.(selectedItem)
    const { type, id, typeId, title } = selectedItem

    // 业务过滤
    if (type == Tree_Type.station || type == Tree_Type.energyUnit) {
      return
    }
    if (type) {
      props.setCheckedKeys([])
      props.setTreeType(type)
      props.setSelectedKeys(keys)
      props.setMode(Mode.look)
      props.action('fetchPointDataType', { deviceTypeId: typeId, deviceId: id, deviceTitle: title })
      props.action('updateCurrentSelectNode', { deviceTypeId: typeId, deviceId: id, deviceTitle: title })
      if (props.setCheckboxDisplay) {
        props.setCheckboxDisplay(true);
        props.action('updateState', {
          checkboxOptions: []
        })
        setTimeout(() => {
          triggerEvent('resize', window)
        })
      }
    }
  }

  const handlerTree = (treeList => {
    if (!treeList || !treeList.length) {
      return [];
    }


    return treeList.map(item => {
      const leaf = { ...item };
      // const leaf = _.cloneDeep(item);
      if (leaf.activity === false && leaf.type !== Tree_Type.virtualNode) {
        leaf.title = leaf.title + `(${utils.intl('无效')})`;
      }

      // 是否可勾选
      let checkable = false;
      // 可编辑状态下
      let editable = props.editable;

      if (editable) {
        if (leaf.type == Tree_Type.singleBattery) {
          checkable = true;
        } else if (leaf.type === Tree_Type.batteryGroup) {
          // 电池组类型
          if (leaf.children && leaf.children.length && leaf.children[0].type === Tree_Type.singleBattery) {
            checkable = true;
          }
        } else if (leaf.type === Tree_Type.batteryPackage && leaf.children && leaf.children.length) {
          // 电池包
          checkable = true;
        }
      }

      leaf.checkable = checkable;
      leaf.selectable = leaf.type !== Tree_Type.station && leaf.type !== Tree_Type.energyUnit
      leaf.isLeaf = !leaf.hasChild && !leaf?.children?.length

      if (leaf.children) {
        leaf.children = handlerTree(leaf.children);
      }

      return leaf;
    });
  })

  let handleExpand = (keys, event) => {
    let key = event.node.props.eventKey

    if (!event.expanded) {
      if (userCloseKeys.indexOf(key) == -1) {
        setUserCloseKeys([...userCloseKeys, key])
      }
    } else {
      if (userCloseKeys.indexOf(key) != -1) {
        userCloseKeys.splice(userCloseKeys.indexOf(key), 1)
        setUserCloseKeys([...userCloseKeys])
      }
    }
  }

  let onCheck = (keys, event) => {
    const { addKeys, removeKeys } = getChangedKeys(keys, props.checkedKeys)
    let selectKey = lastSelectedKey.current
    // 选择不同电池组，只选中后选中的电池组下的设备
    if (addKeys.length > 0) {
      const targetKey = getFirstDeviceKey(addKeys, props.treeList)
      if (props.checkedKeys.length > 0) {
        let prevKey = getFirstDeviceKey(props.checkedKeys, props.treeList)
        const prevParentId = getFirstTreeNode(prevKey, props.treeList, props.checkedKeys).id
        const targetParentId = getFirstTreeNode(targetKey, props.treeList, keys).id
        if (prevParentId !== targetParentId) {
          keys = addKeys
        }
      }
      selectKey = identity(getFirstTreeNode(targetKey, props.treeList, keys))
    } else if (removeKeys.indexOf(selectKey) > -1) {
      let firstItem = getFirstTreeNode(
        getFirstDeviceKey(keys, props.treeList),
        props.treeList,
        keys
      )
      if (firstItem) {
        selectKey = identity(firstItem)
      }
    }
    lastSelectedKey.current = selectKey
    props.setCheckedKeys(keys)
    props.setSelectedKeys(selectKey ? [selectKey] : [])

    if (keys.length != 0) {
      props.setMode(Mode.look)
      props.setTreeType(Tree_Type.singleBattery)
      let selectedItem = findTreeItem(props.treeList, item => identity(item) == selectKey)
      const { typeId, id } = selectedItem
      props.action('fetchPointDataType', { deviceTypeId: typeId, deviceId: id })
    } else {
      props.setTreeType(null)
    }
  }

  const defaultExpandKeysHandle = treeList => {
    const expanded = [];
    traverseTree(treeList, leaf => {
      let key = identity(leaf);
      if (leaf.type === 'BatteryCluster' && !leaf.children?.length || leaf.type === "Pack") {
        expanded.push(key);
      }
      return null;
    })
    return expanded;
  };

  const updateTreeData = (list: any[], key: React.Key, children: any[]): any[] => {
    return list.map((node) => {
      if (node.key === key) {
        return {
          ...node,
          children: children?.map((item, index) => ({ ...item, key: `${key}-${index}`})),
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

  useEffect(() => {
    const closeKeys = defaultExpandKeysHandle(props.treeList);
    setUserCloseKeys(closeKeys)
    setTreeList(props.treeList)
  }, [JSON.stringify(props.treeList)])

  let [userCloseKeys, setUserCloseKeys] = React.useState([]) // 主动点击关闭的key列表
  // 过滤用户收起的节点
  let allKeys = getKeys(treeList)
  let expandedKeys = allKeys.filter(key => userCloseKeys.indexOf(key) == -1)
  // console.log('expandedKeys', allKeys, userCloseKeys, expandedKeys)
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
              expandedKeys={expandedKeys}
              selectedKeys={props.selectedKeys}
              checkedKeys={props.checkedKeys}
              onSelect={onSelect}
              onExpand={(keys, e) => !disabled && handleExpand(keys, e)}
              onCheck={onCheck}
              checkable={true}
              height={height}
              treeData={handlerTree(treeList)}
              onClick={e => e.stopPropagation()}
              // switcherIcon={disabled ? null : undefined}
              loadData={(node) => 
              new Promise<void>(resolve  => {
                const { key, id, children, hasChild } = node
                setDisabled(true);
                if(children && children.length || !hasChild){
                  setDisabled(false);
                  resolve();
                  return;
                }else if(hasChild){ 
                  createServices<{ parentId: number, activity: boolean }>("get", "/api/basic-data-management/equipment-ledger/devices/getDeviceTreeChild", { parentId: id, activity: true })
                  .then(data => {
                    setTreeList(tList => updateTreeData(tList, key, data?.results || []))
                    setDisabled(false);
                    resolve();
                  }).catch(() => {
                    setDisabled(false);
                    resolve();
                  })
                }
              })}
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

export default LeftTree

// 获取第一个不是电池包的设备
function getFirstDeviceKey(keys, treeList) {
  let targetKey = keys[0]
  let type = findTreeItem(treeList, item => {
    if (identity(item) == targetKey) {
      return true
    }
  })?.type
  if (type !== Tree_Type.singleBattery) {
    targetKey = keys[1]
  }
  return targetKey
}

// 获取当前节点同级中第一个节点
function getFirstTreeNode(key, treeList, keysRange) {
  if (keysRange.length === 0) return null
  let parentNode = null
  findTreeItem(treeList, (item, parent) => {
    if (identity(item) == key) {
      parentNode = parent
      return true
    }
  })
  return parentNode.children.find(node => keysRange.indexOf(identity(node)) > -1)
}
