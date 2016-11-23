'use strict';

module.exports = function (component, app) {
    let controller = component.controllers.frontend;
    let jwtAuth = ArrowHelper.jwt;
    return {
        "/auth/facebook" : {
            get: {
                authenticate: 'facebook_login'
            }
        },
        "/auth/facebook/callback":{
            get: {
                authenticate: 'facebook_login'
            }
        },
        "/auth/google" : {
            get: {
                authenticate: 'google_login'
            }
        },
        "/auth/google/callback":{
            get: {
                authenticate: 'google_login'
            }
        },
        "/login": {
            post: {
                handler: controller.login
                //authenticate: 'front_local'
            }
        },
        "/forgot/:token": {
            get: {
                handler : [controller.cPassView]
            },
            post: {
                handler: [controller.cPassSave]
            }
        },
        "/forgot": {
            get: {
                handler: [controller.forgotview]
            },
            post: {
                handler: [controller.forgot]
            }
        },
        "/logout": {
            get: {
                handler: [controller.logout]
            }
        },
        "/jwt": {
            get: {
                handler: [controller.jwtSuccess]
            }
        },
        "/jwt/failure": {
            get: {
                handler: [controller.jwtFailure]
            }
        },
        "/403": {
            get: {
                handler: [controller.notHavePermission]
            }
        },
        "/440": {
            get: {
                handler: [controller.timeOut]
            }
        },
        "/499": {
            get: {
                handler: [controller.requireToken]
            }
        },
        "/user-info": {
            get: {
                handler: [jwtAuth,controller.getUserInfo]
            }
        },
        "/register": {
            post: {
                handler: [controller.userRegister]
            }
        },
        "/register/user-info": {
            post: {
                handler: [jwtAuth,controller.userRegisterInfo]
            }
        }

    }
};