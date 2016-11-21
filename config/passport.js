'use strict';

let logger = require('arrowjs').logger;
let jwt = require('jsonwebtoken');
module.exports = function (passport, app) {
    let jwt_conf = app.getConfig('jwt');
    return {
        serializeUser: function (user, done) {
            done(null, user.id);
        },
        deserializeUser: function (id, done) {
            let redis = app.redisClient;
            let key = app.getConfig('redis_prefix') + 'current-user-' + id;
            redis.get(key, function (err, result) {
                if (result != null) {
                    let user;
                    try {
                        user = JSON.parse(result);
                    } catch (err) {
                        logger.error(err);
                        done(null, false);
                    }

                    done(null, user);
                } else {
                    app.feature.users.actions.find({
                        include: [app.models.role],
                        where: {
                            id: id,
                            user_status: 'publish'
                        }
                    }).then(function (user) {
                        let user_tmp;
                        try {
                            user_tmp = JSON.parse(JSON.stringify(user));
                        } catch (err) {
                            logger.error(err);
                            done(null, false);
                        }
                        // Set expires 300 seconds
                        redis.setex(key, 300, JSON.stringify(user_tmp));
                        done(null, user_tmp);
                    }).catch(function (err) {
                        logger.error(err);
                        done(null, false);
                    });
                }
            });
        },
        checkAuthenticate: function (req, res, next) {
            if(req.originalUrl.indexOf('/api') !== -1){
                let token = req.body.token || req.query.token || req.headers['x-access-token'];
                if(token){
                    jwt.verify(token,jwt_conf.jwtSecretKey, function (err,decoded) {
                        if(err){
                            res.redirect('/api/440')
                        }else{
                            res.locals.user = decoded;
                            next();
                        }
                    })
                }else{
                    res.redirect('/api/499');
                }

            }else if (req.isAuthenticated()) {
                try {
                    req.session.permissions = res.locals.permissions = JSON.parse(req.user.role.permissions);
                } catch (err) {
                    req.session.permissions = null;
                }
                res.locals.user = req.user;
                next();
            }
            else {
                if (req.originalUrl.indexOf('/admin') == -1)
                    res.redirect('/');
                else
                    res.redirect('/admin/login');
            }
        },
        handlePermission: function (req, res, next) {
            if (req.hasPermission) {
                res.locals.user = req.user;
                return next()
            } else {
                req.flash.error('You do not have permission to access');
                res.redirect('/admin/403');
            }
        },
        local_login: {
            strategy: 'local',
            option: {
                successRedirect: '/admin',
                failureRedirect: '/admin/login',
                failureFlash: true

            }
        },
        front_local: {
            strategy: 'local',
            option: {
                successRedirect: '/api/jwt',
                failureRedirect: '/api/jwt/failure',
                failureFlash: true
            }
        },
        facebook_login: {
            strategy: 'facebook',
            option: {
                successRedirect: '/api/jwt',
                failureRedirect: '/api/jwt/failure',
                failureFlash: true

            }
        },
        google_login: {
            strategy: 'google',
            option: {
                successRedirect: '/api/jwt',
                failureRedirect: '/api/jwt/failure',
                failureFlash: true,
                scope: 'https://www.googleapis.com/auth/userinfo.email'

            }
        }
    }
};