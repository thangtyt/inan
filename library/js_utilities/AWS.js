/**
 * Created by thangnv on 10/20/16.
 */
'use strict';
let fs = require('fs'),
    _= require('arrowjs')._;
class AWS {
    constructor(s3, ext) {
        this.s3Client = s3;
        this.extensions = ext;
    }

    /*
     * Get Create Folder
     * */
    createFolder(params, done) {
        this.s3Client.createBucket(params, function (err, data) {
            done(err, data);
        })
    }

    /*
     * Get All Folder
     * */
    getAllDir(params, done) {
        let results = [];
        this.s3Client.listObjects(params, function (err, data) {
            if (err) {
                done(err, [])
            } else {
                let listObj = [];
                _.map(data['Contents'], function (val) {
                    if (val.hasOwnProperty('Key')) {
                        listObj.push(val);
                    }

                });
                done(null, countFolder(listObj));
            }
        });
    }

    //get Object to be prepare delete
    getObjectDelete(params, done) {
        this.s3Client.listObjects(params, function (err, data) {
            if (err) {
                done(err, null)
            } else {
                if (data['Contents'].length == 1) {
                    done(null, data)
                }else if (data['Contents'].length > 1){
                    done({error: 'err', message: 'Cannot delete folder contain file or another folder !'})
                }
                else {
                    done({error: 'err', message: 'Not Found !'})
                }

            }
        })
    }
    //list all file of folder
    listFile(params, pFile, done) {
        let extensions = this.extensions;
        this.s3Client.listObjects(params, function (err, data) {
            let results = [];

            if (err) {
                done({res: 'error'}, null);
            }
            else {
                _.map(data.Contents, function (val) {
                    if (val['Key'].indexOf(pFile.folder) > -1) {
                        let tempStr = val['Key'].replace(pFile.folder + '/', '');
                        if (_.indexOf(extensions, ('.' + tempStr.split('.').pop())) > -1 && _.indexOf(tempStr, '/') < 0) {
                            results.push({
                                p: pFile.path + val['Key'],
                                s: val['Size'],
                                t: new Date(val['LastModified']).getTime() / 1000,
                                h:"0",
                                w:"0"
                            });
                        }
                        //todo: get dimension?

                    }
                })
                done(null, results);
            }
        })
    }
    //upload file to server
    uploadFile(req, form, bucket, done) {
        let s3 = this.s3Client;
        let msg = '';
        form.parse(req, function (err, fields, files) {
            _.map(files, function (val) {
                fs.readFile(val.path, function (err, file_buffer) {
                    let key_ = fields.d + '/' + val['name'].replace(/[ ~!@#$%^&*()_:"',?;]/g, '-');
                    key_ = key_.replace(/[-]+/g, '-');
                    let params = {
                        Bucket: bucket,
                        Key: key_,
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
                    });
                });
            })
        });
        form.on('error', function (err) {
            done({"res": "error", "msg": err.message}, null)
        });
        form.on('end', function (aaa) {
            if (msg) {
                done({"res": "error", "msg": msg}, null);
            } else {
                done(null, {"res": "ok", "msg": ""});
            }
        });

    }
    //rename file or folder
    rename(type,params,done){
        let s3 = this.s3Client;
        if(type === 'file') {
            console.log(params);
            s3.copyObject(params, function (err, data) {
                if (err) {
                    done({"res": "error", "msg": err.message});
                }
                else {
                    s3.deleteObject({
                        Bucket: params.Bucket,
                        Key:  params.CopySource.replace(params.Bucket+'/','')
                    }, function (err, result) {
                        if (err)
                            done({"res": "error", "msg": err.message});
                        else
                            done({"res": "ok", "msg": ""});
                    });

                }
            });
        }
        else if(type === 'folder'){
            let oldFolder = params.CopySource.replace(params.Bucket+'/','');
            s3.listObjects({
                Bucket: params.Bucket,
                Prefix: oldFolder
            }, function (err,data) {
                if(data['Contents'].length == 1){
                    s3.copyObject(params, function (err, data) {
                        if (err) {
                            done({"res": "error", "msg": err.message});
                        }
                        else {
                            s3.deleteObject({
                                Bucket: params.Bucket,
                                Key: oldFolder
                            }, function (err, result) {
                                if (err)
                                    done({"res": "error", "msg": err.message});
                                else
                                    done({"res": "ok", "msg": ""});
                            });

                        }
                    });

                }else {
                    done({"res": "error", "msg": "Cannot rename folder is not empty !"});
                }

            })
        }else{
            done({"res": "error", "msg": "Error when rename folder"});
        }
    }
}
function countFolder(list){
    let results = [];
    _.map(list, function (data) {
        let src = data['Key'];
        let f = 0;
        let s = 0;
        _.map(list, function (ele) {
            let srcTemp = ele['Key'].replace(/\/$/,'');
            if ( src.length < srcTemp.length ){
                let temp =srcTemp.replace(src,'').split('/').filter(function (val) {
                    if ( val != '' ) return val;
                });
                if (temp.length == 1 && ele['Key'].match((/\/$/))){
                    s++;
                }else if (temp.length == 1 && !ele['Key'].match((/\/$/))){
                    f++;
                }
            }
        });
        //only allows folder
        if (data['Key'].match(/\/$/)){
            results.push({
                p: src.replace(/\/$/,''),
                f: f,
                d: s
            })
        }

    })
    return results;
}
module.exports = {
    AWS : AWS
}