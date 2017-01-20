/**
 * Created by thangnv on 11/3/16.
 */
'use strict';
let _ = require('arrowjs')._;
let Promise = require('arrowjs').Promise;
let logger = require('arrowjs').logger;
module.exports = function (controller,component,app) {
    let baseRoute = '/admin/qa';
    let permission = {
        all : 'all',
        create : 'create',
        index : 'view',
        delete : 'delete',
        edit: 'edit',
        active: 'active'
    }
    let isAllow = ArrowHelper.isAllow;
    controller.listChoice = function (req,res) {
        let actions = app.feature.qa.actions;
        // Get current page and default sorting
        let page = req.params.page || 1;
        let itemOfPage = app.getConfig('pagination').numberItem || 10;
        //start create toolbar
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addRefreshButton(baseRoute+'/choice');
        toolbar.addSearchButton(isAllow(req, permission.index));
        toolbar.addCreateButton(isAllow(req, permission.all), baseRoute + '/choice/create');
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
                header : 'Câu hỏi',
                link : baseRoute + '/choice/' + '{id}',
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
                header : 'Môn thi',
                filter : {
                    data_type : 'string'
                }
            },
            {
                column : 'level',
                width : '10%',
                header : 'Độ khó',
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
            backLink: 'qa_back_link'
        });
        filter.order = req.params.sort ? req.params.sort : 'created_at';
        res.locals.currentColumn = req.params.sort || "created_at";
        actions.findAndCountAll({
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
                res.backend.render('listChoice',{
                    title : 'Danh sách câu hỏi trắc nghiệm',
                    toolbar : toolbar,
                    totalPage: totalPage,
                    items: items,
                    currentPage: page,
                    queryString: (req.url.indexOf('?') == -1) ? '' : ('?' + req.url.split('?').pop()),
                    baseRoute: baseRoute+'/choice/'
                })
        }).catch(function (err) {
                //console.log(err);
            //logger.error(err.message);
            res.backend.render('listChoice',{
                title : 'Danh sách câu hỏi trắc nghiệm',
                toolbar : toolbar
            })
        })
    };
    controller.createChoice = function (req, res) {
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req,'qa_back_link');
        toolbar.addSaveButton();
        app.models.subject.findAll({
            attributes: ['id', 'title']
        })
        .then(function (subjects) {
            res.backend.render('form2',{
                title: 'Tạo mới câu hỏi trắc nghiệm',
                toolbar : toolbar.render(),
                subjects: subjects
            })
        }).catch(function (err){
            //logger.error(err.message);
            req.flash.error(err.message);
            res.backend.render('listChoice',{
                title: 'Danh sách các câu hỏi trắc nghiệm',
                toolbar : toolbar.render()
            })
        })

    };
    controller.saveChoice = function (req,res) {
        let toolbar = new ArrowHelper.Toolbar();
        let actions = app.feature.qa.actions;
        toolbar.addBackButton(req,'qa_back_link');
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
        actions.create(data)
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
                    answersPromise.push(app.models.answer.create(answer));
                })
                return Promise.all(answersPromise);
            }else{
                return null;
            }


        })
        .then(function (answer) {
                //console.log('33333333',answer);
            if(answer == null){
                return actions.delete([question_id]);
            }else{
                return null;
            }
        })
        .then(function (error) {
                if( error === null ){
                    req.flash.success('Tạo mới câu hỏi thành công !');
                    res.redirect(baseRoute+'/choice');
                }else{
                    return new Error('Tạo mới câu hỏi không thành công !')
                }
        })
        .catch(function (err) {
                //console.log(err);
            req.flash.error(err.message);
            res.redirect(baseRoute+'/choice/create');
        })
    };
    controller.viewChoice = function (req,res) {
        let questionId = req.params['questionId'];
        let actions = app.feature.qa.actions;
        let toolbar = new ArrowHelper.Toolbar();
        let questionData = req.questionData;
        //console.log(questionData);
        toolbar.addBackButton(req,'qa_back_link');
        toolbar.addSaveButton();
        Promise.all([
            actions.find({
                where: {
                    id: questionId
                }
            }),
            actions.answerFindAll({
                where: {
                    question_id: questionId
                }
            }),
            app.models.subject.findAll({
                attributes: ['id', 'title']
            })
        ])
        .then(function (result){
                Promise.all([
                    app.models.section.findAll({
                        where: {
                            subject_id: result[0].subject_id
                        }
                    }),
                    app.models.chapter.findAll({
                        where: {
                            subject_id: result[0].subject_id
                        }
                    })
                ])
                .then(function (result2) {
                    res.backend.render('form2',{
                        title: 'Cập nhật câu hỏi trắc nghiệm',
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
            if (err.name == ArrowHelper.UNIQUE_ERROR) {
                req.flash.error('Tiêu đề đã được sử dụng vui lòng nhập tiêu đề khác !');
            } else {
                req.flash.error('Name: ' + err.name + '<br />' + 'Message: ' + error.message);
            }
            res.redirect(baseRoute);
        })

    };
    controller.updateChoice = function (req,res) {
        let toolbar = new ArrowHelper.Toolbar();
        let actions = app.feature.qa.actions;
        toolbar.addBackButton(req,'qa_back_link');
        toolbar.addSaveButton();
        let questionId = req.params.questionId;
        let data = req.body;
        //console.log(JSON.stringify(data, 2, 2));
        actions.findById(questionId)
        .then(function (question) {
            return actions.update(question,data)
        })
        .then(function (newQuestion) {
            return app.models.answer.findAll({
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
                return app.models.answer.destroy({
                    where: {
                        id: {
                            $in: idsToDelete
                        }
                    }
                });
        })
        .then(function (count) {
            let answers = JSON.parse(data.answers);
            let answerPromise = [];
            answers.map(function(answer){
                answer.question_id = questionId;
                answerPromise.push(app.models.answer.create(answer));
            });
            return Promise.all(answerPromise) ;
        })
        .then(function (answers) {
            req.flash.success('Cập nhật thành công !');
            res.redirect(baseRoute+'/choice/'+questionId);
        })
        .catch(function (err) {
            if (err.name == ArrowHelper.UNIQUE_ERROR) {
                req.flash.error('Tiêu đề đã được sử dụng vui lòng nhập tiêu đề khác !');
            } else {
                req.flash.error('Name: ' + err.name + '<br />' + 'Message: ' + error.message);
            }
            res.redirect(baseRoute+'/choice/'+questionId);
        })
    };
    controller.delete = function (req,res) {
        let ids = req.body.ids.split(',');
        let actions = app.feature.qa.actions;
        //console.log('fsdfsdfsd');
        app.models.exam.findAll({
            attributes : ['content']
        }).then(function (exams) {//todo: think another ways to compare
            exams.map(function (exam) {
                if(exam.length > 0)
                exam.content.map(function (cont) {
                    if (cont.length > 0)
                    cont.questions.map(function (ques) {
                        if (ids.indexOf(ques) != -1){
                            throw new Error('Không thể xóa câu hỏi đã được đưa vào đề thi !');
                        }
                    })
                })
            })
            return actions.delete(ids);
            //console.log(JSON.stringify(exams,2,2));
            return exams;
        }).then(function () {
            req.flash.success('Xóa câu hỏi thành công !');
            res.sendStatus(200);
        }).catch(function (err) {
            //console.log('dasdasdaerror');
            //console.log(err.message);
            //logger.error(err);
            req.flash.error(err.message);
            res.sendStatus(200);
        });
    };

    //ajax request
    controller.getChapterBySubjectId = function (req,res) {
        let subjectId = req.params.subjectId;
        let actions = app.feature.qa.actions;
        app.models.chapter.findAll({
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
    controller.getSectionBySubjectId = function (req,res) {
        let subjectId = req.params.subjectId;
        app.models.section.findAll({
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
    };
    controller.reportQuestion = function (req,res) {
        let questionId = req.params.questionId;
        let data = req.body;
        if (questionId){
            res.status(200).jsonp({
                message: 'Thông báo câu hỏi bị lỗi thành công !'
            })
        }else{
            res.status(400).jsonp({
                message: 'Thông báo câu hỏi bị lỗi không thành công !'
            })
        }
    }
}