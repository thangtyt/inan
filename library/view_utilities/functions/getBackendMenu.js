"use strict";

let _ = require('arrowjs')._;
let logger = require('arrowjs').logger;

module.exports = {
    name: "getBackendMenu",
    async: true,
    handler: function (currentUrl, currPermission, callback) {
        let app = this;
        let permissions = currPermission || {feature: ''};
        let feature_data = app.featureManager.getAttribute();
        app.redisClient.getAsync(app.getConfig("redis_prefix") + app.getConfig("redis_key.backend_menus"))
            .then(function (menu) {
                let htmlMenu = '<section class="sidebar">' +
                    '<ul class="sidebar-menu">';
                if (menu) {
                    menu = JSON.parse(menu);
                    //console.log(JSON.stringify(menu,2,2));
                    //add item when update new feature
                    _.map(permissions.feature, function (val,key) {
                        if (menu.sorting.indexOf(key) == -1 ){
                            if( _.has(feature_data[key],'backend_menu') ){
                                let flag = false;
                                _.map(feature_data[key].backend_menu.menus, function (v, k) {
                                    if(isDisplay(v.permission,permissions.feature[key])){
                                        flag = true;
                                    }
                                });
                                if( flag ){
                                    menu.sorting.push(key);
                                    if(_.has(feature_data[key].backend_menu,'group'))
                                        menu.default.features[key] = feature_data[key].backend_menu;
                                    else
                                        menu.user.features[key] = feature_data[key].backend_menu;
                                }
                            }
                        }
                    });
                    //remove item when user remove feature
                    _.map(menu.sorting, function (key) {
                        if (!_.has(feature_data, key) ){
                            _.remove(menu.sorting, function (ele) {
                                return ele === key;
                            });
                            delete menu.default.features[key];
                        }
                    })
                } else {
                    menu = {};
                    menu.sorting = [];
                    menu.default = {
                        title: " CHỨC NĂNG HỆ THỐNG",
                        features: {}
                    };
                    menu.user = {
                        title: " CHỨC NĂNG NGƯỜI DÙNG",
                        features: {}
                    };
                    _.map(feature_data, function (val, key) {
                        if (_.has(val, 'backend_menu') && ( !_.has(val.backend_menu,'group') || val.backend_menu.group == 'system' ) )  {
                            if( _.has(permissions.feature,val.name) ){
                                menu.sorting.push(key);
                                menu.default.features[key] = val.backend_menu;
                            }
                        }else{
                            if( _.has(permissions.feature,val.name) ){
                                menu.sorting.push(key);
                                menu.user.features[key] = val.backend_menu;
                            }
                        }
                    })
                }

                htmlMenu += addMenuItem(menu,permissions,'user',currentUrl,app);
                htmlMenu += addMenuItem(menu,permissions,'default',currentUrl,app);

                htmlMenu += '</ul>' +
                '   </section>';
                //set menu json variables to redis
                app.redisClient.setAsync(app.getConfig("redis_prefix") + app.getConfig("redis_key.backend_menus"), JSON.stringify(menu)).then(function () {
                    //return htmlMenu to display on sidebar
                    callback(null, htmlMenu)
                });

            }).catch(function (err) {
                callback(err);
            });
    }
};

/**
 * Sort menu by "sort" property
 * @param {object} menus
 * @returns {array}
 */
function sortMenus(menus) {
    let sortable = [];

    // Add menus to array
    for (let m in menus) {
        if (menus.hasOwnProperty(m)) {
            sortable.push({menu: m, sort: menus[m].sort});
        }
    }

    // Sort menu array
    sortable.sort(function (a, b) {
        if (a.sort < b.sort)
            return -1;
        if (a.sort > b.sort)
            return 1;
        return 0;
    });

    return sortable;
}

/*
 * Check permissions of user with permissions of feature
 * return true if user has at least one permission else return false
 * @permissions :  permissions(permissions of feature) of user
 * @permissionsOfFeature: all permissions of feature is defined in feature.js (in backend_menus)
 * */
function isDisplay(permissions, permissionsOfFeature) {
    let result = false;
    if (!_.isArray(permissions)) permissions = [permissions];
    _.map(permissions, function (val) {
        if (_.findIndex(permissionsOfFeature, 'name', val) > -1)
            result = true;
    });

    return result;
}

/**
 * Add active class to current menu
 * @param {string} currentURL - Current URL
 * @param {string} feature - Feature
 * @param {string} returnStr - String to return (eg: active)
 * @param {integer} type - check active for parent or item
 * @param {string} item - string for compare current item
 */
function active_menu(currentURL, feature, returnStr, type, item) {
    let currentFeature = currentURL.split('/')[2];
    let currentItem = currentURL.split('/').pop();
    let result = "";
    if (currentFeature == feature) {
        if (type === 0) {
            result = returnStr;
        }
        else if (type === 1) {
            if (currentItem == item.split("/").pop()) {
                result = returnStr;
            } else {
            }
        }
    }
    return result;
}
function addMenuItem(menu,permissions,group,currentUrl,app){
    let htmlMenu = '';
    htmlMenu += '<li class="header">' + menu[group]['title'] + '</li>';
    _.map(menu.sorting, function (key) {
        // Display all features have key 'backend_menus' in feature.js

        //todo: khóa chức năng tạm thời
        if ( ['blog', 'configuration', 'menu'].indexOf(key) == -1 && _.has(menu[group]['features'], key) && _.has(menu[group]['features'][key], 'menus') && !_.isUndefined(permissions["feature"][key])) {
            htmlMenu += '<li class="treeview ' + active_menu(currentUrl, key, "active", 0, []) + '">';
            // Display item menu of features
            if (_.isArray(menu[group]['features'][key]['menus'])) {
                htmlMenu += '<a href="#">';
                htmlMenu += '<i class="' + menu[group]['features'][key].icon + '"></i> <span>' + menu[group]['features'][key].title +
                            '</span> <i class="fa fa-angle-left pull-right"></i>';
                htmlMenu += '</a>';
                htmlMenu += '<ul class="treeview-menu" style="display: none;">';

                _.map(menu[group]['features'][key]['menus'], function (val) {
                    if (isDisplay(val.permission, permissions["feature"][key]) && _.has(val,'menus') ) {
                        htmlMenu += '<li>';
                            htmlMenu += '<a href="#">';
                                htmlMenu += '<i class="fa fa-circle-o"></i> ';
                                htmlMenu += '<span class="pull-right-container">';
                                htmlMenu +=  val.title;
                                htmlMenu += '</span>';
                                htmlMenu += '<i class="fa fa-angle-left pull-right"></i>';
                            htmlMenu += '</a>';

                                htmlMenu += '<ul class="treeview-menu" style="display: none;">';
                                    _.map(val.menus, function (_items) {
                                        htmlMenu += '<li>';
                                            htmlMenu += '<a href="/' + app.getConfig("admin_prefix") + '/' + key + _items.link + '">';
                                            htmlMenu += '<i class="fa fa-circle-o"></i> ' + _items.title;
                                            htmlMenu += '</a>';
                                        htmlMenu += '</li>';
                                    });
                                htmlMenu += '</ul>';
                        htmlMenu += '</li>';
                    }else if (isDisplay(val.permission, permissions["feature"][key])) {
                        htmlMenu += '<li class="' + active_menu(currentUrl, key, "active", 1, val.link) + '">';
                        htmlMenu += '<a href="/' + app.getConfig("admin_prefix") + '/' + key + val.link + '">';
                        htmlMenu += '<i class="fa fa-circle-o"></i> ' + val.title;
                        htmlMenu += '</a>';
                        htmlMenu += '</li>';
                    }
                });
                htmlMenu += '</ul>';
                //Display menu parent without items
            } else if (_.isObject(menu[group]['features'][key]['menus'])) {
                htmlMenu += '<a href="/' + app.getConfig("admin_prefix") + '/' + key + menu[group]['features'][key]['menus']['link'] + '">';
                htmlMenu += '<i class="' + menu[group]['features'][key].icon + '"></i> <span>' + menu[group]['features'][key].title + '</span>';
                htmlMenu += '</a>';
            }
            htmlMenu += '</li>';
        }
    });
    return htmlMenu;
}