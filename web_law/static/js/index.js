$(function () {
    $('.tree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Collapse this branch');
    $('.tree li.parent_li > span').on('click', function (e) {
        var children = $(this).parent('li.parent_li').find(' > ul > li');
        if (children.is(":visible")) {
            children.hide('fast');
            $(this).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
        } else {
            children.show('fast');
            $(this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
        }
        e.stopPropagation();
    });
    var text = '';
    $('.tree .li-click>li').click(function () {
        $('.tree').find('span').removeClass('active');
        $(this).find('span').addClass('active');
        text = $(this).find('span').text();
        //console.log(text)
        $.ajax({
            url: '/search_law_sentence/',
            type: 'post',
            data: {word:text},
            success: function(data){
                addLawList(data.data_list);
            }
        })
    })
    $('.categorys button').click(function () {
        $(this).addClass('active').siblings().removeClass('active');
        var aspect_text = $(this).text();
        //console.log(aspect_text)
        $.ajax({
            url: '/search_law_sentence_aspect/',
            type: 'post',
            data: {word:text, aspect:aspect_text},
            success: function(data){
                addLawList(data.data_list);
            }
        })
    })
});
function addLawList(data){
    $('.law-list li').remove();
    var dataList = data;
    for(var i = 0; i < dataList.length; i++){
        var liObj = '<li class="list-group-item"><p>' + dataList[i].law_source + '</p><p>来源政策：<span class="policy-name"> ' + dataList[i].law_sentence + '</span></p></li> '
        $('.law-list').append(liObj);
    }
}