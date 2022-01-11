import React, { useState, useEffect, useCallback, useRef } from 'react';
import Page from '../../../components/Page';
import { Row, Col, Button, Input, Tag, Pagination } from 'wanke-gui';
import PageProps from '../../../interfaces/PageProps';
import { makeConnect } from '../../../pages/umi.helper';
import MakeConnectProps from '../../../interfaces/MakeConnectProps';
import LeftTree from '../components/LeftTree';
import { RoomDetail } from './model';
import { r_d_q, Tree_Type } from '../../../pages/constants';
import FullLoading from '../../../components/FullLoading';
import Footer from '../../../public/components/Footer';
import utils from '../../../public/js/utils';
import { copy, getQueryString } from '../../../util/utils';
import SocketHelper from '../../socket.helper'
import { Socket_Port } from '../../../pages/constants'
import { CrumbsPortal } from '../../../frameset/Crumbs';
import { WankeMenuFoldOutlined, ZdDragOutlined, WankeBattery2Outlined, WankeBatteryUnitOutlined } from 'wanke-icon';
import "./index.less"
import { traverseTree } from '../../page.helper';
import { identity } from '../../common-basic-station/station.helper';
import Forward from '../../../public/components/Forward';

const { CheckableTag } = Tag;

interface Props extends PageProps, MakeConnectProps<RoomDetail>, RoomDetail {
    treeLoading: boolean;
    listLoading: boolean;
    listSuccess: boolean;
    selectedStationId: number,
    stationList: any[]
    total: any;
    query: any;
    _selectedEnergyUnitId: any;
    _selectType: any;
}

const DataQuery: React.FC<Props> = function (this: null, props) {
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [checkedKeys, setCheckedKeys] = useState([]);
    const [leftTreeWidth, setLeftTreeWidth] = useState(250);
    const [treeType, setTreeType] = useState('');
    const [cellId, setCellId] = useState(null);

    const stationId = props.selectedStationId;
    let treeList: any = copy(props.treeList);

    useEffect(() => {
        props.action('reset');
        props.action('fetchDeviceTree', { stationId });
    }, [props.selectedStationId])

    useEffect(() => {
        if (getSelectItem(treeList, selectedKeys[0])?.id) {
            props.updateQuery({
                page: 1,
                size: 120
            })
            getList();
        } else {
            props.action('getHealth', { deviceId: cellId });
        }
        setTreeType(getSelectItem(treeList, selectedKeys[0])?.type)
    }, [selectedKeys])

    useEffect(() => {
        if (treeList.length) {
            let item = traverseTree(treeList, item => item.id == props.selectedStationId ? item : null)
            if (item) {
                setSelectedKeys([identity(item)])
            }
        }
        // if (props._selectedEnergyUnitId) {
        //     let item = traverseTree(treeList, item => item.id == props._selectedEnergyUnitId ? item : null)
        //     if (item) {
        //         setSelectedKeys([identity(item)])
        //     }
        // }
    }, [props.treeList])

    useEffect(() => {
        if (selectedKeys.length) {
            props.updateQuery({
                page: 1,
                size: 120
            })
            getList();
        }
    }, [props.selectedTags, props.scoreTags, props.sortTags])

    useEffect(() => {
        if (props._selectType) {
            let nextSelectedTags = [];
            nextSelectedTags.push(props._selectType)
            props.updateState({
                selectedTags: nextSelectedTags
            })
        }
    }, [props._selectType])

    const getSelectItem = (treeList, key) => {
        return traverseTree(treeList, item => identity(item) == key ? item : null)
    }

    const getList = () => {
        let type = getSelectItem(treeList, selectedKeys[0])?.type
        if (type === 'Station') {
            props.action('getHealth', { stationId: getSelectItem(treeList, selectedKeys[0])?.id });
        } else if (type === 'EnergyUnit') {
            props.action('getHealth', { energyUnitId: getSelectItem(treeList, selectedKeys[0])?.id });
        } else {
            props.action('getHealth', { deviceId: getSelectItem(treeList, selectedKeys[0])?.id });
        }
    }

    const handleChange = (tag, checked) => {
        const { selectedTags } = props;
        const nextSelectedTags = checked ? [...selectedTags, tag] : selectedTags.filter(t => t !== tag);
        props.updateState({
            selectedTags: nextSelectedTags
        })
    }

    const scoreHandleChange = (tag, checked) => {
        const { scoreTags } = props;
        const nextSelectedTags = checked ? [...scoreTags, tag] : scoreTags.filter(t => t !== tag);
        props.updateState({
            scoreTags: nextSelectedTags
        })
    }

    const sortHandleChange = (tag, checked) => {
        const { sortTags } = props;
        let sortArr = []
        if (checked) {
            sortArr.push(tag)
        }
        const nextSelectedTags = checked ? sortArr : sortTags.filter(t => t !== tag);
        props.updateState({
            sortTags: nextSelectedTags
        })
    }
    const onChange = (page, size) => {
        props.updateQuery({
            page,
            size
        })
        getList();
    }

    return (
        <Page
            showStation
            pageId={props.pageId}
            className={'battery-detail'}
            style={{ display: 'flex', background: "transparent", boxShadow: "none" }}
        >
            <div className="left page-sub-left" style={{ flexShrink: 0, width: leftTreeWidth }}>
                <div className="flex1 f-oa e-pt20 e-pl20 e-pr20 horizontal-scroll-tree" style={{ position: 'relative' }}>
                    {
                        props.treeLoading && (<FullLoading />)
                    }
                    <LeftTree
                        setSelectedKeys={setSelectedKeys}
                        setCheckedKeys={setCheckedKeys}
                        setCellId={setCellId}
                        treeList={treeList}
                        selectedKeys={selectedKeys}
                        checkedKeys={checkedKeys}
                        editable={false}
                        action={props.action}
                    />
                </div>
            </div>
            <div className="right page-no-padding" style={{ overflow: 'hidden' }}>
                {props.listLoading && <FullLoading />}
                {treeType !== undefined &&
                    <div className="right-top" style={{}}>
                        <div className="right-top-top" style={{ height: 41 }}>
                            <span style={{ lineHeight: '30px' }}>{utils.intl('已选择条件')}：
                                {props.selectedTags.map(tag => (
                                    <Tag>{utils.intl(props.batteryLevel.find(item => item.value === tag).name)}</Tag>
                                ))}
                                {props.scoreTags.map(tag => (
                                    <Tag>{utils.intl(tag.name)}</Tag>
                                ))}
                                {props.sortTags.map(tag => (
                                    <Tag>{utils.intl(tag.name)}</Tag>
                                ))}
                            </span>
                        </div>
                        <div className="right-top-bottom" style={{}}>
                            {(treeType !== 'BatteryCluster' && treeType !== undefined) &&
                                <span className="flex1" style={{ lineHeight: '43px' }}>
                                    <span className="checkLabel">{utils.intl('电池层级')}：<span className="checkBoxDiv">{utils.intl('多选')}</span>
                                        {props.selectedValueTags.map(tag => (
                                            <CheckableTag
                                                key={tag}
                                                checked={props.selectedTags.indexOf(tag) > -1}
                                                onChange={checked => handleChange(tag, checked)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {props.batteryLevel.find(item => item.value === tag).name}
                                            </CheckableTag>
                                        ))}
                                    </span>
                                </span>
                            }
                            <span className="flex1" style={{ lineHeight: '43px' }}>
                                <span className="checkLabel">{utils.intl('电池分数')}：<span className="checkBoxDiv">{utils.intl('多选')}</span>
                                    {props.scoreLevel.map(tag => (
                                        <CheckableTag
                                            key={tag}
                                            checked={props.scoreTags.indexOf(tag) > -1}
                                            onChange={checked => scoreHandleChange(tag, checked)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {tag.name}
                                        </CheckableTag>
                                    ))}
                                </span>
                            </span>
                            <span className="flex1" style={{ lineHeight: '43px' }}>
                                <span className="checkLabel">{utils.intl('默认排序')}：<span className="checkBoxDiv">{utils.intl('单选')}</span>
                                    {props.sortLevel.map(tag => (
                                        <CheckableTag
                                            key={tag}
                                            checked={props.sortTags.indexOf(tag) > -1}
                                            onChange={checked => sortHandleChange(tag, checked)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {tag.name}
                                        </CheckableTag>
                                    ))}
                                </span>
                            </span>
                        </div>
                    </div>
                }
                <div className="right-bottom" style={{ overflow: 'hidden', height: '100%', marginTop: treeType === undefined ? 0 : '8px' }}>
                    <div className="right-bottom-top">
                        {
                            props.batteryList.map((o, i) => {
                                return (
                                    <Forward to="problemBattery" data={{
                                        _deviceId: o.deviceId, _type: o.type,
                                        _healthScore: o.healthScore, _deviceTitle: o.deviceTitle,
                                        // _productionTime: energyUnitList.find((o, i) => o.id === selectedEnergyUnitId)?.productionTime
                                    }}>
                                        <div className="singleDiv" >
                                            <span style={{}}>
                                                {o.type === 'BatteryUnit' ?
                                                    <WankeBatteryUnitOutlined style={{
                                                        fontSize: '30px', color: '#fff',
                                                        marginLeft: '22px', marginRight: '22px',
                                                        position: 'relative', float: 'left',
                                                        top: 2
                                                    }} />
                                                    :
                                                    <WankeBattery2Outlined style={{
                                                        fontSize: '30px', color: '#fff',
                                                        marginLeft: '22px', marginRight: '22px',
                                                        position: 'relative', float: 'left',
                                                        top: 2
                                                    }} />
                                                }
                                                <span className="singleDivTitle" style={{ float: 'left' }} title={o.deviceTitle}>
                                                    {o.deviceTitle}
                                                </span>
                                                <span style={{ float: 'right', marginRight: 16 }}>
                                                    {o.healthScore}{utils.intl('分')}
                                                </span>
                                            </span>

                                        </div>
                                    </Forward>

                                )
                            })
                        }
                    </div>
                    <div className="right-bottom-bottom">
                        <Pagination
                            size="small"
                            total={props.total}
                            showSizeChanger={false}
                            showTotal={total => `共 ${total} 条`}
                            current={props.query.page}
                            pageSize={props.query.size}
                            onChange={onChange}
                        />
                    </div>
                </div>
            </div>
        </Page>
    )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
    return {
        ...model,
        selectedStationId: state.global.selectedStationId,
        stationList: state.global.stationList,
        treeLoading: getLoading('fetchDeviceTree'),
        listLoading: getLoading('getHealth'),
        listSuccess: isSuccess('fetchPointDataType'),
    }
}

export default makeConnect('roomDetail', mapStateToProps)(DataQuery)