/**
 * Created by thangtyt on 11/21/16.
 */

'use strict';
module.exports = function (component, app) {

    let controller = component.controllers.frontend;
    return {
        "/exam": {
            get: {
                handler: [controller.checkToken,controller.examLists]
            }
        },
        "/exam/page/:page": {
            get: {
                handler: [controller.checkToken,controller.examLists]
            }
        },
        "/exam/page/:page/sort/:sort/(:order)?": {
            get: {
                handler: [controller.checkToken,controller.examLists]
            }
        },
        "/exam/:examId":{
            get : {
                handler: [controller.checkToken,controller.getExamDetail]
            }
        },
        ///
        "/subjects" : {
            get: {
                handler: [controller.checkToken,controller.getSubjects]
            }
        }
    }
}