/**
 * Created by thangtyt on 11/21/16.
 */

'use strict';
module.exports = function (component, app) {
    let jwtAuth = ArrowHelper.jwt;
    let setHeaderCors = ArrowHelper.setHeaderCors;
    let controller = component.controllers.frontend;
    return {
        "/exam": {
            get: {
                handler: [setHeaderCors,controller.examLists]
            }
        },
        "/exam/page/:page": {
            get: {
                handler: [setHeaderCors,controller.examLists]
            }
        },
        "/exam/page/:page/sort/:sort/(:order)?": {
            get: {
                handler: [setHeaderCors,controller.examLists]
            }
        },
        "/exam/:examId":{
            get : {
                handler: [jwtAuth,setHeaderCors,controller.getExamDetail]
            }
        },



        "/subjects" : {
            get: {
                handler: [setHeaderCors,controller.getSubjects]
            }
        }
    }
}