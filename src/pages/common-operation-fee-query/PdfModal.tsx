import React, { Component, useState, useEffect } from 'react';
import { Button, FullLoading, Modal } from 'wanke-gui';
import { getSystemTheme } from '../../core/env';
import MakeConnectProps from '../../interfaces/MakeConnectProps';
import utils from '../../public/js/utils';
import { fee_query_fee_result } from '../constants';
import { makeConnect } from '../umi.helper';
import { FeeQueryResultState } from './models/fee-result';
import './pdf-modal.less'

interface Props extends MakeConnectProps<FeeQueryResultState>, FeeQueryResultState {
  visible: boolean
  record: any
  stationId: any
  cancel: () => void
  loading?: boolean
}

const PdfModal: React.FC<Props> = props => {
    const { visible, record, stationId } = props;
    const theme = getSystemTheme()

    useEffect(() => {
      props.action('reset')
      props.action('fetchFeeResult', { recordId: record.id, stationId: stationId })
    }, [])

    let exportPdf = () => {
      window.open('/api/report-management?format=pdf&reportName=report_electricity_bill' +
        `&recordId=${record.id}&stationId=${stationId}&access-token=${sessionStorage.getItem('token')}&language=${localStorage.getItem('language') || 'zh'}`)
    }

    return (
        <Modal
          width={950}
          maskClosable={true}
          visible={visible}
          onCancel={() => props.cancel()}
          footer={false}
          wrapClassName={'pdfModal'}
          closeIcon={<img src={theme === 'light-theme' ? require('../../static/img/close-firm.svg') : require('../../static/img/black-close-firm.svg')} />}
        >
          <div className="pdf-body" dangerouslySetInnerHTML={{ __html: props.html }} style={{ overflow: 'auto' }}></div>
          <div className="pdf-menu">
            <Button style={{}} onClick={props.cancel} type="default">
              {utils.intl('关闭')}
            </Button>
            <Button style={{ marginLeft: 16, marginBottom: 24 }} onClick={exportPdf} type="primary">
              {utils.intl('导出PDF')}
            </Button>
          </div>
          {props.loading && <FullLoading />}
        </Modal >
    );
};

function mapStateToProps(model, getLoading) {
  return {
    ...model,
    loading: getLoading('fetchFeeResult')
  }
}

export default makeConnect(fee_query_fee_result, mapStateToProps)(PdfModal)
