import React, { useState, useEffect, useMemo } from "react";
import styles from "./index.less";
import Page from "../../../components/Page";
import classnames from 'classnames';
import { Progress, Select, message, Input, Row, Col, Button, InputNumber, FullLoading } from 'wanke-gui'
import Card from "../../../components/Card/index";
import { makeConnect } from "../../umi.helper"
import { WankeBatteryHealthOutlined } from "wanke-icon";
import utils from "../../../public/js/utils";

const { Search } = Input;
interface Props {
    dispatch: any;
    pageId: any;
    action: any;
    selectValue: string;
    selectArr: string[];
    deviceArr: any[];
    min: number;
    max: number;
    scoreArr: any[];
    scoreValue: string;
    queryStr: string;
    getSingelHealthSuccess: boolean;
    getHealthSuccess: boolean;
    getHealthLoading: boolean;
}

const Index: React.FC<Props> = props => {
    const {
        dispatch,
        pageId,
        selectValue,
        selectArr,
        deviceArr,
        min,
        max,
        scoreArr,
        scoreValue,
        queryStr,
        getSingelHealthSuccess,
        getHealthSuccess,
        getHealthLoading
    } = props;

    useEffect(() => {
        props.action('getSelect').then(res => {
            props.action('getHealth')
        })
        return () => {
            props.action('reset')
        }
    }, []);

    useEffect(() => {
        if (getSingelHealthSuccess) {
            props.action('updateToView', { max: '', min: '' })
        }
    }, [getSingelHealthSuccess]);

    useEffect(() => {
        if (getHealthSuccess) {
            props.action('updateToView', { queryStr: '' })
        }
    }, [getHealthSuccess]);

    const selectChange = (o) => {
        props.action('updateToView', { selectValue: o })
    }

    const sortChange = (o) => {
        props.action('updateToView', { scoreValue: o })
    }

    let batteryDom = deviceArr.map((item, index) => {
        let strokeColor = '#3dd598';
        if (item.healthScore < 50) {
            strokeColor = '#ff4d4d';
        } else if (item.healthScore >= 50 && item.healthScore < 80) {
            strokeColor = '#ffa200';
        } else if (item.healthScore >= 80) {
            strokeColor = '#3dd598';
        }
        return (
            <div className={styles["bottomContent"] + ' e-p10 f-df'} style={{ textAlign: 'center' }}>
                <div style={{ width: '100%', height: '100%', padding: '5px' }}>
                    <Progress type="circle" percent={item.healthScore} strokeColor={strokeColor} format={() => <WankeBatteryHealthOutlined style={{ color: strokeColor }} />} />
                </div>
                <div style={{ paddingLeft: '5px', width: '100%', height: '100%', color: '#000', textAlign: 'left' }}>
                    <p className={styles["score"]} style={{ fontSize: '20px', fontFamily: 'PingFang SC', marginTop: '3px' }}>{item.healthScore}<span style={{ fontSize: '14px' }}>{utils.intl('分')}</span></p>
                    <p className={styles["devTitle"]} style={{ paddingTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.deviceTitle}>{item.deviceTitle}</p>
                </div>
            </div>
        )
    })

    //搜索框的值改变
    const searchChange = (type, data) => {
        // const { dispatch } = this.props
        props.action('updateToView', { [type]: data })
    }

    const search = () => {
        if (queryStr) {
            props.action('getSingelHealth')
        } else {
            message.warning(utils.intl('请输入需要搜索的电芯名称'));
        }
    }

    const onQuery = () => {
        if (min > max) {
            message.warning(utils.intl('分数范围的最大值应大于等于最小值'));
        } else {
            props.action('getHealth')
        }
        // const { query } = this.props
        // this.pageChange(1, query.size)
    }

    const numberChange = (o, name) => {
        props.action('updateToView', { [name]: o })
    }

    const itemHeight = 95
    const itemLength = 56
    // 是否开启虚拟滚动
    const enableVirtualScroll = true

    const [offset, setOffset] = useState(0)
    const [scroll, setScroll] = useState(0)
    const options = useMemo(() => {
        return deviceArr.length ? deviceArr.slice(offset, offset + itemLength) : []
    }, [offset, deviceArr])
    let i = 0;
    let j = 0;

    return (
        <Page pageTitle={utils.intl('电芯健康评分详情')} pageId={pageId} className={classnames("bf-br5 page-bg1 e-mt5", styles.page)} showStation={false}>
            <div className="f-df flex-column batteryScore" style={{ height: '100%' }}>
                <Card
                    title={utils.intl('电芯健康评分详情')}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                >
                    <div className="f-df flex-column batteryScore" style={{ height: '100%' }}>
                        <Row className="e-p10">
                            <Col span={24} style={{ minWidth: '500px' }}>
                                <div className='e-mr20' style={{ float: 'left' }}>
                                    <Select value={selectValue} onChange={selectChange} dataSource={selectArr}
                                        label={''} style={{ minWidth: '163px' }} />
                                </div>
                                <div className='e-mr20' style={{ float: 'left' }}>
                                    <Input.Group compact>
                                        <span style={{ lineHeight: '32px' }}>{utils.intl('分数') + '：'}</span>
                                        <InputNumber onChange={e => numberChange(e, 'min')} type="number" style={{ width: 50, textAlign: 'center' }} value={min} placeholder="" />
                                        <Input
                                            className={styles["site-input-split"]}
                                            style={{
                                                width: 40,
                                                pointerEvents: 'none',
                                                border: 0,
                                                textAlign: 'center',
                                                margin: '1px 3px'
                                            }}
                                            placeholder="~"
                                            disabled
                                        />
                                        <InputNumber
                                            className="site-input-right"
                                            style={{
                                                width: 50,
                                                textAlign: 'center',
                                            }}
                                            type="number"
                                            placeholder=""
                                            value={max}
                                            onChange={e => numberChange(e, 'max')}
                                        />
                                    </Input.Group>
                                </div>
                                <div className='e-mr20' style={{ float: 'left' }}>
                                    <Select value={scoreValue} onChange={sortChange} dataSource={scoreArr}
                                        label={utils.intl('排序') + '：'} style={{ minWidth: '163px' }} />
                                </div>
                                <Button type="primary" onClick={onQuery}>{utils.intl('查询')}</Button>
                                <div style={{ width: '150px', float: 'right' }}>
                                    <Search
                                        placeholder={utils.intl('查找电芯')}
                                        value={queryStr}
                                        onChange={(e) => searchChange('queryStr', e.target.value)}
                                        onSearch={search}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <div className={styles["problemCell"]}>
                            {getHealthLoading && <FullLoading />}
                            <div
                                onScroll={event => {
                                    if (!enableVirtualScroll) {
                                        return
                                    }
                                    var { scrollTop } = event.target
                                    setScroll(scrollTop)
                                    setOffset(~~(scrollTop / itemHeight) * 8)
                                }}
                                style={{
                                    height: `${options.length >= itemLength ? itemLength * itemHeight / 8 : 694}px`,
                                    overflowY: 'scroll',
                                }}>
                                <div style={{ height: `${deviceArr.length * itemHeight / 8}px`, position: 'relative', listStyleType: 'none', margin: '0px' }}>
                                    {options.map((item, index) => {
                                        let strokeColor = '#3dd598';
                                        if (item.healthScore < 50) {
                                            strokeColor = '#ff4d4d';
                                        } else if (item.healthScore >= 50 && item.healthScore < 80) {
                                            strokeColor = '#ffa200';
                                        } else if (item.healthScore >= 80) {
                                            strokeColor = '#3dd598';
                                        }
                                        if (index % 8 !== 0) {
                                            j++
                                        }
                                        if (index !== 0 && index % 8 === 0) {
                                            i++;
                                            j = 0;
                                        }
                                        if (item.deviceTitle === 'hide') {
                                            return (
                                                <div className={styles["bottomContent"] + ' e-p10 f-df'} style={enableVirtualScroll ? { position: 'absolute', top: `${i * itemHeight + scroll}px`, left: `${index === 0 ? (j - 1) : j * 205}px`, background: 'transparent' } : {}} key={index}>
                                                </div>
                                            )
                                        } else {
                                            return (
                                                <div className={styles["bottomContent"] + ' e-p10 f-df'} style={enableVirtualScroll ? { position: 'absolute', top: `${i * itemHeight + scroll}px`, left: `${index === 0 ? (j - 1) : j * 205}px` } : {}} key={index}>
                                                    <div style={{ width: '100%', height: '100%', padding: '5px' }}>
                                                        <Progress type="circle" percent={item.healthScore} strokeColor={strokeColor} format={() => <WankeBatteryHealthOutlined style={{ color: strokeColor }} />} />
                                                    </div>
                                                    <div style={{ paddingLeft: '5px', width: '100%', height: '100%', color: '#000', textAlign: 'left' }}>
                                                        <p className={styles["score"]} style={{ fontSize: '20px', fontFamily: 'PingFang SC', marginTop: '3px' }}>{item.healthScore}<span style={{ fontSize: '14px' }}>{utils.intl('分')}</span></p>
                                                        <p className={styles["devTitle"]} style={{ paddingTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.deviceTitle}>{item.deviceTitle}</p>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </Page >
    );
};

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
    return {
        ...state.batteryScore,
        getSingelHealthSuccess: isSuccess('getSingelHealth'),
        getHealthSuccess: isSuccess('getHealth'),
        getHealthLoading: getLoading('getHealth'),
    }
}

export default makeConnect('batteryScore', mapStateToProps)(Index)