var scroll=function(content,box,scrollbar){
        var bigHeight = content.height();
        var smallHeight = box.height();
        var rate = smallHeight/bigHeight;
        var h = Math.floor(rate*smallHeight);
        scrollbar.height(h);
        var offset = box.offset()
        var offsetT = offset.top+1;
        if(bigHeight<=smallHeight){
        	scrollbar.hide();
        	content.css('width','100%');
        }else{
        	scrollbar.show();
        	// content.css('width','100%');
        }
        scrollbar.mousedown(function(e){
          var divOffsetT = scrollbar.offset().top;
          var tempT = e.pageY-divOffsetT;
          function move(e){
            var newH = e.pageY-tempT-offsetT;
            if(newH<0){
              newH=0;
            }else if(newH>(smallHeight-h)){
              newH=smallHeight-h;
            }
            var rate2 = (newH+h)/smallHeight;
            var contentH = Math.floor(bigHeight*rate2-smallHeight);
            content.css("top",-contentH+"px");
            scrollbar.css("top",newH+"px");
          }
          box.on("mousemove",move);
          $(window).mouseup(function(){
            box.off("mousemove",move);
          });
        });
}
      