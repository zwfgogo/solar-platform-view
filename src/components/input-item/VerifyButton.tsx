import React, { useState, useEffect } from "react";
import classnames from "classnames";
import { wrapper } from "../../public/components/InputUnit";
import styles from "./styles/VerifyButton.less";

import { LoadingOutlined } from "wanke-icon";

interface Props {
  verifyName: string; // 需要验证的表单控件name
  name: string; // 当前表单控件的name
  verifyAction: (val: any) => Promise<any>; // 验证方法
  value?: boolean;
  form?: any;
  onChange?: (val: boolean) => void;
}

// 验证按钮，
const VerifyButton: React.FC<Props> = (props) => {
  const { value } = props;
  const [errorList, setErrorList] = useState([]);
  const [loading, setLoading] = useState(false);
  let targetErrs = props.form.getFieldError(props.verifyName) || []; // 目标错误信息
  let curErrs = props.form.getFieldError(props.name) || []; // 当前控件错误信息
  const totalErrs = targetErrs.concat(curErrs);
  let targetValue = props.form.getFieldValue(props.verifyName);

  useEffect(() => {
    // 重置验证控件
    props.form.resetFields([props.name]);
    setErrorList(totalErrs);
  }, [targetValue]);

  useEffect(() => {
    setErrorList(totalErrs);
  }, [JSON.stringify(totalErrs)]);

  const handleVerify = () => {
    if (!targetValue) {
      props.form.validateFields([props.verifyName]);
      return;
    }
    if (value || targetErrs.length > 0) return;
    setLoading(true);
    props.verifyAction(targetValue).then(result => {
      setLoading(false);
      if (!result.result) {
        props.form.setFields({
          [props.name]: { value: false, errors: [new Error(result.errorMsg || "验证不通过")] }
        });
      } else {
        triggerChange(true);
      }
    });
  };

  const triggerChange = changedValue => {
    const { onChange } = props;
    if (onChange) {
      onChange(changedValue);
    }
  };
  return (
    <div className={classnames("has-error", styles["verify-button"])}>
      <a className={styles["btn"]} onClick={handleVerify}>
        验证
      </a>
      <div className={styles["message"]} style={{ minHeight: 22, color: '#3588fe' }}>
        {loading ? <LoadingOutlined /> : ''}
        {!loading && errorList.length === 0 && value ? <span>验证通过</span> : ""}
        {!loading && errorList.map((item, index) => {
          return (
            <span key={index} className=" ant-form-explain">
              {item}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default wrapper(VerifyButton);
