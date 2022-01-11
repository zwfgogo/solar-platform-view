import React from 'react';
import {Icon} from 'wanke-gui'
import classnames from 'classnames'
import styles from './index.less';
import Forward from "../../../../../public/components/Forward/index";

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: any,
    title?: string,
    status?: any,
    page?: any,
    dispatchname?: any,
}


export default function whiteBox(props: Props) {
    const {children, title, status, page, className = '',id,...otherProps} = props;
    let color = '';
    let statusTitle = '';
    switch (status) {
        case '调度中' :
            color = '#2b9cd3';
            statusTitle = '调度中';
            break;
        case '已连接' :
            color = '#32d7bc';
            statusTitle = '已连接';
            break;
        case '断开连接' :
            color = '#ea2a14';
            statusTitle = '断开连接';
            break;
        default:
            color = '';
            statusTitle = '';
            break;
    }
    const setId = () => {
        const { dispatchname } = props;
        dispatchname({
            type: 'allVpp/updateState',
            payload: {id: id}
        })
    };
    return (
        <div className={className + " border-radius-10 white-box"} {...otherProps}>
            {
                title && title !== ''
                    ? (
                        <div className={"header"} style={{paddingLeft: '20px'}}>
              <span>
                <span className={"title"} style={{lineHeight: '0px'}}>{title}</span>
                  <div style={{float: 'right', height: '100%', width: '100px'}}>
                      <div style={{
                          height: '10px',
                          width: '10px',
                          backgroundColor: color,
                          borderRadius: '999px',
                          display: 'inline-block',
                          boxShadow: `0px 0px 15px ${color}`
                      }}></div>
                      <span style={{color: color, marginLeft: '15px', fontSize: '12px'}}>{statusTitle}</span>
                  </div>
              </span>
                        </div>
                    )
                    : null
            }

            <div className={"content"}>
                {props.children}
            </div>
            {page !== '' ?
                <Forward to={page} data={{pageTitle: title,stationId:id}}>
                    <div className={styles.clickBox} onClick={setId}>
                        <div style={{
                            border: '1px solid #fff',
                            textAlign: 'center',
                            width: '80px',
                            height: '32px',
                            borderRadius: '3px',
                            position: 'relative',
                            top: '50%',
                            transform: 'translate(0,-50%)',
                            margin: 'auto'
                        }}>
                            <span style={{lineHeight: '32px'}}>进入</span>
                        </div>
                    </div>
                </Forward>
                : ''}
        </div>
    );
}