/**
 * Created by thangnv on 11/3/16.
 */
module.exports = {
    title: 'Chức năng tạo câu hỏi',
    author: 'Thangnv',
    version: '0.0.1',
    description: 'Chức năng thêm mới sửa xóa câu hỏi',
    permissions: [
        {
            name: 'all',
            title: 'Tất cả các quyền'
        },
        {
            name: 'create',
            title: 'Tạo mới câu hỏi'
        },
        {
            name: 'edit',
            title: 'Chỉnh sửa câu hỏi'
        },
        {
            name: 'view',
            title: 'Xem câu hỏi'
        },
        {
            name: 'delete',
            title: 'Xóa câu hỏi'
        },
        {
            name: 'active',
            title: 'Duyệt câu hỏi'
        }
    ],
    backend_menu: {
        title: "Câu hỏi & câu trả lời",
        icon: 'fa fa-question-circle',
        group: 'user',
        menus: [
            {
                permission: ['create','all','edit','view','delete','active'],
                title: 'Trắc nghiệm',
                menus: [
                    {
                        permission: ['create','all'],
                        title: 'Tạo mới',
                        link: '/choice/create'
                    },
                    {
                        permission: ['create','all','edit','view','delete','active'],
                        title: 'Danh sách',
                        link: '/choice'
                    },
                    {
                        pẻmission: ['all','active'],
                        title: 'Câu trả lời lỗi',
                        link: '/report'
                    }
                ],
                link: '#'
            }//,
            //{
            //    permission: ['view','active','all'],
            //    title: 'Tự luận',
            //    menus: [
            //        {
            //            permission: ['create','all'],
            //            title: 'Tạo mới',
            //            link: '/choice/create'
            //        },
            //        {
            //            permission: ['create','all'],
            //            title: 'Danh sách',
            //            link: '/choice'
            //        },
            //    ],
            //    link: '#'
            //}
        ]
    }
};