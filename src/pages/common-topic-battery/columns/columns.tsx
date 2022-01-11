import React from 'react';
import utils from '../../../public/js/utils';

export default function () {
  let props = this.props
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
    title: utils.intl('温度最大极差') + '(℃)',
    dataIndex: 'temperature',
    render: (value, record) => {
      return (
        <span>
          {value}
        </span>
      );
    }
  },
  {
    title: utils.intl('电压最大极差') + '(V)',
    dataIndex: 'voltage',
    render: (value, record) => {
      return (
        <span>
          {value}
        </span>
      );
    }
  },
  {
    title: utils.intl('SOC最大极差'),
    dataIndex: 'SOC',
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

