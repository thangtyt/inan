/**
 * Created by thangtyt on 12/13/16.
 */

'use strict';
module.exports = function (component, app) {
    let controller = component.controllers.frontend;
    let jwtAuth = ArrowHelper.jwt;
    return {
        "/user-update/avatar": {
            post: {
                handler: [jwtAuth,controller.userUpdateImage]
            }
        },
        "/user-update/info": {
            post: {
                handler: [jwtAuth,controller.userUpdateInfo]
            }
        }
    }
};