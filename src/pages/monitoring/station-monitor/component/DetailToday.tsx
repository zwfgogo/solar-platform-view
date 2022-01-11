import React from 'react';
import {
    GfPowerOutlined,
    GfIncomeOutlined,
    GfEmissionReductionOutlined,
    GfClockOutlined,
    GfPrSquareOutlined,
    GfWeatherOutlined,
} from 'wanke-icon'
import { unitChange } from '../../../page.helper'
import utils from '../../../../public/js/utils';
import styles from './styles/report-card.less'

interface Props {
    weather?: any
    detail?: any
    stationDetail?: any
}

const DetailToday: React.FC<Props> = props => {
    const { weather,detail = {},stationDetail = {} } = props;
    return (
        <div className="bf-br5 flex1 f-pr e-ml10 f-df">
            <div className="flex1 f-pr" style={{ textAlign: 'center' }}>
                <p style={{ marginTop: '15%' }}>{utils.intl('天气')}</p>
                <GfWeatherOutlined style={{ fontSize: '48px', color: '#0062ff' }} />
                <p style={{ marginTop: '10px', marginBottom: '0px' }} className={styles['category-unit']}>{detail.temperature}℃</p>
                <p className="common-value" >{weather[detail.weatherStatus]}</p>
            </div>
            <div className="flex1 f-pr" style={{ textAlign: 'center' }}>
                <p style={{ marginTop: '15%' }}>{utils.intl('今日发电量')}</p>
                <GfPowerOutlined style={{ fontSize: '48px', color: '#0062ff' }} />
                <p className={styles['category-unit']} style={{ marginTop: '10px' }}>{unitChange(detail.generationDay,'kWh')} </p>
            </div>
            <div className="flex1 f-pr" style={{ textAlign: 'center' }}>
                <p style={{ marginTop: '15%' }}>{utils.intl('今日收益')}</p>
                <GfIncomeOutlined style={{ fontSize: '48px', color: '#0062ff' }} />
                <p className={styles['category-unit']} style={{ marginTop: '10px' }}>{unitChange(detail.profitDay,utils.intl(stationDetail.currency))}</p>
            </div>
            <div className="flex1 f-pr" style={{ textAlign: 'center' }}>
                <p style={{ marginTop: '15%' }}>{utils.intl('今日CO2减排')}</p>
                <GfEmissionReductionOutlined style={{ fontSize: '48px', color: '#0062ff' }} />
                <p className={styles['category-unit']} style={{ marginTop: '10px' }}>{unitChange(detail.CO2Day,'kg')}</p>
            </div>
            <div className="flex1 f-pr" style={{ textAlign: 'center' }}>
                <p style={{ marginTop: '15%' }}>{utils.intl('今日满发时长')}</p>
                <GfClockOutlined style={{ fontSize: '48px', color: '#0062ff' }} />
                <p className={styles['category-unit']} style={{ marginTop: '10px' }}>{detail.yieldDay} h</p>
            </div>
            <div className="flex1 f-pr" style={{ textAlign: 'center' }}>
                <p style={{ marginTop: '15%' }}>{utils.intl('今日PR')}</p>
                <GfPrSquareOutlined style={{ fontSize: '48px', color: '#0062ff' }} />
                <p className={styles['category-unit']} style={{ marginTop: '10px' }}>{detail.prDay}%</p>
            </div>
        </div>
    );
};

export default DetailToday;
