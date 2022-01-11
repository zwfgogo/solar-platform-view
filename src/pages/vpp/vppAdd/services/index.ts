import createServices from '../../../../util/createServices';

const services = {
    getList: function (params) {
        return createServices<{  }>(
            "get",
            "/vpp/site",
            params
        );
    },
    getAddList: function (params) {
        return createServices<{  }>(
            "get",
            "/vpp/site",
            params
        );
    },
    addList: function (params) {
        return createServices<{  }>(
            "post",
            "/vpp/bind-site",
            params
        );
    },
    deleteList: function (params) {
        return createServices<{  }>(
            "delete",
            "/vpp/bind-site",
            params
        );
    },
    getSelect: function (params) {
        return createServices<{  }>(
            "get",
            "/vpp/enums/station-status",
            params
        );
    },
};

export default services;
