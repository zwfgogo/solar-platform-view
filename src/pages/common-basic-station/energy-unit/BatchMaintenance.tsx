import React, { useEffect, useState } from 'react'
import { ActionProp } from '../../../interfaces/MakeConnectProps'
import FullContainer from '../../../components/layout/FullContainer'
import { FullLoading, message, Table1 } from "wanke-gui"
import utils from '../../../public/js/utils'
import { makeConnect } from '../../umi.helper'
import Forward from '../../../public/components/Forward'
import AcquisitionModal from './AcquisitionModal'
import { getTreeItemList, extractByKey } from '../../page.helper'
import AbsoluteBubble from '../../../components/AbsoluteBubble'

// 设备信息页签
interface Props extends ActionProp {
    listLoading: boolean
    list: any;
    query: any;
    total: any;
    editAuthority: any
    deviceId: any
    forward: any
    back: any
    detail: any
    stationId: any
    bindCollectDevices: any
    resTree: any
    getCollectDevicesByDevicesLoading: any
    dispatch: any
    allCollectDevices: any
    postCollectDevicesSuccess: any
    theme: any
}

const BatchMaintenance: React.FC<Props> = function (this: null, props) {
    const [acquisitionModal, setAcquisitionModal] = useState(false)
    const [acquisitionDetail, setAcquisitionDetail] = useState({})
    const [ids, setIds] = useState('')


    useEffect(() => {
        if (props.list?.children?.length) {
            setIds(getTreeItemList(props.list?.children, [], 'id').join(','))
            props.action('getTreeTable', { deviceId: getTreeItemList(props.list?.children, [], 'id').join(','), treeTable: props.list?.children })
        }
    }, [props.list?.children])

    useEffect(() => {

    }, [])

    useEffect(() => {
        if (props.postCollectDevicesSuccess) {
            message.success(utils.intl('更新成功'))
            setAcquisitionModal(false)
            props.action('getTreeTable', { deviceId: getTreeItemList(props.list?.children, [], 'id').join(','), treeTable: props.list?.children })
        }
    }, [props.postCollectDevicesSuccess])

    const columns: any = [
        {
            title: utils.intl(''), dataIndex: '', width: 80, align: 'center'
        },
        {
            title: utils.intl('设备名称'), dataIndex: 'title', width: 150
        },
        {
            title: utils.intl('设备SN'), dataIndex: 'name'
        },
        {
            title: utils.intl('采集设备对象'),
            dataIndex: 'title',
            render: (text, record, index) => {

                return (
                    <AbsoluteBubble>
                        <span style={{ color: '#096dd9', cursor: 'pointer' }} onClick={() => {
                            props.action('getCollectDevicesByDevices', { id: record.id })
                            setAcquisitionModal(true); setAcquisitionDetail(record)
                        }}>
                            {extractByKey(record.titleList || [], 'name') || utils.intl('编辑')}
                        </span>
                    </AbsoluteBubble>

                )
            }
        },
        {
            title: utils.intl('采集信号数量'),
            dataIndex: 'signalsNum',
            render: (text, record, index) => {
                return (
                    <Forward to="dataPoint"
                        data={{
                            editable: props.editAuthority,
                            action: props.action,
                            deviceId: record.id,
                            forward: props.forward,
                            back: props.back,
                            detail: record,
                            stationId: props.stationId,
                            deviceType: record.typeId
                        }}
                        title={'数据采集配置'}
                    >
                        {text}
                    </Forward>
                )
            }
        },
    ]

    return (
        <FullContainer>
            {acquisitionModal && !props.getCollectDevicesByDevicesLoading ?
                <AcquisitionModal
                    cancel={() => { setAcquisitionModal(false); setAcquisitionDetail({}) }}
                    visible={acquisitionModal}
                    detail={acquisitionDetail}
                    bindCollectDevices={extractByKey(props.bindCollectDevices || [], 'id', 'Array')}
                    action={props.action}
                    stationId={props.stationId}
                    allCollectDevices={props.allCollectDevices}
                    dispatch={props.dispatch}
                    theme={props.theme}
                /> : ''}
            <div className="flex1">
                {props.listLoading && <FullLoading />}
                {!props.listLoading ?
                    <Table1
                        dataSource={props.resTree}
                        columns={columns}
                    />
                    : ''}
            </div>
        </FullContainer>
    )
}

function mapStateToProps(modal, { getLoading, isSuccess }, state) {
    return {
        ...modal,
        theme: state.global.theme,
        listLoading: getLoading('getTreeTable'),
        getCollectDevicesByDevicesSuccess: isSuccess('getCollectDevicesByDevices'),
        getCollectDevicesByDevicesLoading: getLoading('getCollectDevicesByDevices')
    }
}

export default makeConnect('batchMaintenance', mapStateToProps)(BatchMaintenance)