/**
 * Created by thangtyt on 12/23/16.
 */
'use strict';
let Promise = require('arrowjs').Promise;
let _ = require('arrowjs')._;
module.exports = function (controller,component,app) {
    controller.listGift = function (req,res) {
        let user = req.user;
        let host = req.protocol + '://'+req.get('host');
        let result ;
        let giftIds = [];
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
                user_id: user.id
            }
        }).then(function (_userInfo) {
            //console.log(_userInfo);
            if(_userInfo && _userInfo.gift_codes){
                return Promise.all([
                    app.models.gift.findAndCountAll({
                        where: {
                            status: 1
                        },
                        include: [
                            {
                                model: app.models.giftCode,
                                where: {
                                    gift_code: {
                                        $in : _userInfo.gift_codes
                                    }
                                }
                            }
                        ],
                        attributes: ['id','title','desc'],
                        order: filter.order || 'created_at DESC',
                        limit: itemOfPage,
                        offset: (page - 1) * itemOfPage
                    })
                ])
            }else{
                throw new Error('Bạn không có quà tặng nào');
            }
        }).then(function (resultGift) {
            //console.log(JSON.stringify(1,resultGift,2,2));
            let gifts = JSON.parse(JSON.stringify(resultGift[0].rows));
            if(!gifts[0])
                gifts = [];
            else{
                gifts = _.filter(gifts, function (val) {
                    delete val.giftCodes;
                    return val;
                })
                _.map(gifts, function (val) {
                    giftIds.push(val.id);
                });
                let getExamByGift = [];
                result = {
                    currentPage: page,
                    totalPage: Math.ceil(resultGift[0].count / itemOfPage),
                    items: gifts
                };
                giftIds.map(function (_gId) {
                    getExamByGift.push(app.models.exam.findAndCountAll({
                        where: {
                            gifts: {
                                $iLike: '%'+_gId+'%'
                            }
                        },
                        include: [
                            {
                                model: app.models.subject
                            }
                        ]
                    }))
                });
                return Promise.all(getExamByGift);

            }
            //res.status(200).jsonp(gifts);
        }).then(function (_exams) {
            _exams = JSON.parse(JSON.stringify(_exams));
            let examCounts = [];
            //console.log(JSON.stringify(_exams,3,3));
            for(var i = 0 ; i < _exams.length ; i++){
                if(_exams[i]['rows'].length > 0){
                    let icons = JSON.parse(_exams[i]['rows'][0]['subject']['icons']);
                    icons['icon'].default = host + icons['icon'].default;
                    icons['icon'].hover = host + icons['icon'].hover;

                    result['items'][i]['done'] = _exams[i]['count'];
                    result['items'][i]['icons'] = icons['icon'];
                    let _eIds = [];
                    _exams[i]['rows'].map(function (_ex) {
                        _eIds.push(_ex.id)
                    });
                    examCounts.push(app.models.userResult.findAll({
                        where: {
                            exam_id: {
                                $in: _eIds
                            },
                            user_id: user.id
                        },
                        attributes: ['exam_id','user_id'],
                        group : ['exam_id','user_id']
                    }));
                }

            }
            //console.log(3);
            return Promise.all(examCounts);

        }).then(function (examCount) {
            for(var i = 0 ; i < examCount.length ; i++){
                let countExamDone = 0 ;
                examCount[i].map(function (_eCount) {
                    countExamDone++;
                })
                result['items'][i]['done'] = countExamDone+'/'+ (result['items'][i]['done'] || 0)
            }
            res.status(200).jsonp(result);
        }).catch(function (err) {
            res.status(500).jsonp({
                message: err.message
            })
        })
    };
    controller.listExam = function (req,res) {
        let giftId = req.params.giftId;
        let user = req.user;
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
            },
            attributes: ['gift_codes']
        }).then(function (_giftCodes) {
            return app.models.gift.find({
                include: [
                    {
                        model: app.models.giftCode,
                        where: {
                            gift_code : {
                                $in: _giftCodes.gift_codes
                            }
                        }
                    }
                ],
                where: {
                    id: giftId
                }
            });
        }).then(function (resultGift) {
            if (resultGift){
                conditions[0].gifts = {
                    $iLike: "%"+resultGift.id+"%"
                };
                app.models.exam.findAndCountAll({
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
                            if (exam.level == 0){
                                exam.level = 'dễ'
                            }else if (exam.level == 1){
                                exam.level = 'bình thường'
                            } else {
                                exam.level = 'khó'
                            }
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
                            gift_title: resultGift.title,
                            items: exams
                        })
                    }
                })
            }else{
                res.status(200).jsonp({
                    currentPage: page,
                    gift_title: resultGift.title,
                    totalPage: Math.ceil(result.count / itemOfPage),
                    items: []
                })
            }

        }).catch(function (err) {
            res.status(500).jsonp({
                message: err.message
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