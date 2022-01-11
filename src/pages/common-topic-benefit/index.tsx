import React, { useEffect, useState } from "react";
import { DatePicker, Button, message, Select, FullLoading } from "wanke-gui";
import Page from "../../components/Page";
import PageProps from "../../interfaces/PageProps";
import { isTerminalSystem } from "../../core/env";
import { makeConnect } from "../umi.helper";
import { common_benefit_analyze } from "../constants";
import utils from "../../public/js/utils";
import MakeConnectProps from "../../interfaces/MakeConnectProps";
import { BenefitModal } from "./models";
import Detail from './detail/index'
import './index.less'
import LossView from "./LossView";

interface Props extends PageProps, MakeConnectProps<BenefitModal>, BenefitModal {
  stationId?: string;
  fetchEnergyUnitLossLoading?: boolean
}

const Benefit: React.FC<Props> = (props) => {
  const {
    action,
    pageId,
    stationId,
    energyUnits,
    selectEnergyUnitId,
    lossInfo,
  } = props
  const handleEnergyUnitChange = (val) => {
    props.action('updateToView', { selectEnergyUnitId: val })
  }

  const getEnergyUnits = () => {
    action('fetchEnergyUnits', {
      stationId
    })
  };

  useEffect(() => {
    if (stationId) {
      getEnergyUnits();
    }
  }, [stationId]);

  useEffect(() => {
    if (selectEnergyUnitId) {
      props.action('fetchEnergyUnitLoss', { energyUnitId: selectEnergyUnitId })
    }
  }, [selectEnergyUnitId])

  useEffect(() => {
    return () => {
      action('reset')
    };
  }, []);

  const energyUnit = energyUnits.find(item => item.id === selectEnergyUnitId)

  return (
    <Page
      pageId={pageId}
      pageTitle={utils.intl('效率分析')}
      showStation
    >
      <article className="topic-benefit-page has-filter-header">
        <header className="topic-benefit-title filter-header no-margin">
          <Select
            style={{ width: 260 }} 
            value={selectEnergyUnitId}
            onChange={handleEnergyUnitChange}
            dataSource={
              energyUnits.map((item, index) => ({
              name: item.title,
              value: item.id
            }))}
          />
        </header>
        <section className="topic-benefit-body">
          <aside className="topic-benefit-aside">
            {props.fetchEnergyUnitLossLoading && <FullLoading />}
            <LossView energyUnit={energyUnit} lossInfo={lossInfo} />
          </aside>
          <div className="topic-benefit-detail">
            <Detail
              energyUnitCode={selectEnergyUnitId}
            />
          </div>
        </section>
      </article>
    </Page>
  );
};

export default makeConnect(common_benefit_analyze, (model, { getLoading }, state: any) => ({
  ...model,
  stationId: isTerminalSystem() ? sessionStorage.getItem("station-id") : state.global.selectedStationId,
  fetchEnergyUnitLossLoading: getLoading('fetchEnergyUnitLoss'),
}))(Benefit);
