import createServices from '../../../../util/createServices';

const services = {
    getList: function (params) {
        return createServices<{}>(
            "get",
            "/api/basic-data-management/business-models/energy-unit",
            params
        );
    },
    deleteList: function (params) {
        return createServices<{}>(
            "delete",
            "/api/basic-data-management/business-models/energy-unit/:id",
            params
        );
    },
    getTypeId: function (params) {
        return createServices<{}>(
            "get",
            "/api/basic-data-management/business-models/energy-unit/new-name",
            params
        );
    },
    addList: function (params) {
        return createServices<{}>(
            "post",
            "/api/basic-data-management/business-models/energy-unit",
            params
        );
    },
    editList: function (params) {
        return createServices<{  }>(
            "put",
            "/api/basic-data-management/business-models/energy-unit/:id",
            params
        );
    },
    getSelect: function (params) {
        return createServices<{}>(
            "get",
            "/api/enums",
            params
        );
    },
};

export default services;
