import React, { Component } from 'react';
import { Tree } from 'antd';
import { traverseTree } from '../../pages/page.helper';

interface Props {
  height: number;
  expanded: any[];
  onExpand: (newExpand: any[]) => void;
  equipmentTree: any[];
  // defaultExpanded: any[];
  selectKey: any;
  onChildClick: Function;
  forwardedRef: any;
}

function isPropsEqual(nextProps, curProps, attrList) {
  const nextPropsObject = {};
  const curPropsObject = {};
  attrList.forEach(attr => {
    curPropsObject[attr] = curProps[attr];
    nextPropsObject[attr] = nextProps[attr];
  });
  return JSON.stringify(nextPropsObject) === JSON.stringify(curPropsObject);
}
const updateProp = ['height', 'expanded', 'equipmentTree', 'selectKey'];

class StationTree extends Component<Props> {
  shouldComponentUpdate(nextProps, nextState) {
    if(isPropsEqual(nextProps, this.props, updateProp)) return false;
    return true;
  }

  handleSelect = (selectedKeys, event) => {
    const { node: { key } } = event;
    const node = traverseTree(this.props.equipmentTree, (item) => {
      if (key == item.key) {
        return item
      }
      return null
    })
    console.log(node);
    if(node) {
      this.props.onChildClick && this.props.onChildClick(node.id, node.typeId, !!node.activity, node.key);
    }
  }

  render() {
    const { equipmentTree, selectKey, onChildClick, expanded, onExpand, height, forwardedRef } = this.props;
    console.log('render', selectKey);

    return (
      <Tree
        ref={forwardedRef}
        showLine
        height={height}
        expandedKeys={expanded}
        selectedKeys={selectKey ? [selectKey] : []}
        onSelect={this.handleSelect}
        onExpand={onExpand}
        treeData={equipmentTree}
      />
    );
  }
}

const ForwardedRefWrap = Component => {
  const RefComponent = (props, ref) => {
    return (
      <Component forwardedRef={ref} {...props} />
    );
  }
  return React.forwardRef(RefComponent);
}

export default ForwardedRefWrap(StationTree);