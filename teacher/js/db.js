var myRootRef = new Firebase('https://ilecture.firebaseio.com/');

// 檢查 Auth 是否正確
function checkAuth(tInfo, auth){
	var authRef = myRootRef.child('rooms').child(tInfo['roomId']).child('auth');
	authRef.once('value', function(data){
		console.log( auth );
		console.log( data.val() );
		if( data.val() !== auth ){
			window.location.replace('../error.html');
		}else{
			tInfo.params = 'room_id='+tInfo['roomId']+'&code='+tInfo['roomCode']+'&auth='+auth;
			localStorage.setItem('tInfo', JSON.stringify(tInfo));
			// 更新在線人數的資訊
			updateOnline_s();
			// 開始監聽 FireBase上 該房間的資訊
			bindRoom(tInfo);
			// 抓取 Messages
			getLog(tInfo);
		}
	});
}

// 開始監聽 FireBase上 該房間的資訊
function bindRoom(tInfo){
	var roomRef = myRootRef.child('rooms').child(tInfo['roomId']);
	roomRef.on('child_changed', function(snapshot, prevChildName){
		console.log(snapshot.name());
		if( snapshot.name() === 'mood' ){  // Key 更新 : Mood
			setMoodInfo( $('#pieChart'), snapshot.val() );
		}else if( snapshot.name() === 'speed' ){  // Key 更新 : Speed
			setSpeedInfo( $('#pieChart'), snapshot.val() );
		}else if( snapshot.name() === 'messages' ){  // Key 更新 : Messages
			addMessages( tInfo, JSON.parse( snapshot.val() ) );
		}else if( snapshot.name().indexOf('_') === 1 ){  // Key 更新 : 某個 Question
			var tInfo = JSON.parse(localStorage.tInfo), qId = tInfo.qAry.shift();
			if( snapshot.name() === qId ){  // 取得投票的結果
				console.log(snapshot.val());
				var o_ques = JSON.parse(snapshot.val()), answerAry = o_ques.answer.sort(), resultAry = [], current = null, count = 0;
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
		}else if( snapshot.name() === 'online_s' ){  // Key 更新 : online_s
			updateOnline_s();
		}
	});
}

// 更新 Student 連線者名單
function updateOnline_s(){ console.log('Update : online_s !');
	var tInfo = JSON.parse( localStorage.tInfo ), roomId = tInfo.roomId, num = 0, online_sRef = myRootRef.child('rooms').child(roomId).child('online_s');
	online_sRef.once('value', function(data){
		var ary = JSON.parse(data.val()) || null, newAry = [], num = 0, now = timestamp.get().num;
		if( ary !== null ){  // Student 連線人數不為空
			for( var i=0, aryLen = ary.length; i<aryLen; i++ ){
				for( var key in ary[i] ){
					if( Math.abs( now - parseInt(ary[i][key]) ) > 1.5*60*1000 ){
						// 從連線者名單移除 offline 的 Student
						console.log('offline student -> '+key);
					}else{
						// newAry : 新的連線者名單
						newAry.push(ary[i]);
						num++;
					}
					break;
				}
			}
		}
		//console.log(newAr );
		online_sRef.set(JSON.stringify(newAry));
		$('#container span[_online=num], #linkRoom-box span[_online=num]').text(num);
		tInfo.online_s = num;
		localStorage.setItem('tInfo', JSON.stringify(tInfo));
	});
}

// 初始化所有的 EasyPieChart
function initPieChart(roomId){
	var roomRef = myRootRef.child('rooms').child(roomId), $a = $('#pieChart');
	$('#pieChart div.chart, #linkRoom-box div.chart').easyPieChart({
		lineWidth: 15,
		size: 218,
		barColor: '#38B1D8',
		trackColor: '#f2f2f2',
		animate: 1400,
		scaleColor: !1,
		lineCap: 'square'
	});
	roomRef.child('mood').once('value', function(data){ setMoodInfo($a, data.val()); });
	roomRef.child('speed').once('value', function(data){ setSpeedInfo($a, data.val()); });
}

// 設置 Mood 的百分比
function setMoodInfo($a, a){
	var scores = parseInt(a.split('_')[0]), times = parseInt(a.split('_')[1]), percent = ( times === 0 ) ? 0 : Math.floor(100*((scores+3*times))/(6*times));
	$a.find('div[pieChart=mood]').attr('data-percent', percent).find('span.chart-number').text(percent+'%').end().data('easyPieChart').update(percent);
}

// 設置 Speed 的百分比
function setSpeedInfo($a, a){
	var scores = parseInt(a.split('_')[0]), times = parseInt(a.split('_')[1]), percent = ( times === 0 ) ? 0 : Math.floor(100*((scores+3*times))/(6*times));
	$a.find('div[pieChart=speed]').attr('data-percent', percent).find('span.chart-number').text(percent+'%').end().data('easyPieChart').update(percent);
}

// 新增 Message
function addMessages(tInfo, tLog){
	var sId = Object.keys(tLog[0]);
	if( tLog[0][sId].split('_')[0] === 'mood' ){
		$('#message').children().children('div.item.mood[_sid='+sId+']').remove().end().append(getMessagesHtml('Mood', tLog[0][sId].substr(25), tLog[0][sId].split('_')[1], sId));
	}else if( tLog[0][sId].split('_')[0] === 'speed' ){
		$('#message').children().children('div.item.speed[_sid='+sId+']').remove().end().append(getMessagesHtml('Speed', tLog[0][sId].substr(26), tLog[0][sId].split('_')[1], sId));
	}else if( tLog[0][sId].split('_')[0] === 'text' ){
		$('#message').children().append(getMessagesHtml( 'Text', tLog[0][sId].substr(25), tLog[0][sId].split('_')[1] , sId));
	}
	// scrolling 滑到最下面
	var $a = $('#sidebar-message').children('section');
	$a.animate({scrollTop: $a.prop('scrollHeight')}, 500);
}

// 取得 Message's logs
function getLog(tInfo){
	var messagesRef = myRootRef.child('rooms').child(tInfo['roomId']).child('messages');
	messagesRef.once('value', function( data ){
		var ary = JSON.parse(data.val()) || null, tLog = [];
		if( ary !== null ){
			for( var i=0, aryLen = ary.length; i<aryLen; i++ ){
				tLog.unshift(ary[i]);
			}
		}
		$(function(){ showLogs( tLog, tInfo ); });
		console.log( tLog );
	});
}

// 產生 Question 並傳送到 FireBase
function createQuestion(e, tInfo){
	var o_ques = {
		title : $(e).parent().siblings('div.content').find('#text-question').val().trim(),
		num : $(e).attr('_sel'),
		type : $(e).parent().attr('_type'),
		count: 0,
		answer : []
	}, qId = 'q_'+timestamp.get().num;
	tInfo.qAry = [];
	tInfo.qAry.unshift( qId );
	console.log( tInfo );
	console.log( tInfo.qAry );
	localStorage.setItem('tInfo', JSON.stringify(tInfo));
	var roomRef = myRootRef.child('rooms').child(tInfo['roomId']);
	roomRef.child(qId).set( JSON.stringify(o_ques) );
	roomRef.child('question').set( qId );
}

// 老師回覆 : 送出 Text
function sendText(e, tInfo, text){
	var messagesRef = myRootRef.child('rooms').child(tInfo['roomId']).child('messages');
	messagesRef.once('value', function( data ){
		var ary = JSON.parse(data.val()) || null, o_send = {}, time = timestamp.get().read, $a = $(e).parents('#sidebar-message').children('section');
		o_send['teacher'] = 'text_'+time+'_'+text;
		if( ary === null ){
			ary = [];
			ary.push(o_send);
		}else{
			ary.unshift(o_send);
		}
		console.log(ary);
		messagesRef.set(JSON.stringify(ary));
		$(e).prev().val('');
		$a.animate({scrollTop: $a.prop('scrollHeight')}, 500);
	});
}

// 取得投票的結果
function getResult(tInfo){
	var roomRef = myRootRef.child('rooms').child(tInfo['roomId']), qId = tInfo.qAry.shift();
	roomRef.child(qId).once('value', function(data){
		var o_ques = JSON.parse(data.val()), answerAry = o_ques.answer.sort(), resultAry = [], current = null, count = 0;
		console.log( o_ques );
		for( var i=0, iLen=o_ques.num; i<iLen; i++ ){
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
		console.log( answerAry );
		console.log( resultAry );
		drawBarChart(resultAry);
	});
}