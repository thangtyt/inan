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
    userInfo: {
        city: [
            {
                code: "043",
                name: "Ha Noi",
                district: [{
                    code: '001',
                    name: 'Thanh Xuan'
                },
                    {
                        code: '002',
                        name: 'Dong da'
                    },
                    {
                        code: '003',
                        name: 'Hoan kiem'
                    }
                ],
                school: [
                    {
                        code: '001',
                        name: 'Tran Hung Dao'
                    },
                    {
                        code: '002',
                        name: 'Dong da'
                    },
                    {
                        code: '003',
                        name: 'Hai Ba Trung'
                    }
                ],
                uni: [

                    {
                        code: '001',
                        name: 'Back Khoa'

                    },
                    {
                        code: '002',
                        name: 'Tu Nhien'
                    },
                    {
                        code: '003',
                        name: 'Ngoai Thuong'
                    }
                ]
            },
            {
                code: "043",
                name: "HCM",
                district: [
                    {
                        code: '001',
                        name: 'Phu Nhuan'
                    },
                    {
                        code: '002',
                        name: 'Quan 1'
                    },
                    {
                        code: '003',
                        name: 'Quan 2'
                    }
                ],
                school: [
                    {
                        code: '001',
                        name: 'Tran Hung Dao TP HCM'
                    },
                    {
                        code: '002',
                        name: 'Dong da TP HCM'
                    },
                    {
                        code: '003',
                        name: 'Hai Ba Trung TP HCM'
                    }
                ],
                uni: [
                    {
                        code: '001',
                        name: 'Back Khoa HCM'
                    },
                    {
                        code: '002',
                        name: 'Tu Nhien HCM'
                    },
                    {
                        code: '003',
                        name: 'Ngoai Thuong HCM'
                    }
                ]
            }
        ]
    }
};