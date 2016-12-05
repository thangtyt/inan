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
    let baseRoute = '/admin/examination/section';
    let permission = {
        all: 'section',
        create: 'section',
        index: 'section',
        delete: 'section'
    }
    let isAllow = ArrowHelper.isAllow;
    controller.secList = function (req, res) {
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
                column: 'id',
                width: '1%',
                header: ' ',
                type: 'checkbox'
            },
            {
                column: 'title',
                width: '20%',
                header: 'Title',
                link: baseRoute + '/' + '{id}',
                filter: {
                    data_type: 'string'
                }
            },
            {
                column: 'subject.title',
                width: '10%',
                header: 'Subject',
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
        actions.secFindAndCountAll({
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
            res.backend.render('section/list', {
                title: 'Section',
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
                title: 'Section',
                totalPage: 1,
                items: null,
                currentPage: page,
                toolbar: toolbar,
                queryString: (req.url.indexOf('?') == -1) ? '' : ('?' + req.url.split('?').pop()),
                baseRoute: baseRoute
            });
        });
    };
    controller.secView = function (req, res) {

        let actions = app.feature.examination.actions;
        let sectionId = req.params.sectionId;
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'sView_back_link');
        toolbar.addSaveButton();
        toolbar.addDeleteButton();
        Promise.all([
            actions.secFind({
                where: {
                    id: sectionId
                }
            }),
            actions.sFindAll({
                attributes: ['id','title']
            }),
            actions.questionFind({
                where: {
                    section_id: sectionId
                }
            })
        ])
        .then(function (result) {
                //console.log(result[2]);
            res.backend.render('section/form',{
                toolbar : toolbar.render(),
                baseRoute: baseRoute,
                section: result[0],
                subjects: result[1],
                isUpdate: result[2]
            })
        }).catch(function (err){
            logger.error(err.message);
            res.backend.render('section/form',{
                toolbar : toolbar.render()
            })
        })


    };
    controller.sectionDelete = function (req, res) {
        //let actions = app.feature.examination.actions;
        let ids = [];
        //console.log('11111');
        if (req.params.sectionId){
            ids = [req.params.sectionId]
        }else{
            ids = req.body.ids.split(',');
        }
        app.models.section.destroy({
            where : {
                id: {
                    $in: ids
                }
            }
        }).then(function (result) {
            req.flash.success('Delete successfully !');
            res.jsonp({
                error: null
            });
        }).catch(function (err) {
            req.flash.error('You cannot delete one of sections !');
            res.jsonp({
                error: 'You cannot delete one of sections !'
            });
        });
        //app.models.transaction(function (t) {
        //    let sectionsToDelete = [];
        //    ids.map(function (secId) {
        //        sectionsToDelete.push(app.models.section.destroy({
        //            where: {
        //                id: secId
        //            }
        //        },{transaction: t}));
        //    })
        //    return Promise.all(sectionsToDelete);
        //}).then(function (result) {
        //    console.log(result);
        //}).catch(function (err) {
        //    console.log(err);
        //})
        //console.log(ids);
        //res.redirect(baseRoute);
        //res.sendStatus(200);
    };
    controller.secUpdate = function (req, res,next) {
        let actions = app.feature.examination.actions;
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'sView_back_link');
        toolbar.addSaveButton();
        toolbar.addDeleteButton();
        let form = req.body;
        let sectionid = req.params.sectionId;
        actions.secFind({
            where: {
                id: sectionid
            }
        }).then(function (section) {
            return actions.secUpdate(section,form);
        }).then(function (result) {
            if(result){
                req.flash.success('Update successfully !');
                next();
            }else {
                throw Error('Error');
            }
        }).catch(function (err) {
            console.log(err);
            req.flash.error('cannot update this section !');
            next();
        })
    };
    controller.secCreate = function (req, res) {
        let actions = app.feature.examination.actions;
        let toolbar = new ArrowHelper.Toolbar();
        toolbar.addBackButton(req, 'sCreate_back_link');
        toolbar.addSaveButton();
        actions.sFindAll({
            attributes: ['id', 'title']
        })
            .then(function (subjects) {
                //console.log(subjects);
                res.backend.render('section/form',{
                    toolbar : toolbar.render(),
                    subjects: subjects
                })
            }).catch(function (err){
                logger.error(err.message);
                res.backend.render('section/form',{
                    toolbar : toolbar.render()
                })
            })
    };
    controller.secSave = function (req, res) {
        let toolbar = new ArrowHelper.Toolbar();
        let actions = app.feature.examination.actions;
        toolbar.addBackButton(req, 'sCreate_back_link');
        toolbar.addSaveButton();
        let data = req.body;
        actions.secCreate(data)
        .then(function (section) {
            req.flash.success('Create section successfully !');
            res.redirect(baseRoute);
        }).catch(function (err) {
            req.flash.error(err.message);
            res.redirect(baseRoute+'/create');
        })

    };
}