/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React, { Component, useEffect, useState } from 'react'
import { Input, message, Row, Col, Form, Select, Modal } from 'wanke-gui'
import MakeConnectProps, { ActionProp, UpdateStateAction } from "../../../interfaces/MakeConnectProps"
import { FormComponentProps } from "../../../interfaces/CommonInterface"
import { DispatchState } from '../model'
import { FormContainer } from "../../../components/input-item/InputItem"
import SelectItem from "../../../components/input-item/SelectItem"
import TextItem from "../../../components/input-item/TextItem"
import TextAreaItem from "../../../components/input-item/TextAreaItem"
import utils from "../../../public/js/utils";

type ModelKey = 'id' | 'stationId' | 'devId' | 'typeId' | 'userNameProcess' | 'orderName' | 'description' |
  'orderModal' | 'typeOptions' | 'usersArr' | 'stationArr' | 'devicesArr'

interface Props extends ActionProp, UpdateStateAction<DispatchState>, FormComponentProps, Pick<DispatchState, ModelKey> {
  updateLoading: boolean
}

const _Form: React.FC<Props> = function (this: null, props) {
  const { orderModal, typeOptions, usersArr, stationArr, devicesArr } = props

  const cancel = () => {
    props.updateState({
      orderModal: false
    })
  }

  useEffect(() => {
    updateOrderName()
  }, [props.stationId, props.devId, props.typeId])

  const updateOrderName = () => {
    let stationName = props.stationArr.find(item => item.value == props.stationId)?.name || '';
    let devName = props.devicesArr.find(item => item.value == props.devId)?.name || '';
    let typeName = props.typeOptions.find(item => item.value == props.typeId)?.name || '';
    props.updateState({ orderName: stationName + devName + typeName });
  }

  let onStationChange = (v) => {
    props.updateState({ stationId: v })
    props.action('fetchDeviceType', { stationId: v })
    props.action('getUsersEnums')
  }

  let onDeviceChange = (v) => {
    props.updateState({ devId: v })
  }

  let onTypeChange = (v) => {
    props.updateState({ typeId: v })
  }

  function handleSubmit(e) {
    e.preventDefault()
    props.form.validateFields().then((values) => {
      props.action('save')
    })
  }
  return (
    <Modal
      confirmLoading={props.updateLoading}
      centered maskClosable={false} bodyStyle={{ color: 'white' }} width={480} visible={orderModal}
      title={props.id ? utils.intl('????????????') : utils.intl('????????????')} onOk={handleSubmit} onCancel={cancel} wrapClassName={'customerModal'}
    >
      <div>
        <FormContainer form={props.form} className="d-flex flex-wrap">
          <SelectItem
            style={{ width: 403 }}
            label={utils.intl('????????????')}
            dataSource={stationArr}
            rules={[{ required: true, message: utils.intl('?????????????????????') }]}
            value={props.stationId} onChange={onStationChange}
          />

          <SelectItem
            style={{ width: 403 }}
            label={utils.intl('????????????')}
            dataSource={devicesArr}
            rules={[{ required: true, message: utils.intl('?????????????????????') }]}
            value={props.devId} onChange={onDeviceChange}
          />

          <SelectItem
            style={{ width: 403 }}
            label={utils.intl('????????????')}
            dataSource={typeOptions}
            rules={[{ required: true, message: utils.intl('?????????????????????') }]}
            value={props.typeId} onChange={onTypeChange}
          />

          <SelectItem
            style={{ width: 403 }}
            label={utils.intl('?????????')}
            dataSource={usersArr}
            rules={[{ required: true, message: utils.intl('??????????????????') }]}
            value={props.userNameProcess} onChange={v => props.updateState({ userNameProcess: v })}
          />

          <TextItem
            style={{ width: 403 }}
            label={utils.intl('????????????')}
            rules={[{ required: true, message: utils.intl('?????????????????????') }, { max: 32, message: '????????????32?????????' }]}
            value={props.orderName}
            onChange={v => props.updateState({ orderName: v })}
          />

          <TextAreaItem
            style={{ width: 403 }}
            className="w100" rows={5}
            label={utils.intl('????????????')} placeholder={utils.intl('?????????4~500?????????')}
            rules={[{ max: 500, min: 4, required: true, message: utils.intl('?????????4~500?????????') }]}
            value={props.description} onChange={v => props.updateState({ description: v })}
          />

        </FormContainer>
      </div>
    </Modal>
  )
}

const _FormRes = FormContainer.create<Props>()(_Form)
export default _FormRes
