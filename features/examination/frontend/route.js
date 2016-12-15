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
        "/exam/sort/:sort/(:order)/page/:page?": {
            get: {
                handler: [controller.examLists]
            }
        },
        "/exam/page/:page/sort/:sort/(:order)?": {
            get: {
                handler: [controller.examLists]
            }
        },
        "/exam/:examId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})":{
            get : {
                handler: [jwtAuth,controller.getExamDetail]
            }
        },
        "/exam/subject/:subjectId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})": {
            get: {
                handler: controller.getExamsBySubject
            }
        },
        "/exam/answer/:answerId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})": {
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
        },
        "/user/exam-result/:examId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})" : {
            get: {
                handler: [jwtAuth,controller.eGetUserExamResult]
            }
        },
        "/user/user-exam" : {
            get: {
                handler: [jwtAuth,controller.eGetUserExam]
            }
        },
        "/rating/:rating([1-5]{1})/:examId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})": {
            get: {
                handler: [jwtAuth,controller.rating]
            }
        },
        "/exam-save/:examId([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})": {
            get: {
                handler: [jwtAuth,controller.examSave]
            }
        },
        "/exam-save/list": {
            get: {
                handler: [jwtAuth,controller.examListSave]
            }
        },
        "/exam-save/list/page/:page": {
            get: {
                handler: [jwtAuth,controller.examListSave]
            }
        },
        "/rate/user/list" : {
            get: {
                handler: [jwtAuth,controller.examRateTop10]
            }
        }
    }
}