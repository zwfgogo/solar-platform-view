import React, { useState, useEffect } from 'react';
import Page from '../../../components/Page';
import { Row, Col, Button, RangePicker } from 'wanke-gui';
import PageProps from '../../../interfaces/PageProps';
import { makeConnect, updateState } from '../../../pages/umi.helper';
import MakeConnectProps from '../../../interfaces/MakeConnectProps';
import { SoeQueryState } from './model';
import { s_q } from '../../../pages/constants';
import utils from '../../../public/js/utils';
import List from './List';
import moment from 'moment';
import usePageSize from '../../../hooks/usePageSize';
import { isBigThanToday, getSystemTime, getTargetSystemTime } from '../../../util/dateUtil';
import { CrumbsPortal } from '../../../frameset/Crumbs';
import FormLayout from '../../../components/FormLayout';
import './index.less'

const { FieldItem } = FormLayout

interface Props extends PageProps, MakeConnectProps<SoeQueryState>, SoeQueryState {
  listLoading: boolean;
  exportLoading: boolean;
  selectedStationId: number,
  stationList: any[]
}

const SoeQuery: React.FC<Props> = function (this: null, props) {
  const [pageSize, setPageSize] = usePageSize();
  const [startTime, setStartTime] = useState(moment().startOf('day'));
  const [endTime, setEndTime] = useState(moment().add(1, 'day').startOf('day'));
  const stationId = props.selectedStationId;

  const fetchSoeList = (startTime, endTime, page, size) => {
    props.action('fetchSoe', {
      pageParam: {
        page,
        size
      },
      stationId,
      startTime: moment(startTime).format('YYYY-MM-DD HH:mm:00'),
      endTime: moment(endTime).format('YYYY-MM-DD HH:mm:00')
    });
  }

  const changeTime = (dates, dateStrings) => {
    setStartTime(dates[0]);
    setEndTime(dates[1]);
    fetchSoeList(dates[0], dates[1], 1, pageSize.size);
    setPageSize(1, pageSize.size);
  }

  const exportCsv = () => {
    props.action('onExport', {
      stationId,
      startTime: moment(startTime).format('YYYY-MM-DD HH:mm:00'),
      endTime: moment(endTime).format('YYYY-MM-DD HH:mm:00')
    })
  }

  const onPageChange = (page, size) => {
    setPageSize(page, size);
    fetchSoeList(startTime, endTime, page, size);
  }

  useEffect(() => {
    props.updateState({
      list: []
    });
    fetchSoeList(startTime, endTime, pageSize.page, pageSize.size)
  }, [props.selectedStationId]);

  return (
    <Page
      showStation={true}
      pageId={props.pageId}
      className={'energy-unit-page soe-page'}
      style={{ background: "transparent", boxShadow: "none", display: "flex", flexDirection: "column" }}
    >
      <CrumbsPortal>
        <Button loading={props.exportLoading} onClick={exportCsv} type="primary">
          {utils.intl('导出')}
        </Button>
      </CrumbsPortal>
      <FormLayout onSearch={() => {
        fetchSoeList(startTime, endTime, 1, pageSize.size);
        setPageSize(1, pageSize.size);
      }}
        onReset={() => {
          setStartTime(moment().startOf('day'))
          setEndTime(moment().add(1, 'day').startOf('day'))
        }}
      >
        <FieldItem label={utils.intl('时间')} style={{ width: 345 }}>
          <RangePicker
            disabledDate={(date, type) => {
              const target = props.stationList.find(item => item.id === props.selectedStationId);
              const timeZone = target?.timeZone;
              const today = getTargetSystemTime(timeZone)
              return date.format('YYYY-MM-DD HH:mm:ss') > today.add(1, 'day').format('YYYY-MM-DD 00:00:00')
            }}
            allowClear={false}
            maxLength={7}
            showTime
            value={[startTime, endTime]}
            onChange={changeTime}
            format="YYYY-MM-DD HH:mm"
          />
        </FieldItem>
      </FormLayout>

      <div
        className="flex1 e-pt10 f-pr content page-sub-container"
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <section style={{ flexGrow: 1, overflow: 'hidden' }}>
          <List
            dataSource={props.list}
            loading={props.listLoading}
            total={props.total}
            page={pageSize.page}
            size={pageSize.size}
            onPageChange={(page, size) => onPageChange(page, size)}
          />
        </section>
      </div>
    </Page>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    selectedStationId: state.global.selectedStationId,
    stationList: state.global.stationList,
    listLoading: getLoading('fetchSoe'),
    exportLoading: getLoading('onExport')
  }
}

export default makeConnect(s_q, mapStateToProps)(SoeQuery)