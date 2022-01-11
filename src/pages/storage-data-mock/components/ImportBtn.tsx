import { Moment } from 'moment';
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Button, Col, Form, Modal, Row, Select, Upload } from 'wanke-gui';
import DatePicker from '../../../components/date-picker'
import { FormContainer } from '../../../components/input-item/InputItem';
import UploadItem from '../../../components/input-item/UploadItem';
import styles from './styles/import-btn.less';
import utils from '../../../public/js/utils';

const FormItem = Form.Item;

export interface ImportFormValues {
  stationId: string;
  file: File;
}

interface Props {
  onImport: (values: ImportFormValues) => Promise<any>;
  stationList: any[];
  stationId?: string;
  loading?: boolean;
}

const ImportBtn: React.FC<Props> = ({ onImport, stationList, stationId, loading }) => {
  const [form] = Form.useForm()
  const [visible, setVisible] = useState(false);
  const [fileList, setFileList] = useState([]);

  const handleOk = () => {
    form.validateFields().then((values: ImportFormValues) => {
      onImport({ stationId: values.stationId, file: values.file[0] })
        .then(() => {
          setVisible(false);
        })
    })
  };

  useEffect(() => {
    form.resetFields();
    setFileList([]);
  }, [visible]);

  const vaildFile =  (rule, value: string, callback) => {
    if (!value?.length) {
      return Promise.reject(utils.intl(`请选择文件`));
    }
    return Promise.resolve();
  }

  return (
    <>
      <Button
        type="primary"
        onClick={() => setVisible(true)}
      >
        {utils.intl('导入')}
      </Button>
      <Modal
        title={utils.intl('导入模板')}
        width={600}
        visible={visible}
        confirmLoading={loading}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
        wrapClassName={styles['import-modal']}
        forceRender
      >
        <FormContainer form={form} initialValues={{ stationId: stationId === 'all' ? undefined : stationId }}>
          <Row gutter={16}>
            <Col span={12}>
              <FormItem
                name="stationId"
                rules={[{ required: true, message: utils.intl('请选择电站') }]}
                label={utils.intl('请选择电站')}
              >
                <Select dataSource={stationList} placeholder={utils.intl('请选择电站')} style={{ width: 170 }} />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                name="file"
                rules={[{ required: true, validator: vaildFile, message: utils.intl('请选择文件') }]}
                label={utils.intl('请选择要导入的文件')}
              >
                <UploadItem
                  isOneFileUpload
                  hideFileList
                  onChange={files => setFileList(files)}
                  accept=".csv"
                >
                  <Button style={{ width: '100%', textAlign: 'left' }}>
                    <div className={styles['import-btn-text']} title={fileList?.[0] ? fileList[0].name : ''}>
                      {fileList?.[0] ? fileList[0].name : utils.intl('请选择文件')+"..."}
                    </div>
                  </Button>
                </UploadItem>
              </FormItem>
            </Col>
          </Row>
        </FormContainer>
      </Modal>
    </>
  );
};

export default ImportBtn;