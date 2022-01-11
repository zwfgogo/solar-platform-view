import moment from 'moment'
import React, { ReactElement, useEffect } from 'react'
import { Button, Table2 } from 'wanke-gui'
import Page from '../../components/Page'
import { CrumbsPortal } from '../../frameset/Crumbs'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import utils from '../../public/js/utils'
import { numberToFixed } from '../../util/utils'
import { makeConnect } from '../umi.helper'
import "./index.less"
import { ElectricityFormManagement, modelNamespace } from './model'

interface Props extends MakeConnectProps<ElectricityFormManagement>, ElectricityFormManagement, PageProps{
  loading: boolean
  stations: any[]
  selectedStationId: number,
}

const ElectricityForm: React.FC<Props> = (props) => {

  const { tableList, page, size, total, loading, stations, selectedStationId } = props

  useEffect(() => {
    if(props.selectedStationId) props.action("getTableList", { stationId: props.selectedStationId, page: 1, size: 20 })
  }, [props.selectedStationId]);

  // const nowStation = stations.find(item => item.id === selectedStationId)

  const columns = [
    {
      title: utils.intl('序号'), dataIndex: 'num', width: 65
    },{
      title: utils.intl('账单名称'), dataIndex: 'billName', width: 120
    },{
      title: utils.intl('开始时间'), dataIndex: 'startTime', width: 160, render: text => text ? moment(text).format('YYYY-MM-DD HH:mm') : null
    },{
      title: utils.intl('结束时间'), dataIndex: 'endTime', width: 160, render: text => text ? moment(text).format('YYYY-MM-DD HH:mm') : null
    },{
      title: utils.intl('储能充电量(kWh)'), dataIndex: 'totalCharge', width: 160, render: text => numberToFixed(text) ?? '--',
    },{
      title: utils.intl('储能放电量(kWh)'), dataIndex: 'totalDischarge', width: 160, render: text => numberToFixed(text) ?? '--',
    },{
      title: utils.intl('电源累计发电量(kWh)'), dataIndex: 'totalGeneration', width: 180, render: text => numberToFixed(text) ?? '--',
    },{
      title: utils.intl('电网用电量(kWh)'), dataIndex: 'totalConsumption', width: 160, render: text => numberToFixed(text) ?? '--',
    },{
      title: utils.intl('上网电量(kWh)'), dataIndex: 'totalOngridEnergy', width: 160, render: text => numberToFixed(text) ?? '--',
    },
  ]

  return (
    <Page pageId={props.pageId} pageTitle={utils.intl('电量报表')} showStation>
      <CrumbsPortal>
        <Button style={{ marginLeft: 16 }} onClick={() => props.action('onExport')} type="primary">
          {utils.intl('导出')}
        </Button>
      </CrumbsPortal>
      <div className="table-box">
        <Table2
          loading={loading}
          dataSource={tableList}
          columns={columns}
          page={1}
          size={10}
          total={0}
          onPageChange={(page, size) => {
            if(props.selectedStationId) props.action("getTableList", { stationId: props.selectedStationId, page, size })
          }}
        />
      </div>
    </Page>
  )
}

function mapStateToProps(model, getLoading, state) {

  return {
    ...model,
    selectedStationId: state.global.selectedStationId,
    stations: state.global.stationList,
    loading: getLoading('getTable'),
  };
}

export default makeConnect(modelNamespace, mapStateToProps)(ElectricityForm)