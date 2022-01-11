import createServices from '../../../../util/createServices';

const services = {
    getList: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            "/vpp",
            params
        );
    },
    deleteList: function (params) {
        return createServices<{  }>(
            "delete",
            "/vpp/:id",
            params
        );
    },
    addList: function (params) {
        return createServices<{  }>(
            "post",
            "/vpp",
            params
        );
    },
    editList: function (params) {
        return createServices<{  }>(
            "put",
            "/vpp",
            params
        );
    },
};

export default services;
