import React, { useContext, useState, useEffect, useRef } from 'react';
import { Table, Input, Button, Popconfirm, Form } from 'antd';
import { FormInstance } from 'antd/lib/form';
import utils from '../../../util/utils';
import { numberRangePrecisionRule, numberStringPrecisionRule } from '../../../util/ruleUtil';

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface Item {
    key: string;
    name: string;
    age: string;
    address: string;
}

interface EditableRowProps {
    index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    children: React.ReactNode;
    dataIndex: keyof Item;
    record: Item;
    handleSave: (record: Item) => void;
    isPost: () => void;
    notPost: () => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    isPost,
    notPost,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<Input>(null);
    const form = useContext(EditableContext)!;

    useEffect(() => {
        if (editing) {
            inputRef.current!.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({ [dataIndex]: record[dataIndex] ? record[dataIndex] + '' : '' });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();

            toggleEdit();
            handleSave({ ...record, ...values });
            isPost()
        } catch (errInfo) {
            notPost()
            console.log('Save failed:', errInfo);
        }
    };

    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{ margin: 0 }}
                name={dataIndex}
                rules={[
                    {
                        required: false,
                        message: `${title} is required.`,
                    },
                    numberStringPrecisionRule(0, 999999, 2)
                ]}
            >
                <Input autoComplete="off" ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
        ) : (
            <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];

interface DataType {
    key: React.Key;
    energyUnitTitle: string;
    activePowerPid: string;
    reactivePowerPid: string;
    id: number;
    enable?: any;
    energyUnitId?: number
}

interface EditableTableState {
    dataSource: any;
    count: number;
    selectedRowKeys: any;
}

interface Props {
    strategyName: any;
    selectedRowKeys: any;
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

class EditableTable extends React.Component<EditableTableProps, EditableTableState, Props> {
    columns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[];

    constructor(props: EditableTableProps) {
        super(props);

        let columns = []
        switch (this.props.strategyName) {
            case 'C19':
                columns = [
                    {
                        title: utils.intl('储能单元名称'),
                        dataIndex: 'energyUnitTitle',
                        width: 300,
                    },
                    {
                        title: utils.intl('有功功率'),
                        dataIndex: 'activePowerPid',
                        editable: true,
                        render: (text, record, index) => {
                            if (text) {
                                return (
                                    <span>{text}</span>
                                )
                            } else {
                                return (
                                    <span>{'--'} </span>
                                )
                            }
                        }
                    },
                    {
                        title: utils.intl('无功功率'),
                        dataIndex: 'reactivePowerPid',
                        editable: true,
                        render: (text, record, index) => {
                            if (text) {
                                return (
                                    <span>{text}</span>
                                )
                            } else {
                                return (
                                    <span>{'--'} </span>
                                )
                            }
                        }
                    },
                ]
                break
            case 'C07':
                columns = [
                    {
                        title: utils.intl('储能单元名称'),
                        dataIndex: 'energyUnitTitle',
                        width: 300,
                    },
                    {
                        title: utils.intl('无功功率'),
                        dataIndex: 'reactivePowerPid',
                        editable: true,
                        render: (text, record, index) => {
                            if (text) {
                                return (
                                    <span>{text}</span>
                                )
                            } else {
                                return (
                                    <span>{'--'} </span>
                                )
                            }
                        }
                    },
                ]
                break
            case 'C01':
            case 'C05':
            case 'C06': {
                columns = [
                    {
                        title: utils.intl('储能单元名称'),
                        dataIndex: 'energyUnitTitle',
                        width: 300,
                    },
                    {
                        title: utils.intl('有功功率'),
                        dataIndex: 'activePowerPid',
                        editable: true,
                        render: (text, record, index) => {
                            if (text) {
                                return (
                                    <span>{text}</span>
                                )
                            } else {
                                return (
                                    <span>{'--'} </span>
                                )
                            }
                        }
                    },
                ]
                break
            }
            default:
                break
        }
        this.columns = columns


        this.state = {
            dataSource: this.props.dataSource || [],
            count: 2,
            selectedRowKeys: this.props.selectedRowKeys || []
        };
    }

    handleSave = (row: DataType) => {
        const newData = [...this.state.dataSource];
        const index = newData.findIndex(item => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        this.props.callback(newData, this.state.selectedRowKeys)
        this.setState({ dataSource: newData });
    };

    isPost = () => {
        this.props.isPost()
    }

    notPost = () => {
        this.props.notPost()
    }

    componentWillUnmount() {
        this.setState({ dataSource: [], selectedRowKeys: [] });
    }


    render() {
        const { dataSource, selectedRowKeys } = this.state;
        const components = {
            body: {
                row: EditableRow,
                cell: EditableCell,
            },
        };
        const columns = this.columns.map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: (record: DataType) => ({
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave: this.handleSave,
                    isPost: this.isPost,
                    notPost: this.notPost,
                }),
            };
        });
        //选择框回调
        const onSelectChange = (selectedRowKeys, selectedRows) => {
            this.setState({ selectedRowKeys: selectedRowKeys });
            this.props.callback(this.state.dataSource, selectedRowKeys)
        }

        const rowSelection = {
            selectedRowKeys: selectedRowKeys,
            onChange: onSelectChange,
            columnWidth: 80,
            columnTitle: utils.intl('选择'),
        }

        return (
            <div>
                <Table
                    components={components}
                    rowClassName={() => 'editable-row'}
                    dataSource={dataSource}
                    columns={columns as ColumnTypes}
                    pagination={false}
                    scroll={{ y: 300 }}
                    rowSelection={rowSelection}
                    rowKey="energyUnitId"
                />
            </div>
        );
    }
}

export default EditableTable