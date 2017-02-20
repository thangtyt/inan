'use strict';

/**
 * Module dependencies.
 */
let LocalStrategy = require('passport-local').Strategy;
let log = require('arrowjs').logger;

module.exports = function (passport, config, app) {
    // Use local strategy
    passport.use(new LocalStrategy(
        function (username, password, done) {
            app.models.user.find({
                where: [
                    "lower(user_email) = ? and user_status='publish'", username.toLowerCase()
                ],
                include: [
                    {
                        model: app.models.role
                    }
                ]
            }).then(function (user) {
                if (!user) {
                    ArrowHelper.createUserAdmin(app, function (result) {
                        if (!result) {
                            return done(null, false, {
                                message: 'Sai e-mail đăng nhập! Vui lòng đăng nhập lại.'
                            });
                        } else {
                            return done(null, false, {
                                message: 'E-mail mặc định là \"admin@example.com\" <br> Mật khẩu mặc định là \"123456\" <br> Vui lòng đăng nhập lại!'
                            });
                        }
                    })
                } else if (!user.authenticate(password)) {
                    return done(null, false, {
                        message: 'Sai mật khẩu. Vui lòng đăng nhập lại.'
                    });
                } else {
                    return done(null, user);
                }
            }).catch(function (err) {
                log.error(err);
                return done(null, false, {
                    message: 'Hệ thống bị lỗi. Vui lòng đăng nhập lại.'
                });
            });
        }
    ));
};