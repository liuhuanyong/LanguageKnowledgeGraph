var width = $(window).width()-$('.left').width()-60,
	height = $(window).height();
/*var linksData = [
  {source: "同花顺", target: "IFIND", type: "resolved", rela:"主营产品"},
  {source: "同花顺", target: "手机金融信息服务", type: "resolved", rela:"主营产品"},
  {source: "同花顺", target: "互联网金融信息服务", type: "resolved", rela:"主营产品"},
  {source: "同花顺", target: "网上行情交易系统", type: "resolved", rela:"主营产品"},
  {source: "同花顺", target: "金融资讯及数据服务", type: "resolved", rela:"主营产品"},
  {source: "同花顺", target: "互联网金融", type: "resolved",rela:"主营产品"},
  {source: "同花顺", target: "金融服务", type: "resolved",rela:"主营产品"},
  {source: "手机金融信息服务", target: "金融信息服务", type: "resolved", rela:"上位产品"},
  {source: "互联网金融信息服务", target: "金融信息服务", type: "resolved", rela:"上位产品"},
  {source: "二三四五002195", target: "金融信息服务", type: "resolved", rela:"主营产品"},
  {source: "大智慧601519", target: "金融信息服务", type: "resolved", rela:"主营产品"},
  {source: "大智慧601519", target: "互联网金融信息服务", type: "resolved", rela:"主营产品"},
  {source: "金融服务", target: "移动互联网", type: "resolved", rela:"上游"},
  {source: "金融服务", target: "互联网金融服务", type: "resolved", rela:"下位产品"},
  {source: "金融服务", target: "综合金融服务", type: "resolved", rela:"下位产品"}
];*/
var nodeName="";//记录所点击的公司名；
var nodeId='';
var relId='';
var result=[];//记录返回的关系和节点。
var propContent={};//记录节点的所有属性值
var relationName='';
//处理传递updatePic函数的参数
var passData=[];  //传递updatePic函数的参数
//var relProperty=[];//记录边的所有属性值

function updatePic(links){
	$('.picture-box').find('svg').remove();
	var force = d3.layout.force()//layout将json格式转化为力学图可用的格式
		.size([width, height])//作用域的大小
		.linkDistance(180)//连接线长度
		.charge(-800)//顶点的电荷数。该参数决定是排斥还是吸引，数值越小越互相排斥
		.on("tick", tick);//指时间间隔，隔一段时间刷新一次画面
	var svg = d3.select(".picture-box").append("svg")
		.attr("width", width)
		.attr("height", height);

	var edges_line = svg.selectAll(".edgepath"),
		marker=svg.append("marker"),
		edges_text = svg.append("g").selectAll(".edgelabel");
	var nodes = {};
	var links_ = [];
	var nodes_ =[];
	$.extend(true,links_,links);   //深度拷贝，不改变原来数组对象属性
	var flag = false;
	for( var i = 0; i <links_.length; i++){
		if(links_[i].sx){
			flag = true;
			break;
		}
	}
	if (flag) {
		links_.forEach(function(link,index) {
			//link.target = nodes[link.target] || (nodes[link.target] = {name: link.target, x:link.tx, y:link.ty});
			//link.source = nodes[link.source] || (nodes[link.source] = {name: link.source, x:link.sx, y:link.sy, fixed:true});
			
			if(link.sx) {
				//关系边已经被绘制过
				link.source = nodes[link.source] || (nodes[link.source] = {name: link.source, x:link.sx, y:link.sy, fixed:true});
				link.target = nodes[link.target] || (nodes[link.target] = {name: link.target, x:link.tx, y:link.ty});
			}else {
				//关系边未被绘制过
				for( var i = 0; i < index; i++) {
					if (link.source == links_[i].target.name) {
						//关系边的源节点已被当作目标节点绘制
						link.source = nodes[link.source] || (nodes[link.source] = {name: link.source, x:links_[i].tx, y:links_[i].ty, fixed:true});
						link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
						break;
					}else if(link.source == links_[i].source.name){
						link.source = nodes[link.source] || (nodes[link.source] = {name: link.source.name, fixed:true});
						link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
						break;
					}					
				}				
			}    
		});
	}else {
		links_.forEach(function(link) {                     
			link.source = nodes[link.source] || (nodes[link.source] = {name: link.source, x:width/2, y:height/2, fixed:true});  
			link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});          
		});
	}
	
	nodes_ = d3.values(nodes);
	//console.log(nodes_)
	/*nodes_[0].x = width/2;
	nodes_[0].y = height/2;*/
	/*var nodesXY = randomXY(nodes_.length-1,150,width/2,height/2);
	for(var l = 0; l < nodesXY.length; l++){
	  nodes_[l+1].x = nodesXY[l].x;
	  nodes_[l+1].y = nodesXY[l].y;
	}*/
	//console.log(nodes_);
	force.nodes(nodes_)//设定节点数组
		  .links(links_)//设定连线数组
		  .start();//开始转换
	var drag=force.drag()
	  .on('dragstart', dragstart);
	//箭头

	//.attr("id", function(d) { return d; })
	//marker.exit().remove();
	marker.attr("id", "resolved")
	//.attr("markerUnits","strokeWidth")//设置为strokeWidth箭头会随着线的粗细发生变化
	.attr("markerUnits","userSpaceOnUse")
	.attr("viewBox", "0 -5 10 10")//坐标系的区域
	.attr("refX",32)//箭头坐标
	.attr("refY", -0.5)
	.attr("markerWidth", 12)//标识的大小
	.attr("markerHeight", 12)
	.attr("orient", "auto")//绘制方向，可设定为：auto（自动确认方向）和 角度值
	.attr("stroke-width",2)//箭头宽度
	.append("path")
	.attr("d", "M0,-5L10,0L0,5")//箭头的路径
	.attr('fill','#87919b');//箭头颜色
  
	//设置连接线   
	edges_line=edges_line.data(force.links());
	edges_line.exit().remove();
  
	edges_line.enter()
			.append("path")
			.attr({
				  'd': function(d) {
						//console.log(d);
						return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y
					},
				  'class':'edgepath',             
				  'id':function(d,i) {return 'edgepath'+i;}})
			.style("stroke",function(d){                
				 return d.lineColor;
			 })
			.style("pointer-events", "auto")
			.style("stroke-width",2)//线条粗细
			.attr("marker-end", "url(#resolved)" )   //根据箭头标记的id号标记箭头;
			.on('click',function(d){
				 //单击时让连接线加粗
				edges_line.style("stroke-width",function(line){
					//console.log(line);
					if(line.lid==d.lid){
						return 4;
					}else{
						return 2;
					}
				});
				/*edges_line.style("stroke",function(line){
					//console.log(line);
					if(line.lid==d.lid){
						return "rgb(241, 66, 17)";
					}else{
						return '#87919b';
					}
				});*/
				//d3.select(this).style("stroke","rgb(241, 66, 17)")
				showRelProperty(d);
				relId=d.lid;
			})
			.on('mouseover',function(d){
			  d3.select(this).style("stroke-width",4)
			 // edges_text.attr('fill','rgb(241, 66, 17)')
			 //marker.attr('fill','rgb(241, 66, 17)')
			})
		   .on('mouseout',function(){
			 edges_line.style("stroke-width",2)
			  //d3.select(this).style("stroke",'#87919b')
			  //marker.attr('fill','#87919b')
		   });
	
	edges_text = edges_text.data(force.links());
	edges_text.exit().remove();
	edges_text.enter()
		  .append("text")
		  .style({"pointer-events" : "auto"})
		  //.attr("class","linetext")
		  //.text(function(d){return d.rela})
		  .attr({'class':'edgelabel',
				  'dx':60,
				  'dy':0,
					   //'font-size':10,
				  'fill':function(d) {return d.lineColor;}
				 })
		  .on('click',function(d){
			  showRelProperty(d)
			});

	//设置线条上的文字
	edges_text.append('textPath')
		  .attr('xlink:href',function(d,i) {return '#edgepath'+i})
		  .style("pointer-events", "none")
		  .text(function(d){return d.rela;});

	//圆圈
	//circle.exit().remove();
	var  circle=svg.append('g').selectAll('circle');
	var  text = svg.append("g").selectAll("text");
  
	circle=circle.data(force.nodes());//表示使用force.nodes数据
	circle.exit().remove();
	circle.enter().append("circle")      
		.style("fill","#f39800")        
		.attr("r", 28)//设置圆圈半径
		.on("click",function(node){
			circle.style('stroke','#f39800')
		   // circle.style('fill','#f39800')
		   // d3.select(this).style('fill','#f50')
			d3.select(this).style('stroke','#999')
			d3.select(this).style('stroke-width',2)
			var editNodeId='';
			for(var i=0; i<links.length; i++){
			   var link=links[i];
			   
				if(link.source==node.name){
				   editNodeId=link.sid;
				   nodeId=link.sid;
				   nodeName=link.source;                   
				}
				else if(link.target==node.name){
				   editNodeId=link.tid;
				   nodeId=link.tid;
				   nodeName=link.target;                  
				}
			}
			showPropertyByName(editNodeId);
		})
		.on("dblclick", dblclick)
		.call(drag);//将当前选中的元素传到drag函数中，使顶点可以被拖动

	text=text.data(force.nodes());
	text.exit().remove();
	  //返回缺失元素的占位对象（placeholder），指向绑定的数据中比选定元素集多出的一部分元素。
	text.enter()
		.append("text")
		.attr("dy", ".35em")  
		.attr("text-anchor", "middle")//在圆圈中加上数据  

		.style('fill',"#535353")
		.attr('x',function(d){
			// console.log(d.name+"---"+ d.name.length);
			var re_en = /[a-zA-Z]+/g;
			//如果是全英文，不换行
			if(d.name.match(re_en)){
				d3.select(this).append('tspan')
				.attr('x',0)
				.attr('y',2)
				.text(function(){return d.name;});
			}
			//如果小于四个字符，不换行
			else if(d.name.length<=4){
				d3.select(this).append('tspan')
				.attr('x',0)
				.attr('y',2)
				.text(function(){return d.name;});
			}else{
				var top=d.name.substring(0,4);
				var bot=d.name.substring(4,d.name.length);

				d3.select(this).text(function(){return '';});

				d3.select(this).append('tspan')
				  .attr('x',0)
				  .attr('y',-7)
				  .text(function(){return top;});

				d3.select(this).append('tspan')
				  .attr('x',0)
				  .attr('y',10)
				  .text(function(){return bot;});
			}
		  //直接显示文字    
		  /*.text(function(d) { 
		  return d.name; */
		});
	function tick() {
		//path.attr("d", linkArc);//连接线
		circle.attr("transform", transform1);//圆圈
		text.attr("transform", transform2);//顶点文字
		//edges_text.attr("transform", transform3);
		//text2.attr("d", linkArc);//连接线文字
		//console.log("text2...................");
		//console.log(text2);
		//edges_line.attr("x1",function(d){ return d.source.x; });
		//edges_line.attr("y1",function(d){ return d.source.y; });
		//edges_line.attr("x2",function(d){ return d.target.x; });
		//edges_line.attr("y2",function(d){ return d.target.y; });

		//edges_line.attr("x",function(d){ return (d.source.x + d.target.x) / 2 ; });
		//edges_line.attr("y",function(d){ return (d.source.y + d.target.y) / 2 ; });
		 /*circle.attr("cx", function(d) { return limitRectX(d.x); })
			  .attr("cy", function(d) { return limitRectY(d.y); });*/
		edges_line.attr('d', function(d) {
			var path='M '+limitRectX(d.source.x,width)+' '+limitRectY(d.source.y,height)+' L '+ limitRectX(d.target.x,width) +' '+limitRectY(d.target.y,height);
			return path;
		});
		edges_text.attr('transform',function(d,i){
			if (d.target.x<d.source.x){
				if($(this).css('display')=='inline'){ 
					rx = $(this).attr('x')+$(this).width()/2;
					ry = $(this).attr('y')+$(this).height()/2;
				}
				else{
					bbox = this.getBBox();
					rx = bbox.x+bbox.width/2;
					ry = bbox.y+bbox.height/2;
				}
				return 'rotate(180 '+rx+' '+ry+')';
			}
			else {
				return 'rotate(0)';
			}
		});
	}
	function dblclick(d) {
	  d3.select(this).classed("fixed", d.fixed = false);
	}

	function dragstart(d) {
	  d3.select(this).classed("fixed", d.fixed = true);
	}
}

//设置连接线的坐标,使用椭圆弧路径段双向编码
function linkArc(d) {
	//var dx = d.target.x - d.source.x,
	// dy = d.target.y - d.source.y,
	// dr = Math.sqrt(dx * dx + dy * dy);
	//return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
	//打点path格式是：Msource.x,source.yArr00,1target.x,target.y  
  
	return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y
}
//设置圆圈和文字的坐标
function transform1(d) {
	for(var i=0; i<passData.length; i++){
		if (d.name == passData[i].source) {
			passData[i].sx = d.x;
			passData[i].sy = d.y;
		}else if (d.name == passData[i].target) {
			passData[i].tx = d.x;
			passData[i].ty = d.y;
		}
	}
	return "translate(" + limitRectX(d.x,width) + "," + limitRectY(d.y,height) + ")";
}
function transform2(d) {
	return "translate(" + limitRectX(d.x,width) + "," + limitRectY(d.y,height) + ")";
}

function createNodesPic(nodesdata){
	$('.picture-box').find('svg').remove();
	var force = d3.layout.force()   //layout将json格式转化为力学图可用的格式
		.size([width, height])          //作用域的大小
		.linkDistance(180)              //连接线长度
		.charge(-1500)               //顶点的电荷数。该参数决定是排斥还是吸引，数值越小越互相排斥
		.on("tick", tick);          //指时间间隔，隔一段时间刷新一次画面
	var svg = d3.select(".picture-box").append("svg")
		.attr("width", width)
		.attr("height", height);
	var circle=svg.append('g').selectAll('circle');
	var text = svg.append("g").selectAll("text"),
		edges_line = svg.selectAll(".edgepath"),
		marker=svg.append("marker"),
		edges_text = svg.append("g").selectAll(".edgelabel");
	//var circle=svg.append('g').selectAll('circle');
	//$('.picture-box').find('svg').children().remove()
	force.nodes(d3.values(nodesdata))//设定节点数组
		  //.links(links_)//设定连线数组
		  .start();//开始转换
	//console.log(nodes);
	var drag=force.drag()
		.on('dragstart',function(d,i){
			d.fixed=true;
		});
	circle=circle.data(force.nodes());//表示使用force.nodes数据
	circle.exit().remove();
	circle.enter().append("circle")
		.style("fill","#f39800")
		.attr("r", 28)//设置圆圈半径
		.on("click",function(node){
			//circle.style('fill','#f39800')
			circle.style('stroke','#f39800');
			//d3.select(this).style('fill','#f50')
			
			d3.select(this).style('stroke','#999');
			showPropertyByName(node.nid);
			nodeName=node.name;
			nodeId=node.nid;
			d3.select(this).style('stroke-width',2);
		})
		.call(force.drag);//将当前选中的元素传到drag函数中，使顶点可以被拖动

	text=text.data(force.nodes());
	text.exit().remove();
	  //返回缺失元素的占位对象（placeholder），指向绑定的数据中比选定元素集多出的一部分元素。
	text.enter()
		.append("text")
		.attr("dy", ".35em")  
		.attr("text-anchor", "middle")//在圆圈中加上数据  
		.style('fill',"#535353")
		.attr('x',function(d){
			// console.log(d.name+"---"+ d.name.length);
			var re_en = /[a-zA-Z]+/g;
			//如果是全英文，不换行
			if(d.name.match(re_en)){
				d3.select(this).append('tspan')
				.attr('x',0)
				.attr('y',2)
				.text(function(){return d.name;});
			}
			//如果小于四个字符，不换行
			else if(d.name.length<=4){
				d3.select(this).append('tspan')
				.attr('x',0)
				.attr('y',2)
				.text(function(){return d.name;});
			}else{
				var top=d.name.substring(0,4);
				var bot=d.name.substring(4,d.name.length);

				d3.select(this).text(function(){return '';});
				d3.select(this).append('tspan')
				  .attr('x',0)
				  .attr('y',-7)
				  .text(function(){return top;});

				d3.select(this).append('tspan')
				  .attr('x',0)
				  .attr('y',10)
				  .text(function(){return bot;});
			}
		});
	function tick() {
		//path.attr("d", linkArc);//连接线
		circle.attr("transform", transform1);//圆圈
		text.attr("transform", transform2);//顶点文字
	}
}
function searchNode(){
	$('.edit-rel').hide();
	$('.add-rel').hide();
	var keyword=$('.search-box input').val();
	var limit = $('.dropdown-toggle').attr('id');
	if(keyword!=''){
		$.ajax({
		  url:"/get_search_name/",
		  type:"get",
		  data:{key:keyword, limit: limit},
		  dataType:"json",
		  success:function(data){
		  //console.log(data)            
			var nodesdata=[];
			for(var i=0; i<data.res.length; i++){
			  var node={};
			  node.name=data.res[i][0];
			  node.nid=data.res[i][1];
			  nodesdata.push(node);
			}
			//console.log(nodesdata)
			passData=[];
			result=[];
			createNodesPic(nodesdata);
		  }
		});
	}
}

// 搜索框，下来菜单显示现在搜索结果的个数
$('.dropdown-toggle').click( function() {
	$('.dropdown-menu').toggle();
})
$('.dropdown-menu li').on('click', function() {
	$('.dropdown-toggle').text($(this).text());
	$('.dropdown-toggle').attr('id',$(this).children().attr('id'));
	$('.dropdown-toggle').append(' <span class="caret"></span>');
	$('.dropdown-menu').hide();
})
//点击搜索显示节点
$('.search-box .btn-info').click(function(){
	searchNode()
});
$('.search-box input').keyup(function(e){
	if(e.keyCode == 13){
		searchNode();
	}
})
//关系图谱编辑左侧属性展开收缩
/*$('.property-type').on('click','.prop-name',function(){
	var hideBox=$(this).parent().find('.prop-detail') ;
	var hideBox1=$(this).parent().find('textarea');
	if(hideBox.is(":hidden") || hideBox1.is(":hidden")) {
		hideBox.slideDown();
		hideBox1.show();
		$(this).parent().siblings().find('.prop-detail').slideUp();
		$(this).parent().siblings().find('textarea').hide();
		$(this).addClass('hover');
		$(this).parent().siblings().find('.prop-name').removeClass('hover');
	}else{
		hideBox.slideUp();
		hideBox1.hide();
	//$(this).css('background-color','transparent');
	}
})*/
$('.relation-type').on('mouseover','li',function () {
	var color = $(this).css('border-color');
	$(this).css('background-color',color);
}).on('mouseout','li',function () {
	$(this).css('background-color','transparent');
})
//关系图谱编辑左侧关系展开图谱
$('.relation-type').on('click','li',function(){
	$('.edit-rel').hide();
	$('.add-rel').hide();
	var relName=$(this).text();
	var flag=true;
	var color = $(this).css('border-color');	
	relationName=relName;
	//console.log(relName+nodeId);
	for(var j=0; j<passData.length; j++){
		if(passData[j].source == nodeName && passData[j].rela == relName){
			flag=false;
		}
	}
	if(flag){
		$.ajax({
			url:"/get_info_relations/",
			type:"get",
			data:{rel_name:relName,nodeid:nodeId},
			dataType:"json",
			success:function(data){
				//console.log(data.res)
				//result=data.res;
				for (var i=0; i<data.res.length; i++){
					var relObj=data.res[i].rel;
					var rel_id=data.res[i].rel_id;
					result.push({rel_id:rel_id,rel:relObj});
					var target_name=data.res[i].target_name;
					var target_id=data.res[i].target_id;
					//console.log(target_name)
					var link={};
					link.source=nodeName;
					link.target=target_name;
					link.rela=relName;
					link.sid=nodeId;
					link.lid=rel_id;
					link.tid=target_id;
					link.lineColor=color;
					passData.push(link);
				}
				updatePic(passData);
			}
		}); 
	}else {
		$.ajax({
			url:"/get_info_relations/",
			type:"get",
			data:{rel_name:relName,nodeid:nodeId},
			dataType:"json",
			success:function(data){
				var relLength = data.res.length;
				var delIndex = 0;
				for(var k = 0; k < passData.length; k++){
					if(passData[k].source == nodeName && passData[k].rela == relName){
						delIndex = k;
						break;
					}
				} 
				passData.splice(delIndex,relLength)
				updatePic(passData);
			}
		}); 
		
	}
});
//左侧显示属性
function showPropertyByName(nid){
	$('.edit-rel').hide();
	$('.add-rel').hide();
	var propBox=$('.content-box .property-type');
	var relBox=$('.relation-type');
	//console.log(nid);
	//if(nid){
		$.ajax({
			url:"/get_attributes_rel_name/",
			type:"get",
			data:{nodeid:nid},
			dataType:"json",
			beforeSend:beforeSend($('.content-box')),
			success:function(data){
				$('.content-box').find('.img-box').remove();
				var props=data.prop;
				propContent=data.prop;
				var rels=data.rel;
				//console.log(rels)
				propBox.children().remove();
				relBox.children().remove();
				for(var item in props){
					//console.log(item)
					var propLi="<li><p class='prop-name' name="+ item +">"+ propChinese[item] +":</p><div class='prop-detail'>"+ props[item] +"</div></li>";
					propBox.append(propLi);
				}
				for(var i=0; i<rels.length; i++){
					var relLi="<li style='border-color:" + getRelColor(rels[i]) + "'>"+ rels[i] +"</li>";
					relBox.append(relLi);
				} 
			}
		});   
	//}
}

//左侧属性关系展开所有
$('.prop-tip').on('click',function (){
	var item=$(this).next();
	if(item.hasClass('set-height')){
		item.removeClass('set-height');
		$(this).find('span').removeClass('hidden-icon').addClass('show-icon');
	}else {
		item.addClass('set-height');
		$(this).find('span').removeClass('show-icon').addClass('hidden-icon');
	}
  });


