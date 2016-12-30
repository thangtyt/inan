/**
 * Created by thangnv on 11/15/16.
 */
/**
 * Created by thangnv on 11/3/16.
 */

'use strict'
let _ = require('arrowjs')._;
let Promise = require('arrowjs').Promise;
let logger = require('arrowjs').logger;
module.exports = function (controller, component, app) {
    //todo: not done. View must process javascript, delete method ...
    let baseRoute = '/admin/section';
    let permission = {
        all : 'all',
        create : 'create',
        edit : 'edit',
        delete : 'delete'
    };
    let isAllow = ArrowHelper.isAllow;
    controller.list = function (req, res) {
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
                column: 'id',
                width: '1%',
                header: ' ',
                type: 'checkbox'
            },
            {
                column: 'title',
                width: '20%',
                header: 'Tiêu đề',
                link: baseRoute + '/' + '{id}',
                filter: {
                    data_type: 'string',
                    filter_key: 'section.title'
                }
            },
            {
                column: 'subject.title',
                width: '10%',
                header: 'Môn thi',
                filter: {
                    data_type: 'string',
                    filter_key: 'subject.title'
                }
            }
        ];
        let filter = ArrowHelper.createFilter(req, res, table, {
            rootLink: baseRoute + '/page/$page/sort',
            limit: itemOfPage,
            backLink: 'section_back_link'
        });
        filter.order = req.params.sort ? req.params.sort : 'created_at DESC';
        app.models.section.findAndCountAll({
            where: filter.conditions,
            include: [{
                model: app.models.subject,
                attributes: ['title'],
                as: 'subject'
            }],
            order: filter.order || ' created_at DESC',
            limit: filter.limit,
            offset: (page - 1) * itemOfPage
        }).then(function (results) {
            let totalPage = Math.ceil(results.count / itemOfPage);
            // Replace title of no-title post
            let items = results.rows;
            items.map(function (item) {
                if (!item.title) item.title = '(no title)';
            });

            // Render view
            res.backend.render('list', {
                title: 'Các dạng câu hỏi',
                totalPage: totalPage,
                items: items,
                currentPage: page,
                toolbar: toolbar,
                queryString: (req.url.indexOf('?') == -1) ? '' : ('?' + req.url.split('?').pop()),
                baseRoute: baseRoute
            });
        }).catch(function (err) {
            logger.error(err);
            req.flash.error('Name: ' + err.name + '<br />' + 'Message: ' + err.message);

            // Render view if has error
            res.backend.render('section/list', {
                title: 'Các dạng câu hỏi',
                totalPage: 1,
                items: null,
                currentPage: page,
                toolbar: toolbar,
                queryString: (req.url.indexOf('?') == -1) ? '' : ('?' + req.url.split('?').pop()),
                baseRoute: baseRoute
            });
        });
    };
    controller.view = function (req, res) {
        let sectionId = req.params.sectionId;
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'section_back_link');
        toolbar.addSaveButton();
        toolbar.addDeleteButton();
        Promise.all([
            app.models.section.find({
                where: {
                    id: sectionId
                }
            }),
            app.models.subject.findAll({
                attributes: ['id','title']
            }),
            app.models.question.find({
                where: {
                    section_id: sectionId
                }
            })
        ])
        .then(function (result) {
                //console.log(result[2]);
            res.backend.render('form',{
                title: 'Thông tin dạng câu hỏi',
                toolbar : toolbar.render(),
                baseRoute: baseRoute,
                section: result[0],
                subjects: result[1],
                isUpdate: result[2]
            })
        }).catch(function (err){
            res.backend.render('form',{
                title: 'Thông tin dạng câu hỏi',
                toolbar : toolbar.render()
            })
        })


    };
    controller.delete = function (req, res) {
        //let actions = app.feature.examination.actions;
        let ids = [];
        //console.log('11111');
        if (req.params.sectionId){
            ids = [req.params.sectionId]
        }else{
            ids = req.body.ids.split(',');
        }
        app.models.question.count({
            where: {
                section_id : {
                    $in : ids
                }
            }
        }).then(function (_questionCount) {
            if(_questionCount > 0 ){
                throw new Error();
            }else{
                return app.models.section.destroy({
                    where : {
                        id: {
                            $in: ids
                        }
                    }
                })
            }
        }).then(function (result) {
            req.flash.success('Xóa thành công !');
            res.jsonp({
                error: null
            });
        }).catch(function (err) {
            req.flash.error('Không thể xóa dạng câu hỏi đã được sử dụng !');
            res.jsonp({
                error: 'Không thể xóa !'
            });
        });
    };
    controller.update = function (req, res,next) {
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'section_back_link');
        toolbar.addSaveButton();
        toolbar.addDeleteButton();
        let form = req.body;
        let sectionid = req.params.sectionId;
        app.models.section.find({
            where: {
                id: sectionid
            }
        }).then(function (section) {
            return section.updateAttributes(form);
        }).then(function (result) {
            if(result){
                req.flash.success('Cập nhật thành công !');
                next();
            }else {
                throw Error('Error');
            }
        }).catch(function (err) {
            console.log(err);
            req.flash.error('Không thể cập nhật dạng câu hỏi này !');
            next();
        })
    };
    controller.create = function (req, res) {
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'section_back_link');
        toolbar.addSaveButton();
        app.models.subject.findAll({
            attributes: ['id', 'title']
        })
        .then(function (subjects) {
            //console.log(subjects);
            res.backend.render('form',{
                toolbar : toolbar.render(),
                subjects: subjects
            })
        }).catch(function (err){
            res.backend.render('form',{
                toolbar : toolbar.render()
            })
        })
    };
    controller.save = function (req, res) {
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'section_back_link');
        toolbar.addSaveButton();
        let data = req.body;
        app.models.section.create(data)
        .then(function () {
            req.flash.success('Thêm mới dạng câu hỏi thành công !');
            res.redirect(baseRoute);
        }).catch(function (err) {
            req.flash.error(err.message);
            res.redirect(baseRoute+'/create');
        })

    };
}