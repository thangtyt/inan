/**
 * Created by thangnv on 11/3/16.
 */
module.exports = {
    title: 'Chức năng tạo dạng câu hỏi',
    author: 'Thangnv',
    version: '0.0.1',
    description: 'Chức năng thêm mới sửa xóa các dạng câu hỏi',
    permissions: [
        {
            name: 'all',
            title: 'Tất cả các quyền'
        },
        {
            name: 'create',
            title: 'Tạo mới dạng câu hỏi'
        },
        {
            name: 'edit',
            title: 'Chỉnh sửa dạng câu hỏi'
        },
        {
            name: 'view',
            title: 'Xem các dạng câu hỏi'
        },
        {
            name: 'delete',
            title: 'Xóa các dạng câu hỏi'
        }
    ],
    backend_menu: {
        title: "Dạng câu hỏi (section)",
        icon: 'fa fa-clone',
        group: 'user',
        menus: [
            {
                permission: ['create','all','edit','view','delete'],
                title: 'Thêm mới',
                link: '/create'
            },
            {
                permission: ['create','all','edit','view','delete'],
                title: 'Danh sách',
                link: '/'
            }
        ]
    }
};