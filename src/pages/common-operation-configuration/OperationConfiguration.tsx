
import React, { useCallback, useEffect } from 'react'
import { GlobalState } from 'umi'
import Page from '../../components/Page'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import { globalNS } from '../constants'
import { makeConnect } from '../umi.helper'
import CustomTable from './component/CustomTable'
import { modelNamespace, OperationConfigurationModel } from './model'

interface Props extends PageProps, GlobalState, MakeConnectProps<OperationConfigurationModel>, OperationConfigurationModel {

}

const OperationConfiguration: React.FC<Props> = (props) => {
  const { pageId, tableList, selectedStationId, strategyList } = props

  useEffect(() => {
    props.action('getTableList', { stationId: selectedStationId });
  }, [selectedStationId])

  const handleSave = useCallback((values, callBack) => {
    if (values.id) { // 编辑
      props.action('updateOperation', { stationId: selectedStationId, values })
        .then(() => {
          callBack();
        });
    } else { // 新增
      props.action('addOperation', { stationId: selectedStationId, values })
        .then(() => {
          callBack();
        });
    }
  }, [selectedStationId])

  const handleEnergySave = useCallback((values, callBack) => {
    props.action('updateEnergy', { stationId: selectedStationId, values })
      .then(() => {
        callBack();
      });
  }, [selectedStationId])

  return (
    <Page pageId={pageId} showStation>
      <CustomTable
        dataSource={tableList}
        strategyList={strategyList}
        handleSave={handleSave}
        handleEnergySave={handleEnergySave}
      />
    </Page>
  )
}

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    theme: state[globalNS].theme,
    stationList: state[globalNS].stationList,
    selectedStationId: state[globalNS].selectedStationId,
  }
}

export default makeConnect(modelNamespace, mapStateToProps)(OperationConfiguration);