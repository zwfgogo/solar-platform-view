import React from "react";
import Flow from "../../public/components/Flow";
import Benefit from "./index";
import Detail from "./detail";

const BenefitEntry = ({ pageId }) => {
  return (
    <>
      <Flow
        pageName="benefit"
        component={Benefit}
        default={true}
        pageId={pageId}
      />
      {/* <Flow pageName="benefitDetail" component={Detail} /> */}
    </>
  );
};
export default BenefitEntry;
