/**
 * Created by thangtyt on 12/13/16.
 */
'use strict';

let Promise = require('arrowjs').Promise;
let fs = require('fs');
let formidable = require('formidable');
let _ = require('arrowjs')._,
    moment = require('moment'),
AWS = require('aws-sdk');

Promise.promisifyAll(formidable);

let folder_upload = '/img/users/';

module.exports = function (controller, component, app) {
    const credentials = app.getConfig("amazonS3").credentials;
    const bucket = app.getConfig("amazonS3").bucket;
    const region = app.getConfig("amazonS3").region;
    const allowExtension = ['.jpg', '.jpeg', '.gif', '.png', '.bmp'];
    AWS.config.update(credentials);
    AWS.config.region = region;


    function uploadS3(form,s3,req,image_name,done){
        let msg = null;
        form.parse(req, function (err, fields, files) {
            if(files.image){
                let val = files.image;
                let ext = val['type'].split('/').pop();
                //console.log(val);
                if(_.indexOf(allowExtension,ext)){
                    image_name = image_name+'.'+ext;
                    fs.readFile(val.path, function (err, file_buffer) {
                        let params = {
                            Bucket: bucket+'/user-avatar',
                            Key: image_name,
                            Body: file_buffer,
                            ACL: 'public-read-write'
                        };
                        s3.putObject(params, function (perr, pres) {
                            if (perr) {
                                msg = "File cannot upload to server"
                            }
                            //remove temp file
                            fs.unlink(val.path, function (err) {
                                if (err) {
                                    logger.log(err)
                                }
                            });
                            done(msg,s3.endpoint.href+bucket+'/user-avatar/'+image_name);
                        });
                    });
                }
                else{
                    done('File not found !',null);
                }
            }
            else{
                done('File not found !',null);
            }
        });
    }
    controller.userUpdateImage = function (req,res) {
        let user = req.user;
        let s3 = new AWS.S3();
        let form = new formidable.IncomingForm();
        //let aws = new ArrowHelper.AWS(s3,allowExtension);
        let image_name = user.user_email.split('@').shift();
        image_name = user.id + '-' + image_name;
        uploadS3(form,s3,req,image_name, function (err,url) {
            if(err){
                res.status(500).jsonp(err);
            }else{
                app.feature.users.actions.findById(user.id)
                .then(function (_user) {
                    return _user.updateAttributes({
                        user_image_url : url
                    })
                })
                .then(function (_user) {
                        res.status(200).jsonp(_user.user_image_url);
                })
                .catch(function (err) {
                    res.status(500).jsonp({
                        message: err.message
                    })
                });
            }
        });
    },
    controller.userUpdateInfo = function (req, res) {
        let host = req.protocol + '://'+req.get('host');
        let user = req.user;
        let data = req.body;
        console.log(data);
        app.models.userInfo.find({
            where : {
                user_id : user.id
            }
        })
        .then(function (_userInfo) {
            return _userInfo.updateAttributes({
                birthday : moment(data.birthday, "DD-MM-YYYY"),
                sex: data.sex,
                city: data.city,
                district: data.district,
                school : data.school,
                class: data.class
            })
        })
        .then(function (_userInfo) {
                _userInfo = JSON.parse(JSON.stringify(_userInfo));
                _userInfo.birthday = moment(_userInfo.birthday).format('D/M/YYYY').toString();
            res.status(200).jsonp(_userInfo);
        }).catch(function (err) {
            res.status(500).jsonp(err.message);
        })
    }

}
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