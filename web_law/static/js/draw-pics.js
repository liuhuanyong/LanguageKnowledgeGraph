 //搜索结果显示图谱
 
 //var relData=[['company1','acquire','company2'],['company2','acquire','company3'],['company3','acquire','company4']];
 //createPic();
 var resPic = [];
 var links = [];
function createPic(relData){
	$('.search-result').find('svg').remove();
	var width = $('.search-result').width(), height = $('.search-result').height();
	//var links =[];
	//先把边的颜色都设置为默认色
	for(var i = 0; i < links.length; i++){
		var link = links[i];
		link.lineColor = '#87919b';
	}
	// 发散
	for(var i = 0; i < relData.length; i++){
		var item = relData[i];
		var lastEle = item[item.length-1];
		if (typeof(lastEle) != 'string') {          
			for(var j = 0; j < item.length; j++){     
				if (inLinksIsExits(links, item[j][0], item[j][2])) {
					var linkItem={} ;
					linkItem.source=item[j][0];
					linkItem.target=item[j][2];
					linkItem.rela=item[j][1];      
					linkItem.lineColor = '#87919b';
					links.push(linkItem)
				}
			}            
		}else {
			for(var k = 0; k < item.length-1; k++){  
				for(var n = 0; n < links.length; n++){
					if (item[k][0] == links[n].source && item[k][2] == links[n].target) {
						links[n].lineColor = lastEle;
					}
				}
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
	}
	//links去重,判断links有没有相同的source和target
	function inLinksIsExits(list,source,target) {
		var flag = true;
		for(var i = 0; i < list.length; i++) {
			if (list[i].source == source && list[i].target == target) {
				flag = false;
			}
		}
		return flag;
	}
		console.log(links)
		//单线
	 /* for(var i=0;i<relData.length;i++){
			var item=relData[i];
			var linkItem={} ;   
			linkItem.source=relData[i][0];
			linkItem.target=relData[i][2];
			linkItem.rela=relData[i][1];
			links.push(linkItem)
		}*/
		//console.log(links);
	/*var links = [
		{source: "同花顺", target: "IFIND", type: "resolved", rela:"收购"},
		{source: "同花顺", target: "手机金融", type: "resolved", rela:"并购"},
		{source: "手机金融", target: "互联网金融", type: "resolved", rela:"持有"},
		{source: "互联网金融", target: "网上行情交易系统", type: "resolved", rela:"设立"},
		{source: "网上行情交易系统", target: "金融资讯及数据服务", type: "resolved", rela:"担任"},
		{source: "IFIND", target: "互联网金融", type: "resolved",rela:"转让"},
	];*/

	var nodes = {};
	var force = d3.layout.force()//layout将json格式转化为力学图可用的格式 
	.size([width, height])//作用域的大小
	.linkDistance(150)//连接线长度
	.charge(-1500)//顶点的电荷数。该参数决定是排斥还是吸引，数值越小越互相排斥
	/*.theta(1)
	.charge(-120)
    .gravity(.05)
    .linkStrength(0.5)*/
    //.forceCenter([width/2, height/2])
    //.iterations(2)
	.on("tick", tick);//指时间间隔，隔一段时间刷新一次画面
	var svg = d3.select(".search-result").append("svg")
	.attr("width", '100%')
	.attr("height", '100%');

	//定义缩放函数  
	var zoom = d3.behavior.zoom()  
				.scaleExtent([0.5,10])//用于设置最小和最大的缩放比例  
				.on("zoom",zoomed)  ;
	var g=svg.append('g')//.call(zoom);
	var circle=g.selectAll('circle'),
			text = g.selectAll("text"),
			edges_line = g.selectAll(".edgepath"),
			edges_text = g.selectAll(".edgelabel"),
			marker=g.append("marker");

	function zoomed(){  
		g.attr("transform","translate("+d3.event.translate+")scale("+d3.event.scale+")");      
	} //d3.event.translate 是平移的坐标值，d3.event.scale 是缩放的值。

	update(links);
	//图谱上搜索功能
	/*$('.search-box-btn').click(function () {
		var keywords = $('.search-box-inp').val();
		var searchLinks = searchPic(keywords, links);
		update(searchLinks);
	})*/
	function update(linksData){
		var links_ = [];
		$.extend(true,links_,linksData);
		/*links_.forEach(function(link) {
			link.source = nodes[link.source] || (nodes[link.source] = {name: link.source,});
			link.target = nodes[link.target] || (nodes[link.target] = {name: link.target,});			
		});*/
		links_.forEach(function(link) {			
			//console.log(link);
			link.source = nodes[link.source] || (nodes[link.source] = {name: link.source, x:link.sx, y:link.sy,});
			link.target = nodes[link.target] || (nodes[link.target] = {name: link.target, x:link.tx, y:link.ty,});			
		});
		/*var flag = false;
	    for( var i = 0; i <linksData.length; i++){
	        if(linksData[i].sx){
	            flag = true;
	        }
	    }
	    if(flag) {    	
			linksData.forEach(function(link) {			
				link.source = nodes[link.source] || (nodes[link.source] = {name: link.source.name, x:link.sx, y:link.sy});
				link.target = nodes[link.target] || (nodes[link.target] = {name: link.target.name, x:link.tx, y:link.ty});			
			});
		}else {
			linksData.forEach(function(link) {
				link.source = nodes[link.source] || (nodes[link.source] = {name: link.source,});
				link.target = nodes[link.target] || (nodes[link.target] = {name: link.target,});			
			});
		}*/
		force.nodes(d3.values(nodes))//设定节点数组
					.links(links_)//设定连线数组
					.start();//开始转换
		var drag=force.drag()
			.on('dragstart',function(d,i){				
				d3.event.sourceEvent.stopPropagation();
				d.fixed=true;
			});


		//箭头

		//.attr("id", function(d) { return d; })
		//marker.exit().remove();
		marker.data(force.links())
		marker.attr("id", "resolved")
		//.attr("markerUnits","strokeWidth")//设置为strokeWidth箭头会随着线的粗细发生变化
		.attr("markerUnits","userSpaceOnUse")
		.attr("viewBox", "0 -5 10 10")//坐标系的区域
		.attr("refX",32)//箭头坐标
		.attr("refY", -0.2)
		.attr("markerWidth", 12)//标识的大小
		.attr("markerHeight", 12)
		.attr("orient", "auto")//绘制方向，可设定为：auto（自动确认方向）和 角度值
		.attr("stroke-width",2)//箭头宽度
		.append("path")
		.attr("d", "M0,-5L10,0L0,5")//箭头的路径
		.attr('fill','#87919b');//箭头颜色
		//.attr('fill',function (d) {return d.lineColor;})
	
		/* 将连接线设置为曲线
		var path = svg.append("g").selectAll("path")
				.data(force.links())
				.enter().append("path")
				.attr("class", function(d) { return "link " + d.type; })
				.style("stroke",function(d){
						//console.log(d);
					 return "#A254A2";//连接线的颜色
				})
				.attr("marker-end", function(d) { return "url(#" + d.type + ")"; });
		*/

		//设置连接线   
		edges_line=edges_line.data(force.links());
		//edges_line.exit().remove();
		
		edges_line.enter()
			.append("path")
			.attr({
				'd': function(d) {return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y},
				'class':'edgepath',
				//'fill-opacity':0,
				//'stroke-opacity':0,
				//'fill':'blue',
				//'stroke':'red',
				'id':function(d,i) {return 'edgepath'+i;}})
			.style("stroke",function(d){  
				return d.lineColor;
			})
			.style("pointer-events", "auto")
			.style("stroke-width",1)//线条粗细
			.attr("marker-end", "url(#resolved)" )   //根据箭头标记的id号标记箭头;
			.on('click',function(d){
				showProperty(d.rela)
			})          
		
		edges_text = edges_text.data(force.links());
	 	//edges_text.exit().remove();
		edges_text.enter()
			.append("text")
			.style({"pointer-events" : "auto"})
			//.attr("class","linetext")
			//.text(function(d){return d.rela})
			.attr({'class':'edgelabel',                 
					'dx':60,
					'dy':0,
					//'font-size':10,
					'fill':function(d){ 
							return d.lineColor;
					}
			});
				 

		//设置线条上的文字
		edges_text.append('textPath')
			.attr('xlink:href',function(d,i) {return '#edgepath'+i})
			.style("pointer-events", "none")
			//.text('并购');
			.text(function(d){return d.rela;});					
		//圆圈	
		circle=circle.data(force.nodes());//表示使用force.nodes数据
		//circle.exit().remove();
		circle.enter().append("circle")
			/*.style("fill",function(node){
					var color;//圆圈背景色
					var link=links[node.index];
					if(node.name==link.source.name){
							color="#F6E8E9";
					}else{
							color="#F9EBF9";
					}
					return color;
			})*/
			.style("fill","#f39800")
			/*.style('stroke',function(node){ 
					var color;//圆圈线条的颜色
					var link=links[node.index];
					if(node.name==link.source.name){
							color="#B43232";
					}else{
							color="#A254A2";
					}
					return color;
			})*/
			//.style("stroke","#A254A2")
			.attr("r", 28)//设置圆圈半径
			.on("click",function(node){
				//console.log(node);
				//单击时让连接线加粗
				edges_line.style("stroke-width",function(line){
					//console.log(line);
					if(line.source.name==node.name || line.target.name==node.name){
						return 2;
					}else{
						return 1;
					}
				});
				//d3.select(this).style('stroke-width',2);
			})
			.call(drag)//将当前选中的元素传到drag函数中，使顶点可以被拖动
			.on('mouseover', function(d) {
	                if (force.mouseoutTimeout) {
	                    clearTimeout(force.mouseoutTimeout);
	                    force.mouseoutTimeout = null;
	                }
	                highlightObject(d,circle,edges_line,text,edges_text);
	        })
	        .on('mouseout', function() {
	            //if (!selected.obj) {
	                if (force.mouseoutTimeout) {
	                    clearTimeout(force.mouseoutTimeout);
	                    force.mouseoutTimeout = null;
	                }
	                force.mouseoutTimeout = setTimeout(function() {
	                    highlightObject(null,circle,edges_line,text,edges_text);
	                }, 300);
	           // }
	        });
		/*
		 circle.append("text")  
		.attr("dy", ".35em")  
		.attr("text-anchor", "middle")//在圆圈内添加文字  
		.text(function(d) { 
				//console.log(d);
				return d.name; 
		}); */ 

		//圆圈的提示文字
 		/* circle.append("svg:title")  
				.text(function(node) { 
						var link=links[node.index];
						if(node.name==link.source.name && link.rela=="主营产品"){
								return "双击可查看详情"
						}
				 });  */
		/* 矩形
		var rect=svg.append("rect")
				 .attr({"x":100,"y":100,
								"width":100,"height":50,
								"rx":5,//水平圆角
								"ry":10//竖直圆角
						 })
					.style({
						 "stroke":"red",
						 "stroke-width":1,
						 "fill":"yellow"
		});*/
		text=text.data(force.nodes());
		//text.exit().remove();
		//返回缺失元素的占位对象（placeholder），指向绑定的数据中比选定元素集多出的一部分元素。
		text.enter()
			.append("text")
			.attr("dy", ".35em")  
			.attr("text-anchor", "middle")//在圆圈中加上数据  
			/*.style('fill',function(node){
					var color;//文字颜色
					var link=links[node.index];
					if(node.name==link.source.name && link.rela=="并购"){
							color="#B43232";
					}else{
							color="#A254A2";
					}
					return color;
			})*/
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

/*  将文字显示在圆圈的外面 
var text2 = svg.append("g").selectAll("text")
		 .data(force.links())
		//返回缺失元素的占位对象（placeholder），指向绑定的数据中比选定元素集多出的一部分元素。
		.enter()
		.append("text")
		.attr("x", 150)//设置文字坐标
		.attr("y", ".50em")
		.text(function(d) { 
				//console.log(d);
				//return d.name; 
				//return d.rela;
				console.log(d);
				return  '1111';
		});*/
}


function tick() {
	//path.attr("d", linkArc);//连接线
	circle.attr("transform", transform1);//圆圈
	//circle.attr("-moz-transform", transform1);//圆圈
	text.attr("transform", transform2);//顶点文字
	//text.attr("-moz-transform", transform2);//顶点文字
	//edges_text.attr("transform", transform3);
	//text_path.attr("d", linkArc);//连接线文字
	//console.log("text2...................");
	//console.log(text2);
	//edges_line.attr("x1",function(d){ return d.source.x; });
	//edges_line.attr("y1",function(d){ return d.source.y; });
	//edges_line.attr("x2",function(d){ return d.target.x; });
	//edges_line.attr("y2",function(d){ return d.target.y; });
		
	//edges_line.attr("x",function(d){ return (d.source.x + d.target.x) / 2 ; });
	//edges_line.attr("y",function(d){ return (d.source.y + d.target.y) / 2 ; });


	edges_line.attr('d', function(d) { 
			var path='M '+limitRectX(d.source.x,width)+' '+limitRectY(d.source.y,height)+' L '+ limitRectX(d.target.x,width) +' '+limitRectY(d.target.y,height);
			return path;
	});  
		
	edges_text.attr('transform',function(d,i){
				if (d.target.x<d.source.x){
					//console.log(this.getBBox());
					//console.log($(this).css('display'));
						//bbox = this.getBBox();//火狐下会报错，原因是当目标元素的display属性被设置为'none'时，Firefox认为此时无法获取到元素的边界值
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
		for(var i=0; i<links.length; i++){
			if (d.name == links[i].source) { 				
					links[i].sx = d.x;
					links[i].sy = d.y;
			}else if (d.name == links[i].target) {
					links[i].tx = d.x;
					links[i].ty = d.y;
			}
		}
		return "translate(" + limitRectX(d.x,width) + "," + limitRectY(d.y,height) + ")";
	}
	function transform2(d) {
		return "translate(" + limitRectX(d.x,width) + "," + limitRectY(d.y,height) + ")";
	}


 }
 //点击图上节点显示属性内容
function getResult(res){
	resPic=res;
	//console.log(resPic)
}
function showProperty(nodeName){
	$('.show-prop').show();
	for(var i=0;i<resPic.length;i++){   
		if(resPic[i][0].name==nodeName){
			showThis(resPic[i][0])
		}else if(resPic[i][2].name==nodeName){
			showThis(resPic[i][2])
		}else if(resPic[i][1].name==nodeName){
			showThis(resPic[i][1])
		}
	}
}
function showThis(obj){
	$('.show-prop ul li').remove()
	for(var item in obj){
		//if(item!='name'){
			var liObj='<li class='+item+'>'+propChinese[item] +'：'+obj[item]+';</li>';
			$('.show-prop ul').append(liObj);
		//}    
	}
	if($('.show-prop ul').height()>40){
			$('.showall').show();
			$('.showall').text('查看全部'); 
		}else{
			$('.showall').text('');
		}
}
$('.showall').click(function(){
	if($(this).text()=='查看全部'){
		$('.show-prop').height('100%');
		$('.show-prop').css('padding-top','36px'); 
		$(this).text('收起')
	}else{
		$('.show-prop').height(40);
		$('.show-prop').css('padding-top','0'); 
		$(this).text('查看全部');
	}	
})
