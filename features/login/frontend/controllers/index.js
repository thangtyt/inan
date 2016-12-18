'use strict';
const nodeMailer = require('nodemailer');
let jwt = require('jsonwebtoken');
let moment = require('moment');
let _ = require('arrowjs')._;
module.exports = function (controller, component, app) {
    let jwt_conf = app.getConfig('jwt');
    //create token
    let jwtSign = function (conf,user,host) {
        let userOpt = optimizeUser(user,host);
        return jwt.sign({
            ignoreExpiration: true,
            data: userOpt
        }, conf.jwtSecretKey);
    };
    let mailConfig = app.getConfig('mailer_config');
    controller.view = function (req, res) {
        res.frontend.render('login');
    };

    controller.logout = function (req, res) {
        if (req.user && req.user.id) {
            // Remove cache
            let redis = app.redisClient;
            redis.del(app.getConfig('redis_prefix') + 'current-user-' + req.user.id);
        }

        req.logout();

        if (req.session.prelink) {
            return res.redirect(req.session.prelink);
        }
        res.redirect('/');
    };

    controller.forgotview = function (req,res) {
        res.frontend.render('forgot');
    };
    controller.cPassView = function (req,res) {
        let token = req.params.token;
        app.feature.users.actions.find({
            where : {
                reset_password_expires : {
                    $gt: Date.now()
                },
                reset_password_token : token
            }
        }).then(function (user) {
            if(!user){
                res.frontend.render('changePass',{
                    error : {
                        message : 'This function is expires or not avaiable !'
                    }
                });
            }else{
                res.frontend.render('changePass');
            }
        }).catch(function (err) {
            res.frontend.render('changePass',{
                error : {
                    message : 'This function is expires or not avaiable !'
                }
            });
        })

    };
    controller.cPassSave = function (req,res) {
        let token = req.params.token;
        let data = req.body;
        app.feature.users.actions.find({
            where : {
                reset_password_expires : {
                    $gt: Date.now()
                },
                reset_password_token : token
            }
        }).then(function (user) {
            if (data.password == null || data.password.length < 6){
                res.status(500).jsonp({
                    message: 'Password is null or too short !'
                });
                //req.flash.error('Password is null or too short !');
                //res.frontend.render('changePass');
            }else{
                if(!user){
                    res.status(500).jsonp({
                        message: 'Expires or not available !'
                    });
                    //res.frontend.render('changePass',{
                    //    error : {
                    //        message : 'This function is expires or not avaiable !'
                    //    }
                    //});
                }else{
                    return user.updateAttributes({
                        reset_password_expires : 0,
                        reset_password_token : '',
                        user_pass : user.hashPassword(data.password)
                    }).then(function (user) {
                        if(user){
                            res.status(200).jsonp({
                                message: 'Password update successfully !'
                            });
                            //req.flash.success('Change password successfully !');
                            //req.flash.success('Please re-login with a new password !');
                            //res.redirect('/admin/login');
                        }else{
                            throw new Error('Error when user try to change password !');
                            //req.flash.error('Change password un-successfully ! \n Please re-enter new password !');
                            //res.frontend.render('changePass');
                        }

                    })

                }
            }

        }).catch(function (err) {
            res.status(500).jsonp({
                message: err.message
            });
            //res.frontend.render('changePass',{
            //    error : {
            //        message : 'This function is expires or not avaiable !'
            //    }
            //});
        })
    };
    controller.forgot = function (req,res) {
        app.feature.users.actions.findByEmail(req.body.email)
            .then(function (user) {
                //console.log(user);
                if(!user){
                    res.status(500).jsonp({
                            message : 'E-mail is not registered ! Please enter another e-mail'
                    });
                }else{
                    let href = 'dadasda';//req.protocol + '://'+req.get('host')+req.originalUrl;
                    console.log(app.getConfig('token.timeExpires'));
                    return user.updateAttributes({
                        reset_password_expires : Number(Date.now()) + Number(app.getConfig('token.timeExpires')),
                        reset_password_token : tokenGenerate(50)
                    })
                    .then(function (userUpdated) {
                            console.log(2222);
                            if(userUpdated){
                                href += '/'+userUpdated.reset_password_token;
                                let transporter = nodeMailer.createTransport(mailConfig);
                                let message = {
                                    to : userUpdated.user_email,
                                    subject : 'Confirm email to reset password',
                                    html : `<p>You have just process reset your password</p>
                                <p>Please click link below to continue reset your password</>
                                <p><a href='`+href+`'>`+href+`</a></p>`
                                };
                                return transporter.sendMail(message, function (err,info) {
                                    if(!err){
                                        res.status(200).jsonp({
                                            message: 'Please check '+req.body.email+' to reset password !'
                                        });
                                        //res.frontend.render('forgot');
                                    }else{
                                        throw new Error('E-mail is not exist !');
                                        //res.frontend.render('forgot',{
                                        //    sendEmail : user.user_email
                                        //});
                                    }
                                })
                            }else{
                                throw new Error('Expires or not available');
                            }
                    })

                }
        })
        .catch(function (err) {
                console.log(err.message);
            res.status(500).jsonp({
                message : err.message
            });
        })

    };
    controller.notHavePermission = function (req, res) {
        res.status(403);
        res.jsonp({
            message: 'The request was a valid request'
        })
    };
    controller.timeOut = function (req, res) {
        res.status(440);
        res.jsonp({
            message: 'The client\'s session has expired and must log in again.'
        })
    };
    controller.requireToken = function (req,res) {
        res.status(499);
        res.jsonp({
            message: 'Token is required'
        })
    };
    controller.jwtSuccess = function (req,res) {
        let host = req.protocol + '://'+req.get('host');
        let user = req.user;
        if(user){
            user.role = [];
            user.role_id = [];
            user.role_ids = [];
            //res.header("Access-Control-Allow-Origin", "*");
            //res.header("Access-Control-Allow-Headers", "*");
            res.status(200);
            res.jsonp({
                message: 'login successful !',
                token: jwtSign(jwt_conf,user,host)
            })
        }else{
            res.status(499);
        }
    };
    controller.jwtFailure = function (req,res) {
        res.status(400);
        res.jsonp({
            message: 'Login failure'
        })
    };
    controller.getUserInfo = function (req,res) {
        let host = req.protocol + '://'+req.get('host');
        let user = req.user;
        Promise.all([
            app.models.user.find({
                where: {
                    id: user.id
                }
            }),
            app.models.userInfo.find({
                where: {
                    user_id : user.id
                },
                attributes : ["birthday","school","class","city","district","uni","sex","score","gift_codes"]
            })
        ])
        .then(function (results) {
            if(results){
                let _user = optimizeUser(JSON.parse(JSON.stringify(results[0])),host);
                if(results[1]){
                    _user.userInfo = JSON.parse(JSON.stringify(results[1]));
                    _user.userInfo.birthday = _user.userInfo.birthday ? moment(_user.userInfo.birthday).format('D/M/YYYY').toString() : null;
                }else{
                    _user.userInfo = null;
                }
                res.status(200);
                res.jsonp({
                    user: _user
                })
            }else{
                return new Error('Not Found user');
            }
        }).catch(function (err) {
                console.log(err);
            res.status(503);
            res.jsonp({
                user: null
            })
        })

    };
    controller.userRegister = function (req,res) {
        let host = req.protocol + '://'+req.get('host');
        let dataUserInfo = app.getConfig('userInfo');
        let form  = req.body;
        app.feature.users.actions.findByEmail(form.username)
        .then(function (user) {
            if(user){
                res.status(300);
                res.jsonp({
                    error: "Email is registered ! Please choose another email !"
                })
            }else{
                return app.feature.users.actions.create({
                    user_email: form.username,
                    user_pass: form.password,
                    user_status: 'publish'
                });
            }
        })
        .then(function (user) {
            if(user){
                res.status(200);
                res.jsonp({
                    token: jwtSign(jwt_conf,optimizeUser(user,host)),
                    dataUserInfo: dataUserInfo //city,district,...
                })
            }else{
                return new Error('Cannot create user');
            }
        })
        .catch(function (err) {
            res.status(503);
            res.jsonp({
                error: err.message

            })
        });
    };

    controller.login = function (req,res) {
        let host = req.protocol + '://'+req.get('host');
        let form = req.body;
        if(form){
            app.models.user.find({
                where: {
                    user_email : form['username'].toLowerCase()
                }
            }).then(function (user) {
                if(user){
                    if(user.authenticate(form['password'])){
                        app.models.userInfo.find({
                            where: {
                                user_id: user.id
                            },
                            attributes: ['school','class','city','district','uni','sex']
                        }).then(function (userInfo) {
                            user = JSON.parse(JSON.stringify(user));
                            user.userInfo = userInfo;
                            res.status(200).jsonp({
                                token: jwtSign(jwt_conf,user,host),
                                user: optimizeUser(user,host)
                            })
                        }).catch(function (err) {
                            return err;
                        })
                    }else{
                        res.status(401).jsonp({
                            message: 'Wrong password !'
                        })
                    }

                }else{
                    res.status(401).jsonp({
                        message: 'Wrong username !'
                    })
                }
            }).catch(function (err) {
                //console.log(err);
                res.status(451).jsonp({
                    message: 'Error !!'
                })
            })
        }else{
            res.status(411).jsonp({
                message: 'Cannot get data form client !'
            })
        }
    }
    controller.userRegisterInfo = function (req,res) {
        let host = req.protocol + '://'+req.get('host');
        let user = req.user;
        //console.log('userRegisterInfo',user);
        let userInfo = req.body;
        user = optimizeUser(user,host);
        //console.log(JSON.stringify(userInfo,3,3));
        if( userInfo ){
            userInfo.user_id = user.id;
            Promise.all([
                        app.models.userInfo.findOrCreate({
                        where: {
                            user_id: user.id
                        },
                        defaults : userInfo
                    }),
                    app.models.user.find({
                        where: {
                            id: user.id
                        }
                    })
            ])
            .then(function (result) {
                let _userInfo = result[0][0] ? result[0][0] : result[0][1];
                return Promise.all([
                        result[1].updateAttributes({
                            display_name : userInfo.full_name || '[no name]'
                        }),
                        _userInfo.updateAttributes(userInfo)
                    ])

            })
            .then(function (result) {
                   let _user = optimizeUser(JSON.parse(JSON.stringify(result[0])),host);
                    _user.userInfo = result[1];
                    res.status(200);
                    res.jsonp({
                        user: _user
                    })
            })
            .catch(function (err) {
                res.status(503);
                res.jsonp({
                    error: 'Cannot add user\'s information'
                })
            })

        }else{
            res.status(503);
            res.jsonp({
                error: 'Not found data user\'s information send to server'
            })
        }

    }
    controller.getCityData = function (req,res) {
        let dataUserInfo = app.getConfig('userInfo');
        res.status(200).jsonp(dataUserInfo);
    }
};
function optimizeUser(user,host){

    if(!user){
        return null;
    }else if(user.hasOwnProperty('display_name')){
        return {
            id : user.id,
            user_email : user.user_email,
            full_name : user.display_name,
            user_image : user.user_image_url.indexOf('http') == -1 ? host+user.user_image_url : user.user_image_url,
            mark : Math.floor((Math.random() * 100) + 1),
            level : Math.floor((Math.random() * 1000) + 1)
        };
    }else{
        return user
    }
    //console.log(user);
}

function dateformat(pattern,date){
    let result,
        dd,mm,yyyy;
    try{
        dd = date.getDate() > 9 ? date.getDate() : '0'+date.getDate();
        mm = date.getMonth() > 9 ? date.getMonth() : '0'+date.getMonth();
        yyyy = date.getFullYear();
        result = pattern.replace('dd',dd).replace('mm',mm).replace('yyyy',yyyy)
    }catch(err){
        console.log(err);
        result = '';
    }
    console.log(result);
    return result;
}
let tokenGenerate = function (length) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"+Date.now();

    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};