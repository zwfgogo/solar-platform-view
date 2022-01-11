/**
 * Created by zhuweifeng on 2019/8/16.
 */
import React, { Component, useState } from 'react';
import utils from '../../../../public/js/utils';

interface Props {
    value?: any[];
    title?: string;
    number?:number;
  }
 
const WarningBlock : React.FC<Props | any> = props => {
    const { title,value,number } = props;

    return (
        <div className="f-df flex-column" style={{ height: '100%' }}>
            <div className="flex1 f-pr" style={{ flex: 0.5, padding: '6% 20px 0 20px' }}>
                <span className="common-label" style={{ float: 'left' }}>{title}</span>
                <span style={{ float: 'right' }}>{number} {utils.intl('台')}</span>
            </div>
            <div className="f-df flex1 f-pr">
                <div className="flex1 f-pr" style={{ padding: '0px 15px 20px 20px' }}>
                    <p style={{ height: '20px', marginBottom: '6%' }}>
                        <span style={{ float: 'left' }}>{utils.intl('正常')}</span>
                        <span style={{ float: 'right', color: '#3dd598' }}>{value&&value.length?value[0]:''}<span className="common-unit"> {utils.intl('台')}</span></span>
                    </p>
                    <p style={{ height: '20px', marginBottom: '6%' }}>
                        <span style={{ float: 'left' }}>{utils.intl('中度')}</span>
                        <span style={{ float: 'right', color: '#ff974a' }}>{value&&value.length?value[2]:''}<span className="common-unit"> {utils.intl('台')}</span></span>
                    </p>
                </div>
                <i style={{ height: '30px', border: 'solid 1px #f1f1f5', position: 'relative', top: '13px' }}></i>
                <div className="flex1 f-pr" style={{ padding: '0px 20px 20px 15px' }}>
                    <p style={{ height: '20px', marginBottom: '6%' }}>
                        <span style={{ float: 'left' }}>{utils.intl('轻微')}</span>
                        <span style={{ float: 'right', color: '#0062ff' }}>{value&&value.length?value[1]:''}<span className="common-unit"> {utils.intl('台')}</span></span>
                    </p>
                    <p style={{ height: '20px', marginBottom: '6%'  }}>
                        <span style={{ float: 'left' }}>{utils.intl('严重')}</span>
                        <span style={{ float: 'right', color: '#fc5a5a' }}>{value&&value.length?value[3]:''}<span className="common-unit"> {utils.intl('台')}</span></span>
                    </p>
                </div>
            </div>
        </div>
    );
};
export default WarningBlock;