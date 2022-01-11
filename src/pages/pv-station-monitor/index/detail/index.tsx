import Icon from '@ant-design/icons';
import { connect, useDispatch } from 'dva';
import moment, { Moment } from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Select, DatePicker, MultiLineChart, Radio, LineChart } from 'wanke-gui';
import { WankeConstructionOutlined } from 'wanke-icon';
import CardText from '../../../../components/CardText';
import BarChart from '../../../../components/charts/BarChart';
import Page from '../../../../components/Page'
import MakeConnectProps from '../../../../interfaces/MakeConnectProps';
import PageProps from '../../../../interfaces/PageProps'
import utils from '../../../../public/js/utils';
import { conversionUnit, numberToFixed } from '../../../../util/utils';
import { getChartData, WorkColorMap, WorkStatus } from '../../../common-operation-monitor/dataCfg';
import { globalNS, Socket_Port } from '../../../constants';
import SocketHelper from '../../../socket.helper';
import { formatEmptyValue } from '../components/powerStationTable';
import StationImageCard from '../components/StationImageCard';
// import * as RunningStatus from "../components/img/runningStatus.svg"
import EchartsBarChart from '../../../../components/charts/EchartsBarChart'
import "./index.less"
import { formatChartData, sortChartData } from '../../../page.helper';

interface Props extends PageProps {
  stationId: number
  stationName: string
  stationDetail: any,
  energyUnitList: any[],
}

const RunningIcon = () => (<svg width="17px" height="16px" viewBox="0 0 17 16">
  <g id="页面-1" stroke="none" stroke-width="1" fill="currentColor" fill-rule="evenodd" fill-opacity="0.45">
    <g id="6、电站监控-深色" transform="translate(-645.000000, -1512.000000)" fill="currentColor">
      <g id="编组-15" transform="translate(614.000000, 1200.000000)">
        <g id="编组-13" transform="translate(16.000000, 296.000000)">
          <g id="编组-3" transform="translate(15.000000, 12.000000)">
            <g id="运行状况" transform="translate(0.000000, 4.000000)">
              <path d="M7.99985845,0 C8.41941688,0.000448002876 8.75942444,0.340455564 8.75987244,0.760013994 L8.759,3.817 C8.77470996,3.82606429 8.78470996,3.83260791 8.79450163,3.83915154 L8.82387661,3.85861464 C8.79887832,3.84734854 8.77808415,3.83647859 8.75819079,3.82535154 L8.75981636,6.0748846 C8.77043489,6.07908064 8.78103263,6.0833695 8.79160851,6.08775139 C9.56496978,6.40817708 10.0691304,7.16294742 10.0689739,8.00006166 C10.0704826,8.54928665 9.85297506,9.07645389 9.46461287,9.46481608 C9.07625068,9.85317827 8.54908343,10.0706859 7.99985845,10.0691771 C7.16274421,10.0693336 6.40797386,9.56517299 6.08754817,8.79181173 C5.76712248,8.01845046 5.94415549,7.12821703 6.53608465,6.53628787 C6.74097316,6.33139936 6.98160171,6.17621987 7.24075258,6.07417333 L7.24117342,4.84071765 C6.15678077,5.10181184 5.26084318,5.91104887 4.9103317,7.00765463 C4.48073547,8.35168398 4.96893856,9.81927934 6.11803413,10.6381488 C7.2671297,11.4570182 8.8136967,11.4394425 9.94388601,10.5946703 C11.0740753,9.74989822 11.5288,8.27158707 11.0687705,6.93766777 C10.9800524,6.68102408 11.0349912,6.39654496 11.2128921,6.19139096 C11.390793,5.98623695 11.6646286,5.89157584 11.9312476,5.94306554 C12.1978666,5.99455523 12.4167634,6.18437324 12.5054815,6.44101694 C13.007763,7.89826185 12.7750171,9.50839729 11.8806278,10.7637527 C10.9862385,12.0191081 9.54042421,12.7649821 7.99904561,12.7662028 C5.36691797,12.7666093 3.23249799,10.6321893 3.23249799,7.99924882 C3.23249799,5.62456908 4.96873052,3.65540818 7.24100937,3.29195232 L7.24106375,1.56473468 C4.41650321,1.89951848 2.14090217,4.0379471 1.63137906,6.83626957 C1.12185595,9.63459203 2.49766213,12.4378748 5.02293968,13.7467658 C7.54821724,15.0556569 10.6319374,14.5638167 12.6247546,12.5343088 C14.6175718,10.504801 15.053077,7.41262177 13.6983377,4.91164119 C13.5013806,4.54313135 13.6388448,4.08473924 14.0060837,3.88542247 C14.3733226,3.68610569 14.832587,3.82062683 15.0342553,4.18657973 C16.3770513,6.66593448 16.3159622,9.66898893 14.8734472,12.091684 C13.4309322,14.5143791 10.8198925,15.9991484 8.00026488,16.0001233 L7.99985845,15.9997169 C3.58165863,15.9997169 0,12.4180583 0,7.99985845 C0,3.58165863 3.58165863,0 7.99985845,0 Z M7.99945204,7.45057182 L7.99985845,7.4517949 C7.69638569,7.45179491 7.45037243,7.6978082 7.45037243,8.00128095 C7.45037243,8.30475371 7.69638572,8.55076698 7.99985848,8.55076698 C8.30333123,8.55076698 8.54935193,8.30475369 8.54935193,8.00128094 C8.55010445,7.85513417 8.49243975,7.71474168 8.38917334,7.61132263 C8.28590692,7.50790357 8.14559976,7.45003155 7.99945204,7.45057182 Z" id="形状结合"></path>
            </g>
          </g>
        </g>
      </g>
    </g>
  </g>
</svg>);

const socket = new SocketHelper("powerStationPv", Socket_Port, "/search-history-value", {}, {
  mergeTimeInterval: 600,
  mergeConfig: {
    'work_power_soc': {
      mergeFn: mergeStorageCurve,
      defaultValue: {}
    },
  }
});

function mergeStorageCurve(prevRes, nextRes) {
  const { results: prevResults = {} } = prevRes
  const { results: nextResults = {} } = nextRes

  if (prevResults.stationId && prevResults.stationId !== nextResults.stationId) {
    return { results: nextResults }
  }

  Object.keys(nextResults).forEach(key => {
    if (key === 'stationId') {
      prevResults[key] = nextResults[key]
      return
    }
    if (prevResults[key]) {
      prevResults[key] = prevResults[key].concat(nextResults[key])
    } else {
      prevResults[key] = nextResults[key]
    }
  })
  return { results: prevResults }
}



let realSocketIsConnect = false;
let wsProfitDate = '30,d';
let wsCdDate = '30,d';
let wsWorkChart = { // 运行工况
  xData: [],
  yData: [],
  series: [],
}

const Detail: React.FC<Props> = (props) => {
  const { stationDetail, stationId, energyUnitList } = props
  const dispatch = useDispatch();
  const [energyUnit, setEnergyUnit] = useState();
  const [powerSoc, setPowerSoc] = useState({});
  const [profitCD, setProfitCD] = useState({});
  const [workDate, setWorkDate] = useState(moment());
  const [workChart, setWorkChart] = useState({ // 运行工况
    xData: [],
    yData: [],
    series: [],
  });

  const [profitDate, setProfitDate] = useState('30,d');

  const [profitChart, setProfitChart] = useState({ // 收益趋势
    xData: [],
    yData: [],
    series: [],
  });

  const [cdDate, setCdDate] = useState('30,d');

  const [cdChart, setCdChart] = useState({ // 充放电量趋势
    xData: [],
    yData: [],
    series: [],
  });


  useEffect(() => {
    return () => {
      realSocketIsConnect = false;
      wsProfitDate = '30,d';
      wsCdDate = '30,d';
      socket.close();
    }
  }, [])

  useEffect(() => {
    // 根据电站id查询能量单元
    dispatch({ type: `${globalNS}/getEnergyListByStationId`, payload: { stationId } });
    if (stationId) {
      setProfitCD({});
      initSocket();
    }
  }, [stationId]);

  useEffect(() => {
    setEnergyUnit(energyUnitList?.[0]?.id);
  }, [JSON.stringify(energyUnitList)]);

  useEffect(() => {
    setWorkChart({ // 运行工况
      xData: [],
      yData: [],
      series: [],
    });
    if (realSocketIsConnect) {
      wsWorkChart = { // 运行工况
        xData: [],
        yData: [],
        series: [],
      };
      socket.emit("work_power_soc", { deviceId: stationId, time: workDate.format('YYYY-MM-DD') });
    }
  }, [stationId, workDate.format('YYYY-MM-DD')]);

  useEffect(() => {
    setProfitChart({ // 运行工况
      xData: [],
      yData: [],
      series: [],
    });
    if (realSocketIsConnect) socket.emit("work_profit", { deviceId: stationId, timeType: profitDate });
  }, [stationId, profitDate]);

  useEffect(() => {
    setCdChart({ // 运行工况
      xData: [],
      yData: [],
      series: [],
    });
    if (realSocketIsConnect) socket.emit("work_charge_disCharge", { deviceId: stationId, timeType: cdDate });
  }, [stationId, cdDate]);

  useEffect(() => {
    // 根据能量单元
    if (energyUnit) {
      setPowerSoc({});
      initSocket();
    }
  }, [energyUnit])

  // 初始化websocket
  const initSocket = () => {

    if (realSocketIsConnect) {
      if (stationId) {
        socket.emit("profit_charge_disCharge", { deviceId: stationId });
      }

      if (energyUnit) {
        socket.emit("power_soc", { deviceId: energyUnit });
      }
    } else {
      socket.start(
        dispatch,
        {},
        {
          connect: () => {
            realSocketIsConnect = true;
            if (stationId) {
              socket.emit("profit_charge_disCharge", { deviceId: stationId });
              wsWorkChart = { // 运行工况
                xData: [],
                yData: [],
                series: [],
              }
              socket.emit("work_power_soc", { deviceId: stationId, time: workDate.format('YYYY-MM-DD') });
              socket.emit("work_profit", { deviceId: stationId, timeType: profitDate });
              socket.emit("work_charge_disCharge", { deviceId: stationId, timeType: cdDate });
            }
            if (energyUnit) {
              socket.emit("power_soc", { deviceId: energyUnit });
            }
          },
          power_soc: (message: any) => {
            setPowerSoc({
              ...powerSoc,
              ...message
            });

          },
          profit_charge_disCharge: (message: any) => {
            setProfitCD({
              ...profitCD,
              ...message
            });
          },
          work_power_soc: (message: any) => {
            // const workChart = getChartData(message, workDate, workChart?.yData || [], workChart?.xData || []);
            // workChart.series = workChart.series?.map(i => ({ ...i, name: utils.intl(i.name) })) || []
            // this.setState({ activePowerData: activePowerData });
            const series = (wsWorkChart.series || []).slice();
            const lastKeys = series.map(item => item.originKey)

            Object.keys(message.results).forEach(key => {
              if (key === 'stationId') {
                return
              }
              if (lastKeys.indexOf(key) === -1) {
                const [title, typeName] = key.split('_')
                lastKeys.push(key)
                series.push({
                  name: utils.intl(title) + utils.intl(`storageCurve.${typeName}`),
                  unit: 'kW',
                  originKey: key, // 记录数据key值 数据结构: title_id
                })
              }
            })

            wsWorkChart = sortChartData(formatChartData(wsWorkChart, message.results, lastKeys), { fillPoint: true });
            wsWorkChart.series = series;

            setWorkChart(wsWorkChart);
          },
          work_profit: (message: any) => { //profitDate === '30,d' ? 
            const pList = wsProfitDate.split(',')
            const time = {
              startTime: wsProfitDate === '30,d' ? moment().subtract(Number(pList[0]) + 1, 'days') : moment().subtract(Number(pList[0]), pList[1]),
              endTime: wsProfitDate === '30,d' ? moment().subtract(1, 'days') : moment(),
              type: wsProfitDate === '30,d' ? 'day' : 'month'
            }
            const profitChart = getChartData(message, workDate, profitChart?.yData || [], profitChart?.xData || [], time);
            profitChart.series = profitChart.series?.map(i => ({ ...i, name: utils.intl(i.name) })) || []
            setProfitChart(profitChart);
          },
          work_charge_disCharge: (message: any) => {
            const pList = wsCdDate.split(',')
            const time = {
              startTime: wsCdDate === '30,d' ? moment().subtract(Number(pList[0]) + 1, 'days') : moment().subtract(Number(pList[0]), pList[1]),
              endTime: wsCdDate === '30,d' ? moment().subtract(1, 'days') : moment(),
              type: wsCdDate === '30,d' ? 'day' : 'month'
            }
            const cdChart = getChartData(message, workDate, cdChart?.yData || [], cdChart?.xData || [], time);
            cdChart.series = cdChart.series?.map(i => ({ ...i, name: utils.intl(i.name) })) || []
            // this.setState({ activePowerData: activePowerData });
            // console.log('cdChart', cdChart)
            setCdChart(cdChart);
          },
          // realTimeWorking: (message: any) => {
          //   // setWorkingData(_.merge(workingData, message))
          // }
        }
      );
    }
  }

  const selectDataList = useMemo(() => {
    return energyUnitList.map(item => {
      item.value = item.id;
      item.name = item.title;
      return item;
    })
  }, [JSON.stringify(energyUnitList)]);

  const newProfitCD = useMemo(() => {
    return Object.keys(profitCD).reduce((pre, key) => {
      if ('ProfitDay,ProfitMonth,ProfitYear,ProfitAmount'.indexOf(key) > -1) {
        pre[key] = conversionUnit({ target: profitCD[key], unit: '元', language: localStorage.getItem('language') || 'zh' });
      } else {
        pre[key] = conversionUnit({ target: profitCD[key], unit: 'kWh', language: localStorage.getItem('language') || 'zh' });
      }
      return pre
    }, {})

  }, [JSON.stringify(profitCD)])


  const handleEnergyUnit = useCallback(
    (value) => {
      setEnergyUnit(value);
    }, []);

  const language = localStorage.getItem('language') || 'zh'

  return (
    <Page
      pageId={props.pageId}
      pageTitle={props.stationName}
      className="station-monitor-detail page-bg2"
    >
      <div className="page-left-item">
        <div className="page-title">{stationDetail.title}</div>
        <div className="page-img-box">
          <StationImageCard
            filePath={stationDetail.filePath}
            style={{ height: 210 }}
            showWeather={false}
          />
        </div>
        <div className="page-station-box">
          <WankeConstructionOutlined style={{ fontSize: 16 }} />
          {formatEmptyValue(stationDetail.ratedPowerDisplay)} / {formatEmptyValue(stationDetail.scaleDisplay)}
        </div>
        <div className="page-sub-box">
          <div className="page-sub-header">
            <Icon component={RunningIcon} />
            <span style={{ maxWidth: 190 }}>{utils.intl('实时工况')}</span>
            <Select
              dataSource={selectDataList}
              value={energyUnit}
              className="page-sub-select"
              placeholder={utils.intl('能量单元')}
              style={{ width: "100%", textAlign: "right" }}
              dropdownClassName="page-sub-select-dropdown"
              dropdownStyle={{ width: 198 }}
              onChange={handleEnergyUnit}
            />
          </div>
          <div className="page-sub-body">
            <div className="page-sub-body-item" style={{ borderRadius: "4px 0px 0px 4px", marginRight: 1 }}>
              <div className="page-sub-value">
                {numberToFixed(powerSoc?.SOC) ?? '--'}<span>%</span>
              </div>
              <div className="page-sub-label">SOC</div>
            </div>
            <div className="page-sub-body-item" style={{ borderRadius: "0px 4px 4px 0px", marginLeft: 1 }}>
              <div className="page-sub-value">
                {numberToFixed(powerSoc?.ActivePower) ?? '--'}<span>kW</span>
              </div>
              <div className="page-sub-label">{utils.intl('当前有功功率')}</div>
              <CardText
                color={WorkColorMap[powerSoc?.WorkStatus]?.split('|')?.[0]}
                backgroundColor={WorkColorMap[powerSoc?.WorkStatus]?.split('|')?.[1]}
                text={WorkStatus[powerSoc?.WorkStatus]}
                style={{ position: "absolute", right: 2, top: 0 }}
              />
            </div>
          </div>
        </div>
        <div className="page-card-box">
          <div className="profit-icon" />
          <div className="page-card-middle">
            <div className="page-card-label">{utils.intl('昨日收益')}</div>
            <div className="page-card-value">{numberToFixed(newProfitCD?.ProfitDay?.value) ?? '--'}<span>{utils.intl(newProfitCD?.ProfitDay?.unit)}</span></div>
          </div>
          <div className="page-card-right">
            <div className="right-item">
              <div className="right-label">{utils.intl('本月')}</div>
              <div className="right-value"><div className="text-ellipsis" style={language === 'zh' ? {} : { maxWidth: 31 }} title={numberToFixed(newProfitCD?.ProfitMonth?.value)}>{numberToFixed(newProfitCD?.ProfitMonth?.value) ?? '--'}</div><span>{utils.intl(newProfitCD?.ProfitMonth?.unit)}</span></div>
            </div>
            <div className="right-item">
              <div className="right-label">{utils.intl('本年')}</div>
              <div className="right-value"><div className="text-ellipsis" style={language === 'zh' ? {} : { maxWidth: 46 }} title={numberToFixed(newProfitCD?.ProfitYear?.value)}>{numberToFixed(newProfitCD?.ProfitYear?.value) ?? '--'}</div><span>{utils.intl(newProfitCD?.ProfitYear?.unit)}</span></div>
            </div>
            <div className="right-item">
              <div className="right-label">{utils.intl('累计')}</div>
              <div className="right-value"><div className="text-ellipsis" style={language === 'zh' ? {} : { maxWidth: 52 }} title={numberToFixed(newProfitCD?.ProfitAmount?.value)}>{numberToFixed(newProfitCD?.ProfitAmount?.value) ?? '--'}</div><span>{utils.intl(newProfitCD?.ProfitAmount?.unit)}</span></div>
            </div>
          </div>
        </div>
        <div className="page-card-box">
          <div className="charge-icon" />
          <div className="page-card-middle">
            <div className="page-card-label">{utils.intl('昨日充电量')}</div>
            <div className="page-card-value">{numberToFixed(newProfitCD?.ChargeDay?.value) ?? '--'}<span>{newProfitCD?.ChargeDay?.unit}</span></div>
          </div>
          <div className="page-card-right">
            <div className="right-item">
              <div className="right-label">{utils.intl('本月')}</div>
              <div className="right-value"><div className="text-ellipsis" style={language === 'zh' ? {} : { maxWidth: 31 }} title={numberToFixed(newProfitCD?.ChargeMonth?.value)}>{numberToFixed(newProfitCD?.ChargeMonth?.value) ?? '--'}</div><span>{newProfitCD?.ChargeMonth?.unit}</span></div>
            </div>
            <div className="right-item">
              <div className="right-label">{utils.intl('本年')}</div>
              <div className="right-value"><div className="text-ellipsis" style={language === 'zh' ? {} : { maxWidth: 46 }} title={numberToFixed(newProfitCD?.ChargeYear?.value)}>{numberToFixed(newProfitCD?.ChargeYear?.value) ?? '--'}</div><span>{newProfitCD?.ChargeYear?.unit}</span></div>
            </div>
            <div className="right-item">
              <div className="right-label">{utils.intl('累计')}</div>
              <div className="right-value"><div className="text-ellipsis" style={language === 'zh' ? {} : { maxWidth: 52 }} title={numberToFixed(newProfitCD?.ChargeAmount?.value)}>{numberToFixed(newProfitCD?.ChargeAmount?.value) ?? '--'}</div><span>{newProfitCD?.ChargeAmount?.unit}</span></div>
            </div>
          </div>
        </div>
        <div className="page-card-box">
          <div className="disCharge-icon" />
          <div className="page-card-middle">
            <div className="page-card-label">{utils.intl('昨日放电量')}</div>
            <div className="page-card-value">{numberToFixed(newProfitCD?.DischargeDay?.value) ?? '--'}<span>{newProfitCD?.DischargeDay?.unit}</span></div>
          </div>
          <div className="page-card-right">
            <div className="right-item">
              <div className="right-label">{utils.intl('本月')}</div>
              <div className="right-value"><div className="text-ellipsis" style={language === 'zh' ? {} : { maxWidth: 31 }} title={numberToFixed(newProfitCD?.DischargeMonth?.value)}>{numberToFixed(newProfitCD?.DischargeMonth?.value) ?? '--'}</div><span>{newProfitCD?.DischargeMonth?.unit}</span></div>
            </div>
            <div className="right-item">
              <div className="right-label">{utils.intl('本年')}</div>
              <div className="right-value"><div className="text-ellipsis" style={language === 'zh' ? {} : { maxWidth: 46 }} title={numberToFixed(newProfitCD?.DischargeYear?.value)}>{numberToFixed(newProfitCD?.DischargeYear?.value) ?? '--'}</div><span>{newProfitCD?.DischargeYear?.unit}</span></div>
            </div>
            <div className="right-item">
              <div className="right-label">{utils.intl('累计')}</div>
              <div className="right-value"><div className="text-ellipsis" style={language === 'zh' ? {} : { maxWidth: 52 }} title={numberToFixed(newProfitCD?.DischargeAmount?.value)}>{numberToFixed(newProfitCD?.DischargeAmount?.value) ?? '--'}</div><span>{newProfitCD?.DischargeAmount?.unit}</span></div>
            </div>
          </div>
        </div>
      </div>
      <div className="page-right-item">
        <div className="card-charts-box">
          <div className="card-charts-header">
            {utils.intl('运行工况')}
            <div className="card-header-right">
              <DatePicker
                disabledDate={current => moment().add(1, 'days').isBefore(current)}
                value={workDate}
                onChange={value => setWorkDate(value)} />
            </div>
          </div>
          <div className="card-charts-body" style={{ paddingTop: 16 }}>
            <LineChart
              series={workChart.series}
              xData={workChart.xData}
              yData={workChart.yData}
              options={{
                yAxisScale: true,
                startDate: (workDate as Moment)?.startOf('day').valueOf(),
                endDate: (workDate as Moment)?.endOf('day').valueOf(),
                dateFormat: (d) => { return moment(d).format('HH:mm:ss') },
                // backOpacity: [0, 0],
                margin: {
                  left: 55,
                  right: 55,
                  bottom: 30,
                }
              }}
            />
          </div>
        </div>
        <div className="card-charts-box">
          <div className="card-charts-header">
            {utils.intl('收益趋势')}
            <div className="card-header-right">
              <Radio.Group onChange={e => {
                setProfitDate(e.target.value);
                wsProfitDate = e.target.value;
              }} value={profitDate}>
                <Radio.Button value="30,d">{utils.intl('近30天')}</Radio.Button>
                <Radio.Button value="12,M">{utils.intl('近12月')}</Radio.Button>
              </Radio.Group>
            </div>
          </div>
          <div className="card-charts-body">
            <EchartsBarChart
              series={profitChart.series}
              xData={profitChart.xData}
              yData={profitChart.yData}
              grid={{
                left: profitDate === '30,d' ? 55 : 80,
                right: 55,
                bottom: 30,
              }}
            // options={{
            //   dateFormat: (d) => { return moment(d).format(profitDate === '30,d' ? 'YYYY-MM-DD' : 'YYYY-MM') },
            //   tooltipDateFormat: profitDate === '30,d' ? 'YYYY-MM-DD' : 'YYYY-MM',
            //   startDate: profitDate === '30,d' ? moment().subtract(31, 'days').valueOf() : moment().subtract(12, 'months').valueOf(),
            //   endDate: profitDate === '30,d' ? moment().subtract(1, 'days').valueOf() : moment().valueOf(),
            //   // margin: {
            //   //   left: 55,
            //   //   right: 55,
            //   //   bottom: 50,
            //   // },
            // }}
            />
          </div>
        </div>
        <div className="card-charts-box">
          <div className="card-charts-header">
            {utils.intl('充放电量趋势')}
            <div className="card-header-right">
              <Radio.Group onChange={e => {
                setCdDate(e.target.value);
                wsCdDate = e.target.value;
              }} value={cdDate}>
                <Radio.Button value="30,d">{utils.intl('近30天')}</Radio.Button>
                <Radio.Button value="12,M">{utils.intl('近12月')}</Radio.Button>
              </Radio.Group>
            </div>
          </div>
          <div className="card-charts-body">
            <EchartsBarChart
              {...cdChart}
              grid={{
                left: cdDate === '30,d' ? 55 : 80,
                right: 55,
                bottom: 30,
              }}
            />
          </div>
        </div>
      </div>
    </Page>
  )
}

const mapStateToProps = state => ({
  ...state.powerStationPv,
  energyUnitList: state[globalNS].energyUnitList
});

export default connect(mapStateToProps)(Detail);
