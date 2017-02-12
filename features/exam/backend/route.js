/**
 * Created by thangnv on 11/3/16.
 */
'use strict';
module.exports = function (component, app) {

    let controller = component.controllers.backend;
    let permission = ['create','view','all','edit','delete','active'];
    return {

        //EXAM  *******************************
        "/exam": {
            get : {
                handler : controller.list,
                authenticate : true,
                permissions: permission
            },
            delete : {
                handler : controller.delete,
                authenticate : true,
                permissions: [permission[2],permission[4]]
            }
        },
        "/exam/page/:page": {
            get: {
                handler: controller.list,
                authenticate: true,
                permissions: permission
            }
        },
        "/exam/page/:page/sort/:sort/(:order)?": {
            get: {
                handler: controller.list,
                authenticate: true,
                permissions: permission
            }
        },
        "/exam/create-manual": {
            get: {
                handler: controller.createManual,
                authenticate: true,
                permissions: [permission[3],permission[0]]
            },
            post: {
                handler: controller.saveManual,
                authenticate: true,
                permissions: [permission[3],permission[0]]
            }
        },
        "/exam/list-section/:subjectId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})": {
            get: {
                handler: controller.getSections,
                authenticate: true,
                permission: permission
            }
        },
        "/exam/list-question/:sectionId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})": {
            get: {
                handler: controller.getQuestions,
                authenticate: true,
                permission: permission
            }
        },
        "/exam/list-questions/:sectionId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})": {
            post: {
                handler: controller.getSectionQuestions,
                authenticate: true,
                permission: permission
            }
        },
        "/exam/:examId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})" : {
            get : {
                handler: controller.viewManual,
                authenticate: true,
                permission: [permission[3],permission[3],permission[4],permission[5]]
            },
            post: {
                handler: [controller.updateManual,controller.viewManual],
                authenticate: true,
                permission: [permission[3],permission[3],permission[4],permission[5]]
            }
        },
        "/exam/gift": {
            get: {
                handler: controller.gift,
                authenticate: true,
                permission: permission
            }
        },
        "/exam/gift/page/:page([0-9]+)": {
            get: {
                handler: controller.gift,
                authenticate: true,
                permission: permission
            }
        },
        "/exam/gift/page/:page([0-9]+)/sort/:sort/:order?": {
            get: {
                handler: controller.gift,
                authenticate: true,
                permission: permission
            }
        },
        "/exam/gift/:giftId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})": {
            get: {
                handler: controller.examByGift,
                authenticate: true,
                permission: permission
            }
        },
        "/exam/gift/:giftId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/page/:page([0-9]+)": {
            get: {
                handler: controller.examByGift,
                authenticate: true,
                permission: permission
            }
        },
        "/exam/gift/:giftId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/page/:page([0-9]+)/sort/:sort/:order?": {
            get: {
                handler: controller.examByGift,
                authenticate: true,
                permission: permission
            }
        }
        //END EXAM
    }
}