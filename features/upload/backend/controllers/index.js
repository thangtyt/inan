'use strict';

let logger = require('arrowjs').logger;
let _ = require('arrowjs')._;
let AWS = require('aws-sdk'),
    Promise = require('arrowjs').Promise,
    request = require('request'),
    formidable = require('formidable'),
    path = require('path');

module.exports = function (controller, component, app) {

    //
    const credentials = app.getConfig("amazonS3").credentials;
    const bucket = app.getConfig("amazonS3").bucket;
    const region = app.getConfig("amazonS3").region;
    const rootFolder = app.getConfig("defaultFolderS3");
    AWS.config.update(credentials);
    AWS.config.region = region;
    //

    let permissionManageAll = 'upload_manage_all';
    const allowExtension = app.getConfig("extensions");

    //end s3 function

    controller.view = function (req,res) {
        res.backend.render('index',{
            title : "File Manager"
        });
    }

    controller.dirTree = function (req, res) {
        if (req.permissions.indexOf(permissionManageAll) === -1) {
            res.jsonp({"res": "error", "msg": "You don't have permission to delete this directory"});
        } else {
            let s3 = new AWS.S3();
            let params = {
                Bucket: bucket,
                Prefix: rootFolder
            };
            let aws = new ArrowHelper.AWS(s3,allowExtension);
            aws.getAllDir(params, function (err,results) {
                if (err) res.jsonp({"res": "error", "msg": err.message});
                else{
                    if(results.length == 0){
                        aws.createFolder({
                            Bucket: path.join(bucket,rootFolder),
                            ACL: 'public-read-write'

                        }, function (err,data) {
                            if (err){
                                res.jsonp({"res": "error", "msg": err.message});
                            }else{
                                res.jsonp([{
                                    p: 'uploads',
                                    f: 0    ,
                                    s: 1
                                }])
                            }
                        })
                    }else{
                        res.jsonp(results);
                    }
                }

            });
        }

    };
    controller.fileList = function (req, res) {
        if (req.permissions.indexOf(permissionManageAll) === -1) {
            res.jsonp({"res": "error", "msg": "You don't have permission to delete this directory"});
        } else {
            let folder = req.body.d;
            let s3 = new AWS.S3();
            let params = {
                Bucket: bucket,
                Prefix: folder+'/'
            }
            let path = s3.endpoint.href+bucket+'/';
            let aws = new ArrowHelper.AWS(s3,allowExtension);
            aws.listFile(params,{
                folder : folder,
                path : path
            }, function (err,results) {
                if (err)
                    res.jsonp([]);
                else
                    res.jsonp(results);
            })
        }


    };
    //
    controller.createDir = function (req, res) {
        if (req.permissions.indexOf(permissionManageAll) === -1) {
            res.jsonp({"res": "error", "msg": "You don't have permission to delete this directory"});
        } else {
            let dir = req.body.d;
            let name = req.body.n;
            let s3 = new AWS.S3();
            let params = {
                Bucket: path.join(bucket,dir,name)+'/'
            };
            let aws = new ArrowHelper.AWS(s3,allowExtension);
            aws.createFolder(params, function (err,data) {
                if(err){
                    res.jsonp({"res": "error", "msg": "Cannot create directory"});
                }else{
                    res.jsonp({"res": "ok", "msg": ""});
                }
            })
        }

    };

    controller.deleteDir = function (req, res) {
        let dir = req.body.d;
        let s3 = new AWS.S3();
        let params = {
            Bucket: bucket,
            Prefix: dir+'/'
        };
        // Only allow delete dir inside owner folder if user does not have permission manage all
        if (req.permissions.indexOf(permissionManageAll) === -1) {
            res.jsonp({"res": "error", "msg": "You don't have permission to delete this directory"});
        } else {
            let aws =new ArrowHelper.AWS(s3,allowExtension);
            aws.getObjectDelete(params, function (err,result) {
                if(err)res.jsonp({"res": "error", "msg": err.message});
                else{
                    s3.deleteObject({
                        Bucket: bucket,
                        Key: dir+'/'
                    }, function (err,data) {
                        if(err)
                            res.jsonp({"res": "error", "msg":'deleteObj : '+ err.message});
                        else
                            res.jsonp({"res": "ok", "msg": ""});
                    })

                }
            })

        }
    };

    controller.moveDir = function (req, res) {
        res.jsonp({"res": "error", "msg": __('m_upload_backend_controllers_index_delete_error_integrated')});
    };

    controller.copyDir = function (req, res) {
        res.jsonp({"res": "error", "msg": __('m_upload_backend_controllers_index_delete_error_integrated')});
    };

    controller.renameDir = function (req, res) {
        //let d = req.body.d;
        //let n = req.body.n;
        let d = req.body.d;
        let n = req.body.n;
        if (req.permissions.indexOf(permissionManageAll) === -1 ) {
            res.jsonp({"res": "error", "msg": "You have not permission to do this action !"});
        } else {
            if(d.split('/').pop() === n){
                res.jsonp({"res": "error", "msg": "Choose another name of folder please !"});
            }else{
                let s3 = new AWS.S3();
                n = d.replace(d.split('/').pop(),n);
                let aws = new ArrowHelper.AWS(s3,allowExtension);
                    aws.rename('folder',{
                        Bucket: bucket,
                        CopySource: bucket+'/'+d+'/',
                        Key: n+'/',
                        ACL: 'public-read-write'
                    }, function (err,data) {
                        if(err)
                            res.jsonp(err);
                        else
                            res.jsonp(data);
                    })
            }
        }
    };



    controller.upload = function (req, res) {
        if (req.permissions.indexOf(permissionManageAll) === -1 ) {
            res.jsonp({"res": "error", "msg": "You have not permission to do this action !"});
        } else {
            let s3 = new AWS.S3();
            let form = new formidable.IncomingForm();
            let aws = new ArrowHelper.AWS(s3,allowExtension);
            aws.uploadFile(req,form,bucket, function (err,data) {
                if(err)
                    res.jsonp(err);
                else
                    res.jsonp(data);
            })
        }

    };

    controller.download = function (req, res) {
        res.jsonp({"res": "error", "msg": __('m_upload_backend_controllers_index_delete_error_integrated')});
    };

    controller.downloadDir = function (req, res) {
        res.jsonp({"res": "error", "msg": __('m_upload_backend_controllers_index_delete_error_integrated')});
    };

    controller.deleteFile = function (req, res) {
        let file = req.body.f;
        // Only allow delete file inside owner folder if user does not have permission manage all
        if (req.permissions.indexOf(permissionManageAll) === -1) {
            res.jsonp({"res": "error", "msg": "Cannot delete this file"});
        } else {
            let s3 = new AWS.S3();
            s3.deleteObject({
                Bucket : bucket,
                Key : file.replace(s3.endpoint.href+bucket+'/','')
            }, function (err,result) {
                if (err)
                    res.jsonp({"res": "error", "msg": err.message});
                else
                    res.jsonp({"res": "ok", "msg": ""});
            });
        }
    };

    controller.copyFile = function (req, res) {
        res.jsonp({"res": "error", "msg": __('m_upload_backend_controllers_index_delete_error_integrated')});
    };

    controller.moveFile = function (req, res) {
        res.jsonp({"res": "error", "msg": __('m_upload_backend_controllers_index_delete_error_integrated')});
    };

    controller.renameFile = function (req, res) {
        let f = req.body.f;
        let n = req.body.n;
        if (req.permissions.indexOf(permissionManageAll) === -1 ) {
            res.jsonp({"res": "error", "msg": "You have not permission to do this action !"});
        } else {
            let s3 = new AWS.S3();
            f = f.replace(s3.endpoint.href+bucket+'/','');
            n = f.replace(f.split('/').pop(),n);
            if (f.split('/').pop() === n.split('/').pop()){
                res.jsonp({"res": "error", "msg": "Choose another name of file please !"});
            }else{
                let aws = new ArrowHelper.AWS(s3,allowExtension);
                aws.rename('file',{
                    Bucket: bucket,
                    CopySource: bucket+'/'+f,
                    Key: n,
                    ACL: 'public-read-write'
                }, function (err,data) {
                    if(err)
                        res.jsonp(err);
                    else
                        res.jsonp(data);
                })
            }
        }
    };

    controller.thumb = function (req, res) {
        if (req.permissions.indexOf(permissionManageAll) === -1) {
            res.jsonp({"res": "error", "msg": "You have not permission to do this action !"});
        } else {
            let filePath =req.query.f;
            if (filePath.indexOf('.png') || filePath.indexOf('.jpg') || filePath.indexOf('.gif') || filePath.indexOf('.jpeg')) {
                res.redirect(req.query.f);
            } else {
                res.end();
            }
        }
    };
};