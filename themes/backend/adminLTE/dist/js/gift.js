
function searchGiftCode(_curPage) {
    $.ajax({
        url: $(location).attr('href'),
        type: 'PUT',
        data: {
            type: $('#typeOfGiftCode').val(),
            key: $('#keySearch').val(),
            page: _curPage || currPage
        }
    }).done(function (result) {
        generateGiftCodeDisplay(result);
    });
}

function changeTypeOfGiftCode(type) {
    if (type == 0) {
        $('#typeOfGiftCode').val(0);
        $('#typeBtnDisplay').text('De-Active');
    } else if (type == 1) {
        $('#typeOfGiftCode').val(1);
        $('#typeBtnDisplay').text('Active');
    } else {
        $('#typeOfGiftCode').val(2);
        $('#typeBtnDisplay').text('All');
    }
}
function generateGiftCodeDisplay(giftcodes) {
    $('#giftCodesDiv').empty();
    giftcodes.rows.map(function (val) {
        if (val.status == 1)
            $('#giftCodesDiv').append('<button type="button" style="margin: 5px !important;" class="btn btn-info">' + val.gift_code + '</button>');
        else
            $('#giftCodesDiv').append('<button type="button" style="margin: 5px !important;" class="btn btn-default">' + val.gift_code + '</button>');
    });
    generatePagination(giftcodes.pagination);
}


var paginationGiftCodeDiv = function (data) {
    var totalPage = Math.ceil( data.totalGift/data.itemOfPage );
    var _page = parseInt( Number(data.page) / 5 );
    //console.log(_page);
    if(data.page % 5 == 0)_page--;
    var divReturn = `       <div class="col-sm-12">
                                <div class="dataTables_paginate paging_simple_numbers pull-right">
                                    <ul class="pagination">`;
                    if(Number(_page) > 0)
                        divReturn += `  <li class="paginate_button previous">
                                            <a href="javascript:pagination(1);" aria-controls="example2" data-dt-idx="0" tabindex="0">1</a>
                                        </li>`;

                    if(_page > 0 ){
                        divReturn +=  `      <li class="paginate_button">
                                                            <a href="javascript:pagination(`+(_page*5)+`);" aria-controls="example2" data-dt-idx="1" tabindex="0">...</a>
                                                        </li>`;
                    }
                    for (var i = _page*5 + 1; i <= (_page*5)+5 ; i++){
                        if (i<totalPage){
                            divReturn += `      <li class="paginate_button`;
                            if (Number(data.page) == i) divReturn += ' active';
                            divReturn +=        `">
                                            <a href="javascript:pagination(`+i+`);" aria-controls="example2" data-dt-idx="1" tabindex="0">`+i+`</a>
                                        </li>`;
                        }
                    }
                    if(totalPage > ((_page+1)*5+1) ){
                        divReturn +=  `      <li class="paginate_button">
                                            <a href="javascript:pagination(`+((_page+1)*5+1)+`);" aria-controls="example2" data-dt-idx="1" tabindex="0">...</a>
                                        </li>`;
                    }

                    if( totalPage > 5){
                        divReturn += `  <li class="paginate_button next" id="example2_next">
                                            <a href="javascript:pagination(`+totalPage+`);"  aria-controls="example2"  data-dt-idx="7"  tabindex="0">`+totalPage+`</a>
                                        </li>`;
                    }
    return divReturn += `           </ul>
                                </div>
                            </div>`;
}



function generatePagination(pagGiftCode){
    $('#paginationGiftCode').empty();
    if(pagGiftCode.totalGift != pagGiftCode.itemOfPage)
    $('#paginationGiftCode').append(paginationGiftCodeDiv(pagGiftCode));
}
function pagination(page){
    currPage = page;
    searchGiftCode();
}
