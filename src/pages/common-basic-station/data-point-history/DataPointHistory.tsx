import React, { useEffect } from 'react'
import Page from '../../../components/Page'
import PageProps from '../../../interfaces/PageProps'
import ListHistory from './ListHistory'
import FullContainer from '../../../components/layout/FullContainer'
import Tools from '../../../components/layout/Tools'
import Export from '../../../components/layout/Export'
import Back1 from '../../../components/layout/Back1'
import { ActionProp } from '../../../interfaces/MakeConnectProps'
import { makeConnect } from '../../umi.helper'
import { stationDataPointNS } from '../../constants'
import Label from '../../../components/Label'
import utils from '../../../public/js/utils';
import Header from '../../../components/Header'
import { CrumbsPortal } from '../../../frameset/Crumbs'
import { Button } from 'wanke-gui'

// 数据采集信息-历史记录
interface Props extends PageProps, ActionProp {
  deviceId: number
  typeId: number
  typeTitle: string
  terminalTitle: string
  // end 外部属性
  title: string
  historyList: any[]
  listLoading: boolean
}

const DataPointHistory: React.FC<Props> = function (this: null, props) {
  console.log(props);
  useEffect(() => {
    props.action('fetchHistoryList', { deviceId: props.deviceId, typeId: props.typeId })
  }, [])

  return (
    <Page pageId={props.pageId} pageTitle={utils.intl("历史记录")} style={{ padding: '0 16px 16px 16px' }}>
      <FullContainer style={{ overflow: 'visible' }}>
        <Header borderBottom title={`${props.title} ${utils.intl(`数据采集配置`)}`} style={{ margin: '0 -16px', padding: '16px 0 16px 0' }}>
        </Header>
        <div className="d-flex" style={{ padding: '15px 0 0' }}>
          <div className="v-center" style={{ width: 250 }}>
            <Label className="basic-font-color" horizontal={true}>{utils.intl("数据项名称")}</Label>
            <div className="basic-font-color">{props.typeTitle}</div>
          </div>
          <div className="v-center">
            <Label className="basic-font-color" horizontal={true}>{utils.intl("输入输出端名称")}</Label>
            <div className="basic-font-color">{props.terminalTitle}</div>
          </div>
        </div>
        <div className="flex1" style={{ padding: '0', marginTop: 10 }}>
          <ListHistory
            loading={props.listLoading}
            dataSource={props.historyList}
          />
        </div>
        <CrumbsPortal pageName="dataPointHistory">
          <Button
            style={{ marginLeft: 16 }}
            onClick={() => props.action('onExportHistory', { fileName: `${props.typeTitle || ''}(${props.terminalTitle || ''})-${utils.intl("历史记录")}` })}
          >{utils.intl('导出')}</Button>
        </CrumbsPortal>
      </FullContainer>
    </Page>
  )
}

function mapStateToProps(modal, { getLoading, isSuccess }) {
  return {
    historyList: modal.historyList,
    listLoading: getLoading('fetchHistoryList')
  }
}

export default makeConnect(stationDataPointNS, mapStateToProps)(DataPointHistory)
