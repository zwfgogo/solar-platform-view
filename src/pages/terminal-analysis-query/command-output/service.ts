import createServices from '../../../util/createServices';

const services = {
    getCrews: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            '/api-terminal/enums/crews',
            params
        );
    },
    getOutAnaysis: function (params) {
        return createServices<{ name: string; password: string }>(
            "get",
            '/api-terminal/analysis-query/analysis',
            params
        );
    },
};

export default services;
