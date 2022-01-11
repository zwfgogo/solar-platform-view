/**
 * 设备类型数据项页面
 */
import { active } from 'd3';
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { Table1, Input, Tabs, Button } from 'wanke-gui';
import utils from '../../../public/js/utils';
import "./index.less"

const { Search } = Input
const { TabPane } = Tabs

interface Props {
  terminalList: any[];
  pointDataTypeList: any[];
  deviceType: any;
  selectedKeysMap: any;
  // selectedRowKeys: string[];
  allPointDataTypeMap: any;
  tableLoading?: boolean;
  disabledKeys: string[];
  onSearch?: (params: { deviceTypeId: number, queryStr: string, terminal: string }) => void;
  onCancel?: () => void;
  onOk?: (selectedKeysMap: any) => void;
}


const DeviceTypeDataItem: React.FC<Props> = (props) => {
  const { terminalList, pointDataTypeList, tableLoading, deviceType, selectedKeysMap, allPointDataTypeMap, disabledKeys, onSearch, onCancel, onOk } = props
  const [tabKey, setTabKey] = useState(terminalList[0]?.id);
  const [searchValue, setSearchValue] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState(Object.keys(selectedKeysMap));
  useEffect(() => {
    setTabKey(terminalList[0]?.id);
  }, [JSON.stringify(terminalList)]);

  useEffect(() => {
    setSelectedRowKeys(Object.keys(selectedKeysMap));
  }, [JSON.stringify(selectedKeysMap)])

  const columns = [
    {
      title: utils.intl('序号'),
      dataIndex: 'num',
      key: 'num',
      width: 65,
      // render: (text, record, index) => {
      //   console.log('index', index);
      //   return index + 1;
      // }
    },
    {
      title: utils.intl('数据项名称'),
      dataIndex: 'title',
      key: 'title',
      render: text => <div className="table-ellipsis" title={text}>{text}</div>
    }, {
      title: utils.intl('符号'),
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100
    }, {
      title: utils.intl('单位'),
      dataIndex: 'unit',
      key: 'unit',
      width: 120,
      ellipsis: true,
      render: obj => <div className="table-ellipsis" title={obj?.title}>{obj?.title}</div>
    }
  ];

  const onSelectChange = useCallback(
    (sKeys) => {
      // const terminal = terminalList.find(item => `${item.id}` === `${tabKey}`);
      setSelectedRowKeys(Array.from(new Set([...(selectedRowKeys || []).filter(key => key.indexOf(`:${tabKey}:`) < 0), ...sKeys])));
    }, [JSON.stringify(selectedRowKeys), tabKey]);

  const rowSelection = (terminal) => ({
    selectedRowKeys,
    getCheckboxProps: record => ({ disabled: disabledKeys.indexOf(`${deviceType?.id}:${terminal.id}:${record.id}`) > -1 }),
    onChange: onSelectChange,
  });

  // 确定
  const handleOk = () => {
    const resultMap = {};
    for(let i = 0; i<selectedRowKeys.length; i++){
      if(selectedKeysMap[selectedRowKeys[i]]){
        resultMap[selectedRowKeys[i]] = selectedKeysMap[selectedRowKeys[i]];
      }else{
        const ids = selectedRowKeys[i].split(':');
        const terminal = terminalList.find(terminal => `${terminal.id}` === `${ids[1]}`);
        const pointDataType = allPointDataTypeMap[terminal?.name].find(pointDataType => `${pointDataType.id}` === `${ids[2]}`);
        resultMap[selectedRowKeys[i]] = `${deviceType?.title}:${terminal?.title}:${pointDataType?.title}`;
      }
    }
    onOk && onOk(resultMap);
  }

  return (<div className="receiver-add-modal-box">
    <Tabs activeKey={`${tabKey}`} type="card" size="small" tabPosition="top" onChange={activeKey => {
      setTabKey(activeKey);
      const terminal = terminalList.find(item => `${item.id}` === `${activeKey}`);
      onSearch && onSearch({ deviceTypeId: deviceType?.id, queryStr: searchValue[terminal.name], terminal: terminal.name })
    }}>
      {
        terminalList.map(terminal => (
          <TabPane key={terminal.id} tab={terminal.title}>
            <div style={{ marginBottom: 8 }}>
              <Search
                style={{ width: 260 }}
                placeholder={utils.intl('请输入关键字')}
                value={searchValue[terminal.name]}
                onChange={e => setSearchValue({ ...searchValue, [terminal.name]: e.target.value })}
                onSearch={value => {
                  onSearch && onSearch({ deviceTypeId: deviceType?.id, queryStr: value, terminal: terminal.name })
                }}
              /></div>
            <div style={{ height: 443 }}>
              <Table1
                x={592}
                rowKey={record => `${deviceType?.id}:${terminal.id}:${record.id}`}
                rowSelection={rowSelection(terminal)}
                loading={tableLoading}
                dataSource={pointDataTypeList}
                virtual={false}
                columns={columns}
              />
            </div>
          </TabPane>
        ))
      }
    </Tabs>
    <div className="footer">
      <Button style={{ marginRight: 8 }} onClick={() => onCancel && onCancel()}>{utils.intl('取消')}</Button>
      <Button type="primary" onClick={handleOk}>{utils.intl('确定')}</Button>
    </div>
  </div >)
}

export default DeviceTypeDataItem
