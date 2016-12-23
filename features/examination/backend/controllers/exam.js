/**
 * Created by thangnv on 11/3/16.
 */
'use strict';
let Promise = require('arrowjs').Promise;

module.exports = function (controller,component,app) {
    let baseRoute = '/admin/examination/exam';
    let permission = {
        all : 'manager',
        create : 'manager',
        index : 'manager',
        delete : 'manager',
        active: 'active'
    }
    let isAllow = ArrowHelper.isAllow;
    controller.eList = function (req,res) {
        let actions = app.feature.examination.actions;
        // Get current page and default sorting
        let page = req.params.page || 1;
        let itemOfPage = app.getConfig('pagination').numberItem || 10;

        // Add button on view
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addRefreshButton(baseRoute);
        toolbar.addSearchButton(isAllow(req, permission.index));
        toolbar.addGeneralButton(true,{
            link: baseRoute+'/create-auto',
            title: '<i class="fa fa-plus"></i>  Create Exam Auto',
            buttonClass: 'btn btn-primary'
        });
        toolbar.addGeneralButton(true,{
            link: baseRoute+'/create-manual',
            title: '<i class="fa fa-plus"></i>  Create Exam Manual',
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
                column : 'gift',
                width : '10%',
                header : 'Gift Code',
                filter : {
                    data_type : 'string',
                    filter_key: 'gift'
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
            backLink: 'qa_back_link'
        });
        filter.order = req.params.sort ? req.params.sort : 'created_at DESC';
        actions.examFindAndCountAll({
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
            res.backend.render('exam/list',{
                title: 'List Of Exam',
                toolbar : toolbar,
                items: result.rows,
                totalPage: totalPage,
                currentPage: page,
                queryString: (req.url.indexOf('?') == -1) ? '' : ('?' + req.url.split('?').pop()),
                baseRoute: baseRoute
            })
        }).catch(function (err) {
            req.flash.error(err.message);
            res.backend.render('exam/list',{
                title: 'List Of Exam',
                toolbar : toolbar
            })
        })

    }
    controller.eCreateManual = function (req,res) {
        let actions = app.feature.examination.actions;
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'qa_back_link');
        toolbar.addSaveButton();
        Promise.all([
            actions.sFindAll(),
            app.models.gift.findAll({
                attributes: ['id','title'],
                where: {
                    status : 1
                }
            })
        ])

        .then(function (result) {
                console.log(JSON.stringify(result,2,2));
            res.backend.render('exam/create-manual',{
                title: 'Create Exam Manual',
                subjects: result[0],
                gifts: result[1],
                toolbar: toolbar.render()
            });
        }).catch(function (err) {
            req.flash.error(err.message);
            res.backend.render('exam/create-manual',{
                title: 'Create Exam Manual',
                toolbar: toolbar.render()
            });
        })

    }
    controller.eGetSections = function (req,res) {
        let actions = app.feature.examination.actions;
        actions.secFindAll({
            attributes: ['id','title'],
            where: {
                subject_id: req.params.subjectId
            }//,
            //include: [
            //    {
            //        model: app.models.question,
            //        include: [
            //            {
            //                model: app.models.answer,
            //                as: 'answers'
            //            }
            //        ],
            //        as: 'questions'
            //    }
            //]
        })
        .then(function (sections) {

            res.jsonp(JSON.parse(JSON.stringify(sections)));
        }).catch(function (err) {
                //console.log(err);
            res.jsonp(err);
        })
    }
    controller.eGetQuestions = function (req,res) {
        //console.log(req.params.sectionId);
        let actions = app.feature.examination.actions;
        actions.questionFindAll({
            where: {
                section_id: req.params.sectionId
            },
            include: [
                {
                    model: app.models.answer,
                    as: 'answers',
                    where: ['1=1']
                }
            ]
        })
        .then(function (questions) {
            res.jsonp(JSON.parse(JSON.stringify(questions)));
        }).catch(function (err) {
            res.jsonp(null);
        })
    }
    controller.eSaveManual = function (req,res) {
        let actions = app.feature.examination.actions;
        let form = req.body;
        //console.log(JSON.stringify(form));
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'qa_back_link');
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
        actions.examCreate(form)
        .then(function (exam) {
            //console.log('create ok');
            req.flash.success('Create Successfully !');
            res.redirect(baseRoute);
        }).catch(function (err) {
                //console.log(err);
            req.flash.error(err.message);
            actions.sFindAll()
            .then(function (subjects) {
                res.backend.render('exam/create-manual',{
                    title: 'Create Exam Manual',
                    exam: form,
                    subjects: subjects,
                    toolbar: toolbar.render()
                });
            }).catch(function (err) {
                req.flash.error(err.message);
                res.backend.render('exam/create-manual',{
                    title: 'Create Exam Manual',
                    toolbar: toolbar.render()
                });
            })
        })

    }
    controller.eUpdateManual = function (req,res,next) {
        let actions = app.feature.examination.actions;
        let form = req.body;
        let examId = req.params.examId;
        //console.log(JSON.stringify(form));
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'qa_back_link');
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
            actions.examFind({
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
                return actions.examUpdate(result[0],form);
            }else{
                throw new Error('');
            }
        }).then(function () {
            req.flash.success("Update successfully !");
            next();
        })
        .catch(function (err) {
                console.log(err);
            req.flash.error("This Exam is used ! Please don't edit it !");
            actions.sFindAll()
            .then(function (subjects) {
                res.backend.render('exam/create-manual',{
                    title: 'Create Exam Manual',
                    exam: form,
                    subjects: subjects,
                    toolbar: toolbar.render()
                });
            }).catch(function (err1) {
                req.flash.error(err1.message);
                res.backend.render('exam/create-manual',{
                    title: 'Create Exam Manual',
                    toolbar: toolbar.render()
                });
            })
        })
    }
    controller.eViewManual = function (req,res) {
        let actions = app.feature.examination.actions;
        let examId = req.params.examId;
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'qa_back_link');
        toolbar.addSaveButton();
        Promise.all([
            actions.examFind({
                where: {
                    id: examId
                }
            }),
            actions.sFindAll({
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
            res.backend.render('exam/create-manual',{
                exam : result[0],
                subjects: result[1],
                gifts: result[2],
                toolbar: toolbar.render()
            });
        }).catch(function (err) {
            req.flash.error(err.message);
            res.backend.render('exam/create-manual',{
                title: 'Edit Exam',
                toolbar: toolbar.render()
            });
        })

    };
    controller.eDelete = function (req,res) {
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
            req.flash.success('Delete successfully !');
            res.jsonp({
                error: null
            });
        }).catch(function (err) {
            req.flash.error('This exam is used by user !');
            res.jsonp({
                error: 'You cannot delete one of sections !'
            });
        });
    }
}