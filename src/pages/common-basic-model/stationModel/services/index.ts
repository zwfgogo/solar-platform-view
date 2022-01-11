import createServices from '../../../../util/createServices';

const services = {
    getList: function (params) {
        return createServices<{}>(
            "get",
            "/basic-data-management/business-models/station",
            params
        );
    },
    deleteList: function (params) {
        return createServices<{  }>(
            "delete",
            "/basic-data-management/business-models/station/:id",
            params
        );
    },
    getTypeId: function (params) {
        return createServices<{}>(
            "get",
            "/basic-data-management/business-models/station/new-name",
            params
        );
    },
    addList: function (params) {
        return createServices<{  }>(
            "post",
            "/basic-data-management/business-models/station",
            params
        );
    },
    editList: function (params) {
        return createServices<{  }>(
            "put",
            "/basic-data-management/business-models/station/:id",
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
};

export default services;
