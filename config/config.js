'use strict';

module.exports = {
    app: {
        title: 'TKBooks',
        description: 'Hệ thống thi thử TKBOOKS',
        keywords: 'exams ',
        logo: '',
        icon: ''
    },
    langPath: '/lang',
    language: 'en_US',
    uploadPath: '/fileman/uploads',
    long_stack: false,
    port: process.env.PORT || 8000,
    admin_prefix: 'admin',
    ArrowHelper: '/library/js_utilities/',
    token : {
        timeExpires: 3600000
    }
};