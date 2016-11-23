/**
 * Created by thangtyt on 11/21/16.
 */
'use strict';
module.exports = function (controller,component,app) {

    //controller.setHeaderCORS = function (req,res,next) {
    //    res.header("Access-Control-Allow-Origin", "*");
    //    res.header("Access-Control-Allow-Headers", "*");
    //    next();
    //};
    //controller.checkToken = function (req,res,next) {
    //    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    //    if(token){
    //        jwt.verify(token,jwt_conf.jwtSecretKey, function (err,decoded) {
    //            if(err||!decoded){
    //                res.redirect('/api/440')
    //            }else{
    //                req.user = decoded.data;
    //                next();
    //            }
    //        })
    //    }else{
    //        res.redirect('/api/499');
    //    }
    //};

    controller.examLists = function (req, res) {
        let actions = app.feature.examination.actions;
        // Get current page and default sorting
        let page = req.params.page || 1;
        let itemOfPage = 6;
        let table = [
            {
                column : 'id',
                header : 'id'
            },
            {
                column : 'subject.title',
                header: 'subject-title',
                filter: {
                    data_type: 'string',
                    filter_key: 'subject.title'
                }
            },
            {
                column: 'level',
                header: 'level',
                filter: {
                    data_type: 'integer'
                }
            },
            {
                column : 'subject.id',
                header: 'subject-id',
                filter: {
                    data_type: 'string',
                    filter_key: 'subject.id'
                }
            }
        ];
        let filter = ArrowHelper.createFilter(req, res, table, {
            limit: itemOfPage
        });

        //console.log('test',filter.conditions);
        actions.examFindAndCountAll({
            where: filter.conditions,
            include: [{
                model:app.models.subject,
                as: 'subject'
            }],
            order: filter.order || 'created_at DESC',
            limit: itemOfPage,
            offset: (page - 1) * itemOfPage
        }).then(function (result) {
            //console.log(JSON.stringify(result.rows,2,2));
            let exams = JSON.parse(JSON.stringify(result.rows));
            exams = exams.filter(function (exam) {
                return exam.timeDoExam = Math.floor((Math.random() * 100) + 1);
            })
            res.status(200);
            res.jsonp({
                currentPage: page,
                totalPage: Math.ceil(result.count / itemOfPage),
                items: exams
            })
        }).catch(function (err) {
            //console.log(err);
            res.status(300);
            res.jsonp({
                message: err.message
            })
        })

    }
    controller.getExamDetail = function (req,res) {
        let actions = app.feature.examination.actions;
        let result;
        actions.examFind({
            where: {
                id: req.params.examId
            }
        }).then(function (exam) {
            result = JSON.parse(JSON.stringify(exam));
            result.timeDoExam = Math.floor((Math.random() * 100) + 1);
            let sectionIds = [];
            let questionIds = [];
            exam.content.map(function (section) {
                sectionIds.push(section.section_id);
                section.questions.map(function (val) {
                    questionIds.push(val);
                })

            });
            return actions.secFindAll({
                where: {
                    id: {
                        $in : sectionIds
                    }
                },
                include: [{
                    model: app.models.question,
                    where: {
                        id : {
                            $in : questionIds
                        }
                    },
                    as: 'questions',
                    include: [{
                        model: app.models.answer,
                        as : 'answers'
                    }]
                }]
            })
        }).then(function (sections) {
            //console.log(JSON.stringify(sections,2,2));
            result.content = JSON.parse(JSON.stringify(sections))
            res.status(200);
            res.jsonp(result);
        }).catch(function (err) {
            res.jsonp({
                error: err.message
            })
        })

    }
}
//for getExamDetail
function returnIdByKey(data,key,value){
    
}