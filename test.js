(function(){
	var Grain = {
		canvas: null,
		imgSize: null,
		wrapSize: null,
		ctx: null,
		imgData: [],
		initailData: null,
		initPosData: [],
		init: function(){
			var self = this;
			if(!window.$){
				window.$ = function(selector){
					var firstChar = selector.charAt(0);
					if(firstChar=='#')
						return document.getElementById(selector.substr(1));
					else if(firstChar=='.')
						return document.getElementsByClassName(selector.substr(1));
					return false;
				}
			}
			window.onload=function(){
				var img = new Image();
				var wrap = $('.canvasWrap')[0];
				img.src = 'pic.jpg';
				self.canvas = $('#canvas');
				self.wrapSize={
					width: wrap.clientWidth,
					height: wrap.clientHeight
				}
				img.onload = function(){
					self.imgSize = {
						width: img.width,
						height: img.height
					}
					self.canvas.setAttribute('width',self.wrapSize.width+'px');
					self.canvas.setAttribute('height',self.wrapSize.height+'px');
					self.ctx = self.canvas.getContext("2d");
					self.ctx.drawImage(img,0,0);
					self.initData();
					self.clear();
					self.down();
				}
			}
			this.animate();
		},
		initData: function(){
			var imgData = this.ctx.getImageData(0,0,this.imgSize.width,this.imgSize.height)
			this.initailData = imgData;
			for(var i=0 ;i<this.imgSize.height; i++){
				this.imgData[i] = [];
				this.initPosData[i] = [];
				for(var j=0 ;j<this.imgSize.width; j++){
					var begin = this.imgSize.width*i*4+j*4;
					this.imgData[i][j] = imgData.data.slice(begin,begin+4);
					this.initPosData[i][j] = {
						x: (this.wrapSize.width - this.imgSize.width)/2+j,
						y: i
					}
				}
			}
		},
		clear: function(){
			this.ctx.clearRect(0,0,this.wrapSize.width,this.wrapSize.height);
		},
		animate: function(time){
			requestAnimationFrame(arguments.callee);
			TWEEN.update(time);
		},
		down: function(){
			var self = this;
			var position = {y: 0};
			target = document.getElementById('target');
			tween = new TWEEN.Tween(position)
				.to({y: 300}, 2000)
				.easing(TWEEN.Easing.Bounce.Out)
				.onUpdate(update);
			tween.start();
			function update(){
				self.clear();
				for(var i=0 ;i<self.imgSize.height; i++){
					for(var j=0 ;j<self.imgSize.width; j++){
						var imgData=self.ctx.createImageData(1,1);
						imgData.data[0] = self.imgData[i][j][0];
						imgData.data[1] = self.imgData[i][j][1];
						imgData.data[2] = self.imgData[i][j][2];
						imgData.data[3] = self.imgData[i][j][3];
						self.ctx.putImageData(imgData,self.initPosData[i][j].x,self.initPosData[i][j].y+position.y);
					}
				}
				// self.clear();
				// self.ctx.putImageData(self.initailData,0,position.y);
				console.log(position.y)
			}
		}
	}
	Grain.init();
})()
