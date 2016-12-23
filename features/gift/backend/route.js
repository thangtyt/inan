/**
 * Created by thangtyt on 12/22/16.
 */
module.exports = function (component, app) {
    "use strict";
    let controller = component.controllers.backend;
    let permission = {
        all: 'all',
        create: 'create',
        edit: 'edit',
        delete: 'delete',
        view: 'view'
    };
    return {
        //Q&A
        "/gift": {
            get: {
                handler: controller.list,
                authenticate: true,
                permissions: [permission.all, permission.view]
            },
            delete: {
                handler: controller.delete,
                authenticate: true,
                permissions: [permission.all, permission.delete]
            }
        },
        "page/:page": {
            get: {
                handler: controller.list,
                authenticate: true,
                permissions: [permission.all, permission.view]
            }
        },
        "page/:page/sort/:sort/(:order)?": {
            get: {
                handler: controller.list,
                authenticate: true,
                permissions: [permission.all, permission.view]
            }
        },
        "create": {
            get: {
                handler: controller.create,
                authenticate: true,
                permissions: [permission.all, permission.view]
            },
            post: {
                handler: controller.save,
                authenticate: true,
                permissions: [permission.all, permission.view]
            }
        },
        "/gift/:giftId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})": {
            get: {
                handler: controller.view,
                authenticate: true,
                permissions: [permission.all, permission.view]
            },
            post: {
                handler: controller.update,
                authenticate: true,
                permissions: [permission.all, permission.edit]
            },
            put: {
                handler: controller.searchGiftCode,
                authenticate: true,
                permissions: [permission.all, permission.edit]
            },
            delete: {
                handler: controller.delete,
                authenticate: true,
                permissions: [permission.all, permission.delete]
            }
        },
        "gift-code/excel": {
            get: {
                handler: controller.exportGiftCodeExcel,
                authenticate: true,
                permissions: [permission.all, permission.view]
            }
        }
    }
}