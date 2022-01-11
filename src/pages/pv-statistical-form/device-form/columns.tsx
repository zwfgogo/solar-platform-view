import React from 'react';
import AbsoluteBubble from "../../../components/AbsoluteBubble";

export const DeviceTypeMap = {
  inverter: '1',
  combinerBox: '2',
  transformer: '3',
  gatewayBreaker: '4',
  protectionRelay: '5'
};

export default {
  [DeviceTypeMap.inverter]: [
    {
      title: "时间",
      dataIndex: "date",
      align: 'center',
      width: 150,
    },
    // {
    //   title: "电站名称",
    //   dataIndex: "stationTitle",
    //   render: text => <AbsoluteBubble><span>{text}</span></AbsoluteBubble>
    // },
    // {
    //   title: "设备名称",
    //   dataIndex: "deviceTitle",
    //   render: text => <AbsoluteBubble><span>{text}</span></AbsoluteBubble>
    // },
    {
      title: "发电量",
      dataIndex: "production",
      align: 'right',
      width: 150,
    },
    {
      title: "满发时长",
      dataIndex: "yield",
      align: 'right',
      width: 150,
    },
    {
      title: "效率",
      dataIndex: "efficiency",
      align: 'right',
      width: 150,
    },
    {
      title: "离散率",
      dataIndex: "divergences",
      align: 'right',
      width: 150,
    },
  ],
  [DeviceTypeMap.combinerBox]: [
    {
      title: "时间",
      dataIndex: "date",
      align: 'center',
      width: 150,
    },
    // {
    //   title: "电站名称",
    //   dataIndex: "stationTitle",
    //   render: text => <AbsoluteBubble><span>{text}</span></AbsoluteBubble>
    // },
    // {
    //   title: "设备名称",
    //   dataIndex: "deviceTitle",
    //   render: text => <AbsoluteBubble><span>{text}</span></AbsoluteBubble>
    // },
    {
      title: "离散率",
      dataIndex: "divergences",
      align: 'right',
      width: 150,
    },
    {
      title: "发电量",
      dataIndex: "production",
      align: 'right',
      width: 150,
    },
  ],
  [DeviceTypeMap.transformer]: [
    {
      title: "时间",
      dataIndex: "date",
      align: 'center',
      width: 150,
    },
    // {
    //   title: "电站名称",
    //   dataIndex: "stationTitle",
    //   render: text => <AbsoluteBubble><span>{text}</span></AbsoluteBubble>
    // },
    // {
    //   title: "设备名称",
    //   dataIndex: "deviceTitle",
    //   render: text => <AbsoluteBubble><span>{text}</span></AbsoluteBubble>
    // },
    {
      title: "发电量",
      dataIndex: "production",
      align: 'right',
      width: 150,
    },
    {
      title: "效率",
      dataIndex: "efficiency",
      align: 'right',
      width: 150,
    },
  ],
  [DeviceTypeMap.gatewayBreaker]: [{
    title: "时间",
    dataIndex: "date",
    align: 'center',
    width: 150,
  }, {
    title: "上网电量",
    dataIndex: "production",
    align: 'right',
    width: 150,
  }],
  [DeviceTypeMap.protectionRelay]: [{
    title: "时间",
    dataIndex: "date",
    align: 'center',
    width: 150,
  }, {
    title: "发电量",
    dataIndex: "production",
    align: 'right',
    width: 150,
  }]
}
