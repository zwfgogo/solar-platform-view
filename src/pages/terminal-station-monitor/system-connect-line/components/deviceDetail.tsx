/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React from 'react'
import { Input, Row, Col, Form, Table2, Modal } from 'wanke-gui'
import { makeConnect } from "../../../umi.helper"
import { createFlexableFormItem } from "../../../../components/FlexFormItem"
import { FormContainer } from "../../../../components/input-item/InputItem"
import utils from "../../../../public/js/utils";
import styles from './deviceDetail.less'
import {
  CaretRightOutlined,
} from 'wanke-icon'
import { history } from 'umi'


const _Form = props => {
  const { dispatch, deviceDetailModal, devInfo, alarmList, query, total } = props
  const cancel = () => {
    dispatch({
      type: 'connect-line/updateState',
      payload: {
        deviceDetailModal: false
      }
    })
  }

  const pageChange = (page, size) => {
    dispatch({ type: 'connect-line/pageChange', payload: { page, size } })
  }
  const columns: any = [
    {
      title: utils.intl('序号'), dataIndex: 'num', width: 65, align: 'center'
    },
    {
      title: utils.intl('发生时间'), dataIndex: 'startTime', width: 250
    },
    {
      title: utils.intl('异常名称'), dataIndex: 'alarmTitle', width: 200
    },
    {
      title: utils.intl('异常详情'), dataIndex: 'records', width: 200
    },
    {
      title: utils.intl('告警级别'), dataIndex: 'alarmLevelTitle', width: 100
    },
  ]
  return (
    <Modal centered
      maskClosable={false}
      bodyStyle={{ color: 'white' }}
      width={'960px'} visible={deviceDetailModal}
      title={utils.intl('设备详情')}
      footer={null}
      onCancel={cancel} wrapClassName={'deviceDetailModal'}
    >
      <div style={{/* paddingLeft: '40px' */ }}>
        <Form
          initialValues={{

          }}
          form={props.form}
          layout={'vertical'}
          autoComplete="off">
          <Row>
            <div className={styles.deviceInfo + " e-mt10 f-df"}>
              <div className={styles.deviceItem + " flex1"}>
                {utils.intl('设备名')}：{devInfo?.title}
              </div>
              <div className={styles.deviceItem + " flex1"}>
                {utils.intl('设备类型')}：{devInfo?.deviceType?.title}
              </div>
              <div className={styles.deviceItem + " flex1"}>
                {utils.intl('型号')}：{devInfo?.deviceType?.Type}
              </div>
              <div className={styles.deviceItem + " flex1"}>
                {utils.intl('SN')}：{devInfo?.SN}
              </div>
              <div className={styles.deviceItem + " flex1"}>
                {utils.intl('生产厂家')}：{devInfo?.deviceType?.Manufactor}
              </div>
              <div className={styles.deviceItem + " flex1"}>
                {utils.intl('备注')}：{devInfo?.deviceType?.Notes}
              </div>
            </div>
          </Row>
          <Row style={{ margin: '10px 0', justifyContent: 'flex-end' }}>
            <span style={{
              color: '#2f80ed',
              cursor: 'pointer'
            }} onClick={() => { history.push('/alert-service/abnormal') }}>{utils.intl('告警查看')} <CaretRightOutlined /></span>
          </Row>
          <div className="flex-grow f-pr" style={{ height: '400px' }} >
            <Table2
              x={800}
              dataSource={alarmList}
              columns={columns}
              loading={props.loading}
              rowKey="num"
              page={query.page}
              size={query.size}
              total={total}
              onPageChange={(page, size) => pageChange(page, size)}
            />
          </div>
        </Form>
      </div>
    </Modal >
  );
}

function mapStateToProps(model, getLoading, state) {
  return {
    ...model,
    loading: getLoading('getList'),
    query: state['connect-line'].query,
    total: state['connect-line'].total,
  }
}

const _FormRes = FormContainer.create()(_Form)
export default makeConnect('connect-line', mapStateToProps)(_FormRes)