$(function(){
    var editArray=[];
    var liArray=[];
    var saveArray=[];
    var res=[]; 
    //保存事件弹窗
    var screen_width=$(window).width();
    var screen_height=$(window).height();
    var result=[];
    
    //var labels=[],relationships=[];
    //点击标题实现收缩展开功能
    /*setTimeout(function(){
        $.ajax({
            url:'/show_label/',
            type:'get',
            success:function(rel){
             // console.log(rel.labels);
              var labels=rel.labels;   
              $('#entities li').remove();
              for(var i=0;i<labels.length;i++){
                  var liObj="<li class='entity' id="+labels[i]+"><div>"+labelChinese[labels[i]]+"</div></li>";
                  $('#entities').append(liObj);
                  $('#entities li').draggable({
                    appendTo:"body",
                    helper:"clone",
                    opacity:0.7,
                    cursor:"move"});
              }                     
            }
        });   

        $.ajax({
            url:'/show_relationship/',
            type:'get',
            success:function(rel){
                //console.log(rel.relationships);
                var relationships=rel.relationships;
                $('#relations li').remove();
                for(var i=0;i<relationships.length;i++){            
                      var liObj="<li class='relation' id="+relationships[i]+">"+relChinese[relationships[i]]+"<div class='relation-line'></div></li>";
                      $('#relations').append(liObj);
                      $('#relations li').draggable({
                        appendTo:"body",
                        helper:"clone",
                        opacity:0.7,
                        cursor:"move"});
                }
            }             
        });
    },500);*/
 
    /*$('.relation-type').on('click',function (){
        var item=$(this).next();
        if(item.hasClass('set-height')){
            item.removeClass('set-height');
        }else {   
            item.addClass('set-height');
        }             
    })*/
    //点击左侧导航节点选中
    /*$('.items li').on('click',function(){
        $(this).addClass('choose').siblings().removeClass('choose');
    });*/
    //拖动事件构建事件模式
    $('.items>li').draggable({
        appendTo:"body",
        helper:"clone",
        opacity:0.7,
        cursor:"move"});
    $( ".droppable" ).droppable({
      drop: function( event, ui ) {
        //var dropLeft=ui.draggable.offset().left;
        //var dropTop=ui.draggable.offset().top;
        var dropLeft=event.pageX-$('.side-list').width()-60;
        var dropTop=event.pageY-120;
        //console.log(event.pageY+'uu'+dropLeft+'-----'+dropTop); 
        //ui.draggable.appendTo(this);
        if(ui.draggable.parent().hasClass('items')){
            if (!ui.draggable.hasClass("relation")) {                
                $( "<li class='entity' name=" + ui.draggable.attr('id') + " style='position:absolute; left:" + dropLeft + "px;top:" + dropTop + "px;'><div>"
                  +ui.draggable.text()+"</div></li>" ).appendTo( this );           
            }else{
              $( "<li class='relation' name="+ui.draggable.attr('id') + " style='position:absolute; left:" + dropLeft + "px;top:" + dropTop + "px;'>"
                +ui.draggable.text()+"<div class='relation-line'></div></li>").appendTo( this );
            }
        }   
        $( ".droppable li" ).draggable({containment: "parent" });
      }
    });
    //事件模式点击改变箭头方向 选中与否
    $(".droppable").on('click','li',function(){
        if(!$(this).hasClass('selected')){
            $(this).addClass('selected');
            $(this).siblings().removeClass('selected');
        }else 
            $(this).removeClass('selected');
    });
    //删除事件模式节点
    $(".cancel").click(function(){
       $(".droppable .selected").remove();
    });
    $(".toright").click(function(){
        if(!$('.selected').hasClass('entity')){
            $('.selected').find('div').removeClass().addClass('relation-line')
        }
   });
    $(".toleft").click(function(){
        if(!$('.selected').hasClass('entity')){
            $('.selected').find('div').removeClass().addClass('relation-line-left');
        }
   });
    $(".toup").click(function(){
        if(!$('.selected').hasClass('entity')){
            $('.selected').find('div').removeClass().addClass('relation-line-up')
        }
   });
    $(".todown").click(function(){
        if(!$('.selected').hasClass('entity')){
            $('.selected').find('div').removeClass().addClass('relation-line-down')
        }
    });   
    $('.save').click(function(){
        modalshow($('#mymodal-save'))
    })
    $('.save-cancel').click(function(){
        modalHide($('#mymodal-save'));
    })
    function modalshow(obj){
        $('body').css('overflow','hidden');
        $('#layer').css('display','block');
        obj.css({'display':'block',
            'left':(screen_width-370)/2+'px',
            'top':(screen_height-300)/2+'px'})
    }
    function modalHide(obj){
        $('body').css('overflow','auto');
        $('#layer').hide();
        obj.hide();
    }
    //复合事件结果集表格看详情
    $('.mix-show').on('click',function(){
        console.log('hi')
        $('.toolbox').hide();
        $('.mix-event-all').show();
    });
    $('.mix-hide').on('click',function(){
        $('.toolbox').show();
        $('.mix-event-all').hide();
    });
    $('.mix-event').on('click','li',function(){      
        var user_name=$('.user-box span').text();
        var model_name=$(this).text();
        $(this).addClass('choosed').siblings().removeClass('choosed');
        //console.log(model_name)
        if(model_name!=''){
            $.ajax({
              url:"/query_savedresult/",
              type:'post',
              data:{userName:user_name,modelName:model_name},
              beforeSend:beforeSend($('.result-list')),
              success:function(rel){
                $('.result-list').find('.img-box').remove();
                res=rel.res;
                result=createResArray(rel.res);
                links=[];
                //getLinks(result,null);
                createPic(result);
                createRelList(result);
              },
              dataType:'json'
            })        
        }
    })
    //窗口改变大小，右侧容器自适应
    autoHeight()
    $(window).resize(function(){
        //console.log($(window).height());
        autoHeight()
        scroll($('.result-list ul'),$('.result-list'),$('#scrollbar2')); 
    });
    function autoHeight(){
         $('.main-right').css('height',($(window).height()-60)+'px');
        $(".tb2").css({"height":$('.main-right').height()-$('.tb1').height()});
        $('.result-list').css('height',($('.tb2').height()-35)+'px');
        $('.search-result').css('height',($('.tb2').height()-35)+'px');
    }
    //保存事件模式
    $('.save-btn').on('click',function(){
        var user_name=$('.user-box span').text();
        var model_name=$('#mix-event-name').val();
        var model_remark=$('#mix-event-remark').val();
        var model_array=JSON.stringify(createModalArray());
        var limit=parseInt($('.dropdown-toggle').text());;
        if(model_name!=''){
            $.ajax({
              url:"/saveModel/",
              type:'post',
              data:{userName:user_name,modelName:model_name,modeldescription:model_remark,modelArray:model_array,limit:limit},
              success:function(res){            
                if(res.res.indexOf('repeated')>=0){
                  //console.log(res.res)
                  var pObj="<p class='tips'>"+res.res+"</p>";
                  $('.mymodal-body').append(pObj)
                }else{
                  var li_obj="<li>"+model_name+"</li>";
                  $('.mix-event').append(li_obj);
                  var index=$('.mix-event-table tbody').children().length+1;
                  var tr_obj="<tr><td>"+index+"</td><td><span class='tabel-modelname'>"+model_name+"</span></td><td><span>"+model_remark+"</span></td><td><a href='javascript:void(0)' class='publish-btn'>发布</a></td></tr>"
                 
                  $('.mix-event-table tbody').append(tr_obj)
                  //console.log(res.res);
                  modalHide($('#mymodal-save'));
                }                
              },
              dataType:'json'
            })      
        }
   });
    //发布事件模式
    $('.publish-btn').on('click',function(){
        var content=$(this).parent().parent().find('.tabel-modelname').text();
        $('#mymodal-publish .mymodal-header').text(content);
        modalshow($('#mymodal-publish'));
    });
    $('.publish-cancel').click(function(){
        modalHide($('#mymodal-publish'));
    });
    $('.publishto').click(function(){
        modalHide($('#mymodal-publish'));
    });
    //拖动边线改变区域大小
    function dragBorder(){
        var _height1=$(".tb1").height();
        var _height2=$(".tb2").height();
        //console.log(_height);
        var move=false;//移动标记    
        var _x,_y;//鼠标离控件左上角的相对位置    
        $(".tb2 .toolbars").mousedown(function(e){    
            move=true;
            _y=e.pageY ;
               //console.log(_y);
            //_y=e.pageY-parseInt($(".search-result").css("top"));         
        });    
        $(document).mousemove(function(e){    
            //console.log(move);
            if(move){    
                if(e.pageY>=98 && e.pageY<=464){
                    var y=e.pageY-_y;   
                    //console.log(e.pageY+':::::'+y);
                    if(y<0){
                        height2=_height2+Math.abs(y);
                        height1=Math.max(_height1-Math.abs(y),34);
                        //console.log(y+'::::'+_height2);
                        //console.log(y+'::::'+height2);
                    } 
                else if(y>=0){
                    height2=Math.max(_height2-Math.abs(y),34);
                    height1=Math.min(_height1+Math.abs(y),560);
                    //console.log(y+'::::'+height1);
                }
                //console.log(_height2);
                $(".tb2").css({"height":height2+'px'}); 
                $(".tb1").css({"height":height1+'px'});  
                $('.search-result').css('height',Math.min(($('.tb2').height()-33),($(window).height()-193))+'px');
                $('.result-list').css('height',Math.min(($('.tb2').height()-33),($(window).height()-193))+'px');
              }
            }    
        }).mouseup(function(){    
            move=false;   
            _height1=$(".tb1").height();
            _height2=$(".tb2").height();
      });
    }
    dragBorder();

    /*//company_name,person_name,product_name等对照中文;
    function  toChinese(obj){
        var chinese=""
        if(obj.company_name){
            chinese=obj.company_name;
        }else if(obj.person_name){
            chinese=obj.person_name;
        }else if(obj.product_name){
            chinese=obj.product_name;
        }else{
            chinese="暂无名称";
        }
        return chinese;
    } */
    //创建时间模式所发送的数组
    function createModalArray(){
        if(editArray.length!=0){
            $.extend(true,saveArray,editArray);
        }
        var modalArray=[];
        var relationArray=createLiArray($('.droppable li.relation'));
        var entityArray=createLiArray($('.droppable li.entity'));
        //为相同类型实体编号
        typeNum(relationArray);
        typeNum(entityArray);
          //console.log(relationArray);
        for(var i=0;i<relationArray.length;i++){
            var modal=getSourcTarget(relationArray[i],entityArray);
            for(var k=0;k<modal.length;k++){
                var liname=modal[k];
                modal[k]=[];
                modal[k][0]=liname;
                modal[k][1]={};
            }

            for(var j=0;j<saveArray.length;j++ ){
                var thisArray=saveArray[j];
                if(modal[0][0]==thisArray[0]){
                    modal[0]=thisArray;
                } else if(modal[1][0]==thisArray[0]){
                    modal[1]=thisArray;
                } else if(modal[2][0]==thisArray[0]){
                    modal[2]=thisArray;
                }
            }
            modalArray.push(modal);
        }
        return modalArray;
    }
    /*var result=[[["万科A有限公司","并购","平安银行有限公司"],["平安银行有限公司","并购","金额大幅度有限公司"]],
             [["万科B有限公司","经营","招商银行有限公司"],["招商银行有限公司","上游","水利方有限公司"]]];*/
    
    //事件模式查询向后台发送数据
    function running(){
        var modalArray=createModalArray();
        //console.log(modalArray)
        var limit=parseInt($('.toolbars .dropdown-toggle').text());;
        var new_dic={}
        new_dic.data=JSON.stringify(modalArray);
        new_dic.limit=limit;
        //console.log(new_dic);
        //向后端传递搜索数组
        $.ajax({
            url:'/query_by_requirement/',
            type:'get',
            data:new_dic,
            beforeSend:beforeSend($('.result-list')),
            success:function(rel){
                $('.result-list').find('.img-box').remove();
                if(rel.res == []){
                    showDialog('没有该事件模式的数据！请重新构造事件模式。')
                }
                res=rel.res;
                result=createResArray(rel.res);
                links=[]; 
                createPic(result);
                createRelList(result);     
            }
        });
      //createRelList(result);
    }
    function createLiArray(obj){
        var liArray=[];
        //构建对象数组 一维
        obj.each(function(){
            var liLeft=$(this).offset().left,
            liTop=$(this).offset().top,
            liName=$(this).attr('name');
        var liOne={};   
        liOne.name=liName;
        liOne.left=liLeft;
        liOne.top=liTop;
        if($(this).children().hasClass('relation-line-left')){
            liOne.orient='toleft';
        }else if($(this).children().hasClass('relation-line-up')){
            liOne.orient='toup';
        }else if($(this).children().hasClass('relation-line-down')){
            liOne.orient='todown';
        }else{ liOne.orient='toright'; }
         // console.log(liOne.name);
          liArray.push(liOne);
        });
        //排序
        //liArray.sort(sortLiArray('left','top'));
        // console.log(liArray);
        //构建数组二维;
        /*var liArray2=[];
        liArray2.push([]);
        liArray2[0].push(liArray[0]);
        var item=liArray2[0][0];
        var k=0;
        for(var i=1;i<liArray.length;i++){
            if(Math.abs(liArray[i].top-item.top)<32){
                liArray2[k].push(liArray[i]);
            }else{
                k++;
                liArray2.push([]);
                liArray2[k].push(liArray[i]);
                item=liArray2[k][0];
            }
        }*/
        //console.log(liArray);
        return liArray;
    }
    function typeNum(thisArray){
        //console.log(thisArray)
        var thisType=[];
        thisType.push(thisArray[0].name);
        for(var i=0;i<thisArray.length;i++){
            var thisName=thisArray[i].name;
            if($.inArray(thisName,thisType)<0){
                thisType.push(thisName);
            }
        }
        for(var k=0;k<thisType.length;k++){
            var index=1;
            for(var j=0;j<thisArray.length;j++){
                if(thisArray[j].name==thisType[k]){
                thisArray[j].name=thisArray[j].name+index;
                index++;
              }
            } 
        }  
    }
    function getSourcTarget(obj,entArray){
        var modalOne=['','',''];
        //console.log(obj);
        modalOne[1]=obj.name
        if(obj.orient=="toright"){
            for(var i=0;i<entArray.length;i++){
                if((obj.left-93)<entArray[i].left && entArray[i].left<(obj.left-31) && Math.abs(entArray[i].top-obj.top)<21){
                    modalOne[0]=entArray[i].name;
                }
                else if((obj.left+31)<entArray[i].left && entArray[i].left<(obj.left+155) && Math.abs(entArray[i].top-obj.top)<21){
                    modalOne[2]=entArray[i].name;
                }
            }   
        }
        if(obj.orient=="toleft"){
            for(var i=0;i<entArray.length;i++){
                if((obj.left-93)<entArray[i].left && entArray[i].left<(obj.left-31) && Math.abs(entArray[i].top-obj.top)<21){
                    modalOne[2]=entArray[i].name;
                }
                else if((obj.left+31)<entArray[i].left && entArray[i].left<(obj.left+155) && Math.abs(entArray[i].top-obj.top)<21){
                    modalOne[0]=entArray[i].name;
                }
            }
        }
       if(obj.orient=="todown"){
            for(var i=0;i<entArray.length;i++){
                if((obj.top-63)<entArray[i].top && entArray[i].top<(obj.top-21) && Math.abs(entArray[i].left-obj.left)<31){
                    modalOne[0]=entArray[i].name;
                }
                else if((obj.top+31)<entArray[i].top && entArray[i].top<(obj.top+155) && Math.abs(entArray[i].left-obj.left)<31){
                    modalOne[2]=entArray[i].name;
                }
            }
        }
        if(obj.orient=="toup"){
            for(var i=0;i<entArray.length;i++){
                if((obj.top-63)<entArray[i].top && entArray[i].top<(obj.top-21) && Math.abs(entArray[i].left-obj.left)<31){
                    modalOne[2]=entArray[i].name;
                }
                else if((obj.top+31)<entArray[i].top && entArray[i].top<(obj.top+155) && Math.abs(entArray[i].left-obj.left)<31){
                    modalOne[0]=entArray[i].name;
                }
            }
        }
        //console.log(modalOne);
        return modalOne;
    }
    function createResArray(data){
        var resArray=[];
        for(var i=0;i<data.length;i++){
            resArray[i]=[];
            for(var j=0; j<data[i].length;j++){
                var chnArray=[];
                //var relChn=data[i][j][1].slice(0,-1);
                //console.log(relChn)
                chnArray[0]=data[i][j][0].name;
                chnArray[1]=data[i][j][1].name;
                chnArray[2]=data[i][j][2].name;
                resArray[i].push(chnArray);
            }
        }
        return resArray;
    }
    function createRelList(data){
        $(".result-list ul li").remove();
        var showHeight=$('.tb2').height()-36;
        //$(".result-list").css('height',showHeight);
        for(var i=0;i<data.length;i++){
            var liObj="<li></li>";
            var textObj='';
            var itemLen=data[i].length;
            for(var j=0; j<itemLen;j++){
              //textObj=data[i][j][0] + '-[' + data[i][j][1] +']->'+'······'+data[i][itemLen-1][2];
              textObj=data[i][j][0] +'···'+data[i][itemLen-1][2];
            }
            $(liObj).appendTo($(".result-list ul")).text(textObj);
        }
        //调用自定义滚动条
        scroll($('.result-list ul'),$('.result-list'),$('#scrollbar2'));
    }
    /*function sortLiArray(liLeft,liTop){
        return function(obj1,obj2){
        var left1=obj1[liLeft],
            left2=obj2[liLeft],
            top1=obj1[liTop],
            top2=obj2[liTop];
        if(Math.abs(top1-top2)>32){
            if(top1<top2){ return -1;}
            else { return 1;}
        }else{
            if(left1<left2)
            {return -1;}
            else if(left1>left2){
            return 1;
          }
          else{
            return 0;
          }
        }   
      };
    }*/

    $('.running').click(function(){
        running();
        editArray=[];
        liArray=[];     
    });
    //点击列表每一条结果，对应显示相应的图谱；
    $('.result-list ul').on('click','li',function(){
        var index=$(this).index();
        //console.log(result[index]);
        $(this).addClass('choosed').siblings().removeClass('choosed');
        for(var i = 0; i < result.length; i++){
            var item = result[i];
            var lastEle = item[item.length-1];
            if(typeof(lastEle) == 'string'){
                item.pop();
            }
        }
        result[index].push('#08b2f7');
        //getLinks(result,index);
        createPic(result);
        getResult(res[index]);
        $('.show-prop').hide();
    })

    //点击实体名称显示属性进行编辑
    $('.edit').click(function(){
        $('.property-box ul').css('top','0px')
        var selIndex=$('.selected').index();
        if(liArray==''){
            liArray=createLiArray($('.droppable li'));  
            typeNum(liArray);
        } 
        $(this).attr('name',liArray[selIndex].name);
        $('.property-box ul li').remove();
        var searchStr='';
        var type='';
        if($('.selected').hasClass('entity')){     
            searchStr=toEnglish($('.selected').text(),'entity');
            type='entity';
        }else{
            searchStr=toEnglish($('.selected').text(),'relationship');
            type='re1ationship';
            //console.log($('.selected').text());
        }
        if($('.selected')){     
            $.ajax({
              url:'/show_propterty/',
              type:'get',
              data:{searchStr:searchStr,type:type},
              dataType:'json',
              success:function(rel){   
                //console.log(rel);    
                propterty=rel.propterties;    
                for(var i=0;i<propterty.length;i++){
                    var liObj='';
                    if(propterty[i]=='person_age'){
                        liObj='<li class='+propterty[i]+'>'+propChinese[propterty[i]] +'：<input type="text" class="inp1">—<input type="text"class="inp2"></li>';
                    }else{
                        liObj='<li class='+propterty[i]+'>'+propChinese[propterty[i]] +'：<input type="text"></li>';            
                    }
                    $('.property-box ul').append(liObj);
                }        
                scroll($('.property-box ul'),$('.property-box'),$('#scrollbar1'));                 
              }
            })
        }
    })
    //点击保存获取编辑信息
    $('.save-edit').click(function(){
        var thisObj=[];
        var thisName=$('.edit').attr('name');
        var editContent=getEditContent();
        thisObj.push(thisName);
        thisObj.push(editContent);
        editArray.push(thisObj);
        $('.property-box ul li').remove()
    });
    function getEditContent(){
        var result={};
        $('.property-box ul li').each(function(){
            if($(this).find('input').val()!=''){
                if($(this).find('input').length>1){
                    result[$(this).attr('class')]=[$(this).find('.inp1').val(),$(this).find('.inp2').val()];
                }else{
                    result[$(this).attr('class')]=$(this).find('input').val();
                }          
            }
            //result.push('{' + $(this).attr('class') + ':' + $(this).find('input').val()+'}');        
        })
        return result;
    }   
    // 搜索框，下来菜单显示现在搜索结果的个数
    $('.dropdown-toggle').click( function() {
        $('.dropdown-menu').toggle();
    })
    $('.dropdown-menu li').on('click', function() {
        $('.dropdown-toggle').text($(this).text());
        $('.dropdown-toggle').append(' <span class="caret"></span>')
    })
    //图谱上搜索功能
    $('.search-box-btn').click(function () {
        var keywords = $('.search-box-inp').val();
        var searchLinks = searchPic(keywords, result);
        links = [];  //清空全局变量links
        createPic(searchLinks);
    })
    $('.search-box-inp').keyup(function (e) {
        if (e.keyCode == 13) {
            var keywords = $('.search-box-inp').val();
            var searchLinks = searchPic(keywords, result);
            links = [];
            createPic(searchLinks);
        }
    })
});
