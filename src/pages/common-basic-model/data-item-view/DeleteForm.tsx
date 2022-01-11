/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React from 'react'
import { Form, Modal } from 'wanke-gui'
import { connect } from 'dva'
import './index.less'

import { r_e_data_item } from '../../constants'
import { getActionType } from '../../umi.helper'

import { mapModelState } from '../../umi.helper'

import { makeConnect } from '../../umi.helper'
import { FormContainer } from '../../../components/input-item/InputItem'

const _Form = props => {
  const {dispatch, record, modalTitle, deleteModal, autoData, autoName, dataSign} = props
  const cancel = () => {
    props.action('updateState', {
      deleteModal: false
    })
  }

  function handleSubmit(e) {
    props.action('del')
  }

  return (
    <Modal centered bodyStyle={{color: 'white'}} width={'700px'} title={'删除'} visible={deleteModal} onOk={handleSubmit} onCancel={cancel}
           wrapClassName={'deleteModal'}
           destroyOnClose={true}
    >
      <div className="f-tac">
        <span className="f-fs18 f-dib e-mt20" style={{color: '#000'}}>
          是否确认<span style={{color: 'red'}}>"删除"</span>？
        </span>
      </div>
    </Modal>
  )
}

const _FormRes = FormContainer.create()(_Form)

const mapStateToProps = ({record, modalTitle, deleteModal, autoData, autoName, dataSign}) => ({
  record,
  modalTitle,
  deleteModal,
  autoData,
  autoName,
  dataSign
})

export default makeConnect('model_data_item', mapStateToProps)(_FormRes)
