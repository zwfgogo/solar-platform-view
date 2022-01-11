import React, { useState, useRef, useEffect } from 'react'
import { Button } from 'wanke-gui'
import { Modal } from 'antd'
import { CompressOutlined, ExpandOutlined } from 'wanke-icon';
import { triggerEvent } from '../util/utils'

const btnStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 56,
  color: '#ffffff',
  height: 56,
  width: 40,
  zIndex: 9,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

interface ResizeButtonProps {
  isMax: boolean
  onClick: () => void
}

const ResizeButton: React.FC<ResizeButtonProps> = (props) => {
  const ref = useRef<HTMLDivElement>();

  useEffect(() => {
    let header: Element;
    if(ref) {
      header = ref.current.parentElement.parentElement.getElementsByClassName('ant-modal-header')[0];
      if(header) {
        header.addEventListener('dblclick', handleClick);
      }
    }
    return () => {
      if(header) {
        header.removeEventListener('dblclick', handleClick);
      }
    }
  }, [props.isMax]);

  const handleClick = (e) => {
    e.stopPropagation();
    props.onClick && props.onClick();
  }

  return (
    <div ref={ref} style={btnStyle} onClick={handleClick}>
      {
        props.isMax ? (
          <CompressOutlined />
        ) : (
          <ExpandOutlined />
        )
      }
    </div>
  );
}

export interface Dialog2Props {
  visible: boolean
  title: string
  width?: number
  defaultHeight?: number
  onExited: () => void
  onConfirm: () => void
  confirmLoading?: boolean
  footer?: React.ReactNode
  resizeAble?: boolean
  onResize?: () => void
}

const Dialog2: React.FC<Dialog2Props> = function (this: null, props) {
  const [isMax, setIsMax] = useState(false);
  const [width, setWidth] = useState(props.width || 600);
  const [height, setHeight] = useState<string | number>(props.defaultHeight || 'auto');

  const handleResize = () => {
    if(isMax) {
      setIsMax(false);
      setWidth(props.width || 600);
      setHeight(props.defaultHeight || 'auto');
    } else {
      const bodyRect = document.querySelector('body').getBoundingClientRect();
      setIsMax(true);
      setWidth(bodyRect.width - 20);
      setHeight(bodyRect.height - 20);
    }
    props.onResize && props.onResize();
    setTimeout(()=> {
      triggerEvent('resize', window)
    }, 0)
  }

  let footer = props.footer !== undefined ? props.footer : (<div className="dialog-footer">
    <Button onClick={props.onExited}>取消</Button>
    <Button loading={props.confirmLoading} style={{marginLeft: 18}} type="primary"
            onClick={() => props.onConfirm()}>确认</Button>
  </div>)

  return (
    <Modal
      title={props.title}
      width={width}
      style={{height: height}}
      visible={props.visible}
      onCancel={props.onExited}
      destroyOnClose={true}
      maskClosable={false}
      footer={footer}
      centered={true}
      wrapClassName="resize-modal"
      bodyStyle={{overflow: 'hidden'}}
    >
      {props.resizeAble ? (<ResizeButton isMax={isMax} onClick={handleResize} />) : ''}
      {props.children}
    </Modal>
  )
}

export default Dialog2
