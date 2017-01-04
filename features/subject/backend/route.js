/**
 * Created by thangnv on 11/3/16.
 */
'use strict';
module.exports = function (component, app) {

    let controller = component.controllers.backend;

    let permission = ['create','view','all','edit','delete'];
    return {

        //SECTION
        "/subject" : {
            get : {
                handler : controller.list,
                authenticate : true,
                permissions: permission
            },
            delete: {
                handler: controller.delete,
                authenticate : true,
                permissions: [permission[2],permission[4]]
            }
        },
        "/subject/page/:page": {
            get: {
                handler: controller.list,
                authenticate: true,
                permissions: permission
            }
        },
        "/subject/page/:page/sort/:sort/(:order)?": {
            get: {
                handler: controller.list,
                authenticate: true,
                permissions: [permission[2],permission[4]]
            }
        },
        "/subject/create" : {
            get : {
                handler : controller.create,
                authenticate : true,
                permissions : [permission[0],permission[3]]
            },
            post : {
                handler : controller.save,
                authenticate : true,
                permissions : [permission[0],permission[3]]
            }
        },
        "/subject/:subjectId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})" : {
            get : {
                handler : controller.view,
                authenticate : true,
                permissions : [permission[1],permission[2],permission[3],permission[4]]
            },
            post : {
                handler : [controller.update,controller.view],
                authenticate : true,
                permissions : [permission[1],permission[2],permission[3],permission[4]]
            },
            delete  : {
                handler : controller.delete,
                authenticate : true,
                permissions : [permission[1],permission[2],permission[3],permission[4]]
            }
        }

    }
}