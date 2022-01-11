import createServices from '../../../../util/createServices';

const services = {
    getVideo: function (params) {
        return createServices<{ firmId: string }>(
            'get',
            '/api/on-line-monitoring/monitor',
            params
        );
    },
};

export default services;
