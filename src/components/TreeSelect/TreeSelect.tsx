import React, { useRef, useEffect, useState } from 'react'
import styles from './tree-select.less'
import { Button, Tree, FullLoading, Empty, SearchInput, Popover } from 'wanke-gui'
import { CaretDownOutlined, WankeClearOutlined, WankeEmptyOutlined } from 'wanke-icon'
import { IconType } from 'antd/lib/notification'
import classnames from 'classnames'
import useTreeHelper from './useTreeHelper'
import { useTreeNodeExpand } from '../common-station-tree/useTreeNodeExpand'
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
  label: string
  title: string
  treeData: DataNode[]
  placeholder?: string
  onCheck?: (checkedKeys: string[], obj) => void
  className?: string
  singleCheck?: boolean
  noSearch?: boolean
  size?: 'small' | 'normal'
  defaultCheck?: string[]
  loading?: boolean
  showAll?: boolean
  checkedKeys?: any[]
}


const getObjByKey = function (key, treeList, level = 0) {
  let result = null;
  if (!key || key === '') return null
  if (level === 2) {
    result = treeList.find(item => `${item.key}` === `${key}`)
  } else {
    treeList.forEach(item => {
      const { children } = item
      const obj = getObjByKey(key, children, level + 1)
      if (obj) result = obj
    })
  }
  return result
}


const TreeSelect: React.FC<Props> = (props) => {
  let {
    label = '',
    title,
    treeData,
    onCheck,
    className,
    singleCheck,
    noSearch,
    size,
    defaultCheck = [],
    loading,
    showAll,
    checkedKeys: receiveCheckedKeys,
    placeholder = ''
  } = props;

  const showAllNode = showAll && treeData.length;

  if (showAllNode) {
    treeData = [{
      title: utils.intl('全部'),
      key: 'all',
      children: treeData
    }]
  }

  const [showOverlay, setShowOverlay] = useState(false);
  const [searchViewText, setSearchViewText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [lastCheckedKey, setLastCheckedKey] = useState(defaultCheck);

  const { treeList, checkedKeys, displayCheckedKeys, handleCheck, resetCheckKeys } = useTreeHelper({
    treeData,
    searchText,
    singleCheck,
    defaultCheck
  });

  const { expanded, toggleTreeNode, onExpand } = useTreeNodeExpand({
    // defaultExpandAll: true,
    defaultExpanded: showAllNode ? ['all'] : [],
    nodeList: treeList,
    keygen: "key"
  });

  const handleConfirm = () => {
    const obj = getObjByKey(checkedKeys[0], treeList)
    // console.log('treeList', treeList, obj)
    setLastCheckedKey(checkedKeys)
    onCheck && onCheck(checkedKeys, obj)
    toggleVisible()
  }

  const handleCancel = () => {
    resetCheckKeys(lastCheckedKey)
    toggleVisible()
  }

  const handleSearch = (val: string) => {
    setSearchText(val)
  }

  const toggleVisible = () => {
    if (!showOverlay) {
      setSearchText('')
      setSearchViewText('')
    }
    setShowOverlay(!showOverlay)
  }

  useEffect(() => {
    if (receiveCheckedKeys) {
      setLastCheckedKey(receiveCheckedKeys)
      resetCheckKeys(receiveCheckedKeys)
    }
  }, [JSON.stringify(receiveCheckedKeys)])

  return (
    <div className={classnames(styles['tree-select'], styles[size])}>
      <Popover 
      placement="bottomLeft"
      overlayClassName="treeSelect-overlay"
      title={null} content={
        <section className={styles['overlay']} style={showOverlay ? {} : { display: 'none' }}>
          <header className={styles['header']}>
            <span>{title}</span>
            <WankeClearOutlined style={{ color: '#92929d', cursor: 'pointer' }} onClick={handleCancel} />
          </header>
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
            {loading && <FullLoading />}
            <div className={styles['scroll']}>
              {
                treeList.length > 0 ? (
                  <Tree
                    checkable
                    expandedKeys={expanded}
                    onExpand={onExpand}
                    selectable={false}
                    checkedKeys={displayCheckedKeys}
                    treeData={treeList}
                    onCheck={handleCheck}
                  />
                ) : (<Empty image={<WankeEmptyOutlined style={{ display: 'inline-block', fontSize: '80px', color: '#dedede', marginTop: 30 }} />} />)
              }
            </div>
          </div>
          <footer className={styles['footer']}>
            <Button type="primary" style={{ width: 120 }} onClick={handleConfirm}>{utils.intl('确定')}</Button>
          </footer>
        </section>
      } visible={showOverlay}>
        <div className={classnames(styles['select'], {
          [className]: !!className
        })} onClick={handleCancel}>
          <span>{label}</span>
          <span className={styles['icon']}>
            <CaretDownOutlined style={{ fontSize: 12 }} />
          </span>
        </div>
      </Popover>

      {/* <section className={styles['overlay']} style={showOverlay ? {} : { display: 'none' }}>
        <header className={styles['header']}>
          <span>{title}</span>
          <WankeClearOutlined style={{ color: '#92929d', cursor: 'pointer' }} onClick={handleCancel} />
        </header>
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
          {loading && <FullLoading />}
          <div className={styles['scroll']}>
            {
              treeList.length > 0 ? (
                <Tree
                  checkable
                  expandedKeys={expanded}
                  onExpand={onExpand}
                  selectable={false}
                  checkedKeys={displayCheckedKeys}
                  treeData={treeList}
                  onCheck={handleCheck}
                />
              ) : (<Empty image={<WankeEmptyOutlined style={{ display: 'inline-block', fontSize: '80px', color: '#dedede', marginTop: 30 }} />} />)
            }
          </div>
        </div>
        <footer className={styles['footer']}>
          <Button type="primary" style={{ width: 120 }} onClick={handleConfirm}>{utils.intl('确定')}</Button>
        </footer>
      </section> */}
    </div>
  )
}

export default TreeSelect