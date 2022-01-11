import React from "react";
import { Table1 } from 'wanke-gui'
import { BasicTableProps } from "../../../components/BasicTable"
import { Column } from 'wanke-gui/lib/table'
import Status from '../list/Status'
import utils from "../../../public/js/utils";

interface Props extends BasicTableProps {
  stationStatusOptions: any[];
}

const StationStatusList: React.FC<Props> = function (this: null, props) {
  const columns: Column<any>[] = [
    { title: utils.intl('序号'), width: 70, align: 'center', dataIndex: 'num' },
    {
      title: utils.intl('电站名称'),
      dataIndex: "stationTitle"
    },
    {
      title: utils.intl('电站状态'),
      width: 110,
      dataIndex: "stationStatusTitle",
      align: "center",
      render: (text, record) => {
        let code = null
        let match = props.stationStatusOptions.find(o => o.value == record.stationStatusId)
        let options = []
        if (match) {
          code = match.code
          options.push({ name: match.name, value: match.name });
        }
        return (
          <Status
            disabled={true}
            options={options}
            current={match.name}
            code={code}
            onChange={() => { }}
            stationStatusOptions={props.stationStatusOptions}
          >
            {match.name}
          </Status>
        )
      }
    },
    { title: utils.intl('状态开始时间'), dataIndex: "startTime" },
    { title: utils.intl('持续时间'), dataIndex: "continueTime", render: text => text ? `${text}${utils.intl("小时")}` : '' },
    { title: utils.intl('操作人'), dataIndex: "userTitle" }
  ];

  return <Table1 loading={props.loading} dataSource={props.dataSource} columns={columns}></Table1>;
}

export default StationStatusList
