import React from "react";
import Flow from "../../public/components/Flow";
import Index from "./index";

const RemindEntry = ({ pageId }) => {
  return (
    <>
      <Flow
        pageName="remind"
        component={Index}
        default={true}
        pageId={pageId}
      />
    </>
  );
};
export default RemindEntry;
