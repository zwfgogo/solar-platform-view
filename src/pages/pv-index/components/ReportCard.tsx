import React, {useState} from 'react'
import {history} from 'umi'
import MyCard from './MyCard'
import CommonTitle from './CommonTitle'
import styles from './styles/report-card.less'
import classnames from 'classnames'
import {PieChart} from 'wanke-gui'

import utils from "../../../public/js/utils";

const colorList = ['#fc5a5a', '#ff974a', '#0062ff']

interface Props {
  className?: string
  abnormalChart?: any[]
  jumpAllowed?: boolean
}

const ReportCard: React.FC<Props> = props => {
  const {className = '', jumpAllowed} = props
  const series = props.abnormalChart || []
  const [hideList, setHideList] = useState([])

  const toWarningPage = () => {
    if(!props.jumpAllowed) return
    history.push(`/alert-service/abnormal`)
  }

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
      name: item.name, value: item.value, color: colorList[index]
    }
  }).filter((item, index) => hideList.indexOf(index) == -1)
  let total = filterList.reduce((result, item) => result + item.value, 0)

  return (
    <MyCard className={`${styles['report-card']} ${className}`}>
      <CommonTitle className={styles['title']} title={utils.intl("index.实时异常")}/>
      <article className={styles['content']}>
        <aside className={styles['left']}>
          <PieChart
            options={{
              radius: [0.45, 0.75],
              tooltip: {
                render: (item, sum) => (
                  <div className="wanke-tooltip-children">
                    <i style={{backgroundColor: item.color}}/>
                    {item.name}: {item.value}{item.unit}({(item.value / (sum || 1) * 100).toFixed(0)}%)
                  </div>
                )
              },
              title: ''
            }}
            data={filterList}
          />
          <span
            className={styles['chart-title']}
            onClick={toWarningPage}
            style={{ cursor: jumpAllowed ? 'pointer' : 'unset' }}
          >
            {utils.intl("index.{0}条告警", total)}
          </span>
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
                    <span className={styles['icon']} style={{backgroundColor: colorList[index]}}/>
                    <span className={styles['title']}>{item.name}</span>
                  </p>
                  <p className={styles['value']}>{item.value}{item.unit || ''}</p>
                </div>
              ))
            }
          </div>
        </section>
      </article>
    </MyCard>
  )
}

export default ReportCard
