'use strict';

module.exports = {
    title: "Bài viết",
    author: 'Techmaster',
    version: '0.1.0',
    description: __('m_blog_backend_module_desc'),
    permissions: [
        // Post
        {
            name: 'post_manage',
            title: 'Quản trị các bài viết của mình'
        },
        {
            name: 'post_manage_all',
            title: 'Quản trị tất cả các bài viết'
        },
        // Page
        {
            name: 'page_manage',
            title: 'Quản trị các bài pages của mình'
        },
        {
            name: 'page_manage_all',
            title: 'Quản trị tất các bài page'
        },
        // Category
        {
            name: 'category_manage',
            title: 'Quản trị phần danh mục'
        }
    ],
    backend_menu: {
        title: __('m_blog_backend_module_menu_backend_menu_title'),
        icon: 'fa fa-newspaper-o',
        menus: [
            {
                permission: ['post_manage', 'post_manage_all'],
                title: __('m_blog_backend_module_menu_backend_menu_post_index'),
                link: '/posts'
            },
            {
                permission: ['page_manage', 'page_manage_all'],
                title: __('m_blog_backend_module_menu_backend_menu_page_index'),
                link: '/pages'
            },
            {
                permission: ['category_manage', 'category_manage_all'],
                title: "Categories",
                link: '/categories'
            }
        ]
    },
    // Define this module has link to shows on menu
    add_link_menu: {
        posts: {
            title: 'Link Posts',
            route: '/blog/post/link/menu',
            list: '/blog/posts',
            search: true
        },
        pages: {
            title: 'Link Pages',
            route: '/blog/page/link/menu',
            list: '/blog/pages',
            search: true
        }
    }

};

