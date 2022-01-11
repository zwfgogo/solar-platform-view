import React, { useState } from 'react'
import styles from './style/pieChart.less'
import classnames from 'classnames'
import { PieChart } from 'wanke-gui'
import { unitValueChange, valueUnitChange } from '../../page.helper'

const colorList = ['#0bfffc', '#286cfa', '#fb9f3e']

interface Props {
  className?: string
  abnormalChart?: any[]
  sum?: number
}

const ReportCard: React.FC<Props> = props => {
  const { className = '' } = props
  const series = props.abnormalChart || []
  const [hideList, setHideList] = useState([])

  const toggleLegend = (index) => {
    if (hideList.indexOf(index) == -1) {
      hideList.push(index)
    } else {
      hideList.splice(hideList.indexOf(index), 1)
    }
    setHideList(hideList.slice())
  }

  let filterList = series.map((item, index) => {
    return {
      name: item.name, value: item.value < 0 ? 0 : parseFloat(item.value), color: colorList[index]
    }
  }).filter((item, index) => hideList.indexOf(index) == -1)
  return (
    <div className={styles["income-pie"]}>
      <article className={styles['content']}>
        <aside className={styles['left']}>
          <PieChart
            options={{
              radius: [1.5, 1.8],
              tooltip: {
                render: (item, sum) => (
                  <div className="wanke-tooltip-children">
                    <i style={{ backgroundColor: item.color }} />
                    {item.name}({(item.value / props.sum * 100).toFixed(0)}%)
                  </div>
                )
              },
              title: ''
            }}
            data={filterList}
          />
          <span className={styles['chart-title']}>{'收益分布'}</span>
        </aside>
        <section className={styles['right']}>
          <div className={styles['legend-container']}>
            {
              series.map((item, index) => (
                <div
                  className={classnames(styles['legend'], {
                    [styles['disabled']]: hideList.indexOf(index) > -1
                  })}
                  onClick={() => toggleLegend(index)}>
                  <p className={styles['label']}>
                    <span className={styles['icon']} style={{ backgroundColor: colorList[index] }} />
                    <span className={styles['title']}>{item.name}</span>
                  </p>
                  <p className={styles['value']}>{unitValueChange(item.value, item.unit, 1)}{valueUnitChange(item.value, item.unit)}</p>
                </div>
              ))
            }
          </div>
        </section>
      </article>
    </div>
  )
}

export default ReportCard
