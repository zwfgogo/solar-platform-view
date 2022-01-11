import React, { useEffect } from 'react'
import { FullLoading } from 'wanke-gui'
import EmptyData from '../../../components/EmptyData'
import utils from '../../../public/js/utils'
import C07ControlParamsDetail from './C07ControlParamsDetail'

interface Props {
  stationId: number
  runStrategyId: number
  action: any
  c07CurrentControlParam: any
  loading: boolean
}

const C07CurrentControlParams: React.FC<Props> = (props) => {
  useEffect(() => {
    props.action('fetchC07CurrentControlParams', {
      runStrategyId: props.runStrategyId,
      stationId: props.stationId,
    })
  }, [])

  return (
    <>
      {props.loading && <FullLoading />}
      <C07ControlParamsDetail data={props.c07CurrentControlParam} />
      {!props.loading && !props.c07CurrentControlParam.type && (
        <div className="vh-center card-border" style={{ width: '100%', height: '100%' }}>
          <EmptyData message={utils.intl('暂无当前控制参数')} />
        </div>
      )}
    </>
  )
}

export default C07CurrentControlParams
