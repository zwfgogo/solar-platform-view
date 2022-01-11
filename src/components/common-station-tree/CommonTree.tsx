import React, { useEffect, useState, useRef } from "react";
import { Input, Empty, Tree } from "wanke-gui";
import { useTreeNodeExpand } from "./useTreeNodeExpand";
import styles from "./common-tree.less";
import { FullLoading } from "wanke-gui";
import { WankeExpandOutlined, WankeUpOutlined } from 'wanke-icon'
import { traverseTree } from "../../pages/page.helper";
import utils from '../../public/js/utils'

export function formatTree(treeList, pointList = []) {
  if (!treeList) return treeList;
  return treeList.map(item => {
    const node = { ...item, key: item.id.toString(), disabled: true };
    if (node.children) {
      node.children = formatTree(node.children, pointList);
    } else {
      node.isClick = true;
      node.disabled = false;
      pointList.push(item);
    }
    return node;
  });
}

const { Search } = Input;

interface Props {
  treeList: any[];
  treeLoading?: boolean;
  className?: string;
  activeKey?: string;
  toggleAble?: boolean;
  fetchData?: (queryStr: string) => void;
  onChildrenClick?: (node: any) => void;
}

const CommonTree: React.FC<Props> = props => {
  const {
    className,
    fetchData,
    treeLoading,
    treeList = [],
    onChildrenClick,
    activeKey,
    toggleAble
  } = props;
  const [showMapTree, setShowMapTree] = useState(true);
  const treeContainerRef = useRef();
  const { expanded, toggleTreeNode, onExpand } = useTreeNodeExpand({
    defaultExpandAll: true,
    nodeList: treeList,
    keygen: "key"
  });

  useEffect(() => {
    fetchData && fetchData("");
    setShowMapTree(true);
    return () => {};
  }, []);

  const handleSearch = (val: string) => {
    fetchData && fetchData(val);
    setShowMapTree(true);
    if (treeContainerRef.current)
      (treeContainerRef.current as HTMLDivElement).scrollTop = 0;
  };

  const toggleMapTree = () => {
    setShowMapTree(!showMapTree);
  };

  const handleTreeScroll = () => {
    if (treeContainerRef.current) {
      (treeContainerRef.current as HTMLDivElement).scrollTop = 0;
    }
  };

  useEffect(() => {
    // 查询树的时候，阻止滚动
    if (treeLoading) {
      (treeContainerRef.current as HTMLDivElement).addEventListener(
        "scroll",
        handleTreeScroll
      );
    }
    return () => {
      (treeContainerRef.current as HTMLDivElement).removeEventListener(
        "scroll",
        handleTreeScroll
      );
    };
  }, [treeLoading]);

  const onSelect = (selectedKeys, event) => {
    const { node: { key } } = event;
    const node = traverseTree(treeList, (item) => {
      if (key == item.key) {
        return item
      }
      return null
    })
    if(node) {
      if (node.isClick) {
        // toggleTreeNode([node.key]);
      // } else {
        onChildrenClick && onChildrenClick(node);
      }
    }
  }

  return (
    <div
      className={`${styles["common-station-tree"]} ${
        className ? className : ""
      }`}
    >
      <div className={styles["filter-box"]}>
        <Search
          placeholder={utils.intl('请输入查询的电站名称')}
          onSearch={handleSearch}
        />
      </div>
      <div
        key="shine-tree"
        ref={treeContainerRef}
        className={styles["content"]}
        style={toggleAble && !showMapTree ? { display: "none" } : {}}
      >
        {treeLoading && <FullLoading />}
        <Tree
          showLine
          expandedKeys={expanded}
          selectedKeys={activeKey ? [activeKey] : []}
          onSelect={onSelect}
          onExpand={onExpand}
          treeData={treeList}
        />
        {treeList.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>
      {toggleAble ? (
        <div className={styles["footer"]} onClick={toggleMapTree}>
          {
            showMapTree ? (<WankeUpOutlined/>): (<WankeExpandOutlined/>)
          }
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default CommonTree;
