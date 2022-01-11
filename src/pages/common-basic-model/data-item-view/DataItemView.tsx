import React, { useEffect } from 'react'
import { Button, Row, Col, Tabs, message } from 'wanke-gui'
import Form from './Form'
import DeleteForm from './DeleteForm'
import ListItemDelete from '../../../public/components/ListItemDelete/index'
import Forward from '../../../public/components/Forward'

import { r_e_data_item, r_e_equipment_list } from '../../constants'
import { getActionType } from '../../umi.helper'

import Page from '../../../components/Page'
import Footer from '../../../components/Footer'

import { makeConnect } from '../../umi.helper'
import List4 from './List4'
import FullContainer from '../../../components/layout/FullContainer'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import PageProps from '../../../interfaces/PageProps'
import Header from '../../../components/Header/index';
import Tools from '../../../components/layout/Tools'
import Back1 from '../../../components/layout/Back1'
import { DeviceTypeDetail } from './model'
import utils from '../../../public/js/utils'
import CommonTitle from '../../../components/CommonTitle'
import './data-item-view.less'
import { isZh } from '../../../core/env'

const { TabPane } = Tabs

interface Props extends MakeConnectProps<DeviceTypeDetail>, DeviceTypeDetail, PageProps {
  _id: any;
  loading: boolean
  autoDataLoading: boolean
  delBatchLoading: boolean
  _deviceTitle: string
  modelType: string
}

const DataItemView: React.FC<Props> = function (this: null, props) {
  const {
    dispatch,
    list,
    modal,
    _id,
    selectTerminal,
    deleteModal,
    modelType,
    _deviceTitle,
    deviceTypeId,
    stationTypeId,
    terminals,
  } = props

  let [selectedRowKeys, setSelectedRowKeys] = React.useState([])

  const New = () => {
    props.action('updateState', {
      modal: true,
      record: {},
      modalTitle: '添加数据项'
    })
  }
  const edit = o => {
    props.action('updateState', {
      modal: true,
      record: o,
      modalTitle: '编辑数据项',
      recordName: o.name
    })
  }
  //选择框回调
  const onSelectChange = (selectedRowKeys, selectedRows) => {
    props.action('updateState', {
      exit: false
    })
    setSelectedRowKeys(selectedRowKeys)
  }

  const del = () => {
    // console.log(123, selectedRowKeys)
    if (selectedRowKeys && selectedRowKeys?.length === 0) {
      message.warning(utils.intl('删除数据项需选中目标数据项'))
    } else {
      props.action('$delBatch', {
        deleteId: selectedRowKeys
      })
    }
    setSelectedRowKeys([])
  }
  const delSingle = o => {
    props.action('$del', {
      deleteId: [o.id]
    })
    setSelectedRowKeys(selectedRowKeys.filter(item => item !== o.id))
  }
  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: onSelectChange
  }

  useEffect(() => {
    props.updateState({ deviceTypeId: _id })
    props.action('$getTerminals')
    props.action('$getAutoData')
    props.action('$getEnums')
    return () => {
      props.action('reset')
    }
  }, [])

  useEffect(() => {
    if (selectTerminal) {
      setSelectedRowKeys([])
      props.updateState({ list: [] })
      props.action('$getList')
    }
  }, [selectTerminal])

  let operations = (
    <Forward to="library" title={utils.intl('数据参数库')}>
      <Button style={{ color: '#356edf', borderColor: '#3D7EFF', backgroundColor: props.theme === 'dark-theme' ? '#050A19' : '' }}>
        {utils.intl('数据参数库')}
      </Button>
    </Forward>
  )

  const onChange = (e) => {
    props.updateState({ selectTerminal: e })
  }

  const renderLabel = () => {
    if (isZh()) {
      return (
        <>
          已选择
          <span className="wanke-color-blue">{selectedRowKeys.length}</span>
          项
        </>
      )
    } else {
      return (
        <>
          <span className="wanke-color-blue">{selectedRowKeys.length}</span>
          selected
        </>
      )
    }
  }

  return (
    <Page
      pageId={props.pageId}
      pageTitle={utils.intl(modelType) + utils.intl('采集参数配置')}
      className="data-item-view-page"
      onNeedUpdate={() => {
        props.action('$getAutoData')
        props.action('$getList')
      }}
    >
      <FullContainer>
        <CommonTitle
          withBorder
          title={_deviceTitle}
          fontSize={16}
          iconHeight={12}
        />
        <div className="flex1 e-p16">
          {terminals.length ? (
            <FullContainer>
              <Tabs className="origin-tab data-item-view-tab" onChange={onChange} type="card" activeKey={selectTerminal} style={{ flexShrink: 0 }}>
                {terminals.map(item => (
                  <TabPane tab={item.title} key={item.name}>
                  </TabPane>
                ))}
              </Tabs>
              <div className="data-item-view-menu">
                <div>
                  <span>{renderLabel()}</span>
                  <Button type="default" style={{ marginLeft: 16 }} loading={props.delBatchLoading} disabled={!selectedRowKeys?.length}>
                    <ListItemDelete onConfirm={del}>
                      <a>{utils.intl('批量删除')}</a>
                    </ListItemDelete>
                  </Button>
                </div>
                <div>
                  {operations}
                  <Button type="primary" onClick={New} style={{ marginLeft: 16 }}>
                    {utils.intl('添加数据')}
                  </Button>
                  <Forward to="batch" data={{ _id: _id, selectTerminal: selectTerminal }} style={{ marginLeft: 16 }}>
                    <Button type="primary">{utils.intl('批量添加')}</Button>
                  </Forward>
                </div>
              </div>
              <div className="flex1 e-pt10">
                <List4
                  loading={props.loading || props.autoDataLoading}
                  dataSource={list} edit={edit} del={delSingle} rowSelection={rowSelection}
                />
              </div>
            </FullContainer>
          ): null}
        </div>

      </FullContainer>
      {modal ? <Form /> : ''}
      {/* 貌似没用到 */}
      {deleteModal ? <DeleteForm /> : ''}
    </Page>
  )
}

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    ...state.modelConfig,
    loading: getLoading('$getList'),
    autoDataLoading: getLoading('$getAutoData'),
    theme: state.global.theme,
    delBatchLoading: getLoading('$delBatch'),
  }
}

export default makeConnect('model_data_item', mapStateToProps)(DataItemView)
