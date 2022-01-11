import React, { useEffect } from 'react'
import EchartsBarChart from '../../../components/charts/EchartsBarChart'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { makeConnect } from '../../umi.helper'
import { ElectricDiffState } from '../model'

interface Props extends MakeConnectProps<ElectricDiffState>, ElectricDiffState {
  stationId: number
  startDate: string
  endDate: string
}

const ElectricChart: React.FC<Props> = (props) => {
  const { stationId, electricChart, startDate, endDate } = props

  useEffect(() => {
    if (stationId) {
      props.action('getElectricChart', {
        startDate: startDate,
        endDate: endDate,
        stationId: stationId
      })
    }
  }, [stationId, startDate, endDate])

  return (
    <EchartsBarChart
      grid={{bottom: 20}}
      {...electricChart}
    />
  )
}

function mapStateToProps(modal, getLoading, state) {
  return {
    ...modal,
  }
}

export default makeConnect('electricDifference', mapStateToProps)(ElectricChart)
