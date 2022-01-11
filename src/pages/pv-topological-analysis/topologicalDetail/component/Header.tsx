/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React from 'react';
import { Form } from 'wanke-gui';
import styles from './styles/header.less';

interface Props {
    value?: any[];
    title?: string;
    number?: number;
}

const Header: React.FC<Props | any> = props => {
    const { title } = props;

    return (
        <div className={styles['header']+ " f-pr"}>
            <span className="common-header" style={{ float: 'left',lineHeight:'38px',marginLeft:'20px' }}>{title}</span>
        </div>
    );
};
export default Header;