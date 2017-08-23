var gt = Date.now();
(function() {
    var Grain = {
        canvas: null,
        imgSize: null,
        wrapSize: null,
        ctx: null,
        reverse: true, //是否重组
        imgSrc: 'ryan.gif',
        imgData: [],
        initailData: null,
        initPosData: [],
        currentData: [],
        th: 0, //正在准备聚合的行
        beginTime: Date.now(),
        init: function() {
            var self = this;
            if (!window.$) {
                window.$ = function(selector) {
                    var firstChar = selector.charAt(0);
                    if (firstChar == '#')
                        return document.getElementById(selector.substr(1));
                    else if (firstChar == '.')
                        return document.getElementsByClassName(selector.substr(1));
                    return false;
                }
            }
            window.onload = function() {
                var img = new Image();
                var wrap = $('.canvasWrap')[0];
                img.src = self.imgSrc;
                self.canvas = $('#canvas');
                self.wrapSize = {
                    width: wrap.clientWidth,
                    height: wrap.clientHeight
                }
                img.onload = function() {
                    self.imgSize = {
                        width: img.width,
                        height: img.height
                    }
                    self.canvas.setAttribute('width', self.wrapSize.width + 'px');
                    self.canvas.setAttribute('height', self.wrapSize.height + 'px');
                    self.ctx = self.canvas.getContext("2d");
                    self.ctx.drawImage(img, 0, 0);
                    self.initData();
                    self.clear();
                    self.animate();
                    window.onclick = self.onClick;
                }
            }
        },
        initData: function() {
            var imgData = this.ctx.getImageData(0, 0, this.imgSize.width, this.imgSize.height);
            this.initailData = this.ctx.getImageData(0, 0, this.imgSize.width, this.imgSize.height);
            for (var i = 0; i < this.imgSize.height; i++) {
                this.imgData[i] = [];
                this.initPosData[i] = [];
                this.currentData[i] = [];
                for (var j = 0; j < this.imgSize.width; j++) {
                    var begin = this.imgSize.width * i * 4 + j * 4;
                    this.imgData[i][j] = imgData.data.slice(begin, begin + 4);
                    this.initPosData[i][j] = {
                        x: (this.wrapSize.width - this.imgSize.width) / 2 + j,
                        y: i+50
                    }
                    this.currentData[i][j] = {
                        x: Math.floor(this.wrapSize.width * Math.random()),
                        y: Math.floor(this.wrapSize.height * Math.random()),
                        vx: 0, //x轴打散增量
                        vy: 0, //y轴打散增量
                        ax: .2 - Math.random() * .08, //x轴聚合速度系数
                        ay: .2 - Math.random() * .08, //y轴聚合速度系数
                        nx: .4 + Math.random() * .3, //x轴打散弹力系数
                        ny: .3 + Math.random() * .2, //y轴打散弹力系数
                    }
                }
            }
        },
        clear: function() {
            this.ctx.clearRect(0, 0, this.wrapSize.width, this.wrapSize.height);
        },
        animate: function(time) {
            var fnName = '';
            if (Grain.reverse){
                Grain.gather();
                fnName = 'gather';
            }
            else{
                Grain.breakUp();
                fnName = 'breakUp';
            }
            requestAnimationFrame(Grain.animate);
            if(location.search.indexOf('isLog')!=-1)
                console.log('fps '+fnName+':',Date.now() - Grain.beginTime);
            Grain.beginTime = Date.now();
        },
        //聚合回调
        gather: function() {
            var t1 = Date.now();
            var self = this;
            var width = self.wrapSize.width;
            var height = self.wrapSize.height;
            var imgData = self.ctx.createImageData(width, height);
            self.th < height && ++self.th;
            for (var i = 0; i < self.imgSize.height; i++) {
                for (var j = 0; j < self.imgSize.width; j++) {
                    var current = self.currentData[i][j];
                    var target = self.initPosData[i][j];
                    var index = 0;
                    var x = 0;
                    var y = 0;

                    if (i < self.th) {
                        var xdiff = target.x - current.x;
                        var ydiff = target.y - current.y;
                        if (Math.abs(xdiff) < .5) {
                            current.x = target.x;
                        } else {
                            current.x += (target.x - current.x) * current.ax;
                        }
                        if (Math.abs(ydiff) < .5) {
                            current.y = target.y;
                        } else {
                            current.y += (target.y - current.y) * current.ay;
                        }
                    }

                    x = Math.floor(current.x);
                    y = Math.floor(current.y);
                    index = (y-1>0 ? y-1 : 0) * width * 4 + x * 4;
	                imgData.data.set(self.imgData[i][j], index);
                }
            }
            self.clear();
            self.ctx.putImageData(imgData, 0, 0);
            // console.log('gater caulate:',Date.now() - t1);
        },
        //打散回调
        breakUp: function() {
            var t1 = Date.now();
            var self = this;
            var width = self.wrapSize.width;
            var height = self.wrapSize.height;
            var imgData = self.ctx.createImageData(width, height);
            for (var i = 0; i < self.imgSize.height; i++) {
                for (var j = 0; j < self.imgSize.width; j++) {
                    var current = self.currentData[i][j];
                    var index = 0;
                    current.x += current.vx;
                    current.y += current.vy;
                    if (current.y >= height) {
                        current.vy = -current.ny * current.vy;
                        if (Math.abs(current.vy) <= 2) {
                            current.vy = 0;
                        }
                        current.vx *= current.nx;
                    } else {
                        current.vy += 1;
                    }

                    if(current.y < 0){
                        current.y = 0;
                    }else if(current.y >= height){
                        current.y = height - 1;
                    }

                    if(current.x < 0){
                        current.x = 0;
                    }else if(current.x >= width){
                        current.x = width-1;
                    }

                    if (Math.abs(current.vx) <= 1 || current.x<=0 || current.x>=width) 
                    	current.vx = 0;

                    x = Math.floor(current.x);
                    y = Math.floor(current.y);
                    index = (y-1>0 ? y-1 : 0) * width * 4 + x * 4;
                    imgData.data.set(self.imgData[i][j], index);
                }
            }
            self.clear();
            self.ctx.putImageData(imgData, 0, 0);
            // console.log('breakUp caulate:',Date.now() - t1);
        },
        onClick: function() {
            // window.location.reload();
        	var self = Grain;
            self.reverse = !self.reverse;
            if (!self.reverse) {
                for (var i = 0; i < self.imgSize.height; i++) {
                    for (var j = 0; j < self.imgSize.width; j++) {
                        var current = self.currentData[i][j];
                        current.vx = (Math.random() - Math.random()) * 3;
                        current.vy = -Math.random() * 10;
                    }
                }
            } else {
                self.th = 0;
            }
        }
    }
    Grain.init();
})()