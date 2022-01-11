import React from 'react'
import MyCard from './MyCard'
import CommonTitle from './CommonTitle'
import styles from './styles/overview-card.less'
import utils from '../../../util/utils'

import utils1 from '../../../public/js/utils'

function formatEmptyValue(value: any) {
  return value === null || value === undefined ? '' : value
}

interface CardData {
  name?: string;
  value?: string;
  unit?: string;
}

interface Props {
  dataList: CardData[]
  index: number
  title: string
  subTitle: string
  getIcon: (props: any) => any
}

const OverviewCard: React.FC<Props> = props => {
  let {dataList, title, subTitle, getIcon} = props
  dataList = dataList.concat([{}, {}, {}, {}]).slice(0, 4)

  const getNumber = (item: CardData, unitClassName?: string) => {
    return (
      <span>
        {
          utils.addMicrometerOperator(
            formatEmptyValue(item.value).toString()
          )
        }
        <span className={unitClassName}>{item.unit ? `${item.unit}` : ''}</span>
      </span>
    )
  }

  return (
    <MyCard className={styles['overview-card']}>
      <CommonTitle title={title}/>
      <div className={styles['content']}>
        <div className={styles['left']}>
          <div className={styles['current-value']}>
            {getIcon({
              className: styles['icon'],
              style: {color: '#0062ff'}
            })}
            <span>{getNumber(dataList[1], styles['today-unit'])}</span>
          </div>
          <div className={styles['current-label']}>
            {subTitle ? subTitle : ''}
          </div>
        </div>
        <div className={styles['right']}>
          <p className={styles['line']}>
            <span className={styles['title']}>{utils1.intl('index.本月')}</span>
            <span className={styles['label']}>
              <span className={styles['value']}>{getNumber(dataList[2], styles['unit'])}</span>
            </span>
          </p>
          <p className={styles['line']}>
            <span className={styles['title']}>{utils1.intl('index.本年')}</span>
            <span className={styles['label']}>
              <span className={styles['value']}>{getNumber(dataList[3], styles['unit'])}</span>
            </span>
          </p>
          <p className={styles['line']}>
            <span className={styles['title']}>{utils1.intl('index.累计')}</span>
            <span className={styles['label']}>
              <span className={styles['value']}>{getNumber(dataList[0], styles['unit'])}</span>
            </span>
          </p>
        </div>
      </div>
    </MyCard>
  )
}

export default OverviewCard
