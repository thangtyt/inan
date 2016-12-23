/**
 * Created by thangtyt on 12/22/16.
 */
module.exports = {
    title: "Gift module",
    author: 'Thangnv',
    version: '0.0.1',
    description: "Quản lý các mã quà tặng của đề thi",
    permissions: [
        {
            name: 'all',
            title: 'Có quyền quản lý toàn bộ các chức năng của quà tặng (thêm mới, sửa, xóa)'
        },
        {
            name: 'create',
            title: 'Có quyền thêm mới các phần quà tặng'
        },
        {
            name: 'delete',
            title: 'Có quyền xóa các phần quà tặng'
        },
        {
            name: 'edit',
            title: 'Có quyền thay đổi cập nhật các phần quà tặng'
        },
        {
            name: 'view',
            title: 'Có quyền xem dang sách quà tặng'
        }
    ],
    backend_menu: {
        title: "Phần quà tặng",
        icon: 'fa fa-gift',
        menus: [
            {
                permission: ['all','create'],
                title: 'Thêm mới',
                link: '/create'
            },
            {
                permission: ['all','view'],
                title: 'Danh sách',
                link: '/'
            }
        ]
    }
};