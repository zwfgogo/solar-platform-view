import React from 'react'
import Flow from '../../public/components/Flow'

import index from './index'
import pricePower from './pricePower/index'
import priceUser from './priceUser/priceUserList/PriceUserList'
import priceUserDetail from './priceUser/priceDetail/index'
import priceUserEdit from './priceUser/priceEdit/index'

const Price = ({pageId}) => {
    return (
    <>
        <Flow pageName="index" component={index} default={true} pageId={pageId}/>
        <Flow pageName="pricePower" component={pricePower}/>
        <Flow pageName="priceUser" component={priceUser}/>
        <Flow pageName="priceUserDetail" component={priceUserDetail}/>
        <Flow pageName="priceUserEdit" component={priceUserEdit}/>
    </>
  )
}

export default Price
