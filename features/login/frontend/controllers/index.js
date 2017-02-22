'use strict';
const nodeMailer = require('nodemailer');
let jwt = require('jsonwebtoken');
let moment = require('moment');
let request = require('request');
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
                        message : 'Hết thời gian thay đổi mật khẩu hoặc sai chuỗi xác nhận!'
                    }
                });
            }else{
                res.frontend.render('changePass');
            }
        }).catch(function (err) {
            res.frontend.render('changePass',{
                error : {
                    message : 'Hết thời gian thay đổi mật khẩu hoặc sai chuỗi xác nhận !'
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
                    message: 'Mật khẩu quá ngắn !'
                });
            }else{
                if(!user){
                    res.status(500).jsonp({
                        message: 'Hết thời gian thay đổi mật khẩu !'
                    });
                }else{
                    return user.updateAttributes({
                        reset_password_expires : 0,
                        reset_password_token : '',
                        user_pass : user.hashPassword(data.password)
                    }).then(function (user) {
                        if(user){
                            res.status(200).jsonp({
                                message: 'Thay đổi mật khẩu thành công !'
                            });
                        }else{
                            throw new Error('Lỗi trong quá trình thay đổi mật khẩu !');
                        }

                    })

                }
            }

        }).catch(function (err) {
            res.status(500).jsonp({
                message: err.message
            });
        })
    };
    controller.forgot = function (req,res) {
        app.feature.users.actions.findByEmail(req.body.email)
            .then(function (user) {
                if(!user){
                    res.status(500).jsonp({
                            message : 'Email chưa được đăng ký vui lòng nhập email khác !'
                    });
                }else{
                    let href = req.protocol + '://'+'test.tkbooks.vn/auth/reset-password';
                    return user.updateAttributes({
                        reset_password_expires : Number(Date.now()) + Number(app.getConfig('token.timeExpires')),
                        reset_password_token : tokenGenerate(50)
                    })
                    .then(function (userUpdated) {
                            if(userUpdated){
                                href += '/'+userUpdated.reset_password_token;
                                let transporter = nodeMailer.createTransport(mailConfig);
                                let message = {
                                    to : userUpdated.user_email,
                                    subject : 'Xác nhận địa chỉ email để đặt lại mật khẩu',
                                    html : `<p>Bạn vừa thực hiện chức năng quên mật khâu</p>
                                <p>Vui lòng bấm vào liên kết bên dưới để tiếp tục đặt lại mật khẩu.</>
                                <p><a href='`+href+`'>`+href+`</a></p>`
                                };
                                return transporter.sendMail(message, function (err,info) {
                                    if(!err){
                                        res.status(200).jsonp({
                                            message: 'Vui lòng kiểm tra email '+req.body.email+' để tiếp tục đặt lại mật khẩu !'
                                        });
                                    }else{
                                        throw new Error('Email không tồn tại !');
                                    }
                                })
                            }else{
                                throw new Error('Hết hạn thay đổi mật khẩu hoặc sai mã xác nhận !');
                            }
                    })

                }
        })
        .catch(function (err) {
            res.status(500).jsonp({
                message : err.message
            });
        })

    };
    controller.notHavePermission = function (req, res) {
        res.status(403);
        res.jsonp({
            message: 'Bạn không có quyền truy cập địa chỉ này !'
        })
    };
    controller.timeOut = function (req, res) {
        res.status(440);
        res.jsonp({
            message: 'Hết phiên làm việc vui lòng đăng nhập lại.'
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
                attributes : ["birthday","school","class","city","district","uni","sex","score"]
            })
        ])
        .then(function (results) {
            if(results){
                let _user = JSON.parse(JSON.stringify(results[0]));
                if(results[1]){
                    _user.userInfo = JSON.parse(JSON.stringify(results[1]));
                    _user.userInfo.birthday = _user.userInfo.birthday ? moment(_user.userInfo.birthday).format('D/M/YYYY').toString() : null;
                    _user = optimizeUser(_user,host);
                }else{
                    _user.userInfo = null;
                }
                res.status(200);
                res.jsonp({
                    user: _user
                })
            }else{
                return new Error('Không tìm thấy người dùng !');
            }
        }).catch(function (err) {
                //console.log(err);
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
                    error: "Email đã được đăng ký ! Vui lòng nhập email khác !"
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
                return new Error('Không thể tạo mới người dùng !');
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
                            attributes: ["birthday","school","class","city","district","uni","sex","score"]
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
                            message: 'Nhập sai mật khẩu !'
                        })
                    }

                }else{
                    res.status(401).jsonp({
                        message: 'Sai e-mail đăng nhập !'
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
                message: 'Không có dữ liệu được gửi lên !'
            })
        }
    }
    controller.userRegisterInfo = function (req,res) {
        let host = req.protocol + '://'+req.get('host');
        let user = req.user;
        let userInfo = req.body;
        user = optimizeUser(user,host);
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
                    error: 'Không thể thêm thông tin của user vui lòng nhập lại !'
                })
            })

        }else{
            res.status(503);
            res.jsonp({
                error: 'Không có thông tin gửi lên !'
            })
        }

    };
    controller.getCityData = function (req,res) {
        let dataUserInfo = app.getConfig('userInfo');
        res.status(200).jsonp(dataUserInfo);
    };
    controller.facebookToken = function (req,res) {
        let token = req.headers['authorization'];
        let host = req.protocol + '://'+req.get('host');
        token = token.split(' ').pop();
        request.get('https://graph.facebook.com/me?fields=id,name,birthday,cover,email&access_token='+token, function (err,response,body) {
            if(err){
                res.status(400).jsonp({
                    //message: err.message
                    message: 'Lỗi không kết nối được với facebook !'
                })
            }else{

                let userFB = JSON.parse(body);
                let defaultJSON = {};
                //console.log(userFB);
                defaultJSON.display_name = userFB.name;
                if (!_.has(userFB,'email') || userFB.email == null || userFB.email == ''){
                    userFB.email = userFB.id+'@example.com';
                    defaultJSON.user_email = userFB.id+'@example.com';
                }
                if (_.has(userFB,'cover')){
                    userFB.user_image_url = userFB['cover']['source'];
                }
                //console.log(userFB);
                //console.log(userFB['cover']);
                app.models.user.findOrCreate({
                    where : {
                        user_email : userFB.email
                    },
                    defaults: defaultJSON

                }).then(function (_user) {
                    _user = _user[0] != false ? _user[0] : _user[1];
                    _user = JSON.parse(JSON.stringify(_user));
                    app.models.userInfo.findOrCreate({
                        where: {
                            user_id : _user.id
                        },
                        defaults: {
                            user_id : _user.id,
                            score : 0,
                            city: '',
                            district: '',
                            school : '',
                            class: ''
                        }
                    }).then(function (_result) {
                        let _userInfo =  _result[0] != false ? _result[0] : _result[1];
                        _userInfo = JSON.parse(JSON.stringify(_userInfo,2,2));
                        _user.userInfo = _userInfo;
                        _user = optimizeUser(_user,host);
                        if(!_user.full_name)
                            _user.full_name = userFB.name || userFB.id;
                        res.status(200).jsonp({
                            token: jwtSign(jwt_conf,_user,host),
                            user: _user
                        })
                    });

                    //res.status(200).jsonp(_user);
                }).catch(function (err) {
                    //console.log(err);
                    res.status(300).jsonp({
                        message: err.message
                    });
                })

            }
        });
    }
};
function optimizeUser(user,host){

    user = JSON.parse(JSON.stringify(user));
    if(!user){
        return null;
    }else if(_.has(user,'display_name')){
        return {
            id : user.id,
            user_email : user.user_email,
            full_name : user.display_name,
            user_image : user.user_image_url.indexOf('http') == -1 ? host+user.user_image_url : user.user_image_url,
            mark : _.has(user,'userInfo') ? Number(user.userInfo.score) : 0,
            level : Math.floor((Math.random() * 1000) + 1),
            userInfo : user.userInfo
        };
    }else{
        //user.userInfo = _.has(user,'userInfo') ? user.userInfo : null;
        return user;
    }
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
        result = '';
    }
    return result;
}
let tokenGenerate = function (length) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"+Date.now();

    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};