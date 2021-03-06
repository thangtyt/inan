/**
 * Created by thangtyt on 11/30/16.
 */
var chapters,
    currentAnswerId = '',
    answers = [],
    answerKeys = [];

function loadChapter(subject_id){
    var subId = subject_id ? subject_id : $('#subject_id option:selected').val();
    if( Number(subId) !==0 ){
        $.ajax({
            url: '/admin/qa/list-chapter/'+subId,
            type: 'GET'
        }).done(function(result){
            $('#chapter_id').empty();
            //$('#chapter_id').append();
            chapters = result;
            $('#chapter_id').append(new Option('-- Choose --',''));
            chapters.map(function (val) {
                var opt = new Option(val.title,val.id);
                $('#chapter_id').append(opt);
            })
        });
        $.ajax({
            url: '/admin/qa/list-section/'+subId,
            type: 'GET'
        }).done(function(results){
            if(!results.hasOwnProperty('error')){
                $('#section_id').empty();
                $('#section_id').append(new Option('-- Choose --',''));
                results.map(function (val) {
                    var opt = new Option(val.title,val.id);
                    $('#section_id').append(opt);
                })
            }
        });
    }else{
        $('#chapter_id').empty();
        $('#chapter_id').append(new Option('-- Choose --',''));
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
function renderEditAnswerChoose(index){
    if(answers.length > 0 && $('#require option:selected').val() == 1){
        $('#divEditAnswer').removeClass('hidden');
        var i =1;
        $('select[name=editAnswerIndex]').empty();
        $('select[name=editAnswerIndex]').append($('<option>', {
            text: '-- Choose Question --',
            value: -1
        }));
        answers.map(function (answer) {
            var option = {
                value: i-1,
                text: 'Question '+ i
            };

            if(index != null && index != undefined){
                //console.log(index);
                if(index == i-1){
                    //console.log('found');
                    option.selected = 'selected';
                }
            }
            $('select[name=editAnswerIndex]').append($('<option>', option));
            i++;
        });
        //$('select[name=editAnswerIndex]').attr('selected', true);
        $('#deleteDiv').removeClass('hidden');
    }else {
        {
            $('#addQuestionBtn').removeClass('hidden');
            $('#editQuestionBtn').addClass('hidden');
            $('#divEditAnswer').addClass('hidden');
        }
    }
}
function requirementQuestion(require){
    var isRequire = require || $('#require option:selected').val();
    if(Number(isRequire) == 1){
        $('#requirementContent').removeClass('hidden');
        $('button[name=btnRequireAnswer]').removeClass('hidden');
        if(answers.length < 0){
            $('#addQuestionBtn').removeClass('hidden');
        }else{
            $('#editQuestionBtn').removeClass('hidden');
        }
        renderEditAnswerChoose();
    }else{
        $('#requirementContent').addClass('hidden');
        $('button[name=btnRequireAnswer]').addClass('hidden');
        renderEditAnswerChoose();
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
                //['Styles','Format','Font','FontSize'],
                ['Bold','Italic','Underline','StrikeThrough','-','Undo','Redo','-','Cut','Copy','Paste','Find'],
                //['NumberedList','BulletedList','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'],
                ['Image','Table','-','Mathjax','Source']
            ]
        } );
    })

}
function changeRightAnswer(id){
    var keys = [0,1,2,3];
    keys.map(function (i) {
        if($('#panelAnswer'+i).hasClass('box-success')){
            $('#panelAnswer'+i).removeClass('box-success');
            $('#panelAnswer'+i).addClass('box-danger');
        }
        if($('#answerRadio'+i).is(':checked')){
            $('input[name=rightAnswer]').val(i);
            $('#answerRadio'+i).prop('checked',true)
        }
    });
    $('#'+id).removeClass('box-danger');
    $('#'+id).addClass('box-success');
    //console.log($('input[name=rightAnswer]').val());
}


//add answer to array list
function addAnswer(){
    answerKeys = [];
    pushAnswer(1);
    renderView();
    renderEditAnswerChoose(null);
    resetAnswer();
}
// reset
function resetAnswer(){
    $('#answerMark').val(0.2);
    $('#answerTime').val(1);
    $('#layout').val(0);
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
    $('#answerRadio0').prop('checked',true);
    $('#editQuestionBtn').addClass('hidden');
    $('#addQuestionBtn').removeClass('hidden');
    renderEditAnswerChoose();
    currentAnswerId = '';
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
    //console.log(JSON.stringify(answers,2,2));
    if(answers.length > 0 ){
        //var questionContent = CKEDITOR.instances.answerContent.getData();
        var requireContent ;
        //if($('#'))
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

        //var keyCode= 65;
        answers.map(function (answer) {
            var answerContent = $('#require').val() == 0 ? CKEDITOR.instances.answerContent.getData() : answer.content;
                html += '<div class="col-lg-12">' +
                '<p><b>Question: '+answerIndex+' : </b>'+answerContent+'</p>' +
                '</div>' ;
            html += '<div class="col-lg-12">';
            if(answer.hasOwnProperty('answer_keys')){
                var _layout = 3;
                if(answer.layout == 1)
                    _layout = 6;
                else if (answer.layout == 2)
                    _layout = 12;
                answer.answer_keys.map(function (val) {
                    var tempStyle = '';
                    if(val.isTrue){
                        tempStyle = ' style="color: #0063dc"';
                    }
                    //html+='<div class="col-md-3"'+tempStyle+'>'+String.fromCharCode(keyCode)+'.'+val.answer+'</div>';
                    html+='<div class="col-md-'+_layout+'"'+tempStyle+'>'+val.answer+'</div>';
                })
            }
            html+=       '</div>' ;
            answerIndex++;
        });
        html+='</div>';
        $('#previewDiv').append(html);
        //re-render latex
        MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    }

}

function fillAnswer(index,require,content){
    var answerContent = '';
    if(answers.length > 0){
        answerContent = require == 0 ? content : answers[index].content;
        $('#answerMark').val(answers[index].mark);
        $('#answerTime').val(answers[index].time);
        $('#layout').val(answers[index].layout);
        currentAnswerId = answers[index].id;
        CKEDITOR.instances['answerContent'].setData(answerContent);
        [0,1,2,3].map(function (i) {
            if(answers[index].answer_keys[i].isTrue){
                $('#answerRadio'+i).prop('checked', true);
                $('input[name=rightAnswer]').val(i);
                changeRightAnswer('panelAnswer'+i);
            }
            CKEDITOR.instances['answer'+i].setData(answers[index].answer_keys[i].answer);
            CKEDITOR.instances['answerExplain'+i].setData(answers[index].answer_keys[i].explanation);
        });
        if ($('#require option:selected').val() == 1){
            $('#addQuestionBtn').addClass('hidden');
            $('#editQuestionBtn').removeClass('hidden');
            $('#deleteDiv').removeClass('hidden');
        }else{
            $('#addQuestionBtn').addClass('hidden');
            $('#editQuestionBtn').addClass('hidden');
        }
    }



}
function pushAnswer(require){
    var answerContent = require == 0 ? "" : CKEDITOR.instances['answerContent'].getData();
    [0,1,2,3].map(function (i) {
        var isTrue = $('input[name=rightAnswer]').val() == i ? true : false;
        //console.log(isTrue, i);
        answerKeys.push({
            index: i,
            answer: CKEDITOR.instances['answer'+i].getData(),
            explanation: CKEDITOR.instances['answerExplain'+i].getData(),
            isTrue: isTrue
        })
    })
    var tempId = currentAnswerId != '' ? currentAnswerId : uuid();
    answers.push({
        id: tempId,
        mark: $('#answerMark').val(),
        content: answerContent,
        time: $('#answerTime').val(),
        layout: $('#layout').val(),
        answer_keys: answerKeys
    })
    answerKeys = [];
}
function editAnswer(index,require){
    if(require == 0){
        var answerContent = require == 0 ? "" : CKEDITOR.instances['answerContent'].getData();
        var _answer = [];
        var answer_keys = [];
        var keys = [0,1,2,3];
        keys.map(function (key) {
            var isTrue = Number($('input[name=rightAnswer]:checked').val()) == key ? true : false;
            //console.log(isTrue, key);
            answer_keys.push({
                index: key,
                answer: CKEDITOR.instances['answer'+key].getData(),
                explanation: CKEDITOR.instances['answerExplain'+key].getData(),
                isTrue: isTrue
            })
        });
        _answer.push({
            mark: $('#answerMark').val(),
            content : answerContent,
            time: $('#answerTime').val(),
            layout: $('#layout').val(),
            answer_keys: answer_keys
        })
        if(answers.length > 0)
        _answer[0].id = answers[0].id;
        else
        _answer.id = uuid();

        answers = _answer;
    }else{
        var answerContent = CKEDITOR.instances['answerContent'].getData();
        if (answers[index] != undefined){
            var _answersKeys = [];
            var keys = [0,1,2,3];
            keys.map(function (key) {
                //console.log(Number($('input[name=rightAnswer]:checked').val()));
                var isTrue = Number($('input[name=rightAnswer]:checked').val()) == Number(key) ? true : false;
                //console.log(JSON.stringify($('input[name=rightAnswer]:checked').val(),2,2));
                _answersKeys.push( {
                    index: key,
                    answer: CKEDITOR.instances['answer'+key].getData(),
                    explanation: CKEDITOR.instances['answerExplain'+key].getData(),
                    isTrue: isTrue
                })
            });
            answers[index].answer_keys = _answersKeys;
            answers[index].mark = $('#answerMark').val();
            answers[index].content = answerContent;
            answers[index].time = $('#answerTime').val();
            answers[index].layout = $('#layout').val();
        }
    }

}
function chooseQuestionToEdit(){
    if ($('select[name=editAnswerIndex]').val() >= 0 ){
        fillAnswer($('select[name=editAnswerIndex]').val(),1,'');
    }

}

//
function editAnswerArray(){
    if($('select[name=editAnswerIndex]').val() != -1){
        editAnswer($('select[name=editAnswerIndex]').val(),1);
        resetAnswer();
    }
}

function deleteAnswer(){
    var indexAnswerToDelete = -1;
    for (var i = 0 ; i < answers.length ; i ++) {
        if (answers[i].id == currentAnswerId){
            indexAnswerToDelete = i;
            break;
        }
    }
    if (indexAnswerToDelete > -1){
        answers.splice(indexAnswerToDelete,1);
        resetAnswer();
        $('#confirm-delete-answer-modal').modal('hide');
    }
}

