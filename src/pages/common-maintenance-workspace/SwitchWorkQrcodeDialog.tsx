import React, { useEffect, useState } from 'react';
import { Modal } from 'wanke-gui';
import { workspace_list } from "../constants";
import styles from './styles/SwitchWorkQrcodeDialog.less';
import utils from "../../public/js/utils";
let socketClient;

interface Props {
  closeModal: () => void;
  dispatch: any;
  qrcodeUniqueId: any;
}

const SwitchWorkQrcodeDialog: React.FC<Props> = (props) => {
  const { closeModal, qrcodeUniqueId } = props;
  const [qrcodeUrl, setQrcodeUrl] = useState("");

  const handleCancel = () => {
    closeModal();
  }

  const fetchImg = () => {
    props.dispatch({ type: `${workspace_list}/fetchQrcodeImg` }).then(url => {
      if (!url) {
        closeModal();
        return;
      }
      let str = url;
      setQrcodeUrl(str);
      socketStart();
    })
  }
  const socketStart = () => {
    props.dispatch({ type: `${workspace_list}/startQrcodSocket`, payload: { key: qrcodeUniqueId, dispatch: props.dispatch } });
  }
  useEffect(() => {
    fetchImg();
    return () => {
      // 关闭socket连接
      if (socketClient) {
        socketClient.close();
      }
    };
  }, []);

  return (
    <Modal
      title={utils.intl('交接班')}
      width={348}
      onCancel={handleCancel}
      footer={null}
      visible={qrcodeUrl}
    >
      <div className={styles['page-container']}>
        {qrcodeUrl ? <img className={styles['qrcode']} src={qrcodeUrl} /> : ""}
      </div>
    </Modal>
  );
};

export default SwitchWorkQrcodeDialog;