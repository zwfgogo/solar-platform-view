import React from 'react';
import { ExportColumn } from '../../../../interfaces/CommonInterface'

export default [
    {
        title: '编号', dataIndex: 'num', key: 'num', width: '65px',
        render: (value, record) => {
            return (
                <span>
                    {value}
                </span>
            );
        }
    },
    {
        title: '开始时间', dataIndex: 'startTime', key: 'startTime', width: '8%',
        render: (value, record) => {
            return (
                <span>
                    {value}
                </span>
            );
        }
    },
    {
        title: '结束时间', dataIndex: 'endTime', key: 'endTime', width: '8%',
        render: (value, record) => {
            return (
                <span>
                    {value}
                </span>
            );
        }
    },
    {
        title: '参与储能', dataIndex: 'energyStorageUnits', key: 'energyStorageUnits', width: '28%',
        render: (value, record) => {
            return (
                <span>
                    {value}
                </span>
            );
        }
    },
    {
        title: '对应机组', dataIndex: 'powerUnitName', key: 'powerUnitName', width: '26%',
        render: (value, record) => {
            return (
                <span>
                    {value}
                </span>
            );
        }
    },
    {
        title: '充电电量（kWh）', dataIndex: 'charge', key: 'charge', width: '12%',
        render: (value, record) => {
            return (
                <span>
                    {value}
                </span>
            );
        }
    },
    {
        title: '放电电量（KWh）', dataIndex: 'discharge', key: 'discharge', width: '12%',
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
        title: '编号', dataIndex: 'num',
    },
    {
        title: '开始时间', dataIndex: 'startTime',
    },
    {
        title: '结束时间', dataIndex: 'endTime',
    },
    {
        title: '参与储能', dataIndex: 'energyStorageUnits',
    },
    {
        title: '对应机组', dataIndex: 'powerUnitName',
    },
    {
        title: '充电电量（KWh）', dataIndex: 'charge',
    },
    {
        title: '放电电量（KWh）', dataIndex: 'discharge'
    }
]
