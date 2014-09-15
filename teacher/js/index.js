$(function(){
	// 初始化 EasyPieChart
	initPieChart(getUrlVars()['room_id'], viewport.get());
	
	// 轉換 Student 網址成短網址並生成 QR-Code
	getTinyURL('http://localhost/~wy/git_project/iLecture/student/index.html?room_id='+getUrlVars()['room_id']+'&code='+getUrlVars()['code'], getUrlVars()['code']);
});


$(window).resize( function(){
	// 設定 EasyPieChart
	//setPieChart($('#roomInfo nav'), viewport.get());
});

// 送出 Text
$(document).on('click', '#text_btn', function(){
	var text = $(this).siblings('div.input').children().val().trim() || null;
	if( text !== null ){
		if( checkTextValidity(text) ){
			sendText(this, JSON.parse(localStorage.tInfo), text);
		}else{
			alert('訊息：含有未認可的標點符號。');
		}
	}else{
		alert('未填寫訊息。');
	}
});

// 按下 Enter : 送出 Text
$(document).on('keypress', '#roomMessage > footer input', function(e){
	if( e.keyCode === 13 ){
		$(this).parent().siblings('#text_btn').trigger('click');
		return false;
	}
});

// 點擊 Navigation
$(document).on('click', '#navigation div.item', function(){
	if( !$(this).hasClass('active') ){
		$(this).parent().parent().find('div.active').removeClass('active').end().find('[_nav='+$(this).attr('_nav')+']').addClass('active');
		$(this).parents('#navigation').siblings('#container').children('section.active').removeClass('active').end().children('#'+$(this).attr('_nav')).addClass('active');
		if( $(this).attr('_nav') === 'roomMessage' ){
			// scrolling 滑到最下面
			var $a = $('#'+$(this).attr('_nav')).children('div');
			$a.animate({scrollTop: $a.prop('scrollHeight')}, 500);
		}
	}
});

// 點擊「提問」
$(document).on('click', '#roomQues nav > div.item > div.ask', function(){
	var num = $(this).parents('#roomQues').attr('_sel'), title = $('#title_input').val().trim() || '未設定問題描述';
	if( checkQuestionValidity(title) ){
		// 產生問題並傳送到 FireBase
		createQuestion(this, title, JSON.parse(localStorage.tInfo), num);
	}else{
		alert('問題描述：只能輸入任意文字、空白或底線。');
	}
});

// Checkbox : 單選/多選 切換
$(document).on('click', '#roomQues div.item.type > div', function(){
	if( !$(this).hasClass('active') ){
		$(this).addClass('active').siblings().removeClass('active').parents('#roomQues').attr('_type', $(this).attr('_type'));
	}
});

// 選項數量 : 切換
$(document).on('click', '#roomQues div.sel-item', function(){
	if( !$(this).hasClass('active') ){
		$(this).addClass('active').siblings().removeClass('active').parents('#roomQues').attr('_sel', $(this).attr('_sel'));
	}
});

// 顯示 & 初始化 : 新問題的「提問結果」
function setResult(json_ques){
	if( json_ques !== '""' ){
		var $a = $('#roomResult'), o_ques = JSON.parse(json_ques), type = ( o_ques.type === 'single' ) ? '單選' : '多選', title = o_ques.title;
		analyzeResult(json_ques);
		$a.removeClass('null');
	}else{
		var $a = $('#roomResult'), type = '從未發問', title = '未設定問題描述';
	}
	$a.children().children('nav').find('div.left').text(title).end().find('div.type').text(type);
}

// 分析最新問題之投票結果的資訊
function analyzeResult(json_ques){
	var o_ques = JSON.parse(json_ques), answerAry = o_ques.answer.sort(), resultAry = [], current = null, count = 0;
	for( var i=0, iLen=o_ques.num; i<=iLen; i++ ){
		resultAry[i] = 0;
	}
	for( var i=0, iLen=answerAry.length; i<iLen; i++ ){
		if( answerAry[i] != current ){
			if( count > 0 ){
				resultAry[current] = count;
			}
			current = answerAry[i];
			count = 1;
		}else{
			count++;
		}
	}
	if( count > 0 ){
		resultAry[current] = count;
	}
	console.log(answerAry);
	console.log(resultAry);
	// 顯示投票的結果
	drawBarChart(resultAry);
}

// 設定 EasyPieChart
function setPieChart($pieChart, _){
	/*if( _.w <= 980 ){
		if( $pieChart.hasClass('desktop') ){
			//$pieChart.data('easy-pie-chart', null);
			var $chart = $pieChart.find('div.chart');
			$chart.children('canvas').remove().end().data('easyPieChart', null);
			$chart.easyPieChart({
				lineWidth: 15,
				size: 200,
				barColor: 'rgb(21,161,134)',
				trackColor: 'rgb(191,194,199)',
				animate: 2000,
				scaleColor: !1,
				lineCap: 'square'
			});
			$pieChart.removeClass('desktop').addClass('mobile');
		}
	}else{
		if( $pieChart.hasClass('mobile') ){*
			var $chart = $pieChart.find('div.chart');
			$chart.children('canvas').remove().end().data('easyPieChart', null);
			$chart.easyPieChart({
				lineWidth: 15,
				size: 280,
				barColor: 'rgb(21,161,134)',
				trackColor: 'rgb(191,194,199)',
				animate: 2000,
				scaleColor: !1,
				lineCap: 'square'
			});
			//$pieChart.removeClass('mobile').addClass('desktop');
	/*	}
	}*/
}

// 新增 Message
function addMessages(tInfo, tLog){
	var sId = Object.keys(tLog[0])[0], $a = $('#show-message');
	if( $a.children('div.item:last-child').find('span.timestamp').text() ){ // 若 Messages 不為空
		console.log( compareDateTime($a.children('div.item:last-child').find('span.timestamp').text(), tLog[0][sId].split('_')[1]) );
		if( !compareDateTime($a.children('div.item:last-child').find('span.timestamp').text(), tLog[0][sId].split('_')[1]) ){ // 若 new message 沒比較新，則不動作
			console.log('addMessages 不動作');
			return 0;
		}
	}
	if( tLog[0][sId].split('_')[0] === 'mood' ){
		$a.children('div.item.mood[_sid='+sId+']').remove().end().append(getMessagesHtml('Mood', tLog[0][sId].substr(25), tLog[0][sId].split('_')[1], sId));
	}else if( tLog[0][sId].split('_')[0] === 'speed' ){
		$a.children('div.item.speed[_sid='+sId+']').remove().end().append(getMessagesHtml('Speed', tLog[0][sId].substr(26), tLog[0][sId].split('_')[1], sId));
	}else if( tLog[0][sId].split('_')[0] === 'text' ){
		$a.append(getMessagesHtml('Text', tLog[0][sId].substr(25), tLog[0][sId].split('_')[1], sId));
	}
	// scrolling 滑到最下面
	var $b = $('#roomMessage').children('div');
	$b.animate({scrollTop: $b.prop('scrollHeight')}, 500);
}

// 判斷時間戳 b 是否比 a 還要新
/*!
* compareDateTime 原案：return ( new Date(b).valueOf() > new Date(a).valueOf() ) ? 1 : 0;
* 但是發現手機平板瀏覽器會出問題，所以只好手動比較
*/
function compareDateTime(a, b){
	var oldAry = a.split(/[- :]/), newAry = b.split(/[- :]/), oldSeconds = parseInt(oldAry[5])+60*parseInt(oldAry[4])+60*60*parseInt(oldAry[3])+60*60*24*parseInt(oldAry[2]), newSeconds = parseInt(newAry[5])+60*parseInt(newAry[4])+60*60*parseInt(newAry[3])+60*60*24*parseInt(newAry[2]);
	if( parseInt(newAry[0]) > parseInt(oldAry[0]) ){ // 年 : b 比 a 新
		return 1;
	}else if( parseInt(newAry[0]) === parseInt(oldAry[0]) ){ // 年 : b 等於 a
		if( parseInt(newAry[1]) > parseInt(oldAry[1]) ){ // 月 : b 比 a 新
			return 1;
		}else if( parseInt(newAry[1]) === parseInt(oldAry[1]) ){ // 月 : b 等於 a，比較剩餘的秒數
			return ( newSeconds > oldSeconds ) ? 1 : 0;
		}else{ // 月 : b 比 a 舊
			return 0;
		}
	}else{ // 年 : b 比 a 舊
		return 0;
	}
}
		
// Messages : 顯示資訊(剛載入網頁時)
function showLogs(tLog, tInfo){
	var html = '';
	for( var i=0, aryLen = tLog.length; i<aryLen; i++ ){
		var sId = Object.keys(tLog[i])[0];
		if( tLog[i][sId].split('_')[0] === 'mood' ){
			html += getMessagesHtml('Mood', tLog[i][sId].substr(25), tLog[i][sId].split('_')[1], sId);
		}else if( tLog[i][sId].split('_')[0] === 'speed' ){
			html += getMessagesHtml('Speed', tLog[i][sId].substr(26), tLog[i][sId].split('_')[1], sId);
		}else if( tLog[i][sId].split('_')[0] === 'text' ){
			html += getMessagesHtml('Text', tLog[i][sId].substr(25), tLog[i][sId].split('_')[1], sId);
		}
	}
	$('#show-message').html(html);
	// scrolling 滑到最下面
	var $a = $('#roomMessage').children('div');
	$a.animate({scrollTop: $a.prop('scrollHeight')}, 500);
}

// 產生不同型式 Messages 的 DOM
function getMessagesHtml(mode, val, time, sId){
	if( mode === 'Mood' ){
		var html = '<div class="item mood" _sid='+sId+'>'+
				'<footer><span class="name">No.'+sId.split('_')[1]+'</span>, <span class="timestamp">'+time+'</span></footer>'+
				'<div>'+
					'<img src="../image/mood_'+val+'.png">'+
				'</div>'+
			'</div>';
	}else if( mode === 'Speed' ){
		var html = '<div class="item speed" _sid='+sId+'>'+
				'<footer><span class="name">No.'+sId.split('_')[1]+'</span>, <span class="timestamp">'+time+'</span></footer>'+
				'<div>'+
					'<img src="../image/speed_'+val+'.png">'+
				'</div>'+
			'</div>';
	}else if( mode === 'Text' ){
		var html = '<div class="item" _sid='+sId+'>'+
				'<footer><span class="name">';
					html += ( sId === 'teacher' ) ? 'Teacher' : 'No.'+sId.split('_')[1];
					html += '</span>, <span class="timestamp">'+time+'</span></footer>'+
				'<div>'+
					'<p>'+val+'</p>'+
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
			fillColor : "rgba(142,68,173,.9)",
			strokeColor : "rgba(142,68,173,.8)",
			highlightFill : "rgba(119,107,94,.75)",
			highlightStroke : "rgba(119,107,94,1)",
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
				width: 280,
				height: 280,
				colorDark : 'rgb(100,88,76)',
				colorLight : 'rgba(248,243,230,0)',
				correctLevel : QRCode.CorrectLevel.H
			});
			// 利用回傳的短網址生成 QR-Code 並顯示在「連線資訊」上
			qrCode.makeCode(url);
			$('#show-roomCode').text(roomCode);
			$('#show-roomLink').children().text(shortUrl).attr('href', url);
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

// 檢查 : 問題描述 是否合乎標準 -> 標點符號只能用 _ + 任意字符 + 空白
function checkQuestionValidity(a){
	return ( /^[^\.,-\/?#!$%\^&\*;:{}=\-'"~()<>@+|\\]+$/.test(a) ) ? 1 : 0;
}

// 檢查 : Text 是否合乎標準 -> 標點符號不能用 \ / ' " < >
function checkTextValidity(a){
	return ( /^[^\/'"<>\\]+$/.test(a) ) ? 1 : 0;
}
