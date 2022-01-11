import React, { useEffect, useState } from 'react'
import classnames from 'classnames'
import { Radio } from 'wanke-gui'
import TabSelect from "../TabSelect";
import utils from '../../public/js/utils';
import { Select, Dropdown, Button, DownOutlined } from 'wanke-gui'
import { Menu } from 'antd'
import {
    CaretDownOutlined
} from 'wanke-icon'
import './card.less'
export interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children?: any,
    icon?: any,
    title?: string,
    radio?: boolean,
    radioChange?: (params: any) => void;
    radioDay?: boolean,
    selectChange?: (params: any) => void;
    selectValue?: string;
    selectArr?: any;
    select?: boolean;
    zselectValue?: string;
    selectDay?: boolean;
    zselectChangeNow?: (params: any) => void;
    showBorder?: boolean;
}

const tabList = [
    {
        key: "month",
        name: utils.intl("近12月"),
        value: "month"
    },
    {
        key: "day",
        name: utils.intl("近30天"),
        value: "day"
    },
    {
        key: "detail",
        name: utils.intl("今日"),
        value: "detail"
    }
]

const tabList1 = [
    {
        key: "day",
        name: utils.intl("近7天"),
        value: "day"
    },
    {
        key: "detail",
        name: utils.intl("今日"),
        value: "detail"
    }
]

const zselect = [
    {
        key: "month",
        name: utils.intl("近12月"),
        value: "month"
    },
    {
        key: "day",
        name: utils.intl("近30天"),
        value: "day"
    },
    {
        key: "detail",
        name: utils.intl("今日"),
        value: "detail"
    }
]

const zselectDay = [
    {
        key: "day",
        name: utils.intl("近7天"),
        value: "day"
    },
    {
        key: "detail",
        name: utils.intl("今日"),
        value: "detail"
    }
]
export default function whiteCard(props: Props) {
    const { showBorder, radioChange, children, title, icon, radio, className = '', radioDay, selectChange,
        selectValue, selectDay, select, zselectValue, zselectChangeNow,
        selectArr, ...otherProps
    } = props;
    //   let Icon: any = icon
    const [radioValue, setRadioValue] = useState(tabList[2].value)
    const radioChangeNow = (o) => {
        setRadioValue(o.value);
        if (radioChange) {
            radioChange(o.value);
        }
    }

    const [radioDayValue, setRadioDayValue] = useState(tabList1[1].value)
    const radiooDayChangeNow = (o) => {
        setRadioDayValue(o.value);
        if (radioChange) {
            radioChange(o.value);
        }
    }

    return (
        <div className={className + " border-radius-4 white-card"} {...otherProps}>
            {
                title && title !== ''
                    ? (
                        <div className={"card-header"}>
                            <span style={{ paddingLeft: showBorder ? 20 : 0 }}>
                                {/* <Icon style={{ width: 20, color: "#3d7eff", marginRight: 10 }} /> */}
                                <span className={"title"} style={{ paddingLeft: showBorder ? 8 : 20, boxShadow: showBorder ? '-2px 0px 0px #3d7eff' : '' }}>{title}</span>
                            </span>
                            {selectArr ?
                                <div className={"card-select"}>
                                    <Select value={selectValue} onChange={selectChange} dataSource={selectArr}
                                        label={''} style={{ minWidth: '163px' }} />
                                </div>
                                : ''}
                        </div>
                    )
                    : null
            }
            {radio ?
                <div className={"card-radio"}>
                    <TabSelect list={tabList} onClick={radioChangeNow} value={radioValue} />
                </div>
                : ''}
            {radioDay ?
                <div className={"card-radio"}>
                    <TabSelect list={tabList1} onClick={radiooDayChangeNow} value={radioDayValue} />
                </div>
                : ''}
            {selectDay ?
                <div className={"card-zselect"}>
                    <Select value={zselectValue} onChange={zselectChangeNow} dataSource={zselectDay}
                        label={''} style={{ minWidth: '40px' }} />
                </div>
                : ''
            }
            {select ?
                <div className={"card-zselect"}>
                    <Select value={zselectValue} onChange={zselectChangeNow} dataSource={zselect}
                        label={''} style={{ minWidth: '40px' }} />
                </div>
                : ''
            }
            <div className={"content"}>
                {props.children}
            </div>
        </div>
    );
}