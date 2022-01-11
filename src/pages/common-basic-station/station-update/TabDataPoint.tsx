import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Empty } from 'antd'
import classnames from 'classnames'
import { Tree } from 'wanke-gui'
import DataPoint from '../data-point/DataPoint'
import FullContainer from '../../../components/layout/FullContainer'
import { ActionProp } from '../../../interfaces/MakeConnectProps'
import { stationDataPointNS, Tree_Type } from '../../constants'
import { traverseTree } from '../../page.helper'
import { getKeys, identity } from '../station.helper'
import Tools from '../../../components/layout/Tools'
import Back1 from '../../../components/layout/Back1'
import { NavigateProps } from '../../../public/navigateHoc'
import AutoSizer from '../../../components/AutoSizer'
import Confirm from '../../../components/Confirm'
import { copy } from '../../../util/utils';
import utils from '../../../public/js/utils'
import createServices from '../../../util/createServices'
import Page from '../../../components/Page'
import { makeConnect } from '../../umi.helper'
import PageProps from '../../../interfaces/PageProps'

// const TreeNode = Tree.TreeNode
// 数据采集信息页签
interface Props extends ActionProp, NavigateProps, PageProps {
  editable: boolean
  stationId: number

  deviceId: any
  detail: any
  pageId: any
  deviceType: any
  back: any
}

const TabDataPoint: React.FC<Props> = function (this: null, props) {
  const [deviceId, setDeviceId] = useState(props.deviceId);

  // 主动点击关闭的key列表
  // const [userCloseKeys, setUserCloseKeys] = React.useState([]);
  // 是否编辑模式
  const [editMode, setEditMode] = useState(false);
  // 确认取消编辑
  const [showConfirmCancelEdit, setShowConfirmCancelEdit] = useState(false);
  // const [treeList, setTreeList] = useState(props.deviceTree)
  // const nextKeyRef = useRef<string>(null);
  const operationType = useRef<string>(null);


  // const handlerTree = (tree) => {
  //   if (!tree || !tree.length) {
  //     return null;
  //   }

  //   return tree.map(item => {
  //     let leaf = copy(item);

  //     if (leaf.activity === false && leaf.type !== Tree_Type.virtualNode) {
  //       leaf.title = leaf.title + utils.intl('(无效)');
  //     }
  //     const disabled = !leaf.type || leaf.type == Tree_Type.virtualNode || leaf.type == Tree_Type.energyUnit;

  //     leaf.disabled = disabled;
  //     leaf.isLeaf = !leaf.hasChild && !leaf?.children?.length

  //     if (leaf.children) {
  //       leaf.children = handlerTree(leaf.children);
  //     }
  //     return leaf;
  //   });
  // }

  // const defaultExpandKeysHandle = treeList => {
  //   const expanded = [];
  //   traverseTree(treeList, leaf => {
  //     let key = identity(leaf);
  //     if (leaf.type === 'BatteryCluster' && !leaf.children?.length || leaf.type === "Pack") {
  //       expanded.push(key);
  //     }
  //     return null;
  //   })
  //   return expanded;
  // };

  // const updateTreeData = (list: any[], key: React.Key, children: any[]): any[] => {
  //   return list.map((node) => {
  //     if (node.key === key) {
  //       return {
  //         ...node,
  //         children: children?.map((item, index) => ({ ...item, key: `${key}-${index}`})),
  //       };
  //     }
  //     if (node.children?.length) {
  //       return {
  //         ...node,
  //         children: updateTreeData(node.children, key, children),
  //       };
  //     }
  //     return node;
  //   });
  // }

  // let handleExpand = (keys, event) => {
  //   let key = event.node.props.eventKey

  //   if (!event.expanded) {
  //     if (userCloseKeys.indexOf(key) == -1) {
  //       setUserCloseKeys([...userCloseKeys, key])
  //     }
  //   } else {
  //     if (userCloseKeys.indexOf(key) != -1) {
  //       userCloseKeys.splice(userCloseKeys.indexOf(key), 1)
  //       setUserCloseKeys([...userCloseKeys])
  //     }
  //   }
  // }


  // useEffect(() => {
  //   props.action('getDeviceTree', { stationId: props.stationId, activity: true });
  // }, [])

  // useEffect(() => {
  //   const closeKeys = defaultExpandKeysHandle(props.deviceTree);
  //   setTreeList(props.deviceTree)
  //   setUserCloseKeys(closeKeys);
  // }, [props.deviceTree])

  // const back = () => {
  //   if (editMode) {
  //     operationType.current = 'back';
  //     setShowConfirmCancelEdit(true);
  //   } else {
  //     props.back();
  //   }
  // }

  // const onSelect = (keys) => {
  //   if (keys.length == 0) {
  //     return;
  //   }
  //   nextKeyRef.current = keys[0];
  //   if (editMode) {
  //     operationType.current = 'onSelect';
  //     setShowConfirmCancelEdit(true);
  //   } else {
  //     // doSelect();
  //   }
  // }

  // const doSelect = () => {
  //   const key = nextKeyRef.current;
  //   // 选中自身不请求
  //   if (key === deviceId) {
  //     return;
  //   }
  //   const type = traverseTree(treeList, (item) => {
  //     if (key == identity(item)) {
  //       return item.type;
  //     }
  //     return null;
  //   })
  //   if (type == Tree_Type.virtualNode || type == Tree_Type.energyUnit) {
  //     return;
  //   }
  //   if (type) {
  //     setDeviceId(key);
  //   }
  // }

  // const selectDevice = traverseTree(treeList, (item) => {
  //   if (deviceId == identity(item)) {
  //     return item;
  //   }
  //   return null;
  // })

  const onConfirm = () => {
    setShowConfirmCancelEdit(false);
    setEditMode(false);
    if (operationType.current == 'back') {
      props.back();
    } else if (operationType.current == 'onSelect') {
      // doSelect();
    }
  }

  // console.log(handlerTree(props.deviceTree))
  // let allKeys = getKeys(treeList)
  // let expandedKeys = allKeys.filter(key => userCloseKeys.indexOf(key) == -1)

  return (
    <Page pageId={props.pageId} pageTitle={'数据采集配置'} className={'data-point-page'}>
      <FullContainer>
        {
          showConfirmCancelEdit && (
            <Confirm
              message={utils.intl('该操作将不会保留本次编辑的结果，请确认是否返回之前的页面')}
              visible={showConfirmCancelEdit}
              onConfirm={onConfirm}
              onCancel={() => setShowConfirmCancelEdit(false)}
            />
          )
        }
        <div className="d-flex flex1">
          <FullContainer className="flex1">
            {
              !deviceId && (
                <Empty description={utils.intl("请选择设备")} />
              )
            }
            {
              deviceId && (
                <DataPoint
                  editable={props.editable}
                  stationId={props.stationId}
                  deviceId={props.detail?.id}
                  type={props.detail?.type}
                  deviceTypeId={props.deviceType}
                  title={props.detail?.title}
                  editMode={editMode}
                  setEditMode={setEditMode}
                  showConfirmCancelEdit={showConfirmCancelEdit}
                  setShowConfirmCancelEdit={setShowConfirmCancelEdit}
                  forward={props.forward}
                  parentPageNeedUpdate={props.parentPageNeedUpdate}
                  back={props.back}
                // back={props.back}
                />
              )
            }
          </FullContainer>
        </div>
      </FullContainer>
    </Page>
  )
}

// const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
//   return {
//     ...model,
//   }
// }

// export default makeConnect(stationDataPointNS, mapStateToProps)(TabDataPoint)
export default TabDataPoint