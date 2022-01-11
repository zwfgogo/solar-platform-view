import React, { useRef, useEffect, useState } from 'react'
import { Button, Tree, FullLoading, Empty } from 'wanke-gui'
import { CaretDownOutlined, WankeClearOutlined } from 'wanke-icon'
import { IconType } from 'antd/lib/notification'
import classnames from 'classnames'
import styles from './multiply-tree-select.less'
import TreeList from './TreeList'
import { triggerEvent } from '../../util/utils'
import utils from '../../public/js/utils';

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

interface Option {
  title?: string
  singleCheck?: boolean
  showAll?: boolean
  loading?: boolean
  placeholder?: string
  isVirtual?: boolean
  checkExamine?: (keys: string[]) => boolean
}

interface Props {
  title: string
  treeData: DataNode[][]
  onCheck?: (checkedKeys: string[][]) => void | boolean
  onDisplayCheck?: (checkedKeys: string[][]) => void
  className?: string
  checkedKeys?: any[][]
  optionList?: Option[]
}

const MultiplyTreeSelect: React.FC<Props> = (props) => {
  let {
    title,
    treeData,
    onCheck,
    onDisplayCheck,
    className,
    checkedKeys: receiveCheckedKeysList,
    children,
    optionList = []
  } = props;

  const [showOverlay, setShowOverlay] = useState(false);
  const [checkedKeysList, setCheckedKeysList] = useState([[], []]);
  const [displayCheckedKeysList, setDisplayCheckedKeysList] = useState([[], []]);
  const [lastCheckedKeysList, setLastCheckedKeysList] = useState([[], []]);

  const handleConfirm = () => {
    let flag = true
    if(onCheck) {
      const result = onCheck(checkedKeysList)
      if(typeof result === 'boolean') flag = result
    }
    if(flag) {
      setLastCheckedKeysList(checkedKeysList)
      toggleVisible()
    }
  }

  const handleCheck = (keys, index) => {
    const newKeys = checkedKeysList.slice()
    newKeys[index] = keys
    setCheckedKeysList(newKeys)
  }

  const handleDisplayCheck = (keys, index) => {
    displayCheckedKeysList[index] = keys
    setDisplayCheckedKeysList(displayCheckedKeysList)
    onDisplayCheck && onDisplayCheck(displayCheckedKeysList.slice())
  }

  const handleCancel = () => {
    setCheckedKeysList(lastCheckedKeysList)
    toggleVisible()
  }

  const toggleVisible = () => {
    setShowOverlay(!showOverlay)
    triggerEvent('resize', window)
  }

  useEffect(() => {
    if(receiveCheckedKeysList) {
      setLastCheckedKeysList(receiveCheckedKeysList)
      setCheckedKeysList(receiveCheckedKeysList)
    }
  }, [JSON.stringify(receiveCheckedKeysList)])

  return (
    <div className={classnames(styles['multiply-tree-select'])}>
      <div className={classnames(styles['select'], {
        [className]: !!className
      })} onClick={handleCancel}>
        {children}
      </div>
      <section className={styles['overlay']} style={showOverlay ? {} : { display: 'none' }}>
        <header className={styles['header']}>
          <span>{title}</span>
          <WankeClearOutlined style={{ color: '#92929d', cursor: 'pointer' }} onClick={handleCancel} />
        </header>
        <div className={styles['tree-container']}>
          {
            treeData.map((item, index) => (
              <div className={styles['tree-item']} key={index}>
                <TreeList
                  {...(optionList[index] || {})}
                  visible={showOverlay}
                  treeData={item || []}
                  onCheck={(keys) => handleCheck(keys, index)}
                  onDisplayCheck={(keys) => handleDisplayCheck(keys, index)}
                  checkedKeys={checkedKeysList[index]}
                />
              </div>
            ))
          }
        </div>
        <footer className={styles['footer']}>
          <Button type="primary" style={{ width: 120 }} onClick={handleConfirm}>{utils.intl('OK')}</Button>
        </footer>
      </section>
    </div>
  )
}

export default MultiplyTreeSelect