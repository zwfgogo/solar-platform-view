import React from 'react';
import classnames from 'classnames'
import EmptyImg from '../../../../components/emptyImg';
import styles from './styles/station-image-card.less'
import { GfStationSignalOutlined } from 'wanke-icon';
import Util from '../../../../public/js/utils';
import { getImageUrl } from '../../../page.helper';
import { WeatherEnum } from '../../../constants';
import { getSystemTheme, isMicrogrid, isStorageSystem } from '../../../../core/env';
import { StatusMap } from './MapInfoAside';

export const StatusClassNameMap = {
  'activate': 'put-in',
  'constructing': 'building',
  'debugging': 'debug',
  'testing': 'try-running',
  'deactivated': 'stop',
}

export const heartBeatTitleMap = {
  '0': Util.intl('在线'),
  '1': Util.intl('离线'),
}

// 0:全部故障 1:正常 2:部分故障 3.未获取到通讯状态（自定义默认值）
const colorList = ['#3DD598', '#fc5a5a', 'rgba(255, 255, 255, 0.6)'];
const WeatherMap = {
  '1': Util.intl('晴'),
  '2': Util.intl('雾'),
  '3': Util.intl('雨'),
  '4': Util.intl('云'),
  '5': Util.intl('雪'),
}

interface Props {
  filePath?: string;
  style?: React.CSSProperties;
  heartBeat?: number;
  temperature?: string;
  weatherStatus?: string;
  windSpeed?: string
  stationStatus?: string
  showWeather?: boolean
}

const StationImageCard: React.FC<Props> = ({
  filePath,
  style,
  heartBeat = 2,
  temperature,
  weatherStatus,
  windSpeed,
  stationStatus,
  showWeather = true
}) => {

  const weather = WeatherEnum[weatherStatus]
  const theme = getSystemTheme()
  const isLightTheme = theme === 'light-theme'

  const weatherMsg = `${(
      weather ? `${Util.intl('天气')}: ${weather}` : `${Util.intl('天气')}: -`
    )} ${(
      temperature ? `${Util.intl('温度')}: ${temperature}` : `${Util.intl('温度')}: -`
    )}`

  return (
    <div className={styles['image-box']} style={style}>
      {
        filePath ? (
          <img className={styles['image']} src={getImageUrl(filePath)} />
        ) : (
          <div style={{ height: '100%' }}>
            <EmptyImg imgUrl={isLightTheme ? require('./img/light-default-station.svg') : require('./img/dark-default-station.svg')} />
          </div>
        )
      }
      {!isMicrogrid() && !isStorageSystem() && showWeather && (
        <div className={styles['weather-info']} >
          <span title={weatherMsg}>{weatherMsg}</span>
          <span className={styles['message-status']}>
            <GfStationSignalOutlined style={{ fontSize: 19, color: colorList[heartBeat] }} title={heartBeatTitleMap[heartBeat]} />
          </span>
        </div>
      )}
      {isMicrogrid() && showWeather && (
        <span className={classnames(styles['image-tip'], styles[StatusClassNameMap[stationStatus]])}>{StatusMap?.[stationStatus] || ' '}</span>
      )}
    </div>
  );
};

export default StationImageCard;