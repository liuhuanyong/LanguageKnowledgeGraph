$(function () {
	//第一和第三部分公用
	$('.side-list-title').on('click',function (){
        var item=$(this).next();  
        if(item.hasClass('set-height')){
            item.removeClass('set-height');
        }else {        
            item.addClass('set-height');
        }             
    });
})
var labelChinese = {}, relChinese = {}, propChinese = {},relColor = {};
//var links=[]
$.ajax({
  url: '/neo4j_change_language/',
  type:'get',
  success:function(rel){
    labelChinese = rel.labelChinese;
    relChinese = rel.relChinese;
    propChinese = rel.propChinese;
    initLabelRela()
  }
})
function initLabelRela() {
    $('#entities li').remove();             
    for(var item in labelChinese){
        var li = "<li class='entity' id=" + item + "><div>" + labelChinese[item] + "</div></li>";
        var opt = '<option value="' + item + '">' + labelChinese[item] + '</option>';
        $('#entities').append(li);
        $('#entities li').draggable({
            appendTo:"body",
            helper:"clone",
            opacity:0.7,
            cursor:"move"
        });
        //$('#entities').append(liObj);
        $('#relaStart').append(opt);
        $('#relaEnd').append(opt);
    }       
    for(var rel in relChinese) {
        var optObj = '<option name="' + rel + '">' + relChinese[rel] + '</option>';
        var liObj="<li class='relation' id=" + rel + ">" + relChinese[rel] + "<div class='relation-line'></div></li>";
        $('#relations').append(liObj);
        $('#relations li').draggable({
            appendTo:"body",
            helper:"clone",
            opacity:0.7,
            cursor:"move"
        });
        $('#rel-type').append(optObj);
    }
}
//一种关系对应一种颜色
function getRelColor(str){
    if(relColor[str] == undefined){
        relColor[str] = randomRgbColor();
    }
    return relColor[str];
}
function beforeSend(obj){
    var imgBox="<div class='img-box'><img src='/static/images/loading_blue.gif'></div>";
    obj.append(imgBox);
}
//显示提示窗口淡入淡出
function showDialog(text){
    var dialogBox=$('.dialog');
    dialogBox.text(text);
    dialogBox.fadeIn();
    setTimeout(function(){
        dialogBox.fadeOut(600);
    } ,1500)
} 
//根据中文获取对应英文词
function toEnglish(str,type){
    if(type=='entity'){
        for(var item in labelChinese){
            if(labelChinese[item]==str){   
                return item;
                break;
            }
        }
    }
    else{
        for(var rel in relChinese){
            if(relChinese[rel]==str){   
                return rel;
                break;
            }
        } 
    }
} 
//随机生成一种颜色
function randomRgbColor() {
    var r = Math.floor(Math.random()*256);
    var g = Math.floor(Math.random()*256);
    var b = Math.floor(Math.random()*256);
    return 'rgb(' + r + ','  + g + ',' + b + ')';
}
//第三部分处理links
function getLinks(result,index){
    if (index == null) {
        for(var i = 0; i < result.length; i++){
            var item = result[i];   
            for(var j = 0; j < item.length; j++){     
                var linkItem={} ;
                linkItem.source=item[j][0];
                linkItem.target=item[j][2];
                linkItem.rela=item[j][1];      
                linkItem.lineColor = '#87919b';
                links.push(linkItem)
            }            
        }
    }
    else{
        var resultColor = result[index];
        for( var k = 0; k < resultColor.length; k++){
            var sourceColor = resultColor[k][0];
            var targetColor = resultColor[k][2];
            for(var l = 0; l < links.length; l++){
                //console.log(links[l].source.name)
                if(links[l].source.name == sourceColor && links[l].target.name == targetColor){
                    
                    links[l].lineColor = '#08b2f7';
                }
            }
        }
    }
    // 发散
    /*for(var i = 0; i < result.length; i++){
        var item = result[i];
        var lastEle = item[item.length-1];
        if (typeof(lastEle) != 'string') {          
            for(var j = 0; j < item.length; j++){     
                var linkItem={} ;
                linkItem.source=item[j][0];
                linkItem.target=item[j][2];
                linkItem.rela=item[j][1];      
                linkItem.lineColor = '#87919b';
                links.push(linkItem)
            }            
        }else {
            for(var k = 0; k < item.length-1; k++){     
                var linkItem={} ;
                linkItem.source=item[k][0];
                linkItem.target=item[k][2];
                linkItem.rela=item[k][1];      
                linkItem.lineColor = lastEle;
                links.push(linkItem)
            }
        }
    }
    //处理source和target都相同情况
    for(var l = 0; l < links.length; l++){
        var link = links[l];
        for(var i = 0; i <links.length; i++ ){
            if (link.source == links[i].source && link.target == links[i].target && link.lineColor != '#87919b') {
                links[i].lineColor = link.lineColor;
            }
        } 
    }*/
}
//设置圆圈在规定范围里
function limitRectX(x,width){
    if(x<28) {return 28;}
    else if(x>width-28) {return width-28;}
    else {return x;}
}
function limitRectY(y,height){
    if(y<28) {return 28;}
    else if(y>height-28) {return height-28;}
    else {return y;}
}
function searchPic(key, res){
    var searchLinks = []; 
    if(key != ''){ 
        for(var i = 0; i < res.length; i++) {
            var searchList = [];
            for(var j = 0; j < res[i].length; j++){
                if (res[i][j][0].indexOf(key) > -1 || res[i][j][2].indexOf(key) > -1 || res[i][j][1].indexOf(key) > -1) {
                    searchList.push(res[i][j]);
                    //searchLinks.push(searchList);
                }
            }    
            searchLinks.push(searchList);   
        }
    }else{
        searchLinks = res;
    }
    return searchLinks; 
}
var highlighted = null;
function highlightObject(obj,node,link,text,line_text) {
    if (obj) {
        if (obj !== highlighted) {
            var dependon = [];
            for(var i = 0; i < links.length; i++ ){
                if (obj.name == links[i].source){
                   dependon.push(links[i].target)
                }else if (obj.name == links[i].target) {
                    dependon.push(links[i].source)
                }
            }
            node.classed('inactive', function(d) {
                return (obj !== d && dependon.indexOf(d.name) == -1);
            });
            link.classed('inactive', function(d) {     
                return (obj !== d.source && obj !== d.target);
            });
            line_text.classed('inactive', function(d) {     
                return (obj !== d.source && obj !== d.target);
            });
            text.classed('inactive', function(d) {
                //return (obj !== d && d.name.indexOf(obj.name) == -1);
                return (obj !== d && dependon.indexOf(d.name) == -1);
            })
        }
        highlighted = obj;
    } else {
        if (highlighted) {
            node.classed('inactive', false);
            link.classed('inactive', false);
            text.classed('inactive', false);
            line_text.classed('inactive', false);
        }
        highlighted = null;
    }
}
//关系的终止节点对应
var relTarget={acquire:"Company", 
                  belong_to:"Industry",
                  executive_in:"Person",
                  sell:"Product",
                  need:"Material",
                  sell_to:"Company",
                  compete_with:"Company",
                  hold_stock:"Company",
                  owned:"Copyright",
                  invent:"Patent",
                  registered:"Trade_Mark",
                  dispute_with:"Lawsuit",
                  invest:"Company",
                  account_by:"Organization",
                  upstream:"Industry",
                  branch_of:"Company",
                  locate_in:"Location",
                } ;
var rel_attributes = {};
    rel_attributes['acquire'] = ['acquire_method', 'acquire_money', 'acquire_stock', 'name']
    rel_attributes['belong_to'] = ['name']
    rel_attributes['executive_in'] = ['state', 'position', 'name']
    rel_attributes['sell'] = ['name']
    rel_attributes['upstream'] = ['name']
    rel_attributes['need'] = ['name']
    rel_attributes['sell_to'] = ['name']
    rel_attributes['compete_with'] = ['name']
    rel_attributes['hold_stock'] = ['hold_end_count', 'hold_property', 'hold_rate', 'hold_type', 'name']
    rel_attributes['owned'] = ['name']
    rel_attributes['invent'] = ['name']
    rel_attributes['registered'] = ['name']
    rel_attributes['dispute_with'] = ['name']
    rel_attributes['invest'] = ['name']
    rel_attributes['account_by'] = ['name']
    rel_attributes['branch_of'] = ['name']