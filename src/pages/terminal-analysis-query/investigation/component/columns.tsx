import React from 'react'
import { ExportColumn } from '../../../../interfaces/CommonInterface'
import Forward from "../../../../public/components/Forward/index";
export default [
    {
        title: '序号',
        dataIndex: 'num',
        key: 'xh',
        width: '65px',
        render: (value, record) => {
            return (
                <span>
                    {value}
                </span>
            );
        }
    },
    {
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        width: '9%',
        render: (value, record) => {
            return (
                <Forward to="detailData" data={{ record: record }}>
                    {value}
                </Forward>
            );
        }
    },
    {
        title: '参与次数',
        dataIndex: 'times',
        key: 'times',
        width: '7%',
        render: (value, record) => {
            return (
                <span>
                    {value}
                </span>
            );
        }
    },
    {
        title: '参与充电次数',
        dataIndex: 'chargeTimes',
        key: 'chargeTimes',
        width: '12%',
        render: (value, record) => {
            return (
                <span>
                    {value}
                </span>
            );
        }
    },
    {
        title: '参与充电量(kWh)',
        dataIndex: 'charge',
        key: 'charge',
        width: '13%',
        render: (value, record) => {
            return (
                <span>
                    {value}
                </span>
            );
        }
    },
    {
        title: '充电SOC里程',
        dataIndex: 'chargeSOC',
        key: 'chargeSOC',
        width: '14%',
        render: (value, record) => {
            return (
                <span>
                    {value}
                </span>
            );
        }
    },
    {
        title: '参与放电次数',
        dataIndex: 'dischargeTimes',
        key: 'dischargeTimes',
        width: '12%',
        render: (value, record) => {
            return (
                <span>
                    {value}
                </span>
            );
        }
    },
    {
        title: '参与放电量(kWh)',
        dataIndex: 'discharge',
        key: 'discharge',
        width: '13%',
        render: (value, record) => {
            return (
                <span>
                    {value}
                </span>
            );
        }
    },
    {
        title: '放电SOC里程',
        dataIndex: 'dischargeSOC',
        key: 'dischargeSOC',
        width: '14%',
        render: (value, record) => {
            return (
                <span>
                    {value}
                </span>
            );
        }
    }
];

export const current_exception_columns: ExportColumn[] = [
    {
        title: '序号',
        dataIndex: 'num',
    },
    {
        title: '日期',
        dataIndex: 'date',
    },
    {
        title: '参与次数',
        dataIndex: 'times',
    },
    {
        title: '参与充电次数',
        dataIndex: 'chargeTimes',
    },
    {
        title: '参与充电量(kWh)',
        dataIndex: 'charge',
    },
    {
        title: '充电SOC里程',
        dataIndex: 'chargeSOC',
    },
    {
        title: '参与放电次数',
        dataIndex: 'dischargeTimes',
    },
    {
        title: '参与放电量(kWh)',
        dataIndex: 'discharge',

    },
    {
        title: '放电SOC里程',
        dataIndex: 'dischargeSOC',
    }
]
