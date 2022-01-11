import createServices from "../../util/createServices";

const services = {
    getList: function (params) {
        return createServices<{}>(
            "get",
            "/operation-on-duty/defect-records",
            params
        );
    },
    addBug: function (params) {
        return createServices<{}>(
            "post",
            "/operation-on-duty/defect-records",
            params
        );
    },
    updateBug: function (params) {
        return createServices<{}>(
            "put",
            "/operation-on-duty/defect-records/:id",
            params
        );
    },
    getDetail: function (params) {
        return createServices<{}>(
            "get",
            "/operation-on-duty/defect-records/:id",
            params
        );
    },
    deleteList: function (params) {
        return createServices<{}>(
            "delete",
            "/operation-on-duty/defect-records/:id",
            params
        );
    },
};

export default services;
