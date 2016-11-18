/**
 * Created by thangnv on 11/3/16.
 */
'use strict';
module.exports = function (component, app) {

    let controller = component.controllers.backend;

    /*
    * q* : controller of Q&A module
      s* : controller of section module
      e* : controller of exam module
      sec : controller of section
    * */
    let permission = {
        qa: 'q-a',
        section: 'section',
        subject: 'subject',
        exam: 'exam'
    };
    return {
        //Q&A
        "q-a" : {
            get : {
                handler : controller.qList,
                authenticate : true,
                permissions: permission.qa
            }

        },
        "q-a/page/:page": {
            get: {
                handler: controller.qList,
                authenticate: true,
                permissions: permission.qa
            }
        },
        "q-a/page/:page/sort/:sort/(:order)?": {
            get: {
                handler: controller.qList,
                authenticate: true,
                permissions: permission.qa
            }
        },
        "q-a/create" : {
            get : {
                handler : controller.qCreate,
                authenticate : true,
                permissions : permission.qa
            },
            post : {
                handler : controller.qSave,
                authenticate : true,
                permissions : permission.qa
            }
        },
        "q-a/:qId" : {
            get : {
                handler : controller.qView,
                authenticate : true,
                permissions : permission.qa
            },
            post : {
                handler : controller.qUpdate,
                authenticate : true,
                permissions : permission.qa
            }
        },
        "q-a/list-chapter/:subjectId" : {
            get: {
                handler: controller.qGetChapterBySubjectId,
                authenticate : true,
                permissions : permission.section
            }
        },
        "q-a/list-section/:subjectId" : {
            get: {
                handler: controller.qGetSectionBySubjectId,
                authenticate : true,
                permissions : permission.section
            }
        },
        //END Q&A *****************************
        //SECTION
        "subject" : {
            get : {
                handler : controller.sList,
                authenticate : true,
                permissions: permission.subject
            }
        },
        "subject/page/:page": {
            get: {
                handler: controller.sList,
                authenticate: true,
                permissions: permission.subject
            }
        },
        "subject/page/:page/sort/:sort/(:order)?": {
            get: {
                handler: controller.sList,
                authenticate: true,
                permissions: permission.subject
            }
        },
        "subject/create" : {
            get : {
                handler : controller.sCreate,
                authenticate : true,
                permissions : permission.subject
            },
            post : {
                handler : controller.sSave,
                authenticate : true,
                permissions : permission.subject
            }
        },
        "subject/:subjectId" : {
            get : {
                handler : controller.sView,
                authenticate : true,
                permissions : permission.subject
            },
            post : {
                handler : [controller.sUpdate,controller.sView],
                authenticate : true,
                permissions : permission.subject
            },
            delete  : {
                handler : controller.sDelete,
                authenticate : true,
                permissions : permission.subject
            }
        },
        //END SECTION
        //EXAM  *******************************
        "exam": {
            get : {
                handler : controller.eList,
                authenticate : true,
                permissions: permission.exam
            }
        },
        //END EXAM
        //SECTION
        "section" : {
            get : {
                handler : controller.secList,
                authenticate : true,
                permissions: permission.section
            }
        },
        "section/page/:page": {
            get: {
                handler: controller.secList,
                authenticate: true,
                permissions: permission.section
            }
        },
        "section/page/:page/sort/:sort/(:order)?": {
            get: {
                handler: controller.secList,
                authenticate: true,
                permissions: permission.section
            }
        },
        "section/create" : {
            get : {
                handler : controller.secCreate,
                authenticate : true,
                permissions : permission.section
            },
            post : {
                handler : controller.secSave,
                authenticate : true,
                permissions : permission.section
            }
        },
        "section/:sectionId" : {
            get : {
                handler : controller.secView,
                authenticate : true,
                permissions : permission.section
            },
            post : {
                handler : [controller.secUpdate,controller.secView],
                authenticate : true,
                permissions : permission.section
            },
            delete  : {
                handler : controller.secDelete,
                authenticate : true,
                permissions : permission.section
            }
        }

    }
}