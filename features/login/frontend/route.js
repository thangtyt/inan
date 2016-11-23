'use strict';

module.exports = function (component, app) {
    let controller = component.controllers.frontend;
    let jwtAuth = ArrowHelper.jwt;
    let setHeaderCors = ArrowHelper.setHeaderCors;
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
                authenticate: 'front_local'
            }
        },
        "/forgot/:token": {
            get: {
                handler : [setHeaderCors,controller.cPassView]
            },
            post: {
                handler: [setHeaderCors,controller.cPassSave]
            }
        },
        "/forgot": {
            get: {
                handler: [setHeaderCors,controller.forgotview]
            },
            post: {
                handler: [setHeaderCors,controller.forgot]
            }
        },
        "/logout": {
            get: {
                handler: [setHeaderCors,controller.logout]
            }
        },
        "/jwt": {
            get: {
                handler: [setHeaderCors,controller.jwtSuccess]
            }
        },
        "/jwt/failure": {
            get: {
                handler: [setHeaderCors,controller.jwtFailure]
            }
        },
        "/403": {
            get: {
                handler: [setHeaderCors,controller.notHavePermission]
            }
        },
        "/440": {
            get: {
                handler: [setHeaderCors,controller.timeOut]
            }
        },
        "/499": {
            get: {
                handler: [setHeaderCors,controller.requireToken]
            }
        },
        "/user-info": {
            get: {
                handler: [jwtAuth,setHeaderCors,controller.getUserInfo]
            }
        },
        "/register": {
            post: {
                handler: [setHeaderCors,controller.userRegister]
            }
        },
        "/register/user-info": {
            post: {
                handler: [jwtAuth,setHeaderCors,controller.userRegisterInfo]
            }
        }

    }
};