import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Modal, Input, Tabs, Table, Row, Col } from 'wanke-gui'
import utils from '../../../../public/js/utils'
import { makeConnect } from '../../../umi.helper'
import { Currency } from '../../../../pages/constants'

const { TabPane } = Tabs
const { Search: SearchInput } = Input

interface Props {
  visible: boolean
  onExited: () => void
  title?: string
  costInfo?: any
  generateInfo?: any;
  priceList: any[]
  priceIdList: number;
  modelTitle: string;
  loading?: boolean
  onSelectCost?: any;
  onSelectGenerate?: any;
  onCostSearch?: any;
  onGenerateSearch?: any;
  listLoading?: boolean
  getSpotList: (type: string, query: string) => void
  spotList: any[]
  fetchSpotListLoading: boolean;
  basicInfo: any;
}

const SelectPriceInfo: React.FC<Props> = function (this: null, props) {
  let [selectedRowKeys, setSelectedRowKeys] = React.useState([])
  let [selectedRows, setSelectedRows] = React.useState({ id: '', currency: '' })
  let [tabNum, setTabNum] = React.useState("1")
  let [costSearch, setCostSearch] = React.useState("")
  let [generateSearch, setGenerateSearch] = React.useState("")
  let [realTimeSearch, setRealTimeSearch] = React.useState("")

  useEffect(() => {
    setSelectedRowKeys([props.priceIdList])
    for (let obj of props.priceList) {
      if (props.priceIdList === obj.id) {
        setSelectedRows(obj)
      }
    }
  }, [props.priceIdList])

  function handleSubmit(e) {
    e.preventDefault()

    if (selectedRows.id) {
      if (props.modelTitle === utils.intl("选择用电信息")) {
        if (props.basicInfo?.currency !== selectedRows.currency) {
          Modal.error({
            title: utils.intl('提示'),
            content: utils.intl('电站货币与电价货币不同，无法选择该电价')
          })
        } else {
          if (tabNum === '1') {
            props.onSelectCost(selectedRows, utils.intl("固定电价"))
          } else {
            props.onSelectCost(selectedRows, utils.intl("实时电价"))
          }
        }
      } else {
        if (props.basicInfo?.currency !== selectedRows.currency) {
          Modal.error({
            title: utils.intl('提示'),
            content: utils.intl('电站货币与电价货币不同，无法选择该电价')
          })
        } else {
          if (tabNum === '1') {
            props.onSelectGenerate(selectedRows, utils.intl("固定电价"))
          } else {
            props.onSelectGenerate(selectedRows, utils.intl("实时电价"))
          }
        }
      }
    } else {
      props.onExited();
    }

  }
  const columns: any = [
    {
      title: utils.intl('电价名称'), dataIndex: 'title', width: 200
    },
    {
      title: utils.intl('适用地区'), dataIndex: 'area', width: 250
    },
    {
      title: utils.intl('用电性质'), dataIndex: 'property'
    },
    {
      title: utils.intl('适用电压等级'),
      dataIndex: 'voltageLevelsTitle',
    },
  ]

  const columns1: any = [
    {
      title: utils.intl('电价名称'), dataIndex: 'title', width: 200
    },
    {
      title: utils.intl('适用地区'), dataIndex: 'area', width: 250
    },
    {
      title: utils.intl('光伏上网电价'), dataIndex: 'pvPrice', align: 'right', render: (text, record, index) => {
        return (text + ' ' + utils.intl(record.currency) + '/kWh')
      }
    },
    {
      title: utils.intl('风电上网电价'),
      dataIndex: 'windPrice', align: 'right', render: (text, record, index) => {
        return (text + ' ' + utils.intl(record.currency) + '/kWh')
      }
    },
  ]

  const columns2: any = [
    {
      title: utils.intl('电价名称'), dataIndex: 'title', width: 200
    },
    {
      title: utils.intl('适用地区'), dataIndex: 'area', width: 250
    },
  ]
  let deviceTabArr = [{ title: utils.intl("固定电价"), id: 1 }, { title: utils.intl("实时电价"), id: 2 }]

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    type: 'radio',
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows[0])
      setSelectedRowKeys(selectedRowKeys)
    },
    columnTitle: utils.intl('选择'),
    columnWidth: '60px'
  }
  const tabChange = (e) => {
    if (e === '2') {
      if (props.modelTitle === utils.intl("选择用电信息")) {
        props.getSpotList('Cost', '');
      } else {
        props.getSpotList('Generation', '');
      }
    } else {
      if (props.modelTitle === utils.intl("选择用电信息")) {
        props.onCostSearch('');
      } else {
        props.onGenerateSearch('')
      }
    }
    setTabNum(e)
  }
  const search = () => {
    if (tabNum === '2') {
      if (props.modelTitle === utils.intl("选择用电信息")) {
        props.getSpotList('Cost', realTimeSearch);
      } else {
        props.getSpotList('Generation', realTimeSearch);
      }
    } else {
      if (props.modelTitle === utils.intl("选择用电信息")) {
        props.onCostSearch(costSearch);
      } else {
        props.onGenerateSearch(generateSearch)
      }
    }
  }
  return (
    <Modal
      width={950}
      title={utils.intl(props.modelTitle)}
      visible={props.visible}
      onCancel={props.onExited}
      className="price-detail-dialog"
      // confirmLoading={props.loading}
      onOk={handleSubmit}
      getContainer={false}
    >
      <div className="month-item">
        <Tabs onChange={tabChange} type="card" activeKey={tabNum}>
          {
            deviceTabArr.map((item, index) => (
              <TabPane tab={item.title} key={item.id}>
              </TabPane>
            ))
          }
        </Tabs>
        <Row className="e-mb10">
          <Col span={6}>
            <SearchInput
              onChange={e => {
                setRealTimeSearch(e.target.value)
                if (props.modelTitle === utils.intl("选择用电信息")) {
                  setCostSearch(e.target.value)
                } else {
                  setGenerateSearch(e.target.value)
                }
              }}
              placeholder={utils.intl('请输入关键字查询')}
              style={{ width: '300px' }}
              onSearch={search}
            />
          </Col>
        </Row>
        <div className="flex-grow e-pt10 f-pr" style={{ height: '400px' }} >
          <Table dataSource={tabNum === '2' ? props.spotList : props.priceList} bordered columns={tabNum === "1" ? props.modelTitle === utils.intl("选择用电信息") ? columns : columns1 : columns2}
            loading={tabNum === '2' ? props.fetchSpotListLoading : props.listLoading}
            rowKey="id"
            pagination={false}
            scroll={{ y: 350 }}
            rowSelection={rowSelection}
          />
        </div>
      </div>
    </Modal>
  )
}

//绑定layout model ，获取title
function mapStateToProps(model, getLoading, state) {
  return {
    basicInfo: model.basicInfo,
  };
}

export default makeConnect('stationUpdate', mapStateToProps)(SelectPriceInfo)
// export default SelectPriceInfo