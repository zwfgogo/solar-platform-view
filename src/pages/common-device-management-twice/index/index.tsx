import React, { useEffect, useState } from 'react'
import classnames from 'classnames'
import Page from '../../../components/Page'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import PageProps from '../../../interfaces/PageProps'
import utils from '../../../public/js/utils'
import { device_management_twice } from '../../constants'
import { makeConnect } from '../../umi.helper'
import { DeviceManagementTwiceModal, ModalMode } from '../models'
import './index.less'
import ResizeDiv from '../../../components/resizer/ResizeDiv'
import { triggerEvent } from '../../../util/utils'
import { AutoSizer, Button, Col, Form, FullLoading, InputNumber, Row, Tree } from 'wanke-gui'
import { useTreeExpand } from '../../../hooks/useTreeExpand'
import CommonTitle from '../../../components/CommonTitle'
import TwiceDeviceList from './TwiceDeviceList'
import DetailFormItem from '../../../components/DetailFormItem'
import TwiceForm from './TwiceForm'
import DeviceModal from './DeviceModal'

interface Props extends PageProps, DeviceManagementTwiceModal, MakeConnectProps<DeviceManagementTwiceModal> {
  fetchStationsTreeLoading: boolean
  editStationDetailLoading: boolean
}

const DeviceManageMentTwice: React.FC<Props> = (props) => {
  const { pageId, selectedKey, stationDetail } = props
  const [edit, setEdit] = useState(false)
  const [form] = Form.useForm()
  const { expanded, onExpand } = useTreeExpand({
    nodeList: props.treeList,
    defaultExpandAll: true
  });

  const handleSelect = (kye, { node: options }) => {
    props.updateState({ selectedKey: options.key })
  }

  const fetchData = () => {
    props.action("fetchDeviceList", { stationId: Number(selectedKey) })
  }

  const handleSaveStation = () => {
    form.validateFields().then(values => {
      props.action('editStationDetail', {
        id: selectedKey,
        code: values.code,
        useHeartbeat: values.useHeartbeat === 1 ? true : false,
        beeIds: values.beeIds,
      }).then(() => {
        setEdit(false)
      })
    })
  }

  useEffect(() => {
    props.action("fetchStationsTree")
    return () => {
      props.action('reset')
    }
  }, [])

  useEffect(() => {
    if (selectedKey) {
      setEdit(false)
      props.updateState({
        stationDetail: {},
        deviceList: [],
      })
      props.action("fetchStationDetail", { id: Number(selectedKey) })
      props.action("fetchDeviceList", { stationId: Number(selectedKey) })
    }
  }, [selectedKey])

  return (
    <Page
      style={{ background: 'transparent' }}
      pageId={pageId}
      pageTitle={utils.intl('??????????????????')}
      onActivity={fetchData}
    >
      <section className="device-management-twice-page">
        <ResizeDiv
          className="device-management-tree-container"
          defaultWidth={240}
          minWidth={200}
          maxWidth={700}
        >
          {props.fetchStationsTreeLoading ? <FullLoading /> : null}
          <AutoSizer>
            {
              ({ width, height }) => {
                if (height == 0) {
                  return null
                }
                return (
                <Tree
                  scrollX
                  showIcon
                  showLine
                  height={height}
                  selectedKeys={[selectedKey]}
                  onSelect={handleSelect}
                  expandedKeys={expanded}
                  onExpand={onExpand}
                  treeData={props.treeList}
                />
                )
              }
            }
          </AutoSizer>
        </ResizeDiv>
        <div className="device-management-body">
          <CommonTitle
            withBorder
            title={stationDetail.title}
            fontSize={16}
            iconHeight={12}
          />
          <div className="device-management-content">
            <div className="device-management-card">
              <CommonTitle
                style={{fontWeight: 'bold'}}
                title={utils.intl('????????????')}
                fontSize={16}
                iconHeight={12}
                rightAside={(
                  edit ? (
                    <>
                      <Button
                        key="save"
                        size="small"
                        type="primary"
                        onClick={handleSaveStation}
                        loading={props.editStationDetailLoading}
                      >{utils.intl('??????')}</Button>
                      <Button
                        key="cancel"
                        size="small"
                        type="default"
                        onClick={() => setEdit(false)}
                        style={{ marginRight: 16, marginLeft: 8 }}
                      >{utils.intl('??????')}</Button>
                    </>
                  ) : (
                    <Button
                      disabled={!selectedKey}
                      key="edit"
                      size="small"
                      type="primary"
                      onClick={() => {
                        form.setFieldsValue({
                          code: stationDetail.code,
                          useHeartbeat: stationDetail.useHeartbeat ? 1 : 0,
                          beeIds: stationDetail.beeIds || [],
                        })
                        setEdit(true)
                      }}
                      style={{ marginRight: 16 }}
                    >{utils.intl('??????')}</Button>
                  )
                )}
              />
              <section className="device-management-card-body" style={{ paddingBottom: 0 }}>
                {edit ? (
                  <TwiceForm form={form} />
                ) : (
                  <>
                    <Row>
                      <Col span={6}>
                        <DetailFormItem label={utils.intl('????????????')} value={stationDetail.code} />
                      </Col>
                      <Col span={6}>
                        <DetailFormItem
                          label={utils.intl('??????????????????')}
                          value={stationDetail.useHeartbeat ? utils.intl('???') : utils.intl('???')}
                        />
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <DetailFormItem label="DPU ID" value={stationDetail.beeIds ? stationDetail.beeIds.join('???') : '-'} />
                      </Col>
                    </Row>
                  </>
                )}
              </section>
            </div>
            <div className="device-management-card" style={{ marginTop: 16 }}>
              <CommonTitle
                style={{fontWeight: 'bold'}}
                title={utils.intl('??????????????????')}
                fontSize={16}
                iconHeight={12}
                rightAside={(
                  <Button
                    disabled={!selectedKey}
                    size="small"
                    type="primary"
                    style={{ marginRight: 16 }}
                    onClick={() => {
                      props.updateState({
                        mode: ModalMode.add,
                        modalVisible: true,
                      })
                    }}
                  >{utils.intl('??????')}</Button>
                )}
              />
              <section className="device-management-card-body">
                <TwiceDeviceList />
              </section>
            </div>
          </div>
        </div>
      </section>
      {props.modalVisible ? (
        <DeviceModal />
      ) : null}
    </Page>
  )
}

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    fetchStationsTreeLoading: getLoading('fetchStationsTree'),
    editStationDetailLoading: getLoading('editStationDetail'),
  };
};

export default makeConnect(device_management_twice, mapStateToProps)(DeviceManageMentTwice);
