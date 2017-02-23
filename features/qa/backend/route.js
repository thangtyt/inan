/**
 * Created by thangnv on 11/3/16.
 */
'use strict';
module.exports = function (component, app) {

    let controller = component.controllers.backend;

    let permission = ['create','view','all','edit','delete','active'];
    return {
        //Q&A
        "/qa/choice" : {
            get : {
                handler : controller.listChoice,
                authenticate : true,
                permissions: permission
            },
            delete : {
                handler : controller.delete,
                authenticate : true,
                permissions: [permission[4],permission[2]]
            }
        },
        "/qa/choice/page/:page": {
            get: {
                handler: controller.listChoice,
                authenticate: true,
                permissions: permission
            }
        },
        "/qa/choice/page/:page/sort/:sort/(:order)?": {
            get: {
                handler: controller.listChoice,
                authenticate: true,
                permissions: permission
            }
        },
        "/qa/choice/create" : {
            get : {
                handler : controller.createChoice,
                authenticate : true,
                permissions : [permission[0],permission[2]]
            },
            post : {
                handler : controller.saveChoice,
                authenticate : true,
                permissions : [permission[0],permission[2]]
            }
        },
        "/qa/choice/:questionId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})" : {
            get : {
                handler : controller.viewChoice,
                authenticate : true,
                permissions : [permission[1],permission[2],permission[4],permission[3],permission[5]]
            },
            post : {
                handler : controller.updateChoice,
                authenticate : true,
                permissions : [permission[1],permission[2],permission[4],permission[3]]
            }
        },
        "/qa/list-chapter/:subjectId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})" : {
            get: {
                handler: controller.getChapterBySubjectId,
                authenticate : true,
                permissions : permission
            }
        },
        "/qa/list-section/:subjectId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})" : {
            get: {
                handler: controller.getSectionBySubjectId,
                authenticate : true,
                permissions : permission
            }
        },
        ///bao loi cau hoi
        "/qa/report" : {
            get : {
                handler : controller.listReport,
                authenticate : true,
                permissions: permission
            }
        },
        "/qa/report/page/:page": {
            get: {
                handler: controller.listReport,
                authenticate: true,
                permissions: permission
            }
        },
        "/qa/report/page/:page/sort/:sort/(:order)?": {
            get: {
                handler: controller.listReport,
                authenticate: true,
                permissions: permission
            }
        },
        "/qa/report/:reportId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})" : {
            get : {
                handler : controller.viewReport,
                authenticate : true,
                permissions : [permission[0],permission[2]]
            },
            post : {
                handler : controller.updateReport,
                authenticate : true,
                permissions : [permission[0],permission[2]]
            }
        },
        "/qa/question-mark/:questionId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})": {
            get : {
                handler: controller.questionMark,
                authenticate: true,
                permission: permission
            }
        }
        //END Q&A *****************************
    }
}