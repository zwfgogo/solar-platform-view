import React, { useEffect, useRef, useState } from 'react'
import { message, Tree } from 'wanke-gui'
import { Tree_Type, Mode } from '../../constants'
import { ActionProp } from '../../../interfaces/MakeConnectProps'
import { findTreeItem, getChangedKeys, traverseTree } from '../../page.helper'
import { getKeys, identity } from '../station.helper'
import AutoSizer from '../../../components/AutoSizer'
import utils from '../../../public/js/utils'
import createServices from '../../../util/createServices'
import { every } from 'lodash'

// let TreeNode = Tree.TreeNode

interface Props extends ActionProp {
  setSelectedKeys: (v) => void
  setCheckedKeys: (v) => void
  setMode: (v) => void
  setTreeType: (v) => void
  treeList: any[];
  selectedKeys: any[];
  checkedKeys: any[];
  editable: boolean;
  loadSucFuc?: (treeList: any[]) => void
}

const LeftTree: React.FC<Props> = function (props) {
  const lastSelectedKey = useRef<string>()
  const [treeList, setTreeList] = useState(props.treeList)
  const [disabled, setDisabled] = useState(false)
  let [userCloseKeys, setUserCloseKeys] = React.useState([]) // 主动点击关闭的key列表
  const [loadKeys, setLoadKeys] = useState([])

  const onSelect = (keys, event) => {
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
    const { type, id } = selectedItem
    if (type == Tree_Type.virtualNode) {
      return
    }
    if (type) {
      props.setCheckedKeys([])
      props.setTreeType(type)
      props.setSelectedKeys(keys)
      props.setMode(Mode.look)
      if (type == Tree_Type.energyUnit) {
        props.action('fetchEnergyUnitDetail', { id: id })
      } else {
        props.action('fetchDeviceDetail', { deviceId: id })
      }
    }
  }

  const handlerTree = (treeList => {
    if (!treeList || !treeList.length) {
      return [];
    }

    return treeList.map(item => {
      // const leaf = copy(item);
      const leaf = { ...item }
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
          if (leaf.hasChild && (!leaf?.children?.length || !leaf.children.find(item => item.type === Tree_Type.batteryPackage))) {
            checkable = true;
          }
        } else if (leaf.hasChild && leaf.type === Tree_Type.batteryPackage) {
          // 电池包
          checkable = true;
        }
      }

      leaf.checkable = checkable;
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
      setLoadKeys(Array.from((new Set([...loadKeys, key]))))
    }
  }

  let onCheck = (keys, event) => {
    let { addKeys, removeKeys } = getChangedKeys(keys, props.checkedKeys)
    let selectKey = lastSelectedKey.current
    if (event.node?.children?.length || event.node.type === Tree_Type.singleBattery) {
      // 选择不同电池组，只选中后选中的电池组下的设备
      if (addKeys.length > 0) {
        const targetKey = getFirstDeviceKey(addKeys, treeList)
        if (props.checkedKeys.length > 0) {
          let prevKey = getFirstDeviceKey(props.checkedKeys, treeList)
          const prevParentId = getParentNode(prevKey, treeList, props.checkedKeys).id
          const targetParentId = getParentNode(targetKey, treeList, keys).id
          // console.log(prevKey, getFirstTreeNode(prevKey, treeList, props.checkedKeys), getFirstTreeNode(targetKey, treeList, keys))
          if (prevParentId !== targetParentId) {
            keys = addKeys
          }
        }
        selectKey = identity(getFirstTreeNode(targetKey, treeList, keys))
      } else if (removeKeys.indexOf(selectKey) > -1) {
        let firstItem = getFirstTreeNode(
          getFirstDeviceKey(keys, treeList),
          treeList,
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
        let selectedItem = findTreeItem(treeList, item => identity(item) == selectKey)
        props.action('fetchDeviceDetail', { deviceId: selectedItem?.id })
      } else {
        props.setTreeType(null)
      }
    } else {
      createServices<{ parentId: number, activity: boolean }>("get", "/api/basic-data-management/equipment-ledger/devices/getDeviceTreeChild", { parentId: event.node.id })
        .then(data => {
          if (!data?.results?.length) {
            message.error('返回数据为空')
            return;
          }

          setTreeList(tList => {
            const newTreeList = updateTreeData(tList, event.node.key, data?.results || [])
            props.loadSucFuc && props.loadSucFuc(newTreeList);

            const treeChild = sessionStorage.getItem("treeList")
            const newTree = (data?.results || []).map((item, index) => ({ ...item, key: `${event.node.key}-${index}` }))
            if (treeChild && treeChild !== '') {
              sessionStorage.setItem("treeList", JSON.stringify([...JSON.parse(treeChild), ...newTree]))
            } else {
              sessionStorage.setItem("treeList", JSON.stringify([...newTree]))
            }

            // 选择不同电池组，只选中后选中的电池组下的设备
            addKeys = [...addKeys, ...data?.results.map((item, index) => `${event.node.key}-${index}`)]

            if (addKeys.length > 0) {
              const targetKey = getFirstDeviceKey(addKeys, newTreeList)
              // if (props.checkedKeys.length > 0) {
              //   let prevKey = getFirstDeviceKey(props.checkedKeys, newTreeList)
              //   const prevParentId = getFirstTreeNode(prevKey, newTreeList, props.checkedKeys).id
              //   const targetParentId = getFirstTreeNode(targetKey, newTreeList, keys).id
              //   if (prevParentId !== targetParentId) {
              //     keys = addKeys
              //   }
              // }
              selectKey = identity(getFirstTreeNode(targetKey, newTreeList, addKeys))
            } else if (removeKeys.indexOf(selectKey) > -1) {
              let firstItem = getFirstTreeNode(
                getFirstDeviceKey(keys, newTreeList),
                newTreeList,
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
              let selectedItem = findTreeItem(newTreeList, item => identity(item) == selectKey)
              props.action('fetchDeviceDetail', { deviceId: selectedItem?.id })
            } else {
              props.setTreeType(null)
            }
            return newTreeList
          })

        })
    }

  }

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

  const defaultExpandKeysHandle = (treeList) => {
    const expanded = [];
    traverseTree(treeList, leaf => {
      let key = identity(leaf);
      if (!userCloseKeys?.length && (leaf.type === 'BatteryCluster' && !leaf.children?.length || leaf.type === "Pack")) {
        expanded.push(key);
      } else if (userCloseKeys?.length && userCloseKeys.indexOf(key) > -1 || (leaf.type === 'BatteryCluster' && !leaf.children?.length || leaf.type === "Pack")) {
        expanded.push(key);
      }
      return null;
    })
    if (!userCloseKeys?.length) setLoadKeys(expanded)
    return expanded;
  };

  useEffect(() => {
    const closeKeys = defaultExpandKeysHandle(props.treeList);
    setUserCloseKeys(closeKeys)
    setTreeList(props.treeList)
    // setLoadKeys([])
  }, [JSON.stringify(props.treeList)])

  // 过滤用户收起的节点
  let allKeys = getKeys(treeList)
  let expandedKeys = allKeys.filter(key => userCloseKeys.indexOf(key) == -1)
  return (
    <AutoSizer>
      {
        ({ width, height }) => {
          if (height == 0) {
            return null
          }
          return (
            <Tree
              showLine
              showIcon
              expandedKeys={expandedKeys}
              selectedKeys={props.selectedKeys}
              checkedKeys={props.checkedKeys}
              loadedKeys={expandedKeys}
              onSelect={onSelect}
              onExpand={(keys, e) => !disabled && handleExpand(keys, e)}
              onCheck={onCheck}
              checkable={true}
              height={height}
              treeData={handlerTree(treeList)}
              loadData={(node) => {
                return new Promise<void>(resolve => {
                  const { key, id, children, hasChild } = node
                  if (hasChild) {
                    createServices<{ parentId: number, activity: boolean }>("get", "/api/basic-data-management/equipment-ledger/devices/getDeviceTreeChild", { parentId: id })
                      .then(data => {
                        setTreeList(tList => {
                          const newTreeList = updateTreeData(tList, key, data?.results || [])
                          props.loadSucFuc && props.loadSucFuc(newTreeList);
                          const treeChild = sessionStorage.getItem("treeList")
                          const newTree = (data?.results || []).map((item, index) => ({ ...item, key: `${key}-${index}` }))
                          if (treeChild && treeChild !== '') {
                            sessionStorage.setItem("treeList", JSON.stringify([...JSON.parse(treeChild), ...newTree]))
                          } else {
                            sessionStorage.setItem("treeList", JSON.stringify([...newTree]))
                          }
                          return newTreeList
                        })
                        // setLoadKeys(loadKeys.filter(item => item !== key))
                        setDisabled(false);
                        resolve();
                      }).catch(() => {
                        setDisabled(false);
                        resolve();
                      })
                  } else {
                    resolve();
                  }
                })
              }}
              onLoad={(loadedKeys) => {
                setLoadKeys(loadedKeys)
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

// 获取当前节点的父节点
function getParentNode(key, treeList, keysRange) {
  if (keysRange.length === 0) return null
  let parentNode = null
  findTreeItem(treeList, (item, parent) => {
    if (identity(item) == key) {
      parentNode = parent
      return true
    }
  })
  return parentNode
}
