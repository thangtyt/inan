/**
 * Created by thangnv on 11/19/16.
 */


let sectionDiv = `
                <div class="box box-info collapsed-box" id="$id$">
                    <div class="box-header with-border">
                        <h3 class="box-title">$section-title$</h3>
                        <div class="box-tools pull-right">
                            <button type="button" class="btn btn-box-tool" data-widget="collapse" data-toggle="tooltip" title="" data-original-title="Collapse">
                                <i class="fa fa-plus"></i></button>
                        </div>
                    </div>
                    <div class="box-body" style="display: none;">
                       <div class="form-group">
                                    <label>Question</label>
                                    <div class="input-group input-group-sm">
                                        <select name="question-$id$" id="question-$id$" style="width: 100%"></select>
                                        <span class="input-group-btn">
                                          <button type="button" onclick="addQuestion('$id$')" class="btn btn-info">ADD</button>
                                        </span>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <div class="col-xs-12 table-responsive">
                                        <table class="table table-bordered table-hover dataTable">
                                            <thead style="background-color: #d2d6de">
                                                <th width="5%">
                                                    ?
                                                </th>
                                                <th>
                                                    Answer Key
                                                </th>
                                                <th width="10%">
                                                    #
                                                </th>
                                            </thead>
                                            <tbody id="answerList">

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                    </div>
                    <!-- /.box-body -->
                    <div class="box-footer" style="display: none;">
                       <span class="pull-left">Number of questions : </span><span class="pull-right" id='secTotalQues'></span>
                        <span class="pull-right">Total time : </span><span class="pull-left" id='secTotalTime'></span>
                    </div>
                    <!-- /.box-footer-->
                </div>`;

function loadSections(){
    var subjectId = $('select[name="subject_id"]').val();
    $.ajax({
        url: '/admin/examination/exam/list-section/'+subjectId,
        type: 'GET'
    }).done(function(results){
        if(!results) results =[];
        select2Sections.append(new Option('--Choose Subject--'));
        select2Sections.empty();
        results.map(function (section) {
            var opt = new Option(section.title,section.id);

            select2Sections.append(opt);
            //select2Sections.trigger('change');
        });

    });
}
function addSection(element) {
    var content = sectionDiv.replace(/\$id\$/g,element.id);
    content = content.replace(/\$section-title\$/g,element.text);
    $('#examDetail').append(content);
    $.ajax({
        url: '/admin/examination/exam/list-question/'+element.id,
        type: 'GET'
    }).done(function(results){
        if(!results) results =[];
        $('#question-'+element.id).select2({
            templateSelection: function (option) {
                var text = $(option.element).text().trim();
                text = text.replace(/^[—]+/, '');
                return text;
            }
        });
        results.map(function (section) {
            var opt = new Option(section.title,section.id);
            $('#question-'+element.id).append(opt);
        });

    });
}
function removeSection(element){
    $('#'+element.id).remove();
}
function addQuestion(id){

}