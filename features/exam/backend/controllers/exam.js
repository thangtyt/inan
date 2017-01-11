/**
 * Created by thangnv on 11/3/16.
 */
'use strict';
let Promise = require('arrowjs').Promise;

module.exports = function (controller,component,app) {
    let baseRoute = '/admin/exam';
    let permission = {
        all : 'all',
        create : 'create',
        edit : 'edit',
        delete : 'delete',
        active: 'active'
    };
    let isAllow = ArrowHelper.isAllow;
    controller.list = function (req,res) {
        // Get current page and default sorting
        let page = req.params.page || 1;
        let itemOfPage = app.getConfig('pagination').numberItem || 10;

        // Add button on view
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addRefreshButton(baseRoute);
        toolbar.addSearchButton(isAllow(req, permission.view));
        //toolbar.addGeneralButton(true,{
        //    link: baseRoute+'/create-auto',
        //    title: '<i class="fa fa-plus"></i>  Create Exam Auto',
        //    buttonClass: 'btn btn-primary'
        //});
        toolbar.addGeneralButton(true,{
            link: baseRoute+'/create-manual',
            title: '<i class="fa fa-plus"></i> Tạo đề',
            buttonClass: 'btn btn-primary'
        })
        toolbar.addDeleteButton();
        toolbar = toolbar.render();
        let table = [
            {
                column : 'id',
                width : '1%',
                header : ' ',
                type : 'checkbox'
            },
            {
                column : 'title',
                width : '69%',
                header : 'Tiêu đề',
                link : baseRoute + '/' + '{id}',
                filter : {
                    data_type : 'string',
                    filter_key: 'exam.title'
                }
            },
            {
                column : 'subject.title',
                width : '10%',
                header : 'Môn Thi',
                filter : {
                    data_type : 'string',
                    filter_key: 'subject.title'
                }
            },
            {
                column : 'status',
                width : '10%',
                header : 'Trạng thái',
                type : 'custom',
                alias : {
                    "0" : '<span class="label label-danger">Chưa kích hoạt</span>' ,
                    "1" : '<span class="label label-success">Đã kích hoạt</span>'
                },
                filter : {
                    type : 'select',
                    filter_key : 'status',
                    data_source : [
                        {
                            name : 'Chưa kích hoạt',
                            value : 0
                        },{
                            name : 'Đã kích hoạt',
                            value : 1
                        }
                    ],
                    display_key : 'name',
                    value_key : 'value'
                }
            },
            {
                column : 'level',
                width : '10%',
                header : 'Độ Khó',
                type : 'custom',
                alias : {
                    "0" : 'Dễ' ,
                    "1" : 'Bình thường',
                    "2" : 'Khó'
                },
                filter : {
                    type : 'select',
                    filter_key : 'level',
                    data_source : [
                        {
                            name : 'Dễ',
                            value : 0
                        },{
                            name : 'Bình thường',
                            value : 1
                        },{
                            name : 'Khó',
                            value : 2
                        }
                    ],
                    display_key : 'name',
                    value_key : 'value'
                }
            }

        ];
        let filter = ArrowHelper.createFilter(req, res, table, {
            rootLink: baseRoute + '/page/$page/sort',
            limit: itemOfPage,
            backLink: 'exam_back_link'
        });
        filter.order = req.params.sort ? req.params.sort : 'created_at DESC';
        app.models.exam.findAndCountAll({
            where: filter.conditions,
            order: filter.order ,
            include: [
                {
                    model: app.models.subject,
                    attributes: ['id','title'],
                    as: 'subject'
                }
            ],
            limit: filter.limit,
            offset: (page-1)*itemOfPage
        }).then(function (result) {
            let totalPage = Math.ceil(result.count / itemOfPage);
            res.backend.render('list',{
                title: 'Danh sách các đề thi',
                toolbar : toolbar,
                items: result.rows,
                totalPage: totalPage,
                currentPage: page,
                queryString: (req.url.indexOf('?') == -1) ? '' : ('?' + req.url.split('?').pop()),
                baseRoute: baseRoute
            })
        }).catch(function (err) {
            req.flash.error(err.message);
            res.backend.render('list',{
                title: 'Danh sách các đề thi',
                toolbar : toolbar
            })
        })

    };
    controller.createManual = function (req,res) {
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'exam_back_link');
        toolbar.addSaveButton();
        Promise.all([
            app.models.subject.findAll(),
            app.models.gift.findAll({
                attributes: ['id','title'],
                where: {
                    status : 1
                }
            })
        ])

        .then(function (result) {
                //console.log(JSON.stringify(result,2,2));
            res.backend.render('create-manual',{
                title: 'Tạo mới đề thi',
                subjects: result[0],
                gifts: result[1],
                toolbar: toolbar.render()
            });
        }).catch(function (err) {
            req.flash.error(err.message);
            res.backend.render('create-manual',{
                title: 'Tạo mới đề thi',
                toolbar: toolbar.render()
            });
        })
    }
    controller.getSections = function (req,res) {
        app.models.section.findAll({
            attributes: ['id','title'],
            where: {
                subject_id: req.params.subjectId
            },
            order: 'created_at desc'
        })
        .then(function (sections) {
            res.jsonp(JSON.parse(JSON.stringify(sections)));
        }).catch(function (err) {
                //console.log(err);
            res.jsonp(err);
        })
    }
    controller.getQuestions = function (req,res) {
        app.models.question.findAll({
            where: {
                section_id: req.params.sectionId
            },
            include: [
                {
                    model: app.models.answer,
                    as: 'answers',
                    where: ['1=1']
                }
            ],
            order: 'created_at desc'
        })
        .then(function (questions) {
            res.jsonp(JSON.parse(JSON.stringify(questions)));
        }).catch(function (err) {
            res.jsonp(null);
        })
    };
    controller.getSectionQuestions = function (req,res) {
        let _questions = [];
        console.log(JSON.stringify(JSON.parse(req),2,2));
        let query = {
            where: {
                section_id: req.params.sectionId
            },
            attributes: ['id','title','question_type','require','level','section_id'],
            order: 'created_at desc'
        };

        app.models.question.findAndCountAll(query)
        .then(function (result) {
                res.jsonp({
                    totalPage: Math.ceil(result.count / 10),
                    page: 1,
                    items: result.rows
                });
        }).catch(function (err) {
            res.jsonp(null);
        })
    }
    controller.saveManual = function (req,res) {
        let form = req.body;
        let toolbar = new ArrowHelper.Toolbar();
        let back_link = baseRoute;

        if (form.gifts != null || form.gifts == ''){
            let giftSplit = form.gifts.split('::');
            back_link = '/admin/exam/gift/'+giftSplit[giftSplit.length - 2];
        }else{
            back_link = req.session.search['exam_back_link'];
        }
        toolbar.addBackButton(req, 'exam_back_link');
        toolbar.addSaveButton();

        form.created_by = req.user.id;
        form.select2sections = form.select2sections ? form.select2sections : [];
        if(typeof form.select2sections == "string"){
            form.sections = [form.select2sections];
        }else{
            form.sections = form.select2sections;
        }
        try{
            form.content = JSON.parse(form.content);
        }catch(err){
            form.content = [];
        }
        //console.log(JSON.stringify(form,2,2));
        app.models.exam.create(form)
        .then(function (exam) {
            //console.log('create ok');
            req.flash.success('Tạo mới đề thành công !');
            res.redirect(baseRoute);
        }).catch(function (err) {
                console.log(err);
            //req.flash.error(err.message);
            app.models.subject.findAll()
            .then(function (subjects) {
                res.backend.render('create-manual',{
                    title: 'Tạo mới đề',
                    exam: form,
                    subjects: subjects,
                    toolbar: toolbar.render()
                });
            }).catch(function (err) {
                    //console.log(err);
                req.flash.error(err.message);
                res.backend.render('create-manual',{
                    title: 'Tạo mới đề',
                    toolbar: toolbar.render()
                });
            })
        })

    }
    controller.updateManual = function (req,res,next) {
        let form = req.body;
        let examId = req.params.examId;
        //console.log(JSON.stringify(form));
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'exam_back_link');
        toolbar.addSaveButton();
        //console.log(JSON.stringify(form));
        form.created_by = req.user.id;
        form.select2sections = form.select2sections ? form.select2sections : [];
        if(typeof form.select2sections == "string"){
            form.sections = [form.select2sections];
        }else{
            form.sections = form.select2sections;
        }
        try{
            form.content = JSON.parse(form.content);
        }catch(err){
            form.content = [];
        }
        //console.log(JSON.stringify(form,2,2));
        Promise.all([
            app.models.exam.find({
                where: {
                    id: examId
                }
            }),
            app.models.userResult.count({
                where: {
                    exam_id : examId
                }
            })
        ])
        .then(function (result) {
                //console.log(JSON.stringify(result, 2, 2));
            if(result[0] && result[1] < 1){
                return result[0].updateAttributes(form);
            }else{
                throw new Error('');
            }
        }).then(function () {
            req.flash.success("Cập nhật thành công !");
            next();
        })
        .catch(function (err) {
            req.flash.error("Đề này đã được thi vui lòng không sửa !");
            next();
        })
    }
    controller.viewManual = function (req,res) {

        let examId = req.params.examId;
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'exam_back_link');
        toolbar.addSaveButton();
        Promise.all([
            app.models.exam.find({
                where: {
                    id: examId
                }
            }),
            app.models.subject.findAll({
                attributes: ['id','title']
            }),
            app.models.gift.findAll({
                attributes: ['id','title'],
                where: {
                    status : 1
                }
            })
        ])
        .then(function (result) {
            //console.log(JSON.stringify(result, 2, 2));
            res.backend.render('create-manual',{
                title: 'Chỉnh sửa đề thi',
                exam : result[0],
                subjects: result[1],
                gifts: result[2],
                toolbar: toolbar.render()
            });
        }).catch(function (err) {
            req.flash.error(err.message);
            res.backend.render('create-manual',{
                title: 'Chỉnh sửa đề thi',
                toolbar: toolbar.render()
            });
        })

    };
    controller.delete = function (req,res) {
        let ids = [];
        if (req.params.examId){
            ids = [req.params.examId]
        }else{
            ids = req.body.ids.split(',');
        }
        app.models.userResult.count({
            where: {
                exam_id : {
                    $in : ids
                }
            }
        }).then(function (examCount) {
            if(examCount > 0 ){
                throw new Error();
            }else{
                return app.models.exam.destroy({
                    where : {
                        id: {
                            $in: ids
                        }
                    }
                })
            }
        }).then(function (result) {
            req.flash.success('Xóa đề thi thành công !');
            res.jsonp({
                error: null
            });
        }).catch(function (err) {
            req.flash.error('Đề này đã được sử dụng !');
            res.jsonp({
                error: 'Bạn không được sửa đề thi này !'
            });
        });
    };
    ///get by gift
    controller.gift = function (req,res) {
        // Get current page and default sorting
        let page = req.params.page || 1;
        let itemOfPage = app.getConfig('pagination').numberItem || 10;
        req.query.status = '1';
        // Add button on view
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addRefreshButton(req.originalUrl);
        toolbar.addSearchButton();
        //toolbar.addGeneralButton(isAllow(req, permission.create), {
        //    link: baseRoute + '/create-manual',
        //    title: '<i class="fa fa-plus"></i>  ',
        //    buttonClass: 'btn btn-primary'
        //});
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
                link: baseRoute + '/gift/' + '{id}',
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
            }

        ];
        let filter = ArrowHelper.createFilter(req, res, table, {
            rootLink: baseRoute + '/page/$page/sort',
            limit: itemOfPage,
            backLink: 'exam_back_link'
        });

        filter.order = req.params.sort ? req.params.sort : 'created_at DESC';
        //filter.conditions = filter.conditions.length == 1 ? [' status = ? ','1'] : filter.conditions.concat([' status = ? ','1']);
        Promise.all([
            app.models.gift.findAll({
                where: filter.conditions,
                order: filter.order,
                include: [
                    {
                        model: app.models.user,
                        attributes: ['user_email']
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
                        attributes: ['user_email']
                    }
                ]
            })
        ])
        .then(function (result) {
            //console.log(JSON.stringify(result,2,2));
            let totalPage = Math.ceil(result[1].count / itemOfPage);
            res.backend.render('listGift', {
                title: 'Danh sách bộ đề thi',
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
            res.backend.render('listGift', {
                title: 'Danh sách bộ đề thi',
                toolbar: toolbar
            })
        })
    };
    controller.examByGift = function (req,res) {
        // Get current page and default sorting
        let giftId = req.params.giftId;
        let page = req.params.page || 1;
        let itemOfPage = app.getConfig('pagination').numberItem || 10;

        // Add button on view
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addRefreshButton(baseRoute);
        toolbar.addSearchButton(isAllow(req, permission.view));
        //toolbar.addGeneralButton(true,{
        //    link: baseRoute+'/create-auto',
        //    title: '<i class="fa fa-plus"></i>  Create Exam Auto',
        //    buttonClass: 'btn btn-primary'
        //});
        toolbar.addGeneralButton(true,{
            link: baseRoute+'/create-manual',
            title: '<i class="fa fa-plus"></i> Tạo đề',
            buttonClass: 'btn btn-primary'
        })
        toolbar.addDeleteButton();
        toolbar = toolbar.render();
        let table = [
            {
                column : 'id',
                width : '1%',
                header : ' ',
                type : 'checkbox'
            },
            {
                column : 'title',
                width : '69%',
                header : 'Title',
                link : baseRoute + '/' + '{id}',
                filter : {
                    data_type : 'string',
                    filter_key: 'exam.title'
                }
            },
            {
                column : 'subject.title',
                width : '10%',
                header : 'Subject',
                filter : {
                    data_type : 'string',
                    filter_key: 'subject.title'
                }
            },
            {
                column : 'level',
                width : '10%',
                header : 'Level',
                type : 'custom',
                alias : {
                    "0" : 'Basic' ,
                    "1" : 'Medium',
                    "2" : 'Difficult'
                },
                filter : {
                    type : 'select',
                    filter_key : 'level',
                    data_source : [
                        {
                            name : 'Easy',
                            value : 0
                        },{
                            name : 'Medium',
                            value : 1
                        },{
                            name : 'Difficult',
                            value : 2
                        }
                    ],
                    display_key : 'name',
                    value_key : 'value'
                }
            }

        ];
        let filter = ArrowHelper.createFilter(req, res, table, {
            rootLink: baseRoute + '/page/$page/sort',
            limit: itemOfPage,
            backLink: 'exam_back_link'
        });
        filter.order = req.params.sort ? req.params.sort : 'created_at DESC';
        filter.conditions = filter.conditions.length == 1 ? [' gifts iLike \'%'+giftId+'%\' '] : filter.conditions.push(' gifts iLike \'%'+giftId+'%\' ');
        app.models.exam.findAndCountAll({
            where: filter.conditions,
            order: filter.order ,
            include: [
                {
                    model: app.models.subject,
                    attributes: ['id','title'],
                    as: 'subject'
                }
            ],
            limit: filter.limit,
            offset: (page-1)*itemOfPage
        }).then(function (result) {
            let totalPage = Math.ceil(result.count / itemOfPage);
            res.backend.render('list',{
                title: 'Danh sách các đề thi',
                toolbar : toolbar,
                items: result.rows,
                totalPage: totalPage,
                currentPage: page,
                queryString: (req.url.indexOf('?') == -1) ? '' : ('?' + req.url.split('?').pop()),
                baseRoute: baseRoute
            })
        }).catch(function (err) {
            req.flash.error(err.message);
            res.backend.render('list',{
                title: 'Danh sách các đề thi',
                toolbar : toolbar
            })
        })

    };
};