'use strict';

module.exports = function (component, app) {
    let controller = component.controllers.frontend;

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
                handler : [controller.setHeaderCORS,controller.cPassView]
            },
            post: {
                handler: [controller.setHeaderCORS,controller.cPassSave]
            }
        },
        "/forgot": {
            get: {
                handler: [controller.setHeaderCORS,controller.forgotview]
            },
            post: {
                handler: [controller.setHeaderCORS,controller.forgot]
            }
        },
        "/logout": {
            get: {
                handler: [controller.setHeaderCORS,controller.logout]
            }
        },
        "/jwt": {
            get: {
                handler: [controller.setHeaderCORS,controller.jwtSuccess]
            }
        },
        "/jwt/failure": {
            get: {
                handler: [controller.setHeaderCORS,controller.jwtFailure]
            }
        },
        "/403": {
            get: {
                handler: [controller.setHeaderCORS,controller.notHavePermission]
            }
        },
        "/440": {
            get: {
                handler: [controller.setHeaderCORS,controller.timeOut]
            }
        },
        "/499": {
            get: {
                handler: [controller.setHeaderCORS,controller.requireToken]
            }
        },
        "/user-info": {
            get: {
                handler: [controller.setHeaderCORS,controller.checkToken,controller.getUserInfo]
            }
        },
        "/register": {
            post: {
                handler: [controller.setHeaderCORS,controller.userRegister]
            }
        },
        "/register/user-info": {
            post: {
                handler: [controller.setHeaderCORS,controller.checkToken,controller.userRegisterInfo]
            }
        }

    }
};