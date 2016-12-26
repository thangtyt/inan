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
            }
        }).then(function (resultGift) {
            console.log(JSON.stringify(resultGift,2,2));
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
                //result = _.filter(result, function (val) {
                //    //delete val.giftCodes;
                //    return
                //        val["icon"] = {
                //            "default": host+"/img/icon/gift.png",
                //            "hover": host+"/img/icon/gift-hover.png"
                //        };
                //
                //
                //})
            }
            //res.status(200).jsonp(gifts);
        }).then(function (_exams) {
            console.log(JSON.stringify(_exams,2,2));
            let examCounts = [];
            for(var i = 0 ; i < _exams.length ; i++){
                let icons = JSON.parse(_exams[i]['rows'][0]['subject']['icons']);
                result['items'][i]['done'] = _exams[i]['count'];
                result['items'][i]['icons'] = icons['icon'];
                let _eIds = []
                _exams[i]['rows'].map(function (_ex) {
                    _eIds.push(_ex.id)
                })
                examCounts.push(app.models.userResult.count({
                    where: {
                        exam_id: {
                            $in: _eIds
                        }
                    }
                }));
            }
            return Promise.all(examCounts);

        }).then(function (examCount) {
            console.log(JSON.stringify(examCount,2,2));
            for(var i = 0 ; i < examCount.length ; i++){
                result['items'][i]['done'] = examCount[i]+'/'+result['items'][i]['done']
            }
            res.status(200).jsonp(result);
        }).catch(function (err) {
            console.log(err);
            res.status(500).jsonp({
                message: err.message
            })
        })
    };
    controller.listExam = function (req,res) {
        let giftId = req.params.giftId;
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
        }).then(function (result) {
            if (result){
                conditions[0].gifts = {
                    $iLike: "%"+result.id+"%"
                };
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
                    })
            }else{
                res.status(200).jsonp({
                    currentPage: page,
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