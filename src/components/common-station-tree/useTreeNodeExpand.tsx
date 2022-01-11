import React, { useState, useEffect } from "react";

interface Props {
  defaultExpanded?: string[];
  defaultExpandAll?: boolean;
  nodeList?: any[];
  keygen?: string;
}

// 自定义树展开功能
export function useTreeNodeExpand(props: Props = {}) {
  const { keygen = "id", nodeList } = props;
  const [expanded, setExpanded] = useState([]);

  const getExpandedNode = (nodeList: any[] = [], needExpandList = []) => {
    nodeList.forEach(node => {
      if (node.children) {
        needExpandList.push(node[keygen]);
        if (node.children.length > 0) {
          needExpandList = needExpandList.concat(
            getExpandedNode(node.children)
          );
        }
      }
    });
    return needExpandList;
  };

  useEffect(() => {
    const { defaultExpanded, defaultExpandAll } = props;
    if (defaultExpanded) {
      setExpanded(defaultExpanded);
    }
    if (defaultExpandAll && nodeList) {
      setExpanded(getExpandedNode(nodeList));
    }
  }, [JSON.stringify(nodeList)]);

  const toggleTreeNode = keys => {
    let newExpanded = expanded.slice();
    keys.forEach(key => {
      if (newExpanded.indexOf(key) > -1) {
        newExpanded = newExpanded.filter(id => id !== key);
      } else {
        newExpanded = newExpanded.concat(key);
      }
    });
    setExpanded(newExpanded);
  };

  const onExpand = newExpanded => {
    setExpanded(newExpanded);
  };

  return { expanded, toggleTreeNode, onExpand };
}
