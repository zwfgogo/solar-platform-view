import React, { useEffect } from 'react'
import FullContainer from "../../../components/layout/FullContainer"
import Page from "../../../components/Page"
import PageProps from "../../../interfaces/PageProps"
import MakeConnectProps from "../../../interfaces/MakeConnectProps"
import { ElectricityMeterState } from '../models/electricity-meter'
import { makeConnect } from "../../umi.helper"
import { fee_electricity_meter } from "../../constants"
import ListElectricityMeter from './ListElectricityMeter'
import moment from 'moment'
// import { DatePicker } from 'wanke-gui'
import DatePicker from "../../../components/date-picker"
import Label from "../../../components/Label"
import Tools from "../../../components/layout/Tools"
import Back1 from "../../../components/layout/Back1"
import { isBigThanToday } from "../../../util/dateUtil"
import utils from '../../../public/js/utils'
import FormLayout from '../../../components/FormLayout'
import { Input } from 'wanke-gui'

const { MonthPicker } = DatePicker
const { FieldItem } = FormLayout

interface Props extends PageProps, ElectricityMeterState, MakeConnectProps<ElectricityMeterState> {
  dtime: string
  stationId: number
  loading: boolean
}

const EntryElectricityMeter: React.FC<Props> = function (this: null, props) {
  useEffect(() => {
    props.updateQuery({ dtime: moment(props.dtime).format('YYYY-MM') })
    props.action('fetchMeterList', { stationId: props.stationId })
    return () => {
      props.action('reset')
    }
  }, [])

  const onDateChange = (v) => {
    props.updateQuery({ dtime: v.format('YYYY-MM') })
  }

  const { query } = props

  return (
    <Page pageId={props.pageId} pageTitle={utils.intl('电表读数')} className="page-next">
      <FormLayout
        onSearch={() => { props.action('fetchMeterList', { stationId: props.stationId }) }}
        onReset={() => props.updateQuery({ dtime: moment(props.dtime).format('YYYY-MM') })}
      >
        <FieldItem label={utils.intl('账单时间')}>
          <MonthPicker
            format="YYYY-MM"
            allowClear={false}
            disabledDate={current => isBigThanToday(current)}
            value={moment(query.dtime)} onChange={onDateChange} />
        </FieldItem>
      </FormLayout>
      <FullContainer className="page-sub-container">
        <FullContainer className="flex1" style={{ marginTop: 10 }}>
          <div className="flex1">
            <ListElectricityMeter
              loading={props.loading}
              header={props.header}
              columns={props.header}
              dataSource={props.list}
            />
          </div>
        </FullContainer>
      </FullContainer>
    </Page>
  )
}

function mapStateToProps(model, getLoading) {
  return {
    ...model,
    loading: getLoading('fetchMeterList')
  }
}

export default makeConnect(fee_electricity_meter, mapStateToProps)(EntryElectricityMeter)
