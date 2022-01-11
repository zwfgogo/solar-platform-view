
import React from 'react';
import utils from '../../../public/js/utils';
export default function () {
  let that = this;
  return [{
    title: utils.intl('序号'),
    dataIndex: 'num',
    width: 100,
    render: (value, record) => {
      return (
        <span>
          {value}
        </span>
      );
    }
  },
  {
    title: utils.intl('数据时间'),
    dataIndex: 'dtime',
    render: (value, record) => {
      return (
        <span>
          {value}
        </span>
      );
    }
  },
  {
    title: utils.intl('电池组最大SOC') + '(%)',
    dataIndex: 'maxValue',
    render: (value, record) => {
      return (
        <span>
          {value}
        </span>
      );
    }
  },
  {
    title: utils.intl('最大值对应设备'),
    dataIndex: 'maxDeviceTitle',
    render: (value, record) => {
      return (
        <span>
          {value}
        </span>
      );
    }
  },
  {
    title: utils.intl('电池组最小SOC') + '(%)',
    dataIndex: 'minValue',
    render: (value, record) => {
      return (
        <span>
          {value}
        </span>
      );
    }
  },
  {
    title: utils.intl('最小值对应设备'),
    dataIndex: 'minDeviceTitle',
    render: (value, record) => {
      return (
        <span>
          {value}
        </span>
      );
    }
  },
  {
    title: utils.intl('SOC极差') + '(%)',
    dataIndex: 'extremumSub',
    render: (value, record) => {
      return (
        <span>
          {value}
        </span>
      );
    }
  },
  ];
}

