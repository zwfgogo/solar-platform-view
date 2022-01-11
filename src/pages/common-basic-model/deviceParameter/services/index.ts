import createServices from '../../../../util/createServices';

const services = {
    getTree: function (params) {
        return createServices<{}>(
            "get",
            "/basic-data-management/business-models/tree/:type",
            params
        );
    },
    getList: function (params) {
        return createServices<{}>(
            "get",
            "/basic-data-management/business-models/technical-params",
            params
        );
    },
    addVersion: function (params) {
        return createServices<{}>(
            "post",
            "/basic-data-management/business-models/version",
            params
        );
    },
    getDefaultList: function (params) {
        return createServices<{}>(
            "get",
            "/basic-data-management/business-models/technical-params/draft",
            params
        );
    },
    deleteList: function (params) {
        return createServices<{}>(
            "delete",
            "/basic-data-management/business-models/technical-params/:id",
            params
        );
    },
    addList: function (params) {
        return createServices<{}>(
            "post",
            "/basic-data-management/business-models/technical-params",
            params
        );
    },
    editList: function (params) {
        return createServices<{}>(
            "put",
            "/basic-data-management/business-models/technical-params/:id",
            params
        );
    },
    moveRow: function (params) {
        return createServices<{}>(
            "put",
            "/basic-data-management/business-models/technical-params/update/batch",
            params
        );
    },
};

export default services;
