/**
 * Created by thangtyt on 11/21/16.
 */

'use strict';
module.exports = function (component, app) {
    let jwtAuth = ArrowHelper.jwt;
    let controller = component.controllers.frontend;
    return {
        "/exam": {
            get: {
                handler: [controller.examLists]
            }
        },
        "/exam/page/:page": {
            get: {
                handler: [controller.examLists]
            }
        },
        "/exam/page/:page/sort/:sort/(:order)?": {
            get: {
                handler: [controller.examLists]
            }
        },
        "/exam/:examId":{
            get : {
                handler: [jwtAuth,controller.getExamDetail]
            }
        },
        "/exam/subject/:subjectId": {
            get: {
                handler: controller.getExamsBySubject
            }
        },
        "/exam/answer/:answerId": {
            get: {
                handler: [jwtAuth,controller.getRightKeyAnswer]
            }
        },
        "/exam/right-answer-keys": {
            post: {
                handler: [jwtAuth,controller.getAnswerKeys]
            }
        },
        "/exam/submit-exam": {
            post: {
                handler: [jwtAuth,controller.submitExam]
            }
        },
        //
        "/subjects" : {
            get: {
                handler: [controller.getSubjects]
            }
        }
    }
}