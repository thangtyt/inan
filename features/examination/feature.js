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
        title: __("m_examination_feature_backend_menu_title"),
        icon: 'fa fa-book',
        menus: [
            {
                permission: ['q-a'],
                title: 'Q&A',
                link: '/q-a'
            },
            {
                permission: ['subject'],
                title: 'Subject',
                link: '/subject'
            },
            {
                permission: ['section'],
                title: "Section",
                link: '/section'
            },
            {
                permission: ['exam'],
                title: "Exam",
                link: '/exam'
            }
        ]
    }
};