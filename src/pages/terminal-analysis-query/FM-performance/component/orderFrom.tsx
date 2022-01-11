/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React from 'react'
import { Input, Row, Col, Form, Select, Modal } from 'wanke-gui'
import { makeConnect } from '../../../umi.helper'
import styles from '../index.less'
import { FormContainer } from '../../../../components/input-item/InputItem'
const FormItem = Form.Item

const _Form = props => {
  const {dispatch, explainModal} = props
  const cancel = () => {
    dispatch({
      type: 'abnormalWarning/updateState',
      payload: {
          explainModal: false
      }
    })
  }
  return (
    <Modal centered
           bodyStyle={{color: 'white'}}
           width={'900px'} visible={explainModal}
           title={'告警级别设置说明'}
           onCancel={cancel}
           footer={false}
           wrapClassName={'gjmodal'}
    >
        <div>
            <span><i className={styles.dian}>●</i> {'告警根据级别进行通知，不同的电站允许设置不同的规则'}</span><br/>
            <span><i className={styles.dian}>●</i> {'忽略，是指不关注该告警，系统不再进行记录和不再进行通知'}</span><br/>
            <span><i className={styles.dian}>●</i> {'轻微，是指系统需要记录该告警，但不用特别提醒'}</span><br/>
            <span><i className={styles.dian}>●</i> {'中度，是指系统需要记录该告警，同时通知在线的用户关注'}</span><br/>
            <span><i className={styles.dian}>●</i> {'严重，是指该告警发生会影响电站运行，除了常规提醒以外，还需要通过短信通知运维值班人员'}</span>
        </div>
    </Modal>
  )
}

function mapStateToProps(model, getLoading) {
  return {
    ...model,
  }
}

const _FormRes = FormContainer.create()(_Form)
export default makeConnect('abnormalWarning', mapStateToProps)(_FormRes)