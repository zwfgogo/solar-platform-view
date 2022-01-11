import createServices from '../../util/createServices';

const services = {
    getList: function (params) {
        return createServices<{}>(
            "get",
            "/api-vpp/vpp",
            params
        );
    },
    getVerList: function (params) {
        return createServices<{}>(
            "get",
            "/basic-data-management/business-models/version",
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
    publish: function (params) {
        return createServices<{}>(
            "post",
            "/basic-data-management/business-models/version/publish",
            params
        );
    },
    getModelAttributeTypes: function (params) {
        return createServices<{}>(
            "get",
            "/enums/model-attribute-types",
            params
        );
    },
};

export default services;
