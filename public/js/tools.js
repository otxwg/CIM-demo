/**
 * 从某个字符以后开始截取字符串，不包括被截取的字符
 */
String.prototype.subByFirstChar = function(findChar) {
	return this.substr(this.indexOf(findChar) + 1)
}
/**
 * 将首字母大写
 */
String.prototype.upperCaseFirstChar = function() {
	if (this.length == 0) {
		return this
	}
	var firstChar = this[0].toUpperCase()
	return firstChar + this.substr(1)
}

/**
 * 深拷贝
 */
Array.prototype.copy = function() {
	return copy(this)
}
/**
 * 如果有值就返回值，没有就返回指定默认值
 */
function getValueIfNoNull(value, defaultValue) {
	return value == undefined ? defaultValue : value
}
function copy(item) {
	try {
		return JSON.parse(JSON.stringify(item))
	} catch (e) {
		console.error(e.stack)
	}
}
/**
 * 插入
 * @param {Object} index
 * @param {Object} item
 */
Array.prototype.insert = function(index, item) {
	this.splice(index, 0, item);
}
/**
 * 数组合并
 * @param {Object} array
 */
Array.prototype.addAll = function(array) {
	var _this = this
	array.forEach(function(e) {
		_this.push(e)
	})
	return _this
}

// 对Date的扩展,将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符, 
// 年(y)可以用 1-4 个占位符,毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.format = function(fmt) { //author: meizz 
	var o = {
		"M+": this.getMonth() + 1, //月份 
		"d+": this.getDate(), //日 
		"h+": this.getHours(), //小时 
		"m+": this.getMinutes(), //分 
		"s+": this.getSeconds(), //秒 
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
		"S": this.getMilliseconds() //毫秒 
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		};
	}
	return fmt;
}
/**
 * 获取格式化yyyy/MM/dd的日期字符串
 */
Date.prototype.formatByDate = function(interval) {
	if (interval == undefined) {
		interval = '/'
	}
	return this.getFullYear() + interval + (this.getRealMonth() < 10 ? '0' : '') + this.getRealMonth() + interval + (this
		.getDate() < 10 ? '0' : '') + this.getDate()
}
/**
 * 获取格式化的日期字符串
 * @param {Object} interval yyyy+interval+MM+interval+dd HH:mm:ss 默认是/
 */
Date.prototype.formatByTime = function(interval) {
	return this.formatByDate(interval) + " " + (this.getHours() < 10 ? '0' : '') + this.getHours() + ':' + (this.getMinutes() <
		10 ? '0' : '') + this.getMinutes() + ":" + (this.getSeconds() < 10 ? '0' : '') + this.getSeconds()
}

/**
 * 获取格式化的日期字符串
 * @param {Object} interval yyyy+interval+MM+interval+dd HH:mm:ss:sss 默认是/
 */
Date.prototype.formatByMillisecond = function(interval) {
	return this.formatByDate(interval) + " " + (this.getHours() < 10 ? '0' : '') + this.getHours() + ':' + (this.getMinutes() <
		10 ? '0' : '') + this.getMinutes() + ":" + (this.getSeconds() < 10 ? '0' : '') + this.getSeconds() + ":" + this.getMilliseconds()
}
/**
 * 获取格式化的日期字符串
 * @param {Object} interval yyyy+interval+MM,默认是/
 */
Date.prototype.formatByMonth = function(interval) {
	if (interval == undefined) {
		interval = '/'
	}
	return this.getFullYear() + interval + (this.getRealMonth() < 10 ? '0' : '') + this.getRealMonth()
}
/**
 * 获取格式化的日期字符串
 * @param {Object} interval yyyy+interval+MM,默认是/
 */
Date.prototype.formatByYear = function(interval) {
	if (interval == undefined) {
		interval = '/'
	}
	return this.getFullYear() + interval + (this.getRealMonth() < 10 ? '0' : '')
}

/**
 * 真实月份
 */
Date.prototype.getRealMonth = function() {
	return this.getMonth() + 1
}
/**
 * 获取日期
 * @param {Object} num   0今天,-1昨天,1，明天
 * @param {Object} str   分割方式
 * return yyyy + str + MM + str + dd,默认yyyy-MM-dd
 */
function getDay(num, str) {
	if (undefined == str) {
		str = "-"
	}
	var today = new Date();
	var nowTime = today.getTime();
	var ms = 24 * 3600 * 1000 * num;
	today.setTime(parseInt(nowTime + ms));
	var oYear = today.getFullYear();
	var oMoth = (today.getMonth() + 1).toString();
	if (oMoth.length <= 1) {
		oMoth = '0' + oMoth;
	}
	var oDay = today.getDate().toString();
	if (oDay.length <= 1) {
		oDay = '0' + oDay;
	}
	return oYear + str + oMoth + str + oDay;
}

/**
 * 毫秒值转为时分秒列表
 * @param {Object} mss
 */
function formatDuring(mss) {
	if (mss < 1000) {
		return [0, 0, 0, 0]
	}
	var days = parseInt(mss / (1000 * 60 * 60 * 24));
	var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
	var seconds = parseInt((mss % (1000 * 60)) / 1000);
	return [days, hours, minutes, seconds]
}

function formatDuringToString(mss) {
	var list = formatDuring(mss)
	return '{0} 天 {1} 小时 {2} 分 {3} 秒'.format(list[0], list[1], list[2], list[3])
}

/**
 * 异步加载html文件到指定的id元素
 * @param {Object} path
 * @param {Object} callback
 * @param {Object} targetid 模板id,不传默认是loadhtml
 */
function loadHtml(path, callback, targetid) {
	if (targetid == undefined) {
		targetid = 'loadhtml'
	}
	Vue.http.get(path, {}, {
		emulateJSON: true
	}).then(function(respon) {
		var ele = document.getElementById(targetid)
		respon = respon.body;
		var temp = ele.innerHTML + respon
		ele.innerHTML = temp
		if (callback) {
			callback()
		}
	}, function(respon) {});
}
/**
 * 加载js文件
 * @param {Object} path
 */
function loadJS(path) {
	var myScript = document.createElement("script");
	myScript.type = "text/javascript";
	myScript.src = path;
	document.body.appendChild(myScript);
}

/**
 * 获取对象的类型
 * @param {Object} obj
 */
function getClass(obj) {
	var classname = Object.prototype.toString.call(obj)
	classname = classname.substr(classname.indexOf(' ') + 1)
	classname = classname.substr(0, classname.length - 1)
	return classname
}

/**
 * 下载一个文件
 */
function downloadFile(url, filename) {
	function download(href, filename) {
		const a = document.createElement('a')
		a.download = filename == undefined ? "" : filename
		a.href = href
		document.body.appendChild(a)
		a.click()
		a.remove()
	}
	fetch(url, {
			headers: new Headers({
				Origin: location.origin,
			}),
			mode: 'cors',
		})
		.then(function(res) {
			return res.blob()
		})
		.then(function(blob) {
			const blobUrl = window.URL.createObjectURL(blob)
			download(blobUrl, filename)
			window.URL.revokeObjectURL(blobUrl)
		})
}
