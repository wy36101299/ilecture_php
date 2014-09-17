$(function(){
	// 顯示 Student ID 於 Header
	$('#show-sId').text('No.'+JSON.parse(localStorage.sInfo)['sId'].split('_')[1]);
	
	// 設定 posting swiper
	$('#speed, #mood').mCustomScrollbar({
		axis: 'x',
		scrollInertia: 0
	});
});

// 點擊 Navigation
$(document).on('click', '#navigation div.item', function(){
	if( !$(this).hasClass('active') ){
		$(this).parent().parent().find('div.active').removeClass('active').end().find('[_nav='+$(this).attr('_nav')+']').addClass('active');
		$('#container').children('section.active').removeClass('active').end().children('#'+$(this).attr('_nav')).addClass('active');
		if( $(this).attr('_nav') === 'roomMessage' ){
			// scrolling 滑到最下面
			var $a = $('#'+$(this).attr('_nav')).children('section');
			$a.animate({scrollTop: $a.prop('scrollHeight')}, 500);
		}
	}
});

// 送出 Text
$(document).on('click', '#text_btn', function(){
	var text = $(this).siblings('div.input').children().val().trim() || null;
	if( text !== null ){
		if( checkTextValidity(text) ){
			sendText(this, JSON.parse(localStorage.sInfo), text);
		}else{
			alert('訊息：含有未認可的標點符號。');
		}
	}else{
		alert('未填寫問題。');
	}
});

// 按下 Enter : 送出 Text
$(document).on('keypress', '#roomMessage > footer input', function(e){
	if( e.keyCode === 13 ){
		$(this).parent().siblings('#text_btn').trigger('click');
		return false;
	}
});

// 送出 Mood
$(document).on('click', '#mood div.posting-slide', function(){
	sendMood(this, JSON.parse(localStorage.sInfo));
});

// 送出 Speed
$(document).on('click', '#speed div.posting-slide', function(){
	sendSpeed(this, JSON.parse(localStorage.sInfo));
});

// Posting / User ID : 關閉
$(document).on('click', '#roomMessage > div.overlay', function(){
	$(this).siblings('footer').attr('_now', 'none').children('div.active').removeClass('active').end().siblings('.active').removeClass('active');
});

// Posting / User ID : 關閉
$(document).on('click', '#roomMessage > footer', function(e){
	var a = $(e.target).parent().attr('class') || '';
	if( a.indexOf('user') !== -1 ){  // User ID : Toogle
		if( a.indexOf('active') !== -1 ){  // close User ID
			$(e.target).parent().removeClass('active').parent().siblings('nav.user, div.overlay').removeClass('active').siblings('footer').attr('_now', 'none');
		}else{  // open User ID
			$(e.target).parent().addClass('active').siblings('div').removeClass('active').parent().siblings('nav.posting').removeClass('active').siblings('nav.user, div.overlay').addClass('active').siblings('footer').attr('_now', 'user');
		}
	}else if( a.indexOf('posting') !== -1 ){  // Posting : Toogle
		if( a.indexOf('active') !== -1 ){  // close Posting
			$(e.target).parent().removeClass('active').parent().siblings('nav.posting, div.overlay').removeClass('active').siblings('footer').attr('_now', 'none');
		}else{  // open Posting
			$(e.target).parent().addClass('active').siblings('div').removeClass('active').parent().siblings('nav.user').removeClass('active').siblings('nav.posting, div.overlay').addClass('active').siblings('footer').attr('_now', 'posting');
		}
	}else{
		$(e.target).parent().siblings('div.active').removeClass('active').parent().siblings('.active').removeClass('active').siblings('footer').attr('_now', 'none');
	}
});

// 選項選項 : Click 選項清單
$(document).on('click', '#roomQues div.sel-item', function(){
	if( $(this).hasClass('checked') ){
		$(this).removeClass('checked');
	}else{
		if( $(this).parents('#roomQues').attr('_type') === 'single' ){
			$(this).siblings('div.checked').removeClass('checked').end().addClass('checked');
		}else{
			if( parseInt($(this).attr('_answer')) === 0 ){
				$(this).siblings('div.checked').removeClass('checked').end().addClass('checked');
			}else{
				$(this).siblings('div[_answer=0]').removeClass('checked').end().addClass('checked');
			}
		}
	}
});

// 回答問題
$(document).on('click', '#roomQues nav > div.item > div.answer', function(){
	var $a = $(this).parent().parent().find('div.sel-item.checked'), answerAry = [];
	if( $a[0] ){
		for( var i=0, iLen=$a.length; i<iLen; i++ ){
			answerAry.push( parseInt( $a[i].getAttribute('_answer') ) );
		}
		// 更新 FireBase 的答案資訊
		sentAnswer(this, answerAry, JSON.parse(localStorage.sInfo));
	}else{
		alert('未選擇答案。');
	}
});

// 輸入 : 新名稱
$(document).on('click', '#roomMessage > nav.user div.wrapper-right', function(){
	var a = $(this).siblings('div.wrapper-left').children().val().trim() || null;
	if( a !== null ){
		if( checkNameValidity(a) ){
			// 更新 FireBase 的 sId 名稱
			sentStudentName(a, JSON.parse(localStorage.sInfo));
		}else{
			alert('名稱：只能輸入任意文字、空白或底線。');
		}
	}else{
		if(confirm('未輸入名稱，要移除名稱嗎？')){
			var o_sInfo = JSON.parse(localStorage.sInfo);
			if( o_sInfo.sId.indexOf('-') !== -1 ){ // 判斷目前的名稱是否為空
				if( checkNameValidity(a) ){
					// 更新 FireBase 的 sId 名稱
					sentStudentName(a, o_sInfo);
				}else{
					alert('名稱：只能輸入任意文字、空白或底線。');
				}
			}else{
				alert('沒有名稱可以移除。');
			}
		}
	}
});

// 按下 Enter : 送出 新名稱
$(document).on('keypress', '#roomMessage > nav.user div.wrapper-left > input', function(e){
	if( e.keyCode === 13 ){
		$(this).parent().siblings('div.wrapper-right').trigger('click');
		return false;
	}
});

// 新增 Message
function addMessage(mode, e, val, time, sId){
	if( mode === 'Mood' ){
		$('#show-message').children('div.item.mood').remove().end().append(getMessagesHtml('Mood', val, time, sId));
		$(e).parents('nav.posting').removeClass('active').siblings('.active').removeClass('active').end().siblings('footer').attr('_now', 'none').children('div').removeClass('active');
	}else if( mode === 'Speed' ){
		$('#show-message').children('div.item.speed').remove().end().append(getMessagesHtml('Speed', val, time, sId));
		$(e).parents('nav.posting').removeClass('active').siblings('.active').removeClass('active').end().siblings('footer').attr('_now', 'none').children('div').removeClass('active');
	}else if( mode === 'Text' ){
		$(e).siblings('div.input').children().val('');
		$('#show-message').append(getMessagesHtml('Text', val, time, sId));
	}
	// scrolling 滑到最下面
	var $a = $('#roomMessage').children('section');
	$a.animate({scrollTop: $a.prop('scrollHeight')}, 500);
}

// Messages : 顯示資訊(剛載入網頁時)
function showLogs(sLog, sInfo){
	var html = '';
	for( var i=0, aryLen = sLog.length; i<aryLen; i++ ){
		var sId = Object.keys(sLog[i])[0];
		if( sLog[i]['teacher'] ){
			html += getMessagesHtml('Text', sLog[i]['teacher'].substr(25), sLog[i]['teacher'].split('_')[1], 'teacher');
		}else if( sLog[i][sInfo['sId']].split('_')[0] === 'mood' ){
			html += getMessagesHtml('Mood', sLog[i][sInfo['sId']].substr(25), sLog[i][sInfo['sId']].split('_')[1], sId);
		}else if( sLog[i][sInfo['sId']].split('_')[0] === 'speed' ){
			html += getMessagesHtml('Speed', sLog[i][sInfo['sId']].substr(26), sLog[i][sInfo['sId']].split('_')[1], sId);
		}else if( sLog[i][sInfo['sId']].split('_')[0] === 'text' ){
			html += getMessagesHtml('Text', sLog[i][sInfo['sId']].substr(25), sLog[i][sInfo['sId']].split('_')[1], sId);
		}
	}
	$('#show-message').html(html);
	// scrolling 滑到最下面
	var $a = $('#roomMessage').children('section');
	$a.animate({scrollTop: $a.prop('scrollHeight')}, 500);
}

// 顯示 : 選擇問題答案介面
function setQuestion(json_ques){
	console.log(json_ques)
	var o_ques = JSON.parse(json_ques), type = ( o_ques.type === 'single' ) ? '單選' : '多選', title = ( o_ques.title === '' ) ? '未設定問題描述' : o_ques.title;
	console.log(o_ques.s);
	console.log(checkArrayByIndex(o_ques.s, JSON.parse(localStorage.sInfo).sId));
	if( checkArrayByIndex(o_ques.s, JSON.parse(localStorage.sInfo).sId) !== -1 ){
		$('#roomQues').removeClass('null').attr('_type', o_ques.type).find('div.type').text(type).end().find('div.right.title').text(title).end().find('div.right.selection').attr('_num', o_ques.num).children('div.checked').removeClass('checked').end().children('div[_answer=0]').addClass('checked').end().end().find('div.answered').show().siblings('div.answer').hide();
	}else{
		$('#roomQues').removeClass('null').attr('_type', o_ques.type).find('div.type').text(type).end().find('div.right.title').text(title).end().find('div.right.selection').attr('_num', o_ques.num).children('div.checked').removeClass('checked').end().children('div[_answer=0]').addClass('checked').end().end().find('div.answer').show().siblings('div.answered').hide();
	}
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
	console.log(json_ques);
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

// 取得該選項相對應的英文編號
function mapLetter(a){
	var map = ['沒意見','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
	return map[a];
}

// 檢查 : 新名稱 是否合乎標準 -> 標點符號只能用 _ + 任意字符 + 空白
function checkNameValidity(a){
	return ( /^[^\.,-\/?#!$%\^&\*;:{}=\-'"~()<>@+|\\]+$/.test(a) ) ? 1 : 0;
}

// 檢查 : Text 是否合乎標準 -> 標點符號不能用 \ / ' " < >
function checkTextValidity(a){
	return ( /^[^\/'"<>\\]+$/.test(a) ) ? 1 : 0;
}