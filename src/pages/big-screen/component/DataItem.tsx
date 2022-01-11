import React, { useEffect } from "react";
import { connect } from "dva";
import styles from "./style/dataItem.less";

interface Props {
    title?: string;
    value?: string;
    unit?: string;
}

const DataItem: React.FC<Props> = props => {
    const {
        title, value, unit
    } = props;

    return (
        <>
            <div className={styles['value'] + ' f-df flex1'}>
                <div style={{ width: '100%', height: '100%' }}>
                    <span className={'f-fs24'}>{value}</span><span className={styles['unit']}>{unit}</span>
                </div>
            </div>
            <div className={styles['title'] + ' f-fs14 f-df flex1'} style={{marginTop:'3px'}}>
                <div style={{ width: '100%', height: '100%' }}>
                    {title}
                </div>
            </div>
        </>
    );
};

const mapStateToProps = state => ({ ...state.screenPage });
export default connect(mapStateToProps)(DataItem);
