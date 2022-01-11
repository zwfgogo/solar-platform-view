/**
 * 二次确认气泡框
 * 默认 placement 是 topRight, 可以通过 placement 修改气泡的位置
 */
import React, { useState } from 'react'
import { Popover, Button} from 'wanke-gui'
import { PopoverProps } from 'antd/lib/popover';
import { ExclamationCircleOutlined } from "wanke-icon";
import utils from '../../public/js/utils';
interface Props extends PopoverProps{
    tip?: string
    onConfirm: () => void
    children?: any,
}

export default function DeleteConfirmPopover(props: Props) {
    const {children, onConfirm,tip, ...otherProps} = props;
    let [visible, setVisible] = useState(false)

    let handleConfirm = () => {
        setVisible(false)
        props.onConfirm()
    }

    return (
        <Popover
            visible={visible}
            onVisibleChange={visible => setVisible(visible)}
            placement='topRight'
            content={
                <div className='f-df e-p10'>
                    <ExclamationCircleOutlined className='warning e-mr15' style={{fontSize: '20px'}} />
                    <div className='e-mr10' style={{ maxWidth: 250 }}>
                      <div style={{fontWeight: 'bold'}}>{props.tip || utils.intl('确定删除吗？')}</div>
                      {!props.tip && <div className='e-mt5'>{utils.intl('删除后将不可恢复，请谨慎操作')}</div>}
                      <div className='e-mt15'>
                          <Button size="small" onClick={() => setVisible(false)}>{utils.intl('取消')}</Button>
                          <Button size="small" type="primary" onClick={handleConfirm} style={{ marginLeft: '10px' }}>{utils.intl('确定')}</Button>
                      </div>
                    </div>
                </div>
            }
            trigger="click"
            {...otherProps}
        >
            {
                props.children || (<a className="list-item-delete">{utils.intl('删除')}</a>)
            }
        </Popover>
    );
}
