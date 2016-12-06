'use strict';

module.exports = {
    subjects: [
        {
            name: "Toán",
            id: "1",
            icon: {
                default: '/img/icon/math.png',
                hover: '/img/icon/math-hover.png'
            }
        },
        {
            name: "Hóa Học",
            id: "2",
            icon: {
                default: '/img/icon/chemistry.png',
                hover: '/img/icon/chemistry-hover.png'
            }
        },
        {
            name: "Sinh học",
            id: "3",
            icon: {
                default: '/img/icon/biology.png',
                hover: '/img/icon/biology-hover.png'
            }
        },
        {
            name: "Văn Học",
            id: "4",
            icon: {
                default: '/img/icon/literature.png',
                hover: '/img/icon/literature-hover.png'
            }
        },
        {
            name: "Ngoại Ngữ",
            id: "5",
            icon: {
                default: '/img/icon/language.png',
                hover: '/img/icon/language-hover.png'
            }
        },
        {
            name: "Giáo dục công dân",
            id: "6",
            icon: {
                default: '/img/icon/civics.png',
                hover: '/img/icon/civics-hover.png'
            }
        },
        {
            name: "Địa lý",
            id: "7",
            icon: {
                default: '/img/icon/geography.png',
                hover: '/img/icon/geography-hover.png'
            }
        },
        {
            name: "Vật Lý",
            id: "8",
            icon: {
                default: '/img/icon/physics.png',
                hover: '/img/icon/physics-hover.png'
            }
        },
        {
            name: "Lịch sử",
            id: "9",
            icon: {
                default: '/img/icon/history.png',
                hover: '/img/icon/history-hover.png'
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