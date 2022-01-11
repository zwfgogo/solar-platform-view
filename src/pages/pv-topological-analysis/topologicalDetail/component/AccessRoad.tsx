/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React from 'react';
import {Empty, Form} from 'wanke-gui'
import Header from './Header'
import styles from './styles/accessRoad.less';
import classNames from 'classnames'

interface Props {
    value?: any[];
    title?: string;
    deviceStatus?: string;
}
const colorList = { 1: '#3dd598', 2: '#0062ff', 3: '#ff974a', 4: '#fc5a5a' };

const AccessRoad: React.FC<Props | any> = props => {
    const { title, value, deviceStatus } = props;
    return (
        <div className={`f-df flex-column f-pr ${styles.list}`} style={{ height: '100%' }}>
            <Header title={title} />
            {value.length ?
                <div className="flex1 f-pr flex-column" style={{ overflow: 'auto', maxHeight: '201px' }}>
                    {
                        value.map((item, index) => (
                            <div className={styles["div-block"] + " f-df"}>
                                <div className={classNames("flex1", "eventd")} style={{ textAlign: 'center' }}>
                                    <span title={item.name} style={{ padding: '0 20px', lineHeight: '40px', whiteSpace: 'nowrap', overflow: 'hidden', display: 'block', textOverflow: 'ellipsis' }}>{item.name}</span>
                                </div>
                                <div className={classNames("flex1", "eventd")} style={{ textAlign: 'center', backgroundColor: item.value && deviceStatus === '在线' ? (colorList[item.WorkStatus] ? colorList[item.WorkStatus] : '#3dd598') : '#AAAAAA' }}>
                                    <span style={{ lineHeight: '40px', color: '#fff' }}>{(item.value || parseInt(item.value, 10) === 0) && deviceStatus === '在线' ? item.value : '--'}</span>
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
export default AccessRoad;