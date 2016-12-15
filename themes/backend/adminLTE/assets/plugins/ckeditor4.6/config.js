/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
    //config.extraPlugins = 'dialog';
    //config.extraPlugins = 'widget';
    //config.extraPlugins = 'mathjax';
    config.extraPlugins = 'widgetselection';
    config.codeSnippet_theme = 'monokai';

    config.codemirror_theme = 'monokai';
    config.codemirror = {
        lineNumbers: false
    };

    config.extraPlugins = 'image2,oembed,font';
    config.htmlEncodeOutput = false;
    config.entities = false;
    config.extraAllowedContent = 'iframe;*(*);*[style]{*};';
    config.filebrowserBrowseUrl = '/fileman/index.html';
    config.filebrowserImageBrowseUrl = '/fileman/index.html?type=image';
    config.extraPlugins='mathjax';
    config.mathJaxLib = '//cdn.mathjax.org/mathjax/2.6-latest/MathJax.js?config=TeX-AMS_HTML';
    config.toolbar =
        [
            { name: 'document', items : [ 'Source','-','Preview','-','Templates' ] },
            { name: 'clipboard', items : [ 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ] },
            { name: 'editing', items : [ 'Find','Replace','-','SelectAll','-','SpellChecker', 'Scayt' ] },
            //{ name: 'forms', items : [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton',
            //    'HiddenField' ] },
            '/',
            { name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike' ] },
            { name: 'paragraph', items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote',
                '-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','BidiLtr','BidiRtl' ] },
            { name: 'links', items : [ 'Link','Unlink','Anchor' ] },
            { name: 'insert', items : [ 'Image','Table','HorizontalRule','SpecialChar' ] },
            '/',
            { name: 'styles', items : [ 'Styles','Format','Font','FontSize' ] },
            //{ name: 'colors', items : [ 'TextColor','BGColor' ] },
            { name: 'tools', items : [ 'Maximize', 'Mathjax' ] }
        ];
};
