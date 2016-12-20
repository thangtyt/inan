/**
 * Created by thangtyt on 11/21/16.
 */
'use strict';
let _ = require('arrowjs')._;
module.exports = function (controller, component, app) {
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
                column: 'rating',
                header: 'rating',
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
        let filter = ArrowHelper.createFilter(req, res,table, {
            limit: itemOfPage
        });
        let conditions = createFilter(req.query);
        conditions[0].gift_code = null;
        actions.examFindAndCountAll({
            where: conditions[0],
            include: [{
                model: app.models.subject,
                as: 'subject',
                where: conditions[1]
            }],
            order: filter.order || 'created_at DESC',
            limit: itemOfPage,
            offset: (page - 1) * itemOfPage
        }).then(function (result) {
            if(!result)
                throw new Error('not found');
            //console.log('FIND ALL EXAM :',JSON.stringify(result.rows,2,2));
            let exams = JSON.parse(JSON.stringify(result.rows));
            exams = exams.filter(function (exam) {
                exam.timeDoExam = Math.floor((Math.random() * 100) + 1);
                if (_.has(exam, 'subject')) {
                    try {
                        exam.subject.icons = JSON.parse(exam.subject.icons);
                        exam.subject.icons.icon.default = host+exam.subject.icons.icon.default;
                        exam.subject.icons.icon.hover = host+exam.subject.icons.icon.hover;
                        return exam;
                    } catch (err) {

                    }
                }

            })
            res.status(200);
            res.jsonp({
                currentPage: page,
                totalPage: Math.ceil(result.count / itemOfPage),
                items: exams
            })
        }).catch(function (err) {
            res.status(300);
            res.jsonp({
                error: err.message
            })
        })

    };
    controller.getExamDetail = function (req, res) {
        let actions = app.feature.examination.actions;
        let host = req.protocol + '://'+req.get('host');
        let result;
        let user = req.user;
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
    };
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
        //lấy list answer_id
        answers.map(function (answer) {
            answersIds.push(answer.id)
        });
        //kiểm tra dữ liệu
        if (data) {
            //lấy dữ liệu của câu trả lời để kiểm tra đúng sai
            actions.answerFindAll({
                where: {
                    id: {
                        $in: answersIds
                    }
                }
            })
            .then(function (listAnswers) {
                //    console.log(1);
                let afterCheckAnswer = checkAnswer(JSON.parse(JSON.stringify(listAnswers)),answers);
                data.mark = afterCheckAnswer.mark;//điểm đạt được sau lần thi
                wrongAnswer = afterCheckAnswer.wrongAnswer;
                    //console.log(afterCheckAnswer);
                return actions.examSubmit(data); //nhập vào bảng dữ liệu mỗi lần thi
            })
            .then(function (examSubmit) {
                    //console.log(2);
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
                return Promise.all(actionAnswers);// cập nhật bảng chi tiết của lần thi
            })
            .then(function (answers) {
                //    console.log(3,user.id);
                //cap nhat diem so tong cua user
                return app.models.userInfo.findOrCreate({
                    where: {
                        user_id: user.id
                    }
                });
            })
            .then(function (userInfo) {
                let result = userInfo[0] ? userInfo[0] : userInfo[1];
                //console.log(JSON.stringify(result,2,2));
                score = Number(data.mark) ;
                //score = score * Number(data.level);
                //todo: check userInfo
                if (Number(data.mark) < Number(data.total_mark) / 2) {
                    score = 0;
                }
                    //console.log(4.4);
                //cap nhat diem so tong cua user
                return app.models.userInfo.update({
                    score: Number(result.score) + Number(score)
                },{
                    where: {
                        user_id: result.user_id
                    }
                })
            })
            .then(function (userInfo) {
                    //console.log(5);
                //console.log('get userinfo after update score:',userInfo.score);
                //lay xep hang cua user
                score = userInfo.score;
                return Promise.all([
                    app.models.userInfo.findAndCountAll({
                        where: {
                            user_id: {
                                $notIn: [user.id]
                            }
                        },
                        auttributes: ['score']
                    }),
                    app.models.examSave.destroy({ //xóa đề thi đã lưu để thi nếu đề này đã từng lưu lại
                        where: {
                            user_id : user.id,
                            exam_id : data.exam_id
                        }
                    })
                ])
            })
            .then(function (result) {
                //console.log('test',JSON.stringify(result,2,2));
                let rate = result[0].count;
                result[0].rows.map(function (score_val) {
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
    };
    controller.eGetUserExamResult = function (req,res) {
        let examId = req.params.examId;
        let user = req.user;
        let actions = app.feature.examination.actions;
        actions.examUserCount({
            where: {
                exam_id : examId,
                user_id: user.id
            }
        }).then(function (examCount) {
            if(examCount > 0){
                return Promise.all([
                    actions.examFind({
                        where: {
                            id: examId
                        }
                    }),
                    actions.examUserResultFind({
                        where: {
                            user_id: user.id,
                            exam_id: examId
                        },
                        attributes: ['id','time','mark'],
                        order: 'created_at DESC'
                    })
                ])
            }else{
                throw new Error('You did not do this exam');
            }
        }).then(function (lists) {
            let exam = lists[0];

            let result = JSON.parse(JSON.stringify(exam));
            result.user_result = JSON.parse(JSON.stringify(lists[1]));
            result.timeDoExam = result.user_result.mark;
            //console.log(JSON.stringify(result.user_result,2,2));
            let sectionIds = [];
            let questionIds = [];
            exam.content.map(function (section) {
                sectionIds.push(section.section_id);
                section.questions.map(function (val) {
                    questionIds.push(val);
                })

            });
            Promise.all([
                actions.secFindAll({
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
                }),
                app.models.resultAnswer.findAll({
                    where: {
                        user_result_id : result.user_result.id
                    }
                })
            ])
            .then(function (_result) {
                    let sections = JSON.parse(JSON.stringify(_result[0]));
                    let userAnswers = JSON.parse(JSON.stringify(_result[1]));
                    let detail_answers = [];
                try{
                    sections = sections.filter(function (section) {
                        section.questions = section.questions.filter(function (question) {
                            question.answers = question.answers.filter(function (answer) {
                                answer.mark = Number(answer.mark);//todo: change mark to integer
                                // compare with userAnswers
                                let doFlash = false;
                                userAnswers.map(function (_userAnswer) {
                                    if (_userAnswer.answer_id == answer.id){
                                        doFlash = true;
                                        let right = false;
                                        answer.answer_keys.map(function (key) {
                                            if(key.isTrue){
                                                if(key.index == _userAnswer.chose){
                                                    right = true;
                                                }
                                            }
                                        });
                                        answer.user_answers = {
                                            isSure : _userAnswer.isSure,
                                            chose : _userAnswer.chose,
                                            content: _userAnswer.content,
                                            right: right
                                        };
                                        detail_answers.push({
                                            answer_id : answer.id,
                                            haveAnswer : true,
                                            right: right,
                                            isSure: _userAnswer.isSure,
                                            chose: _userAnswer.chose
                                        })
                                    }else{
                                        detail_answers.push({
                                            answer_id : answer.id,
                                            haveAnswer : false
                                        })
                                    }
                                });
                                if(!doFlash)
                                answer.user_answers = null;
                                delete answer.question_id;
                                //answer.result
                                return answer;
                            })
                            return question;
                        })
                        return section;
                    });
                }catch(err){
                    sections = null;
                }
                result.content = JSON.parse(JSON.stringify(sections));
                result.user_result.detail_answers = detail_answers;
                res.status(200).jsonp(result);
            })
        }).catch(function (err) {
            res.status('204').jsonp(err.message);
        })

    };
    controller.eGetUserExam = function (req,res) {
        let user = req.user;
        let actions = app.feature.examination.actions;
        let host = req.protocol + '://'+req.get('host');
        // Get current page and default sorting
        let page = req.params.page || 1;
        let itemOfPage = 6;
        actions.examUserFindAll({
            attributes: [[app.models.fn('DISTINCT', app.models.col('exam_id')), 'exam_id']],
            where: {
                user_id: user.id
            }
        }).then(function (exams) {
            let result = [];
            exams.map(function (exam) {
                result.push(exam.exam_id);
            })
            ///

            //console.log('test',filter.conditions);
            return actions.examFindAndCountAll({
                where: {
                    id: {
                        $in : result
                    }
                },
                include: [{
                    model: app.models.subject,
                    as: 'subject'
                }],
                order: 'created_at DESC',
                limit: itemOfPage,
                offset: (page - 1) * itemOfPage
            })
        }).then(function (result) {
            //console.log('FIND ALL EXAM :',JSON.stringify(result.rows,2,2));

            let exams = JSON.parse(JSON.stringify(result.rows));
            exams = exams.filter(function (exam) {
                exam.timeDoExam = Math.floor((Math.random() * 100) + 1);
                if (_.has(exam, 'subject')) {
                    try {
                        exam.subject.icons = JSON.parse(exam.subject.icons);
                        exam.subject.icons.icon.default = host+exam.subject.icons.icon.default;
                        exam.subject.icons.icon.hover = host+exam.subject.icons.icon.hover;
                        return exam;
                    } catch (err) {

                    }
                }

            })
            res.status(200);
            res.jsonp({
                currentPage: page,
                totalPage: Math.ceil(result.count / itemOfPage),
                items: exams
            })
        }).catch(function (err) {
            console.log(err.message);
            res.sendStatus(499);
        })
    };
    controller.rating = function (req,res) {
        let examId = req.params.examId;
        let rating = req.params.rating;
        let user = req.user;
        let msg = '';
        app.models.exam.find({
            where : {
                id: examId
            }
        }).then(function (exam) {
            if(!exam){
              throw new Error('Not found exam !');
            }
            app.models.examRate.findOrCreate({
                where: {
                    user_id : user.id,
                    exam_id : examId
                },
                defaults: {
                    user_id : user.id,
                    exam_id : examId,
                    rating : rating
                }
            }).then(function (examRate) {
                return Promise.all([
                    app.models.examRate.count({
                        where: {
                            exam_id: examId
                        },
                        raw: true
                    }),
                    app.models.examRate.find({
                        attributes : [
                            [app.models.fn('SUM',app.models.col('rating')),'rating_total']
                        ],
                        where: {
                            exam_id: examId
                        },
                        group: 'exam_id',
                        raw: true
                    })
                ]);

            }).then(function (result) {
                return exam.updateAttributes({
                    rating : result[1].rating_total / result[0]
                })
            }).then(function (examUpdate) {
                res.status(200).jsonp(examUpdate.rating);
            }).catch(function (err) {
                res.status(500).jsonp({
                    message: err.message
                })
            })
        }).catch(function (err) {
            res.status(500).jsonp({
                message: err.message
            })
        })

    };
    controller.examSave = function (req,res) {
        let examId = req.params.examId;
        let user = req.user;
        app.feature.examination.actions.examFindById(examId)
            .then(function (_exam) {
                if(_exam){
                    return app.models.examSave.findOrCreate({
                        where: {
                            exam_id : examId,
                            user_id : user.id
                        },
                        defaults: {
                            exam_id : examId,
                            user_id : user.id
                        }
                    })
                }else{
                    throw new Error('Not found exam to save');
                }
            })
            .then(function (_examSave) {
                res.status(200).jsonp({
                    message: 'done'
                })
            })
            .catch(function (err) {
                res.status(500).jsonp({
                    message: err.message
                })
            })
    };
    controller.examListSave = function (req,res) {
        let actions = app.feature.examination.actions;
        let host = req.protocol + '://'+req.get('host');
        // Get current page and default sorting
        let page = req.params.page || 1;
        let itemOfPage = 6;
        let user = req.user;
        app.models.examSave.findAll({
            where : {
                user_id : user.id
            },
            attributes: ['exam_id'],
            raw : true
        }).then(function (listSave) {
            let _exams = []
            listSave.map(function (_element) {
                _exams.push(_element.exam_id);
            });
            return actions.examFindAndCountAll({
                where: {
                    id: {
                        $in : _exams
                    }
                },
                include: [{
                    model: app.models.subject,
                    as: 'subject'
                }],
                order: 'created_at DESC',
                limit: itemOfPage,
                offset: (page - 1) * itemOfPage
            }).then(function (result) {
                if(result.rows.length < 1){
                    throw new Error('Not fount !');
                }
                //console.log('FIND ALL EXAM :',JSON.stringify(result.rows,2,2));
                let exams = JSON.parse(JSON.stringify(result.rows));
                exams = exams.filter(function (exam) {
                    exam.timeDoExam = Math.floor((Math.random() * 100) + 1);
                    if (_.has(exam, 'subject')) {
                        try {
                            exam.subject.icons = JSON.parse(exam.subject.icons);
                            exam.subject.icons.icon.default = host+exam.subject.icons.icon.default;
                            exam.subject.icons.icon.hover = host+exam.subject.icons.icon.hover;
                            return exam;
                        } catch (err) {

                        }
                    }
                })
                res.status(200);
                res.jsonp({
                    currentPage: page,
                    totalPage: Math.ceil(result.count / itemOfPage),
                    items: exams
                })
            });
        }).catch(function (err) {
            res.status(300);
            res.jsonp({
                error: err.message
            })
        });
    }
    controller.examRateTop10 = function (req,res) {
        let dataUser = app.getConfig('userInfo');
        let user = req.user;
        Promise.all([
            app.models.userInfo.findAll({
                include: [{
                    model: app.models.user,
                    attributes : ['id','user_email','display_name'],
                    where: {
                        role_id: {
                            $or: {
                                $lt: 0,
                                $eq: null
                            }
                        }

                    },
                    as : 'user'
                }],
                attributes: ['score','school','city'],
                as: 'userInfo',
                raw : true,
                limit: 10,
                order: 'score DESC'
            }),
            app.models.userInfo.findAll({
                attributes: ['user_id'],
                raw : true,
                order: 'score DESC'
            })
        ])
        .then(function (result) {
            let allUserInfo = result[1];
            let stt = 1;
            allUserInfo.map(function (_userInfo) {
                if (_userInfo.user_id !== user.id){
                    stt++;
                }
            });

            let top10 = [];
                result[0].map(function (_user) {
                dataUser['city'].map(function (_city) {
                    if(_city.code == _user.city){
                        _user['city'] = _city.name;
                        _city.school.map(function (_school) {
                            if( _user.school == _school.code){
                                _user.school = _school.name;
                            }
                        })
                    }

                });
                top10.push({
                    id: _user['user.id'],
                    score: _user['score'],
                    school: _user['school'],
                    full_name: _user['user.display_name'],
                    city: _user['city'],
                    user_email: _user['user.user_email']
                })
            });
            res.status(200).jsonp({
                current_rates: stt,
                list_users: top10
            })
        }).catch(function (err) {
            res.status(300).jsonp({
                message: err.message
            })
        })
    };
    controller.giftCode = function (req,res) {
        let user = req.user;
        let data = req.body;
        app.models.userInfo.findOrCreate({
            where: {
                user_id: user.id
            },
            defaults: {
                user_id: user.id,
                gift_codes: [data.gift_code]
            }
        }).then(function (result) {
            //chua co userInfo => tao moi
            //console.log(result);
            if(result[1]){
                return result[1];
            }else{//co roi cap nhat
                if(result[0].gift_codes == null || result[0].gift_codes.length == 0 || result[0].gift_codes.indexOf(data.gift_code) == -1){
                    let gift_codes = [];
                    if(result[0].gift_codes == null || result[0].gift_codes.length == 0){
                        gift_codes = [data.gift_code];
                    }else{
                        gift_codes = result[0].gift_codes;
                        gift_codes.push(data.gift_code);
                    }
                    return result[0].updateAttributes({
                        gift_codes : gift_codes
                    })
                }else{
                    throw new Error('This giftcode is used ! Please enter another giftcode !');
                }
            }

        }).then(function () {
            res.status(200).jsonp({
                message: 'GiftCode add successfully !'
            })
        }).catch(function (err) {
            res.status(500).jsonp({
                message: err.message
            })
        })
        //res.sendStatus(200);
    };
    controller.getExamGiftCode = function (req,res) {
        let user = req.user;
        let actions = app.feature.examination.actions;
        let host = req.protocol + '://'+req.get('host');
        // Get current page and default sorting
        let page = req.params.page || 1;
        let itemOfPage = 6;
        let filter = ArrowHelper.createFilter(req, res, [
            {
                column: 'id',
                header: 'id'
            }
        ], {
            limit: itemOfPage
        });

        let conditions = createFilter(req.query);
        app.models.userInfo.find({
            where: {
                user_id : user.id
            }
        }).then(function (_userInfo) {
            _userInfo.gift_codes = _userInfo.gift_codes ? _userInfo.gift_codes : [];
            if(!_userInfo){
                throw new Error('Not found !');
            }else if(_userInfo.gift_codes.length == 0 || _userInfo.gift_codes == null){
                return null;
            }else{
                conditions[0].gift_code = {
                    $in: _userInfo.gift_codes
                };
                return actions.examFindAndCountAll({
                    where: conditions[0],
                    include: [{
                        model: app.models.subject,
                        as: 'subject',
                        where: conditions[1]
                    }],
                    order: filter.order || 'created_at DESC',
                    limit: itemOfPage,
                    offset: (page - 1) * itemOfPage
                })
            }

        })
        .then(function (result) {
            if(!result){
                res.status(200).jsonp({
                    currentPage: page,
                    totalPage: 0,
                    items: []
                });
            }else{
                //console.log('FIND ALL EXAM :',JSON.stringify(result.rows,2,2));
                let exams = JSON.parse(JSON.stringify(result.rows));
                exams = exams.filter(function (exam) {
                    exam.timeDoExam = Math.floor((Math.random() * 100) + 1);
                    if (_.has(exam, 'subject')) {
                        try {
                            exam.subject.icons = JSON.parse(exam.subject.icons);
                            exam.subject.icons.icon.default = host+exam.subject.icons.icon.default;
                            exam.subject.icons.icon.hover = host+exam.subject.icons.icon.hover;
                            return exam;
                        } catch (err) {

                        }
                    }

                })
                res.status(200).jsonp({
                    currentPage: page,
                    totalPage: Math.ceil(result.count / itemOfPage),
                    items: exams
                })
            }


        }).catch(function (err) {
                console.log(err);
            res.status(300).jsonp({
                error: err.message
            })
        })
    }
};
function createFilter(query){
    let result = [{},{}];
    _.forEach(query, function (val,key) {
        switch (key) {
            case "subject.title" :
                result[1]['title'] = {
                    $iLike: '%'+val+'%'
                };
                break;
            case "rating":
                result[0][key] = parseInt(val);
                break;
            case "level":
                result[0][key] = parseInt(val);
                break;
            default:
                break;
        }

    })
    return result;
}
function checkAnswer(data,user_answers){
    let mark = 0;
    let keyChose = -1 ;
    let wrongAnswer = _.filter(data, function (data_answer) {

        let isWrong = true;
        _.map(user_answers, function (user_answer) {
            keyChose = user_answer.chose;
            if (user_answer.id == data_answer.id){
                data_answer.answer_keys.map(function (_key) {
                    if ( _key.isTrue == true && _key.index == user_answer.chose ){
                        isWrong = false
                    }
                })
            }
        });
        if(isWrong){
            data_answer.userChose = keyChose;
            return data_answer;
        }else{
            if(!data_answer.mark)
                data_answer.mark = 1; //todo: fix logic mark of exam
            mark += Number(data_answer.mark);
        }
    });
    return {
        mark: mark,
        wrongAnswer: wrongAnswer
    }
}
