/**
 * Created by thangtyt on 11/21/16.
 */

'use strict';
module.exports = function (component, app) {

    let controller = component.controllers.frontend;
    return {
        "/exam": {
            get: {
                handler: controller.examLists,
                authenticate: true
            }
        },
        "/exam/page/:page": {
            get: {
                handler: controller.examLists,
                authenticate: true
            }
        },
        "/exam/page/:page/sort/:sort/(:order)?": {
            get: {
                handler: controller.examLists,
                authenticate: true
            }
        },
        "/exam/:examId":{
            get : {
                handler: controller.getExamDetail,
                authenticate: true
            }
        },

        ///
        "/subjects" : {
            get: {
                handler: controller.getSubjects,
                authenticate: true
            }
        }
    }
}