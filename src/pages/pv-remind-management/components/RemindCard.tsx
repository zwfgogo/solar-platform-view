import React, { CSSProperties, useEffect, useState } from 'react'
import { Button, Popconfirm } from 'wanke-gui'
import { EditOutlined } from 'wanke-icon'
import classnames from 'classnames'
import styles from './styles/remind-card.less'
import utils from '../../../public/js/utils'

export enum TagType {
  ExpireSoon = 1,
  Expired = 2
} 

interface Props {
  title: string
  contentList: any[][]
  style?: CSSProperties
  tagType?: TagType
  onDelete?: () => void
  onEdit?: () => void
}

const RemindCard: React.FC<Props> = (props) => {
  const [showMenu, setShowMenu] = useState(false)

  const renderTag = () => {
    switch (props.tagType) {
      case TagType.ExpireSoon:
        return <span className={styles['tag']}>{utils.intl('remind.即将到期')}</span>
      case TagType.Expired:
        return <span className={classnames(styles['tag'], styles['grey'])}>{utils.intl('remind.已到期')}</span>
    }
    return ''
  }

  const handleMouseOver = () => {
    setShowMenu(true)
  }

  const handleMouseLeave = () => {
    setShowMenu(false)
  }

  return (
    <section
      style={props.style}
      className={classnames(styles['remind-card'], { [styles['show-menu']]: showMenu })}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      {renderTag()}
      <header className={styles['header']} title={props.title}>{props.title}</header>
      <div className={styles['content']}>
        {props.contentList.map((item, index) => {
          return (
            <div key={index} className={styles['content-line']}>
              <span>{item[0]}</span>
              <span title={item[1]}>{item[1]}</span>
            </div>
          )
        })}
      </div>
      <footer className={styles['footer']}>
        <Popconfirm
          title={utils.intl('确定删除吗')}
          placement="topRight"
          onConfirm={props.onDelete}
        >
          <a className={classnames(styles['btn'], styles['btn-grey'])} style={{ marginRight: 5 }}>{utils.intl('remind.删除')}</a>
        </Popconfirm>
        <a
          className={classnames(styles['btn'], styles['btn-blue'])}
          type="primary"
          onClick={props.onEdit}
        ><EditOutlined />{utils.intl('remind.编辑')}</a>
      </footer>
    </section>
  )
}

export default RemindCard
