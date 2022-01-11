import React from 'react'
import { Button, Row, Col, Select, DatePicker, Table2 } from 'wanke-gui'
import Page from '../../../../components/Page'
import { makeConnect } from '../../../umi.helper'
import MakeConnectProps from '../../../../interfaces/MakeConnectProps'
import { investigationDetailModal } from './model'
import PageProps from '../../../../interfaces/PageProps'
import FullContainer from '../../../../components/layout/FullContainer'
import styles from './index.less'
import moment from 'moment';
import Tools from '../../../../components/layout/Tools'
import Export from '../../../../components/layout/Export'
import Columns from '../component/detialColums';
import { disabledDateAfterToday } from '../../../../util/dateUtil'
import { CrumbsPortal } from '../../../../frameset/Crumbs'
import utils from '../../../../public/js/utils'

interface Props extends MakeConnectProps<investigationDetailModal>, investigationDetailModal, PageProps {
    loading: boolean;
    list: any[];
    pageName: string;
    date: string;
    detail: any;
    energyList: any[];
    energyValue: string;
    powerUnitValue: string;
    crews: any[];
    query: any;
    record: any;
    energyUnitValue: string;
}

class InvestigationDetail extends React.Component<Props> {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const { record, dispatch, energyUnitValue } = this.props;
        dispatch({
            type: 'investigationDetail/updateState',
            payload: { date: record.date, energyValue: energyUnitValue }
        }).then(res => {
            this.props.action('getCrews');
            this.props.action('getEnergyUnits');
            this.props.action('getList');
        });
    }

    componentWillUnmount() {
        this.props.action('reset');
    }

    pageChange = (page, size) => {
        const { dispatch } = this.props;
        dispatch({ type: 'investigationDetail/pageChange', payload: { page, size } });
    };

    onDateChange = (data, dataString) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'investigationDetail/updateState',
            payload: { date: dataString }
        });
    };
    changePowerUnit = (value) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'investigationDetail/updateState',
            payload: { powerUnitValue: value }
        });
    };
    changeEnergy = (value) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'investigationDetail/updateState',
            payload: { energyValue: value }
        });
    };
    render() {
        const { list, loading, query, total, pageName, date, energyList, energyValue, powerUnitValue, crews, detail, pageId } = this.props
        return (
            <Page pageId={pageId} pageTitle='储能参与情况明细' className={styles["agcCncyqkcx"] + " e-p10"} showStation={false}>
                <CrumbsPortal pageName='detailData'>
                    <Button style={{ marginLeft: 16 }} onClick={() => this.props.action('onExport')} type="primary">
                        {utils.intl('导出')}
                    </Button>
                </CrumbsPortal>
                <FullContainer>
                    <Row className="e-mt10">
                        <Col span={20} style={{ minWidth: '330px' }}>
                            <div style={{ position: 'relative', float: 'left' }}>
                                <span>{utils.intl('日期')}：</span>
                                <DatePicker
                                    value={moment(date)}
                                    onChange={this.onDateChange}
                                    allowClear={false}
                                    disabledDate={disabledDateAfterToday}
                                />
                            </div>
                            <div style={{ position: 'relative', float: 'left' }} className='e-ml10'>
                                <Select value={energyValue} onChange={this.changeEnergy} dataSource={energyList}
                                    label={utils.intl('能量单元') + "："} style={{ minWidth: '163px' }} />
                            </div>
                            <div style={{ position: 'relative', float: 'left' }} className='e-ml10'>
                                <Select value={powerUnitValue} onChange={this.changePowerUnit} dataSource={crews}
                                    label={utils.intl('机组名称') + "："} style={{ minWidth: '163px' }} />
                            </div>
                            <Button className='e-ml10' type="primary" onClick={() => this.props.action('getList')}>{utils.intl('查询')}</Button>
                        </Col>
                        <Col span={4} className="f-tar">
                        </Col>
                    </Row>
                    <div className="flex1 f-pr e-mt10">
                        <Table2 dataSource={list} columns={Columns} loading={loading}
                            rowKey="id"
                            page={query.page}
                            size={query.size}
                            total={total}
                            onPageChange={(page, size) => this.pageChange(page, size)}
                        />
                    </div>
                </FullContainer>
            </Page>
        )
    }
}

function mapStateToProps(model, getLoading) {
    return {
        ...model,
        loading: getLoading('getList'),
    }
}

export default makeConnect('investigationDetail', mapStateToProps)(InvestigationDetail)
