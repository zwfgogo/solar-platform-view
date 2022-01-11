/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React from 'react';
import { Empty, Form } from 'wanke-gui'
import { history } from 'umi'
import Header from './Header'
import styles from './styles/warning.less';
import utils from '../../../../public/js/utils';
import classNames from 'classnames'

interface Props {
    value?: any[];
    title?: string;
}

const Warning: React.FC<Props | any> = props => {
    const { title, value } = props;
    return (
        <div className={`f-df flex-column f-pr ${styles.list}`} style={{ height: '100%' }}>
            <Header title={title} />

            {value.length > 0 ?
                <span className={styles["opertion"]} onClick={() => { history.push('/alert-service/abnormal') }}>{utils.intl('详情')}</span>
                :
                <span className={styles["opertion"]} style={{ color: '#aaa', cursor: 'not-allowed' }}>{utils.intl('详情')}</span>
            }
            {value.length > 0 ?
                <div className="flex1 f-pr" style={{ overflow: 'auto', maxHeight: '105px' }}>
                    {
                        value.map((item, index) => (
                            <div className={styles["div-block"] + " f-df"}>
                                <div className={classNames("flex1", "eventd2")} style={{
                                    textAlign: 'left', flex: 0.2, paddingLeft: '20px',
                                }}>
                                    <span title={item.alarmTitle} style={{ lineHeight: '40px', whiteSpace: 'nowrap', overflow: 'hidden', display: 'block', textOverflow: 'ellipsis' }}>{item.alarmTitle}</span>
                                </div>
                                <div className={classNames("flex1", "eventd2")} style={{ textAlign: 'left' }}>
                                    <span style={{ lineHeight: '40px', marginLeft: '40px' }}>{item.startTime}</span>
                                </div>
                            </div>
                        ))
                    }
                </div>
                :
                <div className="vh-center">
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
            }

        </div >
    );
};
export default Warning;
