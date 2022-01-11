/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React, { useEffect, useState } from 'react';
import {Form, Dropdown, Empty} from 'wanke-gui'
import { Menu } from 'antd';
import Header from './Header'
import styles from './styles/realtime.less';
import { CaretDownOutlined } from '@ant-design/icons';
import classNames from 'classnames'

interface Props {
    value?: any[];
    title?: string;
    opertion?: boolean;
    typeChange?: (params: any) => void;
    typeArr?: any[];
    deviceStatus?: string;
}

const RealTime: React.FC<Props | any> = props => {
    const { title, value, opertion, typeChange, typeArr, deviceStatus } = props;
    const [typeName, setTypeName] = useState(typeArr && typeArr.length > 0 ? typeArr[0].name : '')
    useEffect(() => {
        setTypeName(typeArr && typeArr.length > 0 ? typeArr[0].name : '')
    }, [typeArr]);

    const onClick = ({ key }) => {
        typeArr.forEach(element => {
            if (element.value + '' === key) {
                setTypeName(element.name)
            }
        });
        if (typeChange) {
            typeChange(key)
        }
    };

    const menu = (
        <Menu onClick={onClick}>
            {
                typeArr.map((item, index) => (
                    <Menu.Item key={item.value}>
                        <a>{item.name}</a>
                    </Menu.Item>
                ))
            }
        </Menu>
    );

    return (
        <div className={`f-df flex-column ${styles.list}`} style={{ height: '100%' }}>
            <Header title={title} />
            {opertion ?
                <span className={styles["opertion"]}>
                    <Dropdown overlay={menu} trigger={['click']}>
                        <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                            {typeName} <CaretDownOutlined />
                        </a>
                    </Dropdown>
                </span>
                : ''}
            {value.length > 0 ?
                <div className="flex1 f-pr" style={{ overflow: 'auto', maxHeight: '200px' }}>
                    {
                        value.map((item, index) => (
                            <div className={styles["div-block"] + " f-df"}>
                                <div className="flex1" style={{ textAlign: 'left', marginLeft: '20px' }}>
                                    <span title={item.title} style={{ lineHeight: '40px', whiteSpace: 'nowrap', overflow: 'hidden', display: 'block', textOverflow: 'ellipsis' }}>{item.title}</span>
                                </div>
                                <div className={classNames("flex1 common-border-left", "eventd")} style={{ textAlign: 'left', paddingLeft: '20px' }}>
                                    <span style={{ lineHeight: '40px' }}>{(item.value || parseInt(item.value, 10) === 0) && deviceStatus === '在线' ? item.value : '--'}</span>
                                </div>
                            </div>
                        ))
                    }
                </div>
                :
                <div className="vh-center">
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                </div>
            }

        </div>
    );
};
export default RealTime;