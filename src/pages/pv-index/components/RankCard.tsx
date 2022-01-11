import React, {useState} from 'react'
import styles from './styles/rank-card.less'
import CommonTitle from './CommonTitle'
import {Dropdown, Progress, Bubble, FullLoading} from 'wanke-gui'
import {Menu} from 'antd'
import {CaretDownFilled, CaretUpFilled} from 'wanke-icon'
import classnames from 'classnames'
import utils  from "../../../public/js/utils";

const rangeList = [{
  key: 'day',
  title: utils.intl("index.今日")
}, {
  key: 'month',
  title: utils.intl("index.本月")
}, {
  key: 'year',
  title: utils.intl("index.本年")
}, {
  key: 'total',
  title: utils.intl("index.累计")
}]

interface RangePickerProps {
  value: string
  onChange: (key: string) => void
}

const RangePicker: React.FC<RangePickerProps> = ({value, onChange}) => {
  const menu = (
    <Menu>
      {
        rangeList.map(item => (
          <Menu.Item key={item.key} onClick={() => onChange(item.key)}>
            {item.title}
          </Menu.Item>
        ))
      }
    </Menu>
  )
  const target = rangeList.find(item => item.key === value)

  return (
    <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
      <span style={{cursor: 'pointer', userSelect: 'none', paddingRight: 8}}>
        {target.title}<CaretDownFilled style={{color: '#92929d', fontSize: 12, marginLeft: 2}}/>
      </span>
    </Dropdown>
  )
}

interface RankItemProps {
  name: string
  value: string
  percent: number
}

const RankItem: React.FC<RankItemProps> = ({name, value, percent}) => {
  return (
    <div className={styles['rank-item']}>
      <div className={styles['title']}>
        <span className={styles['label-box']}>
          <Bubble bubble={true} placement={undefined}>
            <span className={styles['label']}>{name}</span>
          </Bubble>
        </span>
        <span className={styles['value-box']}>
          <Bubble bubble={true} placement={undefined}>
            <span className={styles['value']} style={{color: '#0062ff'}}>{value}</span>
          </Bubble>
        </span>
      </div>
      <Progress percent={percent} showInfo={false} size="small" status="active"/>
    </div>
  )
}

function getPercent(value, total) {
  if (!total) return 0
  return Number(((value ?? 0) * 100 / total).toFixed(2))
}

interface Props {
  title: string
  list: any[]
  isPercent: boolean
  mod: string
  loading: boolean
  handleRangeChange: (key: string) => void
}

const RankCard: React.FC<Props> = (props) => {
  const [isPrev, setIsPrev] = useState(true)
  let {title, list, isPercent, mod, handleRangeChange} = props
  list = list.sort((prev, next) => (next.value || 0) - (prev.value || 0))
  const dataList = isPrev ? list.slice(0, 5) : list.slice(-5).reverse()
  const max = isPrev ? dataList[0]?.value : dataList[dataList.length - 1]?.value

  return (
    <div className={styles['rank-card']}>
      <CommonTitle title={title}/>
      <div className={styles['time-menu']}><RangePicker value={mod} onChange={handleRangeChange}/></div>
      <div className={styles['type-menu']}>
        <span onClick={() => setIsPrev(true)} className={classnames(styles['tab'], {[styles['active']]: isPrev})}>{utils.intl("index.前5名")}<CaretDownFilled style={{fontSize: 12, marginLeft: 2}}/>
        </span>
        <span onClick={() => setIsPrev(false)} className={classnames(styles['tab'], {[styles['active']]: !isPrev})}>{utils.intl("index.后5名")}<CaretUpFilled style={{fontSize: 12, marginLeft: 2}}/>
        </span>
      </div>
      <div className={classnames(styles['content'], {
        [styles['low-then-5']]: dataList.length < 5
      })}>
        {props.loading && <FullLoading />}
        {
          dataList.map(item => (
            <RankItem
              name={item.title}
              value={isPercent ? `${item.value}%` : `${item.value}h`}
              percent={isPercent ? item.value : getPercent(item.value, max)}
            />
          ))
        }
      </div>
    </div>
  );
}

export default RankCard