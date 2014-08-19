$(function(){
	// 處理 Hash
	setHash();
	
	// 設定 #pieChart 的 Margin-top
	setPieChartPos($('#pieChart'),viewport.get());

	// 初始化 Semantic UI Checkbox
	$('#question-box div.ui.checkbox').checkbox();

	// 初始化 EasyPieChart
	initPieChart(getUrlVars()['room_id']);
	
	// 轉換 Student 網址成短網址並生成 QR-Code
	getTinyURL('http://merry.ee.ncku.edu.tw/~thwang/ilecture/student/index.html?room_id='+getUrlVars()['room_id']+'&code='+getUrlVars()['code'], getUrlVars()['code']);
});

// Hash 發生改變時...
$(window).on('hashchange', function(){ console.log('hashchange -> '+hash);
	setHash();
	return false;
});

$(window).resize( function(){
	// 修正 #pieChart 的 Margin-top
	setPieChartPos($('#pieChart'),viewport.get());
});

// 送出 Text
$(document).on('click', '#text', function(){
	var text = $(this).prev().val().trim() || null;
	if( text !== null ){
		$(this).prev().prev().val('');
		sendText(this, JSON.parse(localStorage.tInfo), text);
	}else{
		alert('未填寫問題。');
	}
});

// 按下 Enter : 送出 Text
$(document).on('keypress', '#sidebar-message > footer input', function(e){
	if( e.keyCode === 13 ){
		$(this).siblings('#text').trigger('click');
		return false;
	}
});

// 顯示 : Question Box
$(document).on('click', '#question_btn', function(){
	$(this).parents('#header').parent().css('overflow-y', 'hidden').end().siblings('#question-box').show();
	$.address.value('question-box');
});

// 關閉 : Question Box
$(document).on('click', '#question-box div.title', function(){
	$(this).parents('#question-box').hide().parent().css('overflow-y', '');
	goBack();
});

// 顯示 : LinkRoom Box
$(document).on('click', '#linkRoom_btn', function(){
	$(this).parents('#header').parent().css('overflow-y', 'hidden').end().siblings('#linkRoom-box').show();
	$.address.value('linkRoom-box');
});

// 關閉 : LinkRoom Box
$(document).on('click', '#linkRoom-box div.title', function(){
	$(this).parents('#linkRoom-box').hide().parent().css('overflow-y', '');
	goBack();
});

// 顯示 : Message Box
$(document).on('click', '#message_btn', function(){
	$(this).parents('#header').parent().css('overflow-y', 'hidden').end().siblings('#sidebar-message').sidebar({overlay: true}).sidebar('show').children('div.overlay').show();
	$.address.value('sidebar-message');
});

$(document).on('click', '#sidebar-message > div.overlay', function(){
	// 關閉 : Message Box
	$(this).hide().siblings('#sidebar-message').sidebar('hide').parent().css('overflow-y', '');
	goBack();
});

// 投票結果 : 返回「Question Box」主頁面
$(document).on('click', '#question-box article[_que=1] div.bottom > div.prev', function(){
	$(this).parents('article[_que=1]').hide().siblings('[_que=0]').show().end().siblings('header').children('div.title').children('div').text('提出問題').end().end().children('div.done').hide();
});

// 投票結果 : 完成這個問題，並隱藏「Question Box」頁面
$(document).on('click', '#question-box div.done', function(){
	$(this).hide().siblings('div.title').children('div').text('提出問題').end().parent().siblings('article[_que=1]').hide().end().siblings('[_que=0]').show().parents('#question-box').hide().parent().css('overflow-y', '');
	goBack();
});

// Default 提問 : 進入「投票結果」頁面
$(document).on('click', '#sel-default > div.ui', function(){
	var resultAry = [];
	for( var i=0, iLen=$(this).attr('_sel'); i<iLen; i++ ){
		resultAry[i] = 0;
	}
	$(this).parents('article[_que=0]').hide().siblings('[_que=1]').show().end().siblings('header').children('div.title').children('div').text('投票結果').end().end().children('div.done').show();
	drawBarChart(resultAry);
	// 產生問題並傳送到 FireBase
	createQuestion(this, JSON.parse(localStorage.tInfo));
});

// Default 提問 : Hover 選項清單，則該底色變紅
$(document).on({
    mouseenter: function () {
		$(this).addClass('red inverted');
    },
    mouseleave: function () {
		$(this).removeClass('red inverted');
    }
}, '#sel-default > div.ui');

// Checkbox : 單選/多選 切換
$(document).on('click', '#question-box div.wrapper > div.content div.ui.radio.checkbox > label', function(){
	$(this).parents('div.content').siblings('#sel-default').attr('_type', $(this).attr('_type'));
});

// 處理 Hash 
function setHash(){
	hash = location.hash.replace(/\#\//,'');
	switch( hash ){
		case 'question-box':
			$('#'+hash).show();
			break;
		case 'linkRoom-box':
			$('#'+hash).show();
			break;
		case 'sidebar-message':
			$('#'+hash).show();
			break;
		default:
			hash = 'iLecture-Teacher';
			// 利用 sessionStorage 來判斷返回操作是 history back，還是導向 teacher/index,html
			sessionStorage.setItem('isValidity', 'iLecture-Teacher');
			$('#container').siblings('#question-box, #linkRoom-box, #sidebar-message').hide();
			break;
	}
	console.log('setHash -> '+hash);
}

// 回到前一頁
function goBack(){
	var isBackValid = sessionStorage.isValidity || null;
	if( isBackValid === 'iLecture-Teacher' ){
		window.history.back();
	}else{
		window.location.replace('./index.html?'+JSON.parse(localStorage.tInfo).params);
	}
}

// 設定 #pieChart 的 Margin-top
function setPieChartPos($pieChart, _){
	if( _.w <= 670 ){
			$pieChart.css('margin-top', 30);
	}else{
		if( _.h > 296 ){
			$pieChart.css('margin-top', (_.h-296)/2);
		}else{
			$pieChart.css('margin-top', 30);
		}
	}
}

// Messages : 顯示資訊(剛載入網頁時)
function showLogs(tLog, tInfo){
	var html = '';
	for( var i=0, aryLen = tLog.length; i<aryLen; i++ ){
		var sId = Object.keys(tLog[i]);
		if( tLog[i][sId].split('_')[0] === 'mood' ){
			html += getMessagesHtml('Mood', tLog[i][sId].substr(25), tLog[i][sId].split('_')[1], sId);
		}else if( tLog[i][sId].split('_')[0] === 'speed' ){
			html += getMessagesHtml('Speed', tLog[i][sId].substr(26), tLog[i][sId].split('_')[1], sId);
		}else if( tLog[i][sId].split('_')[0] === 'text' ){
			html += getMessagesHtml('Text', tLog[i][sId].substr(25), tLog[i][sId].split('_')[1], sId);
		}
	}
	$('#message > div').html(html);
	// scrolling 滑到最下面
	var $a = $('#sidebar-message').children('section');
	$a.animate({scrollTop: $a.prop('scrollHeight')}, 500);
}

// 產生不同型式 Messages 的 DOM
function getMessagesHtml(mode, val, time, sId){
	if( mode === 'Mood' ){
		var html = '<div class="item mood" _sId='+sId+'>'+
			'<div class="">'+sId+'</div>'+
			'<img src="../image/mood_'+val+'.png">'+
			'<div class="time">'+time+'</div>'+
		'</div>';
	}else if( mode === 'Speed' ){
		var html = '<div class="item speed" _sId='+sId+'>'+
			'<div class="">'+sId+'</div>'+
			'<img src="../image/speed_'+val+'.png">'+
			'<div class="time">'+time+'</div>'+
		'</div>';
	}else if( mode === 'Text' ){
		var html = '<div class="item" _sId='+sId+'>'+
			'<div class="">'+sId+'</div>'+
			'<div class="ui segment" style="margin: 0;">'+
				'<p>'+val+'</p>'+
				'<div class="time">'+time+'</div>'+
			'</div>'+
		'</div>';
	}
	return html;
}

// 投票結果 : 畫出長條圖
function drawBarChart(resultAry){
	var barChartData = {
		labels : [],
		datasets : [{
			fillColor : "rgba(151,187,205,0.5)",
			strokeColor : "rgba(151,187,205,0.8)",
			highlightFill : "rgba(151,187,205,0.75)",
			highlightStroke : "rgba(151,187,205,1)",
			data : []
		}]
	}, ctx = document.getElementById('barCanvas').getContext('2d');

	// barChartData : 長條圖的資料陣列
	for( var i=0, iLen=resultAry.length; i<iLen; i++ ){
		barChartData.labels.push(mapLetter(i));
		barChartData.datasets[0].data.push(resultAry[i]);
	}
	console.log(barChartData);
	
	window.myBar = new Chart(ctx).Bar(barChartData, {
		responsive : true,
		showTooltips: false,
	});
}

// 轉換 Student 網址成短網址並生成 QR-Code
function getTinyURL(url, roomCode){
	$.urlShortener.settings.apiKey = 'AIzaSyDhbUJhg1z_4y1WZiRxu-xqXhU8EsVOj6E';
	$.urlShortener({
		longUrl: url,
		success: function(shortUrl){
			var qrCode = new QRCode('show-qrCode', {
				width: 256,
				height: 256,
				colorDark : '#000000',
				colorLight : '#ffffff',
				correctLevel : QRCode.CorrectLevel.H
			});
			// 利用回傳的短網址生成 QR-Code 並顯示在「連線資訊」上
			qrCode.makeCode(url);
			var $a = $('#linkInfo');
			$a.children()[0].childNodes[1].innerText = roomCode;
			$a.children()[1].childNodes[1].innerText = shortUrl;
			$a.children()[1].setAttribute('href', url);
		},
		error: function(err){
			console.log(err);
			alert('產生縮網址發生錯誤。');
		}
	});
}

// 取得該選項相對應的英文編號
function mapLetter(a){
	var map = ['沒意見','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
	return map[a];
}
