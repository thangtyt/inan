/**
 * Created by thangnv on 11/3/16.
 */
module.exports = {
    title: 'Quản lý môn thi',
    author: 'Thangnv',
    version: '0.0.1',
    description: 'Chức năng quản lý môn thi của hệ thống thi',
    permissions: [
        {
            name: 'all',
            title: 'Tất cả các quyền'
        },
        {
            name: 'create',
            title: 'Tạo mới môn thi'
        },
        {
            name: 'edit',
            title: 'Chỉnh sửa môn thi'
        },
        {
            name: 'view',
            title: 'Xem môn thi'
        },
        {
            name: 'delete',
            title: 'Xóa môn thi'
        },
        {
            name: 'active',
            title: 'Duyệt môn thi'
        }
    ],
    backend_menu: {
        title: "Môn thi",
        icon: 'fa fa-book',
        group: 'user_features',
        menus: [
            {
                permission: ['all','create'],
                title: 'Tạo mới môn học',
                link: '/create'
            },
            {
                permission: ['create','all','edit','view','delete','active'],
                title: 'Danh sách môn học',
                link: '/'
            }
        ]
    }
};