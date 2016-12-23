/**
 * Created by thangnv on 11/3/16.
 */
module.exports = {
    title: __("m_examination_feature_title"),
    author: 'Thangnv',
    version: '0.0.1',
    description: __("m_examination_feature_desc"),
    permissions: [
        {
            name: 'q-a',
            title: 'Manager of Q&A feature'
        },
        {
            name: 'subject',
            title: 'Manager of Subject feature'
        },
        {
            name: 'exam',
            title: 'Manager of Exam feature'
        },
        {
            name: 'section',
            title: 'Manager of Section feature'
        }
    ],
    backend_menu: {
        title: "Thi cử",
        icon: 'fa fa-university',
        menus: [
            {
                permission: ['q-a'],
                title: 'Câu hỏi & câu trả lời',
                link: '/q-a'
            },
            {
                permission: ['subject'],
                title: 'Các môn học',
                link: '/subject'
            },
            {
                permission: ['section'],
                title: "Mục câu hỏi (section)",
                link: '/section'
            },
            {
                permission: ['exam'],
                title: "Đề thi",
                link: '/exam'
            }
        ]
    }
};