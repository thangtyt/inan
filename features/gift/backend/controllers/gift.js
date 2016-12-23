/**
 * Created by thangtyt on 12/22/16.
 */
'use strict';
let Promise = require('arrowjs').Promise;
let _ = require('arrowjs')._;
let formidable = require('formidable');
let fs = require('fs');
let excel = require('xlsx');
let excelExport = require('excel-export');
module.exports = function (controller,component,app) {
    let baseRoute = '/admin/gift';
    let permission = {
        all: 'all',
        create: 'create',
        edit: 'edit',
        delete: 'delete',
        view: 'view'
    };
    let isAllow = ArrowHelper.isAllow;
    controller.list = function (req, res) {
        // Get current page and default sorting
        let page = req.params.page || 1;
        let itemOfPage = app.getConfig('pagination').numberItem || 10;
        // Add button on view
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addRefreshButton(baseRoute);
        toolbar.addSearchButton();
        toolbar.addGeneralButton(isAllow(req, permission.create), {
            link: baseRoute + '/create',
            title: '<i class="fa fa-plus"></i> Create ',
            buttonClass: 'btn btn-primary'
        });
        toolbar.addDeleteButton();
        toolbar = toolbar.render();
        let table = [
            {
                column: 'id',
                width: '1%',
                header: ' ',
                type: 'checkbox'
            },
            {
                column: 'title',
                width: '40%',
                header: 'Tiêu đề',
                link: baseRoute + '/' + '{id}',
                filter: {
                    data_type: 'string',
                    filter_key: 'title'
                }
            },
            {
                column: 'user.user_email',
                width: '40%',
                header: 'Người tạo',
                filter: {
                    data_type: 'string',
                    filter_key: 'user.user_email'
                }
            },
            {
                column: 'created_at',
                width: '40%',
                header: 'Ngày Tạo',
                type: 'datetime',
                dateFormat: 'DD/MM/YYYY',
                filter: {
                    data_type: 'datetime',
                    filter_key: 'created_at'
                }
            },
            {
                column: 'status',
                width: '15%',
                header: 'Trạng thái',
                type: 'custom',
                alias: {
                    "0": '<span class="label label-danger">Không kích hoạt</span>',
                    "1": '<span class="label label-success">Kích hoạt</span>'
                },
                filter: {
                    type: 'select',
                    filter_key: 'status',
                    data_source: [
                        {
                            name: 'Không kích hoạt',
                            value: 0
                        }, {
                            name: 'Kích hoạt',
                            value: 1
                        }
                    ],
                    display_key: 'name',
                    value_key: 'value'
                }
            }

        ];
        let filter = ArrowHelper.createFilter(req, res, table, {
            rootLink: baseRoute + '/page/$page/sort',
            limit: itemOfPage,
            backLink: 'gift_back_link'
        });
        filter.order = req.params.sort ? req.params.sort : 'created_at DESC';
        Promise.all([
            app.models.gift.findAll({
                where: filter.conditions,
                order: filter.order,
                include: [
                    {
                        model: app.models.user,
                        attributes: ['user_email'],
                        where: ['1=1']
                    }
                ],
                limit: filter.limit,
                offset: (page - 1) * itemOfPage
            }),
            app.models.gift.count({
                where: filter.conditions,
                include: [
                    {
                        model: app.models.user,
                        attributes: ['user_email'],
                        where: ['1=1']
                    }
                ]
            })
        ])
        .then(function (result) {
                console.log(JSON.stringify(result,2,2));
            let totalPage = Math.ceil(result[1].count / itemOfPage);
            res.backend.render('list', {
                title: 'Danh sách các phần quà tặng',
                toolbar: toolbar,
                items: result[0],
                totalPage: totalPage,
                currentPage: page,
                queryString: (req.url.indexOf('?') == -1) ? '' : ('?' + req.url.split('?').pop()),
                baseRoute: baseRoute
            })
        }).catch(function (err) {
            //console.log(err);
            req.flash.error(err.message);
            res.backend.render('list', {
                title: 'Danh sách các phần quà tặng',
                toolbar: toolbar
            })
        })
    };
    controller.create = function (req, res) {
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'gift_back_link');
        toolbar.addSaveButton();
        res.backend.render('form',{
            toolbar : toolbar.render(),
            title: 'Thêm mới phần quà tặng'
        })
    };
    controller.view = function (req, res) {
        let giftId = req.params.giftId;
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'gift_back_link');
        toolbar.addSaveButton();
        toolbar.addGeneralButton(isAllow(req, permission.create), {
            link: 'javascript:exportExcel()',
            title: '<i class="fa fa-plus"></i> Xuất excel',
            buttonClass: 'btn btn-primary'
        });
        toolbar.addDeleteButton();
        Promise.all([
            app.models.gift.find({
                where: {
                    id: giftId
                }
            }),
            app.models.giftCode.findAndCountAll({
                where: {
                    gift_id: giftId
                },
                attributes:['status','gift_code'],
                limit: 150,
                order: 'gift_code desc',
                raw:true
            })
        ])
        .then(function (result) {
            if(!result[0]){
                throw new Error('Không tìm thấy phần quà này !')
            }else{
                result[1].pagination = {
                    page : 1,
                    itemOfPage : 150,
                    totalGift : result[1].count
                };
                res.backend.render('form',{
                    title: 'Chi tiết phần quà',
                    gift: result[0],
                    giftCodes: result[1],
                    toolbar : toolbar.render(),
                    baseRoute: baseRoute
                })
            }
        }).catch(function (err) {
            req.flash.error(err.message);
            res.redirect(req.session.search['gift_back_link']);
        })


    };
    controller.delete = function (req, res) {

        let ids = [];
        if (req.params.giftId){
            ids = [req.params.giftId]
        }else{
            ids = req.body.ids.split(',');
        }
        Promise.all([
            app.models.gift.findAll({
                where: {
                    id: {
                        $in: ids
                    },
                    status: 1
                }
            }),
            app.models.giftCode.findAll({
                where: {
                    gift_id: {
                        $in: ids
                    },
                    status: 1
                }
            })
        ])
        .then(function (result) {
            if(result[0].length > 0){
                req.flash.error('Không thể xóa phần quà đã được kích hoạt !');
                res.jsonp({
                    error: 'Không thể xóa phần quà đã được kích hoạt !'
                });
            }else if(result[1].length > 0){
                req.flash.error('Không thể xóa phần quà đã có mã quà tặng được kích hoạt !');
                res.jsonp({
                    error: 'Không thể xóa phần quà đã có mã quà tặng được kích hoạt !'
                });
            }else{
                return app.models.transaction(function (t) {
                    return app.models.giftCode.destroy({
                        where: {
                            gift_id: {
                                $in: ids
                            }
                        }
                    },{transaction : t})
                    .then(function (_giftCode) {
                        return app.models.gift.destroy({
                            where: {
                                id: {
                                    $in: ids
                                }
                            }
                        },{transaction : t})
                    }).then(function (_gift) {
                        if(_gift > 0){
                            req.flash.success('Xóa phần quà thành công !');
                            res.jsonp({
                                error: null
                            });
                        }else{
                            console.log(1);
                            t.rollback();
                            req.flash.error('Xóa phần quà không thành công !');
                            res.jsonp({
                                error: 'Xóa phần quà không thành công !'
                            });
                        }
                    })
                })
            }
        }).catch(function (err) {
                res.jsonp({
                    error: err.message
                });
            });
        //app.models.question.count({
        //    where: {
        //        section_id : {
        //            $in : ids
        //        }
        //    }
        //}).then(function (_questionCount) {
        //    if(_questionCount > 0 ){
        //        throw new Error();
        //    }else{
        //        return app.models.section.destroy({
        //            where : {
        //                id: {
        //                    $in: ids
        //                }
        //            }
        //        })
        //    }
        //}).then(function (result) {
        //    req.flash.success('Delete successfully !');
        //    res.jsonp({
        //        error: null
        //    });
        //}).catch(function (err) {
        //    req.flash.error('Exits sections is used by user !');
        //    res.jsonp({
        //        error: 'You cannot delete one of sections !'
        //    });
        //});

    };
    controller.update = function (req, res,next) {
        let giftId = req.params.giftId;

        let form = new formidable.IncomingForm();

        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'gift_back_link');
        toolbar.addSaveButton();
        form.parse(req,function (err, fields, files) {
            Promise.all([
                app.models.giftCode.find({
                    where: {
                        gift_id: giftId,
                        status: 1
                    }
                }),
                app.models.gift.find({
                    where: {
                        id: giftId
                    }
                })
            ])
            .then(function (result) {
                return result[1].updateAttributes(fields)
                    .then(function (_gift) {
                        req.flash.success('Cập nhật phần quà tặng thành công !');
                        if(files.file.size == 0){
                            res.redirect(baseRoute+'/'+giftId);
                        }else if(result[0]){
                            req.flash.error('Không thể cập nhật mã quà tặng đã được sử dụng !');
                            res.redirect(baseRoute+'/'+giftId);
                        }else {
                            if (files.file.type.indexOf('officedocument.spreadsheetml.sheet') == -1) {
                                req.flash.error('Không cập nhật được mã quà tặng ! Mã quà tặng chỉ được nhập file dạng excel !');
                                res.backend.render('form', {
                                    toolbar: toolbar.render(),
                                    title: 'Chi tiết phần quà',
                                    gift: fields
                                })
                            } else {
                                app.models.transaction(function (t) {
                                    return app.models.giftCode.destroy({
                                        where: {
                                            gift_id: giftId
                                        }
                                    }, {transaction: t})
                                    .then(function (count) {
                                        let workbook = excel.readFile(files.file.path);
                                        let giftCodes = [];
                                        _.map(workbook.Strings, function (obj) {
                                            if (obj['t'].match(/[A-Z0-9]{5,}/)) {
                                                giftCodes.push({
                                                    gift_id: giftId,
                                                    gift_code:obj.t
                                                });
                                            }
                                        });
                                        fs.unlink(files.file.path, function (err) {
                                        });//xoa file temp tren server

                                        return app.models.giftCode.bulkCreate(giftCodes, {transaction: t});
                                    })
                                }).then(function (result) {
                                    req.flash.success('Đã cập nhật thành công mã quà tặng !');
                                    res.redirect(baseRoute + '/' + giftId);
                                }).catch(function (err) {
                                    console.log(err.message);
                                    req.flash.error('Không cập nhật được mã quà tặng !');
                                    res.backend.render('form', {
                                        toolbar: toolbar.render(),
                                        title: 'Chi tiết phần quà',
                                        gift: fields
                                    })
                                })
                            }
                        }
                    })
            }).catch(function (err) {
                req.flash.error(err.message);
                res.backend.render('form',{
                    toolbar : toolbar.render(),
                    title: 'Chi tiết phần quà',
                    gift: fields
                })
            })
        });


    };

    controller.save = function (req, res) {
        let form = new formidable.IncomingForm();
        let data;
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'gift_back_link');
        toolbar.addSaveButton();
        form.parse(req,function (err, fields, files) {
            fields.user_id = req.user.id;
            data = fields;
            if(err){
                req.flash.error('Lỗi file excel !');
                res.backend.render('form',{
                    toolbar : toolbar.render(),
                    title: 'Thêm mới phần quà tặng',
                    gift: data
                })
            }else{
                _.map(files, function (file) {
                    if(file.type.indexOf('officedocument.spreadsheetml.sheet') == -1){
                        req.flash.error('Chỉ được nhập file dạng excel !');
                        res.backend.render('form',{
                            toolbar : toolbar.render(),
                            title: 'Thêm mới phần quà tặng',
                            gift: data
                        })
                    }else{
                        let workbook = excel.readFile(file.path,{type: 'v'});
                        let giftCodes = [];
                        _.map(workbook.Strings, function (obj) {
                            if(obj['t'].match(/[A-Z0-9]{5,}/)){
                                giftCodes.push(obj.t);
                            }
                        });
                        fs.unlink(file.path, function (err) {});//xoa file temp tren server
                        app.models.transaction(function (t) {
                            return app.models.gift.create(data,{transaction: t})
                                .then(function (_gift) {
                                    let dataGiftCodes = [];
                                     _.map(giftCodes,function (val) {
                                        dataGiftCodes.push( {
                                            gift_id: _gift.id,
                                            gift_code: val
                                        })
                                    });
                                    return app.models.giftCode.bulkCreate(dataGiftCodes,{transaction: t});
                                })
                        }).then(function (result) {
                            req.flash.success('Đã thêm mới 1 phần quà thành công !');
                            res.redirect(baseRoute);
                        }).catch(function (err) {
                            req.flash.error(err.message);
                            res.backend.render('form',{
                                toolbar : toolbar.render(),
                                title: 'Thêm mới phần quà tặng',
                                gift: data
                            })
                        })
                    }
                })
            }
        });
    };
    controller.searchGiftCode = function (req,res) {
        let page = req.body.page || 1;
        let key = req.body.key.toUpperCase();
        let giftId = req.params.giftId;
        let conditions = {
            where : {
                gift_code : {
                    $like : '%'+key+'%'
                },
                gift_id: giftId
            },
            attributes: ['status','gift_code'],
            limit : 150,
            offset : (page-1)*150,
            order : 'gift_code ASC',
            raw: true
        };
        if(+req.body.type != 2){
            conditions.where.status = +req.body.type;
        }
        app.models.giftCode.findAndCountAll(conditions)
            .then(function (giftcodes) {
                giftcodes.pagination = {
                    page : page,
                    itemOfPage : 150,
                    totalGift : giftcodes.count
                };
                res.jsonp(giftcodes);
            })
            .catch(function (err) {
                res.send({});
            })
    };
    controller.exportGiftCodeExcel = function (req,res) {
        //console.log(process.cwd(),req.query);
        let rootPath = process.cwd();
        let type = req.query.type || 2;
        let giftId = req.query.giftId;

        let key = req.query.key.toUpperCase() || '';
        let conditions = {
            where : {
                gift_code : {
                    $iLike : '%'+key+'%'
                },
                gift_id: giftId
            },
            attributes: ['status','gift_code'],
            order : 'gift_code ASC',
            raw: true
        };
        if(+type != 2){
            conditions.where.status = +req.query.type;
        }
        app.models.giftCode.findAll(conditions)
        .then(function (giftcodes) {
                if(!req.query.giftId)
                throw new Error('not found');
                let active = [];
                let deactive = [];
                giftcodes.map(function (val) {
                    if(val.status == 0){
                        deactive.push(val.gift_code);
                    }else{
                        active.push(val.gift_code);
                    }
                });
                let rows = [];

                let index = active.length > deactive.length ? active.length : deactive.length;

                for(let i = 0 ; i < index ; i++){
                    if(i > (active.length - 1) ){
                        rows.push(['',deactive[i]])
                    }else if (i > (deactive.length - 1) ){
                        rows.push([active[i],''])
                    }else{
                        rows.push([active[i],deactive[i]])
                    }

                }
                var conf ={};
                //conf.stylesXmlFile = rootPath+"/upload/excel/styles.xml";
                conf.name = "giftCodes";
                conf.cols = [{
                    caption:'Kích hoạt',
                    type:'string'
                },{
                    caption:'Chưa kích hoạt',
                    type:'string'
                },];



                conf.rows = rows;
                var result = excelExport.execute(conf);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader("Content-Disposition", "attachment; filename=" + "gift-codes.xlsx");
                res.end(result, 'binary');
        })
        .catch(function (err) {
            res.jsonp({
                error: err.message
            });
        })
    }
}