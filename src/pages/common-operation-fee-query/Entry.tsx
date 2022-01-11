import React from 'react'
import Flow from "../../public/components/Flow"
import PageProps from "../../interfaces/PageProps"
import EntryStationList from './EntryStationList'
import EntryFeeList from './EntryFeeList'
import EntryMonth from './month/EntryMonth'
import EntryElectricityMeter from './electricity-meter/EntryElectricityMeter'
import EntryFeeResult from './EntryFeeResult'
import { isTerminalSystem } from '../../core/env'

interface Props extends PageProps {
}

const Entry: React.FC<Props> = function(this: null, props) {
  return (
    <>
      <Flow pageName={'list'} default={true} pageId={props.pageId} component={EntryStationList}/>
      <Flow pageName={'fee-list'} component={EntryFeeList}/>
      <Flow pageName={'month-list'} component={EntryMonth}/>
      <Flow pageName={'electricity-meter'} component={EntryElectricityMeter}/>
      <Flow pageName={'fee-result'} component={EntryFeeResult}/>
    </>
  )
}

const TerminalEntry: React.FC<Props> = function (this: null, props) {
  const stationId = sessionStorage.getItem('station-id')
  return (
    <>
      <Flow pageName={'fee-list'} pageId={props.pageId} default={true} component={EntryFeeList} data={{stationId}}/>
      <Flow pageName={'month-list'} component={EntryMonth}/>
      <Flow pageName={'electricity-meter'} component={EntryElectricityMeter}/>
      <Flow pageName={'fee-result'} component={EntryFeeResult}/>
    </>
  )
}

export default isTerminalSystem() ? TerminalEntry : Entry
