import React from "react";
import classnames from "classnames";
import styles from "./style/flex-form-item.less";
import { FormItemProps } from "antd/lib/form/FormItem";

declare const ValidateStatuses: [
  "success",
  "warning",
  "error",
  "validating",
  ""
];
declare const FormLabelAligns: ["left", "right"];
export declare type FormLabelAlign = typeof FormLabelAligns[number];

interface Props extends FormItemProps {
  flexAble?: boolean;
}

// 表单排版修改, 利用flex实现水平布局
export function createFlexableFormItem<T = {}>(
  Component,
  isContainer = false
): React.FC<Props & Pick<T, Exclude<keyof T, "form" | "errs">>> {
  return props => {
    const { flexAble, className, ...rest } = props;
    return (
      <Component
        {...rest}
        className={classnames({
          [isContainer ? styles["flex-container"] : styles["flex-form-item"]]: flexAble,
          [className]: !!className
        })}
      />
    );
  };
}
