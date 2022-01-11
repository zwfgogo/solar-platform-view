import React, { useEffect } from 'react';
import Page from '../../../components/Page'
import PageProps from '../../../interfaces/PageProps'
import utils from '../../../public/js/utils';
import { makeConnect } from '../../umi.helper';
import { StrategySettingModel } from '../models/strategy-setting';
import { strategySettingNS } from '../../constants';
import MakeConnectProps from '../../../interfaces/MakeConnectProps';
import List from './List';
import usePageSize from '../../../hooks/usePageSize';
import FullContainer from '../../../components/layout/FullContainer';
import { copy } from '../../../util/utils';

//控制策略页签
interface Props extends PageProps, StrategySettingModel, MakeConnectProps<StrategySettingModel> {
  listLoading: boolean,
  // 外部props
  stationId: number
}

const StrategySetting: React.FC<Props> = function (this: null, props) {
  const [pageSize, setPageSize] = usePageSize();

  const fetchStrategySettingList = (page, size) => {
    props.action('fetchStrategySetting', {
      stationId: props.stationId,
      page,
      size
    });
  }

  const onPageChange = (page, size) => {
    setPageSize(page, size);
    fetchStrategySettingList(page, size);
  }

  const onCheckChange = (e, i, type) => {
    const list = copy(props.list);
    if (list[i] && list[i][type] !== null) {
      list[i][type] = e.target.checked;
    }
    props.action('updateStrategySetting', {
      stationId: props.stationId,
      putBody: list
    })
  }

  useEffect(() => {
    fetchStrategySettingList(pageSize.page, pageSize.size);
  }, [])

  return (
    <FullContainer>
      <List
        dataSource={props.list}
        loading={props.listLoading}
        total={props.total}
        page={pageSize.page}
        size={pageSize.size}
        onPageChange={(page, size) => onPageChange(page, size)}
        onCheckChange={onCheckChange}
      />
    </FullContainer>
  );
}

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    listLoading: getLoading('fetchStrategySetting')
  }
}

export default makeConnect(strategySettingNS, mapStateToProps)(StrategySetting)