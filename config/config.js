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
    subjects: [
        {
            name: "Toán",
            icon: {
                default: '',
                hover: ''
            }
        },
        {
            name: "Hóa Học",
            icon: {
                default: '',
                hover: ''
            }
        },
        {
            name: "Sinh học",
            icon: {
                default: '',
                hover: ''
            }
        },
        {
            name: "Văn Học",
            icon: {
                default: '',
                hover: ''
            }
        },
        {
            name: "Ngoại Ngữ",
            icon: {
                default: '',
                hover: ''
            }
        },
        {
            name: "Giáo dục công dân",
            icon: {
                default: '',
                hover: ''
            }
        },
        {
            name: "Địa lý",
            icon: {
                default: '',
                hover: ''
            }
        },
        {
            name: "Vật Lý",
            icon: {
                default: '',
                hover: ''
            }
        },
        {
            name: "Lịch sử",
            icon: {
                default: '',
                hover: ''
            }
        }
    ],
    userInfo: {
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
                },
                {
                    code: '004',
                    name: 'Back Khoa'

                },
                {
                    code: '005',
                    name: 'Tu Nhien'
                },
                {
                    code: '006',
                    name: 'Ngoai Thuong'
                }
            ]
        ,
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
                ]
            },
            {
                code: "051",
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
                ]
            }
        ]
    }
};