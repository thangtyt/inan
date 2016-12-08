/**
 * Created by thangnv on 11/3/16.
 */
'use strict';
let _ = require('arrowjs')._;
let Promise = require('arrowjs').Promise;
let logger = require('arrowjs').logger;
module.exports = function (controller,component,app) {
    let baseRoute = '/admin/examination/q-a';
    let permission = {
        all : 'manager',
        create : 'manager',
        index : 'manager',
        delete : 'manager',
        active: 'active'
    }
    let isAllow = ArrowHelper.isAllow;
    controller.qList = function (req,res) {
        let actions = app.feature.examination.actions;
        // Get current page and default sorting
        let page = req.params.page || 1;
        let itemOfPage = app.getConfig('pagination').numberItem || 10;
        //start create toolbar
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addRefreshButton(baseRoute);
        toolbar.addSearchButton(isAllow(req, permission.index));
        toolbar.addCreateButton(isAllow(req, permission.all), baseRoute + '/create');
        toolbar.addDeleteButton();
        toolbar = toolbar.render();
        //end toolbar
        //define column to be displayed
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
                header : 'Question',
                link : baseRoute + '/' + '{id}',
                type : 'title',
                filter : {
                    data_type : 'string',
                    filter_key: 'question.title',
                    length: 100
                }
            },
            {
                column : 'subject.title',
                width : '15%',
                header : 'Subject',
                filter : {
                    data_type : 'string'
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
        actions.questionFindAndCountAll({
            where: filter.conditions,
            order: filter.order || 'created_at DESC',
            limit: filter.limit,
            offset: (page-1)*itemOfPage,
            include: [
                {
                    model: app.models.subject,
                    attributes: ['title','class'],
                    as: 'subject',
                    where: ['1 = 1']
                }
            ]
        })
        .then(function (results) {

                //console.log(JSON.stringify(results,2,2));
                let totalPage = Math.ceil(results.count / itemOfPage);
                let items = results.rows;
                res.backend.render('q-a/list',{
                    title : 'List All Questions & Answers',
                    toolbar : toolbar,
                    totalPage: totalPage,
                    items: items,
                    currentPage: page,
                    queryString: (req.url.indexOf('?') == -1) ? '' : ('?' + req.url.split('?').pop()),
                    baseRoute: baseRoute
                })
        }).catch(function (err) {
                //console.log(err);
            logger.error(err.message);
            res.backend.render('q-a/list',{
                title : 'List All Questions & Answers',
                toolbar : toolbar
            })
        })
    };
    controller.qCreate = function (req, res) {
        let actions = app.feature.examination.actions;
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'qCreate_back_link');
        toolbar.addSaveButton();
        actions.sFindAll({
            attributes: ['id', 'title']
        })
        .then(function (subjects) {
            res.backend.render('q-a/form2',{
                title: 'Create Questions & Answers',
                toolbar : toolbar.render(),
                subjects: subjects
            })
        }).catch(function (err){
            logger.error(err.message);
            req.flash.error(err.message);
            res.backend.render('q-a/list',{
                title: 'List All Questions & Answers',
                toolbar : toolbar.render()
            })
        })

    };
    controller.qSave = function (req,res) {
        let toolbar = new ArrowHelper.Toolbar();
        let actions = app.feature.examination.actions;
        toolbar.addBackButton(req, 'qa_save_back_link');
        toolbar.addSaveButton();
        let data = req.body;
        data.created_by = req.user.id;
        let answers;
        try{
            answers =  JSON.parse(data.answers);
        }catch(err){
            answers = []
        }
        //console.log(answers);
        let question_id = '';
        //begin insert to database
        actions.questionCreate(data)
        .then(function (question) {
            question_id = question.id;
            if( answers.length > 0 ){
                let answersPromise = [];
                answers.map(function (answer) {
                    answer.question_id = question_id;
                    //if (answer.mark){
                    //    answer.mark = ''+answer.mark;
                    //}
                    //console.log(parseInt(answer.time));
                    if( typeof parseInt(answer.time) !== 'Number'  ){
                        answer.time = 0;
                    }
                    answersPromise.push(actions.answerCreate(answer));
                })
                return Promise.all(answersPromise);
            }else{
                return null;
            }


        })
        .then(function (answer) {
                //console.log('33333333',answer);
            if(answer == null){
                return actions.questionDelete([question_id]);
            }else{
                return null;
            }
        })
        .then(function (error) {
                if( error === null ){
                    req.flash.success('Create question successfully !');
                    res.redirect(baseRoute);
                }else{
                    return new Error('Create question unsuccessfully !')
                }
        })
        .catch(function (err) {
                //console.log(err);
            req.flash.error(err.message);
            res.redirect(baseRoute+'/create');
        })
    };
    controller.qView = function (req,res) {
        let questionId = req.params['questionId'];
        let actions = app.feature.examination.actions;
        let toolbar = new ArrowHelper.Toolbar();
        let questionData = req.questionData;
        //console.log(questionData);
        toolbar.addBackButton(req, 'qCreate_back_link');
        toolbar.addSaveButton();
        Promise.all([
            actions.questionFind({
                where: {
                    id: questionId
                }
            }),
            actions.answerFindAll({
                where: {
                    question_id: questionId
                }
            }),
            actions.sFindAll({
                attributes: ['id', 'title']
            })
        ])
        .then(function (result){
                Promise.all([
                    actions.secFindAll({
                        where: {
                            subject_id: result[0].subject_id
                        }
                    }),
                    actions.cFindAll({
                        where: {
                            subject_id: result[0].subject_id
                        }
                    })
                ])
                .then(function (result2) {

                    res.backend.render('q-a/form2',{
                        title: 'Update Questions & Answers',
                        toolbar : toolbar.render(),
                        question: questionData ? questionData : result[0],
                        answers: questionData ? questionData.answers : result[1],
                        subjects: result[2],
                        chapters: result2[1],
                        sections: result2[0],
                        chaptersStr: JSON.stringify(result2[1])
                    })
                })
                .catch(function (err) {
                    return err;
                })

        }).catch(function (err) {
                //console.log(err);
            logger.error(err.message);
            req.flash.error(err.message);
            res.redirect(baseRoute);
        })

    };
    controller.qUpdate = function (req,res) {
        let toolbar = new ArrowHelper.Toolbar();
        let actions = app.feature.examination.actions;
        toolbar.addBackButton(req, 'qa_save_back_link');
        toolbar.addSaveButton();
        let questionId = req.params.questionId;
        let data = req.body;
        //console.log(JSON.stringify(data, 2, 2));
        actions.questionFindById(questionId)
        .then(function (question) {
            return actions.questionUpdate(question,data)
        })
        .then(function (newQuestion) {
            return actions.answerFindAll({
                where: {
                    question_id: questionId
                },
                attributes: ['id']
            })

        }).then(function (ids) {
                let idsToDelete = [];
                ids.map(function (element) {
                    idsToDelete.push(element.id);
                })
                return actions.answerDelete(idsToDelete);
        })
        .then(function (count) {
            let answers = JSON.parse(data.answers);
            let answerPromise = [];
            answers.map(function(answer){
                answer.question_id = questionId;
                answerPromise.push(actions.answerCreate(answer));
            });
            return Promise.all(answerPromise) ;
        })
        .then(function (answers) {
            req.flash.success('Update Successfully !!');
            res.redirect(baseRoute+'/'+questionId);
        })
        .catch(function (err) {
                console.log(err);
            req.flash.error('Update unSuccessfully !!');
            res.redirect(baseRoute+'/'+questionId);
        })
    };
    controller.qDelete = function (req,res) {
        let ids = req.body.ids.split(',');
        let actions = app.feature.examination.actions;
        //console.log('fsdfsdfsd');
        actions.examFindAll({
            attributes : ['content']
        }).then(function (exams) {//todo: think another ways to compare
            exams.map(function (exam) {
                exam.content.map(function (cont) {
                    cont.questions.map(function (ques) {
                        if (ids.indexOf(ques) != -1){
                            throw new Error('Cannot delete one of questions. It is used !');
                        }
                    })
                })
            })
            return actions.questionDelete(ids);
            //console.log(JSON.stringify(exams,2,2));
            return exams;
        }).then(function () {
            req.flash.success(__('m_blog_backend_post_flash_delete_success'));
            res.sendStatus(200);
        }).catch(function (err) {
            //console.log('dasdasdaerror');
            console.log(err.message);
            //logger.error(err);
            req.flash.error(err.message);
            res.sendStatus(200);
        });
    };

    //ajax request
    controller.qGetChapterBySubjectId = function (req,res) {
        let subjectId = req.params.subjectId;
        let actions = app.feature.examination.actions;
        actions.cFindAll({
            where: {
                subject_id: subjectId
            }
        }).then(function (chapters) {
            res.json(JSON.parse(JSON.stringify(chapters)));
        }).catch(function (err) {
            res.json({
                error: err.message
            })
        })
    };
    controller.qGetSectionBySubjectId = function (req,res) {
        let subjectId = req.params.subjectId;
        let actions = app.feature.examination.actions;
        actions.secFindAll({
            where: {
                subject_id: subjectId
            }
        }).then(function (sections) {
            res.json(JSON.parse(JSON.stringify(sections)));
        }).catch(function (err) {
            res.json({
                error: err.message
            })
        })
    }
}