/**
 * Created by thangtyt on 11/21/16.
 */

'use strict';
module.exports = function (component, app) {
    let jwtAuth = ArrowHelper.jwt;
    let controller = component.controllers.frontend;
    return {
        "/subjects" : {
            get: {
                handler: [controller.getSubjects]
            }
        }

    }
}