import React, { useEffect, useLayoutEffect } from 'react';
import { useLocation, connect } from 'umi';
import { getAction } from '../pages/umi.helper';
import { crumbsNS, globalNS } from '../pages/constants'
import { getPageId } from '../components/Page'

const RouterHelperInner = (props) => {
  const location = useLocation()
  useEffect(() => {
    let parts = location.pathname.split('/')
    if (parts[1]) {
      let openKeys = ['/' + parts[1]]
      props.dispatch(getAction(globalNS, 'updateState', { openKeys }))
    }
  
    let pageId = getPageId()
    if (parts.length == 3) {
      props.dispatch(getAction(crumbsNS, 'addCrumb', { pageId, url: '/' + parts[1] }))
    }
    if (location.pathname != '/index') {
      pageId = getPageId()
      props.dispatch(getAction(crumbsNS, 'addCrumb', { pageId, url: location.pathname }))
    }

    return () => {
      props.dispatch(getAction(crumbsNS, 'clear'))
    };
  }, [location.pathname]);
  let match = props.crumbs?.find(item => item.url == location.pathname)

  return (
    <>
      {React.cloneElement(props.children, { pageId: match ? match.pageId : null })}
    </>
  );
};

const RouterHelper = connect<any, any, any, any>(state => {
  return {
    crumbs: state.crumbs.crumbs
  }
})(RouterHelperInner)

export default RouterHelper
