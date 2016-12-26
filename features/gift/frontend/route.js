/**
 * Created by thangtyt on 12/23/16.
 */
'use strict';
module.exports = function (component, app) {
    let jwtAuth = ArrowHelper.jwt;
    let controller = component.controllers.frontend;
    return {
        "/gift": {
            get: {
                handler: [jwtAuth,controller.listGift]
            }
        },
        "/gift/page/:page": {
            get: {
                handler: [jwtAuth,controller.listGift]
            }
        },
        "/gift/page/:page/sort/:sort/:order?": {
            get: {
                handler: [jwtAuth,controller.listGift]
            }
        },
        "/gift/exam/:giftId": {
            get: {
                handler: [jwtAuth,controller.listExam]
            }
        },
        "/gift/exam/:giftId/page/:page": {
            get: {
                handler: [jwtAuth,controller.listExam]
            }
        },
        "/gift/exam/:giftId/page/:page/sort/:sort/:order?": {
            get: {
                handler: [jwtAuth,controller.listExam]
            }
        }
    }
}