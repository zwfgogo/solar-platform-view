import React from "react";
import Flow from "../../../public/components/Flow";
import Index from './index'
import Detail from './detail/index'

const Entry = ({ pageId }) => {
  return (
    <>
      <Flow
        pageName="index"
        component={Index}
        default={true}
        pageId={pageId}
      />
      <Flow pageName="detail" component={Detail} />
    </>
  );
};
export default Entry;
