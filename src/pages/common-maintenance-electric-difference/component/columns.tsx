import React from 'react';
import ListItemDelete from "../../../components/ListItemDelete/index"
import AbsoluteBubble from '../../../components/AbsoluteBubble'
import utils from '../../../public/js/utils';

export default function () {
    const showBjgd = (record) => {
        const { dispatch } = this.props;
        dispatch({
            //需要调用对于namespace下effects中的该函数
            type: 'electricDifference/updateState',
            payload: { record: record, runModal: true, type: 'edit', id: record.id }
        })
    };
    const deleteRecord = (e) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'electricDifference/deleteList',
            payload: {
                id: e,
            },
        });
    };
    return [
        {
            title: utils.intl('序号'), dataIndex: 'num', key: 'number', width: '80px'
        },
        {
            title: utils.intl('原因标题'), dataIndex: 'causeTitle', key: 'causeTitle', width: '15%', render: (value) => <AbsoluteBubble>{value}</AbsoluteBubble>
        },
        {
            title: utils.intl('详情'), dataIndex: 'detail', key: 'detail', render: (value) => <AbsoluteBubble>{value}</AbsoluteBubble>
        },
        {
            title: utils.intl('解决方案'), dataIndex: 'solution', key: 'solution', width: '20%', render: (value) => <AbsoluteBubble>{value}</AbsoluteBubble>
        },
        {
            title: utils.intl('计划完成时间'),
            dataIndex: 'planCompleteTime',
            key: 'planCompleteTime',
            width: '10%',
            render: (text, record, index) => {
                if (text) {
                    return text.split(' ')[0]
                } else {
                    return text
                }
            }
        },
        {
            title: utils.intl('责任部门'), dataIndex: 'dutyDept', key: 'dutyDept', width: '7%'
        },
        {
            title: utils.intl('责任人'), dataIndex: 'dutyUserTitle', key: 'dutyUserTitle', width: '7%'
        },
        {
            title: utils.intl('操作'),
            dataIndex: 'action',
            key: 'action',
            align: 'right',
            width: '10%',
            render: (text, record, index) => {
                const actionList = Array.isArray(text) ? text : (text?.split(' ') || [])
                return (
                    <div className='editable-row-operations'>
                        {
                            actionList.map(v => {
                                if (v === 'edit') {
                                    return (
                                        <a onClick={showBjgd.bind(this, record)}><span>{utils.intl('编辑')}</span></a>
                                    )
                                } else if (v === 'del') {
                                    return (
                                        <ListItemDelete onConfirm={deleteRecord.bind(this, record.id)}>
                                            <a style={{ marginLeft: '8px' }}>{utils.intl('删除')}</a>
                                        </ListItemDelete>
                                    )
                                }
                            })
                        }
                    </div>
                )
            }
        }
    ];
}
