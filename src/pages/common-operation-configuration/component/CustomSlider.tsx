/**
 * 自定义进度
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Tooltip, Form } from 'wanke-gui';
import { GfDeleteOutlined } from 'wanke-icon';
import utils from '../../../public/js/utils';
import CustomInputNumber from './CustomInputNumber';
import classNames from 'classnames'
import "./customSlider.less"

const { Item: FormItem } = Form;

type valueType = {
  soh: number,
  cycles: number,
};

interface CustomSliderProps {
  value?: valueType[],
  max: valueType,
  min: valueType,
  onChange?: (item: valueType[]) => void
};

let lineLeft: number = 0;
let lineWidth: number = 0;
let publicValue: valueType[] = [];

const CustomSlider: React.FC<CustomSliderProps> = (props) => {

  const { max, min, onChange } = props
  const lineDom = useRef();
  const [title, setTitle] = useState(undefined);
  const [value, setValue] = useState([]);
  const [visibleIndex, setVisibleIndex] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    document.body.addEventListener('click', bodyClick);
    return () => {
      publicValue = [];
      document.body.removeEventListener('click', bodyClick);
    }
  }, [])

  useEffect(() => {
    setValue(props.value ?? []);
    publicValue = props.value ?? [];
  }, [JSON.stringify(props.value)]);

  useEffect(() => {
    if (lineDom?.current) {
      const { width } = lineDom.current.getBoundingClientRect();
      lineLeft = lineDom.current.offsetLeft;
      lineWidth = width;
    }
    return () => {
      lineLeft = 0;
      lineWidth = 0;
    }
  }, [max.soh]);

  const bodyClick = useCallback((e) => {
    if (!e.path.find(target => {
      return target.className && `${target.className}`.indexOf('customSlider-tooltips') > -1 || target.className && `${target.className}`.indexOf('customSlider-point') > -1
    })) {
      setVisibleIndex(null);
      changeFunc();
    }
  }, [JSON.stringify(value)])

  const changeFunc = () => {
    const errors = form.getFieldsError();
    // console.log('errors', errors)
    const newValue = publicValue.filter((i, index) => i.cycles !== undefined && i.cycles !== null && (errors[0]?.errors?.[0] ? `cycles_${i.soh}` !== errors[0]?.name?.[0] : true));  // 排除数据错误的点
    publicValue = newValue;
    setValue(newValue);
    onChange && onChange(newValue);
  }

  const handleMouseMove = useCallback((e) => {
    const { left, width } = e.target.getBoundingClientRect();
    const startX = Number(left.toFixed(0));
    if (max.soh > min.soh) { // 只有最大soh > 最小soh才有意义
      const tarLen = width / (max.soh - min.soh);
      const num = max.soh - Math.ceil((e.clientX - startX) / tarLen);
      if (title !== num) setTitle(num);
    } else {
      setTitle(undefined);
    }
  }, [JSON.stringify(max), JSON.stringify(min), title])

  const handleClick = useCallback(
    (e) => {
      if (!value.find(item => item.soh === title)) {
        const newValue = [...value, { soh: title, cycles: undefined }].sort((a, b) => a.soh - b.soh);
        publicValue = newValue;
        setValue(newValue)
        setVisibleIndex(title);
        onChange && onChange(newValue);
      }
    }, [JSON.stringify(max), JSON.stringify(min), title, JSON.stringify(value)])

  const formValue = useMemo(() => {
    return value.filter(i => i.soh >= min.soh && i.soh <= max.soh && min.soh !== max.soh).reduce((pre, v) => ({
      ...pre,
      [`cycles_${v.soh}`]: v.cycles
    }), {})
  }, [value])

  return (
    <div className="customSlider-box">
      <div className="customSlider-left">{max.soh}%</div>
      <div
        className={classNames("customSlider-line", { "customSlider-line-no": max.soh - min.soh < 1 })}
        ref={lineDom}
        title={title}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      ></div>
      <div className="customSlider-right">{min.soh}%</div>
      {
        value.filter(i => i.soh >= min.soh && i.soh <= max.soh && min.soh !== max.soh).map(v => (
          <Tooltip overlayClassName="customSlider-tooltips" visible={v.soh === visibleIndex} title={
            <div className="customSlider-tooltips-box">
              <div className="customSlider-tooltips-header">
                <label>SoH:</label>
                <span style={{ marginLeft: 8 }}>{v.soh}%</span>
                <GfDeleteOutlined
                  style={{ float: "right", color: "#3D7EFF", cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    publicValue = value.filter(i => i.soh !== v.soh)
                    setValue(publicValue);
                    setVisibleIndex(null);
                    onChange && onChange(publicValue);
                  }} />
              </div>
              <div className="customSlider-tooltips-body">
                <Form
                  form={form}
                  requiredMark={false}
                  initialValues={formValue}
                  onValuesChange={(values, allValues) => {
                    const index = value.findIndex(i => `cycles_${i.soh}` === Object.keys(values)[0]);
                    if (index > -1) {
                      value[index].cycles = Object.values(values)[0];
                      publicValue = value;
                      setValue(value);
                      onChange && onChange(value);
                    }
                  }}>
                  <FormItem noStyle shouldUpdate={() => true}>
                    {
                      ({ getFieldsValue }) => {
                        return (
                          <FormItem
                            label={utils.intl('循环次数')}
                            name={`cycles_${v.soh}`}
                            colon={false}
                            validateFirst
                            rules={[
                              { required: true, type: 'integer', min: 0, message: utils.intl('请输入整数') },
                              {
                                validator: (_, value) => {
                                  const formValues = { ...formValue, ...getFieldsValue() };
                                  const values = (Object.keys(formValues).reduce((pre, key) => {
                                    const soh = Number(key.split('_')[1]);
                                    if(!pre.find(item => item.soh === soh)) pre.push({ soh, cycles: formValues[key] });
                                    return pre;
                                  }, [max, min]) as any[]).sort((a, b) => a.soh - b.soh);
                                  const index = values.findIndex(i => i.soh === v.soh);
                                  const maxCycles = values[index - 1]?.cycles ?? Number.MAX_SAFE_INTEGER;
                                  const minCycles = values[index + 1]?.cycles ?? 0;
                                  // console.log('values', values)

                                  // const vs = [];
                                  // for(let i = 0; i < values.length; i++){
                                  //   if(!vs.find(item => item.soh === values[i].soh)){
                                  //     vs.push(values[i]);
                                  //   }
                                  // }

                                  if (value >= maxCycles || value <= minCycles) {
                                    return Promise.reject(new Error(maxCycles === Infinity || values.length < 3 ? 
                                      utils.intl(`请输入大于{0}的整数`, minCycles)
                                      : utils.intl(`请输入不小于0且不大于{0}的整数`, minCycles, maxCycles)
                                      ))
                                  }
                                  return Promise.resolve();
                                },
                              }
                            ]}
                          >
                            <CustomInputNumber
                              addonAfter={utils.intl('次')}
                              style={{ width: 212 }}
                              placeholder={utils.intl('请输入')}

                            />
                          </FormItem>
                        )
                      }
                    }
                  </FormItem>
                </Form>
              </div>
            </div>
          }>
            <div className="customSlider-point"
              title={`SoH: ${v.soh}%；${utils.intl('循环次数')}: ${v.cycles ?? '--'}`}
              style={{ left: lineLeft + Math.round((max.soh - v.soh) * lineWidth / (max.soh - min.soh)) - 6 }}
              onClick={e => {
                e.stopPropagation();
                setVisibleIndex(visibleIndex !== null ? null : v.soh);
              }}
            ></div>
          </Tooltip>

        ))
      }
    </div>
  )
}

export default CustomSlider