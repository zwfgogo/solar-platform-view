import React from 'react'
import { Col, FullLoading, Modal, Row, Table, Table1 } from 'wanke-gui'
import utils from '../../../public/js/utils'
import CommonHeader from '../component/CommonHeader'
import { StrategyControlWay } from '../strategy.constant'
import styles from './today-command.less'
import classnames from 'classnames'

interface Props {
  stationId: number
  strategyId: number
  action: any
  c07CommandList: any[]
  loading: boolean

  visible: boolean
  onCancel: () => void
}

const C07TodayCommandDialog: React.FC<Props> = (props) => {
  const columns: any = [{
    title: utils.intl('strategy.时间点'),
    dataIndex: 'dtime'
  }, {
    title: utils.intl('strategy.无功功率') + '(kVar)',
    dataIndex: 'value'
  }]

  return (
    <Modal
      centered
      width={640}
      title={utils.intl('当日控制参数')}
      visible={props.visible}
      onCancel={props.onCancel}
      footer={null}
      className={styles['c07-command-dialog']}
    >
      <div className={styles['content']}>
        {
          !props.loading && !props.c07CommandList.length && (
            <div className="vh-center" style={{ width: '100%', height: 200 }}>{utils.intl('暂无当前控制参数')}</div>
          )
        }
        {props.c07CommandList.map((item, index) => {
          const isAutomatic = item.type === StrategyControlWay.Automatic

          return (
            <div className={styles['command-card']}>
              <CommonHeader
                title={(
                  <span>
                    <span className={classnames('wanke-common-tag', isAutomatic ? 'orange' : 'green')}>
                      {utils.intl(isAutomatic ? 'strategyTag.自动控制' : 'strategyTag.手动控制')}
                    </span>
                    <span style={{ marginLeft: 16 }}>{utils.intl('strategy.时段')}</span>{`${item.startTime} ~ ${item.endTime || ''}`}
                  </span>
                )}
                fontSize={16}
                style={{ lineHeight: '20px', height: 20 }}
              />
              {isAutomatic && (
                <div className={styles['body']}>
                  {/* <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                      <span className={styles['label']}>{utils.intl('strategy.控制方式')}:</span>
                      <span className={styles['value']}>{utils.intl('strategy.自动控制')}</span>
                    </Col>
                  </Row> */}
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                      <span className={styles['label']}>{utils.intl('strategy.电压目标')}:</span>
                      <span className={styles['value']}>{item.targetVoltage}V</span>
                    </Col>
                    <Col span={12}>
                      <span className={styles['label']}>{utils.intl('strategy.允许偏差')}:</span>
                      <span className={styles['value']}>
                        {item.deviationRange ? `${item.deviationRange[0]}%~${item.deviationRange[1]}%` : ''}
                      </span>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <span className={styles['label']}>{utils.intl('strategy.无功功率范围')}:</span>
                      <span className={styles['value']}>
                        {`-${item.maxReactivePowerInput}kVar~${item.maxReactivePowerOutput}kVar`}
                      </span>
                    </Col>
                  </Row>
                </div>
              )}
              {item.type === StrategyControlWay.Manual && (
                <div className={styles['body']}>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                      <span className={styles['label']}>{utils.intl('strategy.控制方式')}:</span>
                      <span className={styles['value']}>{utils.intl('strategy.手动控制')}</span>
                    </Col>
                  </Row>
                  <Table
                    pagination={false}
                    columns={columns}
                    dataSource={item.details || []}
                  />
                </div>
              )}
            </div>
          )
        })}
        {props.loading && <FullLoading />}
      </div>
    </Modal>
  )
}

export default C07TodayCommandDialog
