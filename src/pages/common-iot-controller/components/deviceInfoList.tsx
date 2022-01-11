import React from "react";
import { Table2 } from 'wanke-gui'
import { PageTableProps } from '../../../interfaces/CommonInterface'
import Forward from "../../../public/components/Forward";
import AbsoluteBubble from "../../../components/AbsoluteBubble";
import utils from '../../../public/js/utils'

interface Props extends PageTableProps {
  stationId?: string;
}

const DeviceInfoList: React.FC<Props> = function(this: null, props) {
  const columns: any = [
    {
      title: utils.intl('序号'),
      width: 70,
      dataIndex: 'num'
    },
    {
      title: utils.intl('控制器名称'),
      dataIndex: "title",
      render: text => (
        <AbsoluteBubble>{text}</AbsoluteBubble>
      )
    },
    {
      title: utils.intl('控制器型号'),
      dataIndex: "model",
      width: 170,
      render: text => (
        <AbsoluteBubble>{text}</AbsoluteBubble>
      )
    },
    {
      title: utils.intl('SN码'),
      dataIndex: "name",
      width: 170,
      render: text => (
        <AbsoluteBubble>{text}</AbsoluteBubble>
      )
    },
    {
      title: utils.intl('配置文件'),
      dataIndex: "configFile",
      render: text => (
        <AbsoluteBubble>{text}</AbsoluteBubble>
      )
    },
    { title: utils.intl('配置时间'), dataIndex: "configTime", width: 165 },
    {
      title: utils.intl('所属工程名称'),
      dataIndex: "project",
      render: text => (
        <AbsoluteBubble>{text}</AbsoluteBubble>
      )
    },
    {
      title: utils.intl('采集设备'),
      width: 100,
      render: (text, record) => {
        return (
          <Forward
            to="CollectingDevice"
            data={{
              controllerId: record.id,
              controllerName: record.title,
              projectName: record.project
            }}
          >
            <span style={!record.isNormal ? { color: "#ff0000" } : {}}>
              {utils.intl('查看')}
            </span>
          </Forward>
        );
      }
    }
  ];

  return (
    <Table2
      loading={props.loading}
      dataSource={props.dataSource}
      columns={columns}
      page={props.page}
      size={props.size}
      total={props.total}
      onPageChange={props.onPageChange}
    />
  )
};

export default DeviceInfoList;
