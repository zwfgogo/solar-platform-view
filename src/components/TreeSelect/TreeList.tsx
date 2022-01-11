import React, {useRef, useEffect, useState} from 'react'
import styles from './tree-list.less'
import {Button, Tree, FullLoading, Empty, AutoSizer, SearchInput} from 'wanke-gui'
import {IconType} from 'antd/lib/notification'
import classnames from 'classnames'
import useTreeHelper from './useTreeHelper'
import {useTreeNodeExpand} from '../common-station-tree/useTreeNodeExpand'
import utils from '../../public/js/utils'

interface DataNode {
  checkable?: boolean;
  children?: DataNode[];
  disabled?: boolean;
  disableCheckbox?: boolean;
  icon?: IconType;
  isLeaf?: boolean;
  key: string | number;
  title?: React.ReactNode;
  selectable?: boolean;
  switcherIcon?: IconType;
  className?: string;
  style?: React.CSSProperties;
}

interface Props {
  placeholder?: string
  title?: string
  treeData: DataNode[]
  onCheck?: (checkedKeys: string[]) => void
  onDisplayCheck?: (checkedKeys: string[]) => void
  className?: string
  singleCheck?: boolean
  noSearch?: boolean
  size?: 'small' | 'normal'
  loading?: boolean
  showAll?: boolean
  checkedKeys?: any[]
  isVirtual?: boolean
  checkExamine?: (keys: string[]) => boolean
  visible?: boolean
}

const TreeList: React.FC<Props> = (props) => {
  let {
    title,
    treeData,
    onCheck,
    onDisplayCheck,
    singleCheck,
    noSearch,
    loading,
    showAll,
    checkedKeys: receiveCheckedKeys,
    placeholder = '',
    isVirtual,
    checkExamine,
    visible
  } = props

  const showAllNode = showAll && treeData.length

  if (showAllNode) {
    treeData = [{
      title: utils.intl('全部'),
      key: 'all',
      children: treeData
    }]
  }

  const [searchViewText, setSearchViewText] = useState('')
  const [searchText, setSearchText] = useState('')

  const {treeList, checkedKeys, displayCheckedKeys, handleCheck, resetCheckKeys} = useTreeHelper({
    checkExamine,
    treeData,
    searchText,
    singleCheck,
    defaultCheck: receiveCheckedKeys,
    onCheck
  })

  const {expanded, toggleTreeNode, onExpand} = useTreeNodeExpand({
    // defaultExpandAll: true,
    defaultExpanded: showAllNode ? ['all'] : [],
    nodeList: treeList,
    keygen: 'key'
  })
  
  const handleClick = (tree, node) => {
    if (node.children && node.checkable === false) {
      toggleTreeNode([node.key])
    }
  }

  const handleSearch = (val: string) => {
    setSearchText(val)
  }

  useEffect(() => {
    if (!visible) {
      setSearchViewText('')
      setSearchText('')
    }
  }, [visible])

  useEffect(() => {
    if (receiveCheckedKeys) {
      resetCheckKeys(receiveCheckedKeys)
    }
  }, [JSON.stringify(receiveCheckedKeys)])

  useEffect(() => {
    onDisplayCheck && onDisplayCheck(displayCheckedKeys)
  }, [JSON.stringify(displayCheckedKeys)])

  return (
    <section className={classnames(styles['tree-list'])}>
      {title && (
        <header className={styles['header']}>
          <span>{title}</span>
        </header>
      )}
      {!noSearch && (
        <div className={styles['search']}>
          <SearchInput
            value={searchViewText}
            onChange={e => setSearchViewText(e.target.value)}
            searchSize="normal"
            className={styles['search-input']}
            placeholder={placeholder}
            onSearch={handleSearch}
          />
        </div>
      )}
      <div className={styles['tree-container']}>
        {loading && <FullLoading/>}
        <AutoSizer>
          {
            ({width, height}) => {
              return (<div className={styles['scroll']}>
                {
                  treeList.length > 0 && (
                    <Tree
                      checkable
                      height={isVirtual ? height || 160 : undefined}
                      expandedKeys={expanded}
                      onExpand={onExpand}
                      selectable={false}
                      checkedKeys={displayCheckedKeys}
                      treeData={treeList}
                      onCheck={handleCheck}
                      onClick={handleClick}
                    />
                  )
                }
                {
                  treeList.length == 0 && (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                  )
                }
              </div>)
            }
          }
        </AutoSizer>
      </div>
    </section>
  )
}

export default TreeList