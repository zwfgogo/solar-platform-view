import React, { useEffect, useState } from "react";
import { connect } from "dva";
import CommonTree from "./CommonTree";

interface NodeData {
  id: string;
  title: string;
  longitude: number;
  latitude: number;
  [key: string]: any;
}

interface Props {
  toggleAble?: boolean;
  dispatch?: any;
  list?: any[];
  treeLoading?: boolean;
  className?: string;
  activeKey?: string;
  onChildrenClick?: (node: NodeData) => void | boolean; // 返回false可以阻止选中节点
  disableFirstChildSelect?: boolean; // 禁用初始化时默认点击第一个子节点
  showAllNode?: boolean;
}

const CommonStationTree: React.FC<Props> = ({
  toggleAble,
  treeLoading,
  dispatch,
  list,
  onChildrenClick,
  className,
  activeKey,
  disableFirstChildSelect,
  showAllNode
}) => {
  const fetchTree = (queryStr: string) => {
    console.log("fetchTree");
    dispatch({ type: "stationTree/getTreeData", payload: { queryStr, showAllNode } }).then(
      data => {
        if (disableFirstChildSelect) return;
        const { pointList, activeKey } = data;
        if (!activeKey && pointList.length > 0) {
          onClick(pointList[0]);
        }
      }
    );
  };

  useEffect(() => {
    return () => {
      dispatch({
        type: "stationTree/reset",
        payload: {}
      });
    };
  }, []);

  const onClick = node => {
    const result = onChildrenClick && onChildrenClick(node);
    if (result === false) return;
    dispatch({
      type: "stationTree/updateToView",
      payload: { activeKey: node.id.toString() }
    });
  };

  const handleSearch = (val: string) => {
    fetchTree(val);
  };

  const formatList = (list: any[]) => {
    if(!showAllNode && list?.[0]?.key === 'all') {
      return list[0].children || [];
    }
    return list;
  }

  return (
    <CommonTree
      toggleAble={toggleAble}
      className={className}
      onChildrenClick={onClick}
      fetchData={handleSearch}
      treeLoading={treeLoading}
      activeKey={activeKey}
      treeList={formatList(list)}
    />
  );
};

const mapStateToProps = state => {
  const { treeData, activeKey } = state.stationTree;

  let results = {
    activeKey,
    ...treeData,
    treeLoading: state.loading.effects["stationTree/getTreeData"]
  };
  return results;
};

export default connect(mapStateToProps)(CommonStationTree);
