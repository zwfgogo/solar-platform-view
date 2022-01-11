import React, { useCallback, useMemo, useState } from 'react'
import { Button, Empty, Tabs } from 'wanke-gui';
import { ClockCircleOutlined, GfMonitoringCenterOutlined, UserOutlined } from 'wanke-icon';
import EchartsLineChart from '../../../components/charts/EchartsLineChart';
import Item from '../../../components/SelectItem';
import utils from '../../../public/js/utils'
import data from '../../storage-run-strategy/models/data';
import "./customCard.less"

const { TabPane } = Tabs

interface CustomCardProps {
  dataSource: any;
  energyUnit: any;
}

const CustomCard: React.FC<CustomCardProps> = (props) => {
  const { dataSource, energyUnit } = props
  // console.log('dataSource', dataSource, energyUnit);

  const getEchartsData = useMemo(
    () => {
      const { cycles, soh } = dataSource
      const { startSoh = 100, startCycles = 0 } = energyUnit
      const result = {
        xData: [],
        yData: [],
        series: []
      }

      if (cycles && cycles.length) {
        const newCycles = _.cloneDeep(cycles.sort((a, b) => a.cycles - b.cycles));
        // newCycles.reverse();
        const cyclesXData = newCycles.map(i => i.cycles);
        const cyclesYData = newCycles.map(i => i.soh);

        if (cyclesYData[0] === soh) {
          result.xData = [startCycles, ...cyclesXData];
          result.yData = [[startSoh, ...cyclesYData]];
        } else {
          result.xData = [startCycles, ...cyclesXData, null];
          const yData = [startSoh, ...cyclesYData, soh]
          result.yData = [yData];
          result.series = [{ name: 'SOH', unit: '' }]
          // 根据斜率算出第一个点的循环次数

          result.xData[result.xData.length - 1] = parseInt((result.xData[yData.length - 3] - result.xData[yData.length - 2]) / (yData[yData.length - 3] - yData[yData.length - 2]) * (soh - yData[yData.length - 2]) + result.xData[yData.length - 2]);
        }
      }

      result.xData = result.xData.map(i => `${i}`)

      return result
    },
    [dataSource.soh, JSON.stringify(dataSource.cycles ?? []), JSON.stringify(energyUnit)],
  )

  return (
    <div className="customCard-box">
      <div className="charts-box">
        <header className="charts-header">
          {utils.intl('衰减参数')}
          <span className="charts-header-right">
            {/* <span className="first-item">{utils.intl('DoD')}: <span style={{ color: "#3D7EFF", marginLeft: 8 }}>{dataSource.dod}</span>%</span> */}
            <span>{utils.intl('最低可用SoH')}: <span style={{ color: "#3D7EFF", marginLeft: 8 }}>{dataSource.soh}</span>%</span>
          </span>
        </header>
        <div className="charts-body">
          <EchartsLineChart
            xData={getEchartsData.xData}
            yData={getEchartsData.yData}
            series={getEchartsData.series}
            showLegend={false}
            // xAxisName={utils.intl('循环次数')}
            xAxis={{
              name: utils.intl('循环次数')
            }}
            // yAxisName={"SoH"}
            yAxis={{
              name: "SoH",
              axisLabel: {
                formatter: '{value}%'
              }
            }}
            grid={{ left: 60, right: 70 }}
            colorList={["#42CECE"]}
            tooltip={{
              formatter: (params) => {
                return `${utils.intl('循环次数')}：${params[0].value?.[0]} <br/> SoH: ${params[0].value?.[1]}%`
              }
            }}
          />
        </div>
      </div>
      <div className="customCard-footer">
        <div className="footer-item">
          <GfMonitoringCenterOutlined style={{ marginRight: 8 }} />
          {utils.intl('充电效率')}:
          <span className="footer-item-value" style={{ color: "#3D7EFF", fontSize: 20 }}>
            {dataSource.chargeEfficiency}<span style={{ fontSize: 14 }}>%</span>
          </span>
        </div>
        <div className="footer-item">
          <GfMonitoringCenterOutlined style={{ marginRight: 8 }} />
          {utils.intl('放电效率')}:
          <span className="footer-item-value" style={{ color: "#3D7EFF", fontSize: 20 }}>
            {dataSource.dischargeEfficiency}<span style={{ fontSize: 14 }}>%</span>
          </span>
        </div>
        <div className="footer-item">
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          {utils.intl('更新时间')}:
          <span className="footer-item-value">{dataSource.updateTime}</span>
        </div>
        <div className="footer-item">
          <UserOutlined style={{ marginRight: 8 }} />
          {utils.intl('操作人')}:
          <span className="footer-item-value">{dataSource.user?.title}</span>
        </div>
      </div>
    </div>
  )
}

export default CustomCard