import React from "react";
import Flow from "../../public/components/Flow";
import Index from "./index";
import DeviceInfo from "./deviceInfo";
import CollectingDevice from "./collectingDevice";
import ChangeHistory from "./changeHistory";

const IotEntry = ({ pageId }) => {
  return (
    <>
      <Flow
        pageName="IotIndex"
        component={Index}
        default={true}
        pageId={pageId}
      />
      <Flow pageName="DeviceInfo" component={DeviceInfo} />
      <Flow pageName="CollectingDevice" component={CollectingDevice} />
      <Flow pageName="ChangeHistory" component={ChangeHistory} />
    </>
  );
};

export default IotEntry;
