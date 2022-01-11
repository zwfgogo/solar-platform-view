/**
 * Created by zhuweifeng on 2019/5/10.
 */

import React from 'react';
import utils from '../../../public/js/utils';
export default function () {
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
    title: utils.intl('单体最大温度') + '(℃)',
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
    title: utils.intl('单体最小温度') + '(℃)',
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
    title: utils.intl('温度极差') + '(℃)',
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

