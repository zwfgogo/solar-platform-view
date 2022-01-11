import React from "react";
import Flow from "../../public/components/Flow";
import PowerQuality from "./PowerQuality";
import EnergyUnitDetail from "./EnergyUnitDetail";
import Detail from "./Detail";

const PowerQualityEntry = ({ pageId }) => {
  console.log(pageId);
  return (
    <>
      <Flow
        pageName="powerQuality"
        component={PowerQuality}
        default={true}
        pageId={pageId}
      />
      <Flow pageName="energyUnitDetail" component={EnergyUnitDetail} />
      <Flow pageName="powerQualityDetail" component={Detail} />
    </>
  );
};
export default PowerQualityEntry;
