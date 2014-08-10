$(function(){
	// 處理 Hash
	setHash();

	// 顯示 Student ID 於 Header
	$('#header > nav > div.sId').text(JSON.parse(localStorage.sInfo)['sId']);

	// 初始化 Swiper
	var moodSwiper = $('#mood > div.swiper-nav').swiper({
		visibilityFullFit: true,
		slidesPerView:'auto',
		simulateTouch:true
	});
	var speedSwiper = $('#speed > div.swiper-nav').swiper({
		visibilityFullFit: true,
		slidesPerView:'auto',
		simulateTouch:true
	});
});

// Hash 發生改變時...
$(window).on('hashchange', function(){ console.log('hashchange -> '+hash);
	setHash();
	return false;
});

// 進入 Results
$(document).on('click', '#results_btn', function(){
	 getVoteResults(this, JSON.parse(localStorage.sInfo));
});

// 離開 Results
$(document).on('click', '#results-box div.title', function(){
	$(this).parents('#results-box').hide();
	goBack();
});

// 送出 Text
$(document).on('click', '#text', function(){
	var text = $(this).prev().prev().val().trim() || null;
	if( text !== null ){
		$(this).prev().prev().val('');
		sendText(this, JSON.parse(localStorage.sInfo), text);
	}else{
		alert('未填寫問題。');
	}
});

// 按下 Enter : 送出 Text
$(document).on('keypress', '#footer input', function(e){
	if( e.keyCode === 13 ){
		$(this).siblings('#text').trigger('click');
		return false;
	}
});

// 送出 Mood
$(document).on('click', '#mood div.swiper-slide', function(){
	sendMood(this, JSON.parse(localStorage.sInfo));
});

// 送出 Speed
$(document).on('click', '#speed div.swiper-slide', function(){
	sendSpeed(this, JSON.parse(localStorage.sInfo));
});

// Posting : 切換
$(document).on('click', '#posting_btn', function(){
	if( $(this).hasClass('actived') ){  // close Posting
		$(this).removeClass('actived').parents('#footer').siblings('#posting').animate({'bottom': '-191px'}, 300).end().siblings('#posting-overlay').hide();
	}else{  // open Posting
		$(this).addClass('actived').parents('#footer').siblings('#posting').animate({'bottom': '41px'}, 300).end().siblings('#posting-overlay').show();
	}
});

// Posting : 關閉
$(document).on('click', '#posting-overlay', function(){
	$(this).siblings('#footer').find('#posting_btn').trigger('click');
	return false;
});

// Vote Box : Click 選項清單
$(document).on('click', '#sel-vote > div.ui.label', function(){
	if( $(this).hasClass('checked') ){
		$(this).removeClass('checked');
	}else{
		if( $(this).parents('#vote-box').attr('_type') === 'single' ){
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

// Vote Box : 提交答案
$(document).on('click', '#vote-box div.done', function(){
	var $a = $(this).parent().siblings('article').find('#sel-vote').children('div.checked'), answerAry = [];
	if( $a[0] ){
		for( var i=0, iLen=$a.length; i<iLen; i++ ){
			answerAry.push( parseInt( $a[i].getAttribute('_answer') ) );
		}
		// 更新 FireBase 的答案資訊
		sentAnswer(answerAry, JSON.parse(localStorage.sInfo));
	}else{
		alert('未選擇答案。');
	}
});

// 處理 Hash 
function setHash(){
	hash = location.hash.replace(/\#\//,'');
	switch( hash ){
		case 'results-box':
			$('#results_btn').trigger('click');
			return false;
			break;
		default:
			hash = 'iLecture-Student';
			// 利用 sessionStorage 來判斷返回操作是 history back，還是導向 student/index,html
			sessionStorage.setItem('isValidity', 'iLecture-Student');
			$('#container').siblings('#results-box').hide();
			break;
	}
	console.log('setHash -> '+hash);
}

// 回到前一頁
function goBack(){
	var isBackValid = sessionStorage.isValidity || null;
	if( isBackValid === 'iLecture-Student' ){
		window.history.back();
	}else{
		window.location.replace('./index.html?'+JSON.parse(localStorage.sInfo).params);
	}
}

// 新增 Message
function addMessage(mode, e, val, time, sId){
	var $a = $(e).parents('body').children('#container');
	if( mode === 'Text' ){
		$(e).prev().prev().val('');
		$a.children('#message').children().append(getMessagesHtml('Text', val, time, sId));
	}else if( mode === 'Mood' ){
		$a.children('#message').children().children('div.item.mood').remove().end().append(getMessagesHtml('Mood', val, time, sId));
	}else if( mode === 'Speed' ){
		$a.children('#message').children().children('div.item.speed').remove().end().append(getMessagesHtml('Speed', val, time, sId));
	}
	$a.animate({scrollTop: $a.prop('scrollHeight')}, 500).siblings('#footer').find('#posting_btn').removeClass('actived').end().siblings('#posting').animate({'bottom': '-191px'}, 300).end().siblings('#posting-overlay').hide();
}

// Messages : 顯示資訊(剛載入網頁時)
function showLogs(sLog, sInfo){
	var html = '';
	for( var i=0, aryLen = sLog.length; i<aryLen; i++ ){
		var sId = Object.keys(sLog[i]);
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
	$('#message > div').html(html);
	// scrolling 滑到最下面
	var $a = $('#container');
	$a.animate({scrollTop: $a.prop('scrollHeight')}, 500);
}

// 顯示 : Vote Box 介面
function showVote(o_ques){
	var typeNmae = ( o_ques.type === 'single' ) ? '單選' : '多選', titleNmae = ( o_ques.title === '' ) ? '注意老師的問題' : o_ques.title;
	$('#vote-box').attr('_type', o_ques.type).show().siblings('#results-box').hide().end().find('div.title').text(typeNmae).parent().siblings('article').children().children('#question').text(titleNmae).end().find('#sel-vote').html(getSelectionsHtml(parseInt(o_ques.num)));
}

// 關閉 : Vote Box 介面
function closeVote(){
	$('#vote-box').hide();
}

// 產生不同型式 Messages 的 DOM
function getMessagesHtml(mode, val, time, sId){
	if( mode === 'Mood' ){
		var html = '<div class="item mood" _sId='+sId+'>'+
			'<img src="../image/mood_'+val+'.png">'+
			'<div class="time">'+time+'</div>'+
		'</div>';
	}else if( mode === 'Speed' ){
		var html = '<div class="item speed" _sId='+sId+'>'+
			'<img src="../image/speed_'+val+'.png">'+
			'<div class="time">'+time+'</div>'+
		'</div>';
	}else if( mode === 'Text' ){
		var html = '<div class="item" _sId='+sId+'>';
		html += ( sId === 'teacher' ) ? '<div class="">'+sId+'</div><div class="ui segment" style="margin: 0;background: #38B1D8;color: white;">' : '<div class="ui segment" style="margin: 0;">';
		html +=	'<p>'+val+'</p>'+
				'<div class="time">'+time+'</div>'+
			'</div>'+
		'</div>';
	}
	return html;
}

// 投票結果 : 畫出長條圖
function drawBarChart(e, resultAry){
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
	// 顯示 results-box
	$(e).parents('#header').siblings('#results-box').show();
	$.address.value('results-box');
	
	window.myBar = new Chart(ctx).Bar(barChartData, {
		responsive : true,
		showTooltips: false,
	});
}

// 產生 Selections 的 DOM
function getSelectionsHtml(num){
	var html = '';
	for( var i=1; i<=num; i++ ){ html += '<div class="ui label" _answer="'+i+'">'+mapLetter(i)+'</div>'; }
	html += '<div class="ui label" _answer="0">沒意見</div>';
	return html;
}

// 取得該選項相對應的英文編號
function mapLetter(a){
	var map = ['沒意見','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
	return map[a];
}
