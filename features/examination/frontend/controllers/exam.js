/**
 * Created by thangtyt on 11/21/16.
 */
'use strict';
let _ = require('arrowjs')._;
module.exports = function (controller, component, app) {

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
        let host = req.protocol + '://'+req.get('host');
        // Get current page and default sorting
        let page = req.params.page || 1;
        let itemOfPage = 6;
        let table = [
            {
                column: 'id',
                header: 'id'
            },
            {
                column: 'subject.title',
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
                column: 'subject.id',
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
                model: app.models.subject,
                as: 'subject'
            }],
            order: filter.order || 'created_at DESC',
            limit: itemOfPage,
            offset: (page - 1) * itemOfPage
        }).then(function (result) {
            //console.log('FIND ALL EXAM :',JSON.stringify(result.rows,2,2));
            let exams = JSON.parse(JSON.stringify(result.rows));
            exams = exams.filter(function (exam) {
                exam.timeDoExam = Math.floor((Math.random() * 100) + 1);
                if (_.has(exam, 'subject')) {
                    try {
                        exam.subject.icons = JSON.parse(exam.subject.icons);
                    } catch (err) {

                    }
                    exam.subject.icons.default = host+exam.subject.icons.default;
                    exam.subject.icons.hover = host+exam.subject.icons.hover;
                }
                return exam;
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
                error: err.message
            })
        })

    }
    controller.getExamDetail = function (req, res) {
        let actions = app.feature.examination.actions;
        let host = req.protocol + '://'+req.get('host');
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
                        $in: sectionIds
                    }
                },
                include: [{
                    model: app.models.question,
                    where: {
                        id: {
                            $in: questionIds
                        }
                    },
                    as: 'questions',
                    include: [{
                        model: app.models.answer,
                        attributes: ['id', 'mark', 'content', 'time', 'answer_keys', 'question_id'],
                        as: 'answers'
                    }]
                }]
            })
        }).then(function (sections) {
            sections = sections.filter(function (section) {
                section.questions = section.questions.filter(function (question) {
                    question.answers = question.answers.filter(function (answer) {
                        answer.mark = Number(answer.mark);//todo: change mark to integer
                        answer.answer_keys = answer.answer_keys.filter(function (key) {
                            delete key['isTrue'];
                            if(_.has(key,'explanation'))
                            delete key['explanation'];
                            return key;
                        })
                        return answer;
                    })
                    return question;
                })
                return section;
            })
            result.content = JSON.parse(JSON.stringify(sections));
            res.status(200);
            res.jsonp(result);
        }).catch(function (err) {
            res.status(404);
            res.jsonp({
                error: err.message
            })
        })

    };
    //todo: have to check
    controller.getRightKeyAnswer = function (req, res) {
        let answerId = req.params.answerId;
        let actions = app.feature.examination.actions;
        actions.answerFind({
            where: {
                id: answerId
            }
        }).then(function (answer) {
            if (answer) {
                let result = answer.answer_keys.filter(function (key) {
                    if (key['isTrue'] == true) {
                        delete key['isTrue'];
                        return key;
                    }
                })
                res.status(200).jsonp(result);
            } else {
                res.status(404).jsonp({
                    error: 'not found !'
                })
            }

        }).catch(function (err) {
            res.status(404).jsonp({
                error: err.message
            })
        })
    };
    controller.getExamsBySubject = function (req, res) {
        let subjectId = req.params.subjectId;
        let actions = app.feature.examination.actions;
        actions.examFindAll({
            where: {
                subject_id: subjectId
            },
            order: 'created_at DESC',
            limit: 6
        }).then(function (exams) {
            exams = exams.filter(function (exam) {
                exam.timeDoExam = Math.floor((Math.random() * 100) + 1);
                return exam;
            })
            res.status(200);
            res.jsonp(exams);
        }).catch(function (err) {
            res.status(404).jsonp({
                error: err.message
            });
        })
    };
    controller.getAnswerKeys = function (req, res) {
        let form = req.body;
        let actions = app.feature.examination.actions;
        if (typeof form.data != 'object') {
            try {
                form = JSON.parse(form.data);
            } catch (err) {
                //console.log(err);
                form = [];
            }
        }
        if (form) {
            actions.answerFindAll({
                where: {
                    id: {
                        $in: form
                    }
                }
            }).then(function (answers) {
                if (answers) {
                    let answerReturn = [];
                    answers.map(function (val) {
                        let answer = {
                            id: val.id,
                            explanation: val.explanation
                        };
                        val.answer_keys.map(function (answer_val) {
                            if (answer_val.isTrue) {
                                answer.keyIndex = answer_val.index
                            }
                        });
                        answerReturn.push(answer);
                    });
                    res.status(200).jsonp(answerReturn);
                } else {
                    throw new Error('Not Found answers');
                }
            }).catch(function (err) {
                res.status(404).jsonp({
                    error: err.message
                })
            })
        } else {
            res.status(404).jsonp({
                error: 'Not found answers'
            })
        }
    }
    controller.submitExam = function (req, res) {
        let actions = app.feature.examination.actions;
        let user = req.user;
        let data = req.body;
        let answers = [];
        let wrongAnswer = []
        data.user_id = user.id;
        if (typeof data.answers !== 'object') {
            try {
                answers = JSON.parse(data.answers);
            } catch (err) {
                //console.log(err);
                answers = [];
            }
        }
        let answersIds = [];
        let score = 0;
        answers.map(function (answer) {
            answersIds.push(answer.id)
        });
        //console.log(answers);
        if (data) {
            actions.answerFindAll({
                where: {
                    id: {
                        $in: answersIds
                    }
                }
            })
            .then(function (listAnswers) {
                let afterCheckAnswer = checkAnswer(JSON.parse(JSON.stringify(listAnswers)),answers);
                data.mark = afterCheckAnswer.mark;
                data.total_mark = afterCheckAnswer.total_mark;
                wrongAnswer = afterCheckAnswer.wrongAnswer;
                    //console.log(afterCheckAnswer);
                return actions.examSubmit(data);
            })
            .then(function (examSubmit) {
                let actionAnswers = [];
                //answers = JSON.parse(answers);
                if (answers.length > 0) {
                    answers.map(function (answer) {
                        actionAnswers.push(actions.examSubmitAnswer({
                            user_result_id: examSubmit.id,
                            answer_id: answer.id,
                            isSure: answer.isSure,
                            chose: answer.chose
                        }))
                    })
                }
                return Promise.all(actionAnswers);
            })
            .then(function (answers) {
                //cap nhat diem so tong cua user
                return app.models.userInfo.find({
                    where: {
                        user_id: user.id
                    }
                })
            })
            .then(function (userInfo) {

                if (data.total_mark > 10) {
                    score = data.mark / 10
                }
                score = score * Number(data.level);
                //todo: check userInfo
                if (data.mark < data.total_mark / 2) {
                    score = 0;
                }
                //cap nhat diem so tong cua user
                return userInfo.updateAttributes({
                    score: Number(userInfo.score) + Number(score)
                })
            })
            .then(function (userInfo) {
                //console.log('get userinfo after update score:',userInfo.score);
                //lay xep hang cua user
                score = userInfo.score;
                return app.models.userInfo.findAndCountAll({
                        where: {
                            user_id: {
                                $notIn: [user.id]
                            }
                        },
                        auttributes: ['score']
                    })
            })
            .then(function (result) {
                //console.log('test',JSON.stringify(result,2,2));
                let rate = result.count;
                result.rows.map(function (score_val) {
                    if (score > score_val) {
                        rate--;
                    }
                });
                //tra ve thanh cong + thứ hạng hiện tại của user + danh sách câu trả lời và kết quả
                res.status(200).jsonp({
                    rate: rate,
                    mark: data.mark,
                    wrongAnswer : wrongAnswer
                })
            })
            //tra ve loi
            .catch(function (err) {
                res.status(499).jsonp({
                    error: err.message
                })
            })
        } else {
            res.status(411).jsonp({
                error: 'Not found data to update !'
            })
        }
    }
};
function checkAnswer(data,answers){
    let mark = 0;
    let total_mark = 0;
    let wrongAnswer = _.filter(data, function (answer) {
        let keyChose = _.filter(answers, function (ans) {
            if (ans.id == answer.id){
                if(ans.chose)
                    return ans.chose;
                else
                    return null;
            }
        })
        let keyRight =_.map(answer.answer_keys, function (key) {
            if (key.isTrue){
                return key;
            }
        });
        if(keyChose && keyChose != keyRight){
            return answer;
        }else if( keyChose ){
            if(!answer.mark)
                answer.mark = 1; //todo: fix logic mark of exam
            mark += Number(answer.mark);
        }
        total_mark +=  Number(answer.mark);
    });
    return {
        mark: mark,
        total_mark : total_mark,
        wrongAnswer: wrongAnswer
    }
}
