/**
 * Created by thangtyt on 11/30/16.
 */
var chapters,
    currentAnswerIndex = 0,
    answers = [],
    answerKeys = [];

function loadChapter(subject_id){
    var subId = subject_id ? subject_id : $('#subject_id option:selected').val();
    if( Number(subId) !==0 ){
        $.ajax({
            url: '/admin/examination/q-a/list-chapter/'+subId,
            type: 'GET'
        }).done(function(result){
            $('#chapter_id').empty();
            //$('#chapter_id').append();
            chapters = result;
            $('#chapter_id').append(new Option('-- Choose --',0));
            chapters.map(function (val) {
                var opt = new Option(val.title,val.id);
                $('#chapter_id').append(opt);
            })
        });
        $.ajax({
            url: '/admin/examination/q-a/list-section/'+subId,
            type: 'GET'
        }).done(function(results){
            if(!results.hasOwnProperty('error')){
                $('#section_id').empty();
                $('#section_id').append(new Option('-- Choose --',0));
                results.map(function (val) {
                    var opt = new Option(val.title,val.id);
                    $('#section_id').append(opt);
                })
            }
        });
    }else{
        $('#chapter_id').empty();
        $('#chapter_id').append(new Option('-- Choose --',0));
    }
}
function loadLesson(chapter_id){
    var chapId = chapter_id ? chapter_id : $('#chapter_id option:selected').val();
    $('#lesson').empty();
    $('#lesson').append(new Option('-- Choose --'));
    chapters.map(function (val) {
        if (val.id === chapId ){
            var lessons = JSON.parse(val.lessons);
            lessons.map(function (lesson) {
                var opt = new Option(lesson.title,lesson.title);
                $('#lesson').append(opt);
            })
        }
    })
}
function requirementQuestion(require){
    var isRequire = require || $('#require option:selected').val();
    if(Number(isRequire) == 1){
        $('#requirementContent').removeClass('hidden');
        $('button[name=btnRequireAnswer]').removeClass('hidden');
    }else{
        $('#requirementContent').addClass('hidden');
        $('button[name=btnRequireAnswer]').addClass('hidden');
    }
}

function uuid() {
    var uuid = "", i, random;
    for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;
        if (i == 8 || i == 12 || i == 16 || i == 20) {
            uuid += "-"
        }
        uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
}
function initCkeditorBasic(list){
    list.map(function (val) {
        CKEDITOR.replace( val, {
            height: 100,
            toolbar : [
                ['Styles','Format','Font','FontSize'],
                ['Bold','Italic','Underline','StrikeThrough','-','Undo','Redo','-','Cut','Copy','Paste','Find','Replace'],
                ['NumberedList','BulletedList','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
                ['Image','Table','-','TextColor','BGColor','Source']
            ]
        } );
    })

}
function changeRightAnswer(id){
    //console.log('changeRightAnswer');
    for(var i in [0,1,2,3]){
       if($('#panelAnswer'+i).hasClass('box-success')){
           $('#panelAnswer'+i).removeClass('box-success');
           $('#panelAnswer'+i).addClass('box-danger');
       }
    }
    $('#'+id).removeClass('box-danger');
    $('#'+id).addClass('box-success');
}
function pushAnswer(require){
    //console.log("dasdasdas : ",CKEDITOR.instances);
    var answerContent = require == 0 ? "" : CKEDITOR.instances['answerContent'].getData();
    [0,1,2,3].map(function (i) {
        var isTrue = $('input[name=rightAnswer]').val() == i ? true : false;
        answerKeys.push({
            index: i,
            answer: CKEDITOR.instances['answer'+i].getData(),
            explanation: CKEDITOR.instances['answerExplain'+i].getData(),
            isTrue: isTrue
        })
    })

    answers.push({
        id: uuid(),
        mark: $('#answerMark').val(),
        content: answerContent,
        time: $('#answerTime').val(),
        answer_keys: answerKeys
    })
    answerKeys = [];
}

function addAnswer(){
    answerKeys = [];
    pushAnswer(1);
    resetAnswer();
    renderView();
}
function resetAnswer(){
    $('#answerMark').val(0);
    $('#answerTime').val(0);
    CKEDITOR.instances['answerContent'].setData('');
    CKEDITOR.instances['answer0'].setData('');
    CKEDITOR.instances['answer1'].setData('');
    CKEDITOR.instances['answer2'].setData('');
    CKEDITOR.instances['answer3'].setData('');
    CKEDITOR.instances['answerExplain0'].setData('');
    CKEDITOR.instances['answerExplain1'].setData('');
    CKEDITOR.instances['answerExplain2'].setData('');
    CKEDITOR.instances['answerExplain3'].setData('');
    changeRightAnswer('panelAnswer0');
}

function renderChapterLesson(chapter_id,lesson){
    $('#chapter_id').val(chapter_id);
    loadLesson(chapter_id);
    $('#lesson').val(lesson);
}
function renderView(){
    if($('#require').val()==0){
        editAnswer(0,0);
    }
    if(answers.length > 0 ){
        var questionContent = CKEDITOR.instances.answerContent.getData();;
        var requireContent ;
        if($('#'))
        requireContent = CKEDITOR.instances.content.getData();
        $('#previewDiv').empty();
        var html = '';
        var answerIndex = 1;
        html+=`<div class="margin">
                        <div class="col-lg-12">
                            <p>`
                                +
                                    requireContent
                                +
                            `</p>
                        </div>`;
        if( $('#question_type').prop('value') == 0 ){
            var keyCode= 65;
            answers.map(function (answer) {
                    html += '<div class="col-lg-12">' +
                    '<p><b>Question: '+answerIndex+' : </b>'+questionContent+'</p>' +
                    '</div>' ;
                html += '<div class="col-lg-12">';
                answer.answer_keys.map(function (val) {
                    var tempStyle = '';
                    if(val.isTrue){
                        tempStyle = ' style="color: #0063dc"';
                    }
                    html+='<div class="col-md-3"'+tempStyle+'>'+String.fromCharCode(keyCode)+'.'+val.answer+'</div>';
                    keyCode++;
                })
                html+=       '</div>' ;
                answerIndex++;
            })
        }
        html+='</div>';
        $('#previewDiv').append(html);
    }

}

function fillAnswer(index,require,content){
    var answerContent = require == 0 ? content : answers[index].content;
    $('#answerMark').val(answers[index].mark);
    $('#answerTime').val(answers[index].time);
    CKEDITOR.instances['answerContent'].setData(answerContent);
    CKEDITOR.instances['answer0'].setData(answers[index].answer_keys[0].answer);
    CKEDITOR.instances['answer1'].setData(answers[index].answer_keys[1].answer);
    CKEDITOR.instances['answer2'].setData(answers[index].answer_keys[2].answer);
    CKEDITOR.instances['answer3'].setData(answers[index].answer_keys[3].answer);
    CKEDITOR.instances['answerExplain0'].setData(answers[index].answer_keys[0].explanation);
    CKEDITOR.instances['answerExplain1'].setData(answers[index].answer_keys[1].explanation);
    CKEDITOR.instances['answerExplain2'].setData(answers[index].answer_keys[2].explanation);
    CKEDITOR.instances['answerExplain3'].setData(answers[index].answer_keys[3].explanation);

}

function editAnswer(index,require){
    var answerContent = require == 0 ? '' : CKEDITOR.instances['answerContent'].getData();
    answers[index].answer_keys = answers[index].answer_keys.filter(function (key) {
        var isTrue = $('input[name=rightAnswer]').val() == key.index ? true : false;
        return {
            index: key.index,
            answer: CKEDITOR.instances['answer'+key.index].getData(),
            explanation: CKEDITOR.instances['answerExplain'+key.index].getData(),
            isTrue: isTrue
        }
    })

    answers[index].mark = $('#answerMark').val();
    answers[index].content = answerContent;
    answers[index].time = $('#answerTime').val();
}
$(function(){
    $('form').submit(function (e) {
        //console.log(typeof $('#require').val());
        try{
            if(Number($('#require').val()) == 0){
                CKEDITOR.instances.content.setData(CKEDITOR.instances['answerContent'].getData());
                if( answers.length > 0 ){
                    editAnswer(0,0);
                }else{
                    CKEDITOR.instances['answerContent'].setData('');
                    pushAnswer(0);
                }
            }else{
                if(currentAnswerIndex != 0){
                    editAnswer(currentAnswerIndex,1);
                }
            }
            $('input[name=answers]').val(JSON.stringify(answers));
        }catch(err){
            console.log(err);
            return false;
        }
        //
        //console.log(JSON.stringify($('form').serializeArray(),3,3));
        //return false;
    })

});