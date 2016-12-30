/**
 * Created by thangnv on 11/3/16.
 */
module.exports = {
    title: 'Chức năng quản lý đề thi',
    author: 'Thangnv',
    version: '0.0.1',
    description: 'Thêm mới sửa xóa đề thi',
    permissions: [
        {
            name: 'all',
            title: 'Có quyền quán lý toàn bộ đề thi'
        },
        {
            name: 'create',
            title: 'Thêm mới đề thi'
        },
        {
            name: 'edit',
            title: 'Chỉnh sửa đề thi'
        },
        {
            name: 'delete',
            title: 'Xóa đề thi'
        },
        {
            name: 'view',
            title: 'Xem đề thi'
        },
        {
            name: 'active',
            title: 'Duyệt đề thi'
        }
    ],
    backend_menu: {
        title: "Đề thi",
        icon: 'fa fa-university',
        group: 'user_features',
        menus: [
            {
                permission: ['all','create'],
                title: 'Tạo đề thủ công',
                link: '/create-manual'
            },
            {
                permission: ['create','all','edit','view','delete','active'],
                title: 'Danh sách đề thi',
                link: '/'
            },
            {
                permission: ['create','all','edit','view','delete','active'],
                title: 'Bộ đề thi',
                link: '/gift'
            }
        ]
    }
};