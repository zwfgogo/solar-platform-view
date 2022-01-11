import React from 'react'
import { Tabs } from 'wanke-gui'
import Page from '../../../components/Page'
import { makeConnect } from '../../umi.helper'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { fmPerformanceModal } from './model'
import PageProps from '../../../interfaces/PageProps'
import FullContainer from '../../../components/layout/FullContainer'
import TotalFM from './total-FM/index'
import DayDetail from './dayDetail/index'
import HourDetail from './hourDetail/index'
import OnceDetail from './onceDetail/index'

const { TabPane } = Tabs

interface Props extends MakeConnectProps<fmPerformanceModal>, fmPerformanceModal, PageProps {
    selectedStationId: any;
}

class FmPerformance extends React.Component<Props> {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.props.action('getCrews')
    }

    componentWillUnmount() {
        this.props.action('reset')
    }
    componentDidUpdate() {
        const { stationId, selectedStationId } = this.props;
        if (selectedStationId !== stationId) {
            this.props.action('getCrews')
        }
    }

    onChange = (e) => {
        this.props.updateState({ TabNum: e })
    }
    render() {
        const { TabNum, typeTabArr, pageId } = this.props
        return (
            <Page pageId={pageId} showStation={true}>
                <FullContainer>
                    {/* <Row className="e-mt10 e-pl10">
                        <Col span={22} className="f-tal">
                            <Input.Search placeholder={'请输入关键字'}
                                          onChange={(e) => this.searchChange('queryStr', e.target.value)}
                                          onPressEnter={this.search}
                                          onSearch={this.search}
                                          style={{width: '400px'}}
                            />
                        </Col>
                        <Col span={2} className="f-tar">
                            <Button type="primary" onClick={this.onExport}>{'导出'}</Button>
                        </Col>
                    </Row>
                    <div className="flex-grow e-pt10 f-pr">
                        <Table2 dataSource={list} columns={columns} loading={loading}
                               rowKey="id"
                               rowSelection={rowSelection}
                               page={query.page}
                               size={query.size}
                               total={total}
                               onPageChange={(page, size) => this.pageChange(page, size)}
                        />
                    </div>
                    {explainModal ? <ExplainModal/> : ''}
                    {levelModal ? <LevelModal/> : ''} */}
                    <Tabs onChange={this.onChange} activeKey={TabNum}>
                        {
                            typeTabArr.map((item, index) => (
                                <TabPane tab={item.title} key={item.id}>
                                </TabPane>
                            ))
                        }
                    </Tabs>
                    <div className="flex1">
                        {(() => {
                            switch (TabNum) {
                                case '1':
                                    return (<TotalFM />)
                                    break;
                                case '2':
                                    return (<DayDetail />)
                                    break;
                                case '3':
                                    return (<HourDetail />)
                                    break;
                                case '4':
                                    return (<OnceDetail />)
                                    break;
                                    defalut:
                                    break;
                            }
                        })()}
                    </div>
                </FullContainer>
            </Page>
        )
    }
}

function mapStateToProps(model, getLoading, state) {
    return {
        ...model,
        loading: getLoading('getList'),
        selectedStationId: state.global.selectedStationId
    }
}

export default makeConnect('fmPerformance', mapStateToProps)(FmPerformance)
