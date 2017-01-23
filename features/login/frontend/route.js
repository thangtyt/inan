'use strict';

module.exports = function (component, app) {
    let controller = component.controllers.frontend;
    let jwtAuth = ArrowHelper.jwt;
    return {
        "/auth/facebook/token" : {
            get: {
                handler: controller.facebookToken
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
            }
        },
        "/forgot-password/:token": {
            post: {
                handler: [controller.cPassSave]
            }
        },
        "/forgot-password": {
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
        },
        "/user-info/data": {
            get: {
                handler: [controller.getCityData]
            }
        }

    }
};