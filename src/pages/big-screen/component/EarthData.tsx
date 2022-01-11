import React, {useEffect} from 'react'
import {connect} from 'dva'
import styles from './style/earthData.less'
import Earth from '../../../components/earth-demo/earth'
import {jumpToOtherSystem} from '../contant'
import {Old_Storage_Web_Url, Pv_Web_Url, Terminal_Web_Url} from '../../constants'

interface Props {
  dispatch: any;
  solar: any;
  storage: any;
  stations: any[];
  stationDetail: any;
  stationOtherDetail: any;
}

const EarthData: React.FC<Props> = props => {
  const {
    dispatch,
    solar,
    storage,
    stations,
    stationDetail,
    stationOtherDetail
  } = props

  const jump = () => {
    if (stationOtherDetail.title == '江苏移动数据中心储能管理系统') {
      jumpToOtherSystem(Old_Storage_Web_Url + 'auto-login?type=1', stationOtherDetail.id)
    }
    if (stationOtherDetail.title == '新能源微网与主动配电网运维管理系统') {
      jumpToOtherSystem(Old_Storage_Web_Url + 'auto-login?type=2', stationOtherDetail.id)
    }
    if (stationOtherDetail.stationType == 'Storage' || stationOtherDetail.stationType == 'SupportingService') {
      jumpToOtherSystem(Terminal_Web_Url + '/uuid-login', stationOtherDetail.id)
    } else if (stationOtherDetail.stationType == 'Solar') {
      jumpToOtherSystem(Pv_Web_Url + '/uuid-login', stationOtherDetail.id)
    }
  }

  const stationClick = (o) => {
    if (['江苏移动数据中心储能管理系统', '新能源微网与主动配电网运维管理系统', '尼日利亚VPP'].indexOf(o.title) == -1) {
      dispatch({type: 'screenPage/getStationDetail', payload: {result: o}})
    } else {
      dispatch({
        type: 'screenPage/updateState', payload: {
          stationDetail: {
            workStatus: '正常',
            scale: o.scale,
            charge: '-',
            discharge: '-',
            generation: '-',
          }
        }
      })
    }
    dispatch({type: 'screenPage/updateState', payload: {stationOtherDetail: o}})
  }

  return (
    <div className={'flex1 f-df flex-column'} style={{flex: 0.44, paddingLeft: '90px', paddingRight: '90px'}}>
      <div className={styles['top'] + ' flex1 f-df'} style={{flex: 0.1}}>
        <div className={styles['left'] + ' flex1'}>
          <p className={styles['leftTitle']}>
            <span className={'f-fs18'}>储能装机</span>
            <span className={'f-fs20'} style={{color: '#0AFFFC', float: 'right', lineHeight: '26px', marginLeft: '40px'}}>
                            {storage.power} <span className={'f-fs16'}>{storage.powerUnit}</span> / {storage.scale} <span
              className={'f-fs16'}>{storage.scaleUnit}</span>
                        </span>
          </p>
        </div>
        <div className={styles['right'] + ' flex1'}>
          <p className={styles['rightTitle']}>
            <span className={'f-fs18'}>光伏装机</span>
            <span className={'f-fs20'} style={{color: '#0AFFFC', lineHeight: '26px', marginLeft: '40px'}}>
                            {solar.power} <span className={'f-fs16'}>{solar.powerUnit}</span> / {solar.scale} <span
              className={'f-fs16'}>{solar.scaleUnit}</span>
                        </span>
          </p>
        </div>
      </div>
      <div className={styles['middle'] + ' flex1 f-df'} style={{position: 'relative'}}>
        {stations.length > 0 &&
        <Earth
          color={0x44bbbb}
          stations={stations}
          position={{x: 0, y: 0, z: 0}}
          zoom={1}
          switchSpeed={10}
          stationClick={(station) => {
            stationClick(station)
          }}
        />
        }
      </div>
      <div className={styles['bottom'] + ' flex1 f-df flex-column'} style={{marginTop: '20px', flex: 0.1}}>
        <div className={styles['title']}>
          <span className={'f-fs14'} style={{float: 'left', borderBottom: '1px solid #fff', opacity: '0.65'}}>{stationOtherDetail.title}</span>
          {stationOtherDetail.id &&
          <span className={'f-fs14'} style={{float: 'right', borderBottom: '1px solid #fff', color: '#0AFFFC', cursor: 'pointer'}} onClick={jump}>进入</span>
          }
        </div>
        <div className={styles['line']}>
        </div>
        {
          (stationOtherDetail.stationType === 'Storage' || stationOtherDetail.stationType === 'SupportingService') && (
            <div className={styles['content'] + ' flex1 f-df '}>
              <div className={styles['content_div'] + ' flex1'} style={{flex: 0.20}}>
                <span className={styles['title'] + ' f-fs13'}>工作状态</span>
                <span className={styles['value'] + ' f-fs13'}>{stationDetail.workStatus}</span>
              </div>
              <div className={styles['content_div'] + ' flex1'} style={{flex: 0.40, padding: '0 30px'}}>
                <span className={styles['title'] + ' f-fs13'}>建设规模</span>
                <span className={styles['value'] + ' f-fs13'}>{stationOtherDetail.scale}</span>
              </div>
              <div className={styles['content_div'] + ' flex1'} style={{flex: 0.20, padding: '0 30px 0 0'}}>
                <span className={styles['title'] + ' f-fs13'}>今日充电量</span>
                <span className={styles['value'] + ' f-fs13'}>{stationDetail.charge}</span>
              </div>
              <div className={styles['content_div'] + ' flex1'} style={{flex: 0.20}}>
                <span className={styles['title'] + ' f-fs13'}>今日放电量</span>
                <span className={styles['value'] + ' f-fs13'}>{stationDetail.discharge}</span>
              </div>
            </div>
          )
        }
        {
          stationOtherDetail.stationType === 'Solar' && (
            <div className={styles['content'] + ' flex1 f-df '}>
              <div className={styles['content_div'] + ' flex1'} style={{flex: 0.3}}>
                <span className={styles['title'] + ' f-fs13'}>工作状态</span>
                <span className={styles['value'] + ' f-fs13'}>{stationDetail.workStatus}</span>
              </div>
              <div className={styles['content_div'] + ' flex1'} style={{flex: 0.4, padding: '0 30px'}}>
                <span className={styles['title'] + ' f-fs13'}>建设规模</span>
                <span className={styles['value'] + ' f-fs13'}>{stationOtherDetail.scale}</span>
              </div>
              <div className={styles['content_div'] + ' flex1'} style={{flex: 0.3}}>
                <span className={styles['title'] + ' f-fs13'}>今日发电量</span>
                <span className={styles['value'] + ' f-fs13'}>{stationDetail.generation}</span>
              </div>
            </div>
          )
        }
        {
          stationOtherDetail.stationType === 'SolarStorage' && (
            <div className={styles['content'] + ' flex1 f-df '}>
              <div className={styles['content_div'] + ' flex1'} style={{flex: 0.3}}>
                <span className={styles['title'] + ' f-fs13'}>工作状态</span>
                <span className={styles['value'] + ' f-fs13'}>{stationDetail.workStatus}</span>
              </div>
              <div className={styles['content_div'] + ' flex1'} style={{flex: 0.35}}>
                <span className={styles['title'] + ' f-fs13'}>今日发电量</span>
                <span className={styles['value'] + ' f-fs13'}>{stationDetail.generation}</span>
              </div>
              <div className={styles['content_div'] + ' flex1'} style={{flex: 0.35, padding: '0 30px'}}>
                <span className={styles['title'] + ' f-fs13'}>今日并网量</span>
                <span className={styles['value'] + ' f-fs13'}>-</span>
              </div>
            </div>
          )
        }
      {
          stationOtherDetail.stationType === 'Microgrid' && (
            <div className={styles['content'] + ' flex1 f-df '}>
              <div className={styles['content_div'] + ' flex1'} style={{flex: 0.3}}>
                <span className={styles['title'] + ' f-fs13'}>工作状态</span>
                <span className={styles['value'] + ' f-fs13'}>正常</span>
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}

const mapStateToProps = state => ({...state.screenPage})
export default connect(mapStateToProps)(EarthData)
