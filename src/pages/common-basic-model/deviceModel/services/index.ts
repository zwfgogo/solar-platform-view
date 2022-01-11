import createServices from '../../../../util/createServices';

const services = {
    getList: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/basic-data-management/business-models/device-type",
            params
        );
    },
    deleteList: function (params) {
        return createServices<{}>(
            "delete",
            "/basic-data-management/business-models/device-type/:id",
            params
        );
    },
    getTypeId: function (params) {
        return createServices<{}>(
            "get",
            "/basic-data-management/business-models/device-type/new-name",
            params
        );
    },
    addList: function (params) {
        return createServices<{}>(
            "post",
            "/basic-data-management/business-models/device-type",
            params
        );
    },
    editList: function (params) {
        return createServices<{}>(
            "put",
            "/basic-data-management/business-models/device-type/:id",
            params
        );
    },
    getSelect: function (params) {
        return createServices<{}>(
            "get",
            "/enums",
            params
        );
    },
    getinputOutputTypes: function (params) {
        return createServices<{}>(
            "get",
            "/enums/input-output-types",
            params
        );
    },
};

export default services;
