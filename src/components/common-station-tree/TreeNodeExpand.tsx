import React from 'react';
import { useTreeNodeExpand } from './useTreeNodeExpand';
import { traverseTree, getAllParentNodeByKey } from '../../pages/page.helper';

interface Props {
  defaultExpandAll?: boolean;
  nodeList?: any[];
  keygen?: string;
  children?: (expanded: any[], explandToNode: (key: string) => void, onExpand: (newExpand: any[]) => void) => React.ReactChild
}

const TreeNodeExpand: React.FC<Props> = ({
  defaultExpandAll,
  nodeList,
  keygen,
  children
}) => {
  const { expanded, toggleTreeNode, onExpand } = useTreeNodeExpand({
    defaultExpandAll,
    nodeList,
    keygen
  });

  const explandToNode = (key: string) => {
    const parentKeys = getAllParentNodeByKey(nodeList, key)
      .map(node => node.key);
    const needExpandKeys = parentKeys.filter(parentKey => expanded.indexOf(parentKey) < 0);
    if(needExpandKeys.length) toggleTreeNode(needExpandKeys);
  }

  return (
    <>
      {children(expanded, explandToNode, onExpand)}
    </>
  );
};

export default TreeNodeExpand;