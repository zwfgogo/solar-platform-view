import React, { useEffect } from "react"
import Page from "../../../components/Page"
import MakeConnectProps from "../../../interfaces/MakeConnectProps"
import PageProps from "../../../interfaces/PageProps"
import { Input } from "wanke-gui"
import StationStatusList from "./StationStatusList"
import { makeConnect } from "../../umi.helper"
import Tools from "../../../components/layout/Tools"
import Export from "../../../components/layout/Export"
import styles from "./index.less"
import { stationStatusListNS, stationListNS } from "../../constants"
import { StationStatusModal } from "../models/station-status"
import Back1 from "../../../components/layout/Back1"
import FullContainer from '../../../components/layout/FullContainer'
import utils from "../../../public/js/utils"

// 状态信息页面
const { Search } = Input

interface Props
  extends PageProps,
  StationStatusModal,
  MakeConnectProps<StationStatusModal> {
  loading?: boolean;
  exportLoading?: boolean;
  stationStatusOptions?: any[];
  stationId?: number;
}

const StationStatus: React.FC<Props> = props => {
  const {
    pageId,
    loading,
    totalCount,
    list,
    exportLoading,
    stationStatusOptions,
    stationId
  } = props

  const fetchData = () => {
    props.action("getTableData", { stationId })
  }

  const handleSearch = val => {
    props.updateQuery({ queryStr: val })
    fetchData()
  }

  useEffect(() => {
    fetchData()
    return () => {
      props.action("reset")
    }
  }, [])

  return (
    <Page pageId={pageId} pageTitle={utils.intl("状态信息")} onActivity={fetchData}>
      <FullContainer>
        <div className="flex1" style={{ padding: 10 }}>
          <StationStatusList
            stationStatusOptions={stationStatusOptions}
            loading={loading}
            dataSource={list}
          />
        </div>
        <Tools height={40}>
          <Export
            onExport={() => props.action("onExport", { stationId })}
            loading={exportLoading}
          />
          <Back1 back={() => props.back()} />
        </Tools>
      </FullContainer>
    </Page>
  )
}

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    stationStatusOptions: state[stationListNS].stationStatusOptions,
    loading: getLoading("getTableData"),
    exportLoading: getLoading("onExport")
  }
}

export default makeConnect(stationStatusListNS, mapStateToProps)(StationStatus)
