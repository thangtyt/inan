/**
 * Created by thangnv on 11/3/16.
 */
'use strict';
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
                width : '20%',
                header : 'Title',
                link : baseRoute + '/' + '{id}',
                filter : {
                    data_type : 'string'
                }
            }
        ];
        let filter = ArrowHelper.createFilter(req, res, table, {
            rootLink: baseRoute + '/page/$page/sort',
            limit: itemOfPage,
            backLink: 'qa_back_link'
        });
        actions.examFindAll({
            where: filter.conditions,
            order: filter.order || 'created_at DESC',
            limit: filter.limit,
            offset: (page-1)*itemOfPage
        }).then(function (items) {
            res.backend.render('exam/list',{
                title: 'List Of Exam',
                toolbar : toolbar,
                items: items
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
        toolbar.addBackButton(req, 'qCreate_back_link');
        toolbar.addSaveButton();
        actions.sFindAll()
        .then(function (subjects) {
            res.backend.render('exam/create-manual',{
                title: 'Create Exam Manual',
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

    }
    controller.eGetSections = function (req,res) {
        let actions = app.feature.examination.actions;
        actions.secFindAll({
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
                console.log(err);
            res.jsonp(err);
        })
    }
    controller.eGetQuestions = function (req,res) {
        console.log(req.params.sectionId);
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
        console.log(JSON.stringify(form));
        form.created_by = req.user.id;
        if(typeof form.sections == 'string'){
            try{
                form.sections = JSON.parse(form.sections);
            }catch(err){
                console.log('error',form.sections);
                form.sections = [form.sections];
            }
        }
        try{
            form.content = JSON.parse(form.content);
        }catch(err){
            form.content = [];
        }

        console.log(JSON.stringify(form,2,2));
        actions.examCreate(form)
        .then(function (exam) {
            console.log('create ok');
            res.redirect(baseRoute);
        }).catch(function (err) {
                console.log(err);
            res.redirect(baseRoute);
        })
        
        //console.log(JSON.stringify(form,2,2));
        
        //res.backend.render('exam/list');
    }

}