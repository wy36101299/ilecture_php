initCount = 0;
// 檢查 Auth 是否正確
function checkAuth(tInfo, auth){
	$.ajax({  
		url: '../php/teacher_db.php',
		data:{'action': 'checkAuth','roomsId': tInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');
			// msg[1] : auth
			// no roomCode is that code product by php
			if (msg[1] !== "") {
				if ( msg[1] === auth ) {
					tInfo.params = 'room_id='+tInfo['roomId']+'&code='+tInfo['roomCode']+'&auth='+auth;
					localStorage.setItem('tInfo', JSON.stringify(tInfo));
					// 初始化 DB 的一些資訊
					init(tInfo);
				}else{
					alert('參數錯誤。');
					window.location.replace('../error/index.html');					
				}				
			}else{
				alert('找不到房間。');
				window.location.replace('../error/index.html');
			}
		},
		error:function(xhr, ajaxOptions, thrownError){ 
			console.log(xhr.status); 
			console.log(thrownError);
		}
	});	
}

//開始監聽 FireBase上 該房間的資訊
function bindRoom(tInfo){
	$.ajax({  
		url: '../php/teacher_db.php',
		data:{'action': 'tea_bindRoom','roomId':tInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');
			console.log('bindRoom')
			console.log(msg)
			console.log(msg[0])
			if( msg[0].trim() === 'mood' ){  // Key 更新 : Mood
				setMoodInfo( $('#roomInfo nav'), JSON.parse( msg[1] ).mood );
			}else if( msg[0].trim() === 'speed' ){  // Key 更新 : Speed
				setSpeedInfo( $('#roomInfo nav'), JSON.parse( msg[1] ).speed );
			}else if( msg[0].trim() === 'messages' ){ // Key 更新 : Messages
				addMessages( tInfo, JSON.parse( msg[1] ).messages );
			}else if( msg[0].trim() === 'question' ){  // Key 更新 : 某個 Question
				var tInfo = JSON.parse(localStorage.tInfo), qId = tInfo.qAry[0];
				if( JSON.parse( msg[1] ).question === qId ){  // 取得投票的結果
					console.log( JSON.parse( msg[1] )[qId] );
					localStorage.setItem('tlatestQuesInfo', JSON.parse( msg[1] )[qId] );
					setResult( JSON.stringify(JSON.parse( msg[1] )[qId]) );
				}
			}else if( msg[0].trim() === 'online_s' ){  // Key 更新 : online_s
				console.log('online_s')
				updateOnline_s();
			}else if( msg[0].trim() === 'sName' ){  // Key 更新 : sName
				console.log('sName')
				getLog(JSON.parse(localStorage.tInfo));
			}
		},
		error:function(xhr, ajaxOptions, thrownError){ 
			console.log(xhr.status); 
			console.log(thrownError);
		}
	});
}

// 更新 Student 連線者名單
function updateOnline_s(){ console.log('Update : online_s !');
	var tInfo = JSON.parse( localStorage.tInfo ), roomId = tInfo.roomId, num = 0;
	$.ajax({  
		url: '../php/index.php',
		data:{'action': 'getroomvalue','roomId':tInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');
			var ary = JSON.parse( msg[1] ).online_s || null, newAry = [], num = 0, now = timestamp.get().num;
			if( ary !== null ){  // Student 連線人數不為空
				for( var i=0, aryLen = ary.length; i<aryLen; i++ ){
					for( var key in ary[i] ){
						// 刪除超過15秒未繼續連線的 Students -> 亦即他們不在線上
						if( Math.abs( now - parseInt(ary[i][key]) ) > 15*1000 ){
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
			$.ajax({  
				url: '../php/teacher_db.php',
				data:{'action': 'setonline_s','online_s':JSON.stringify(newAry)},
				type: 'POST',
				dataType: 'html',
				success: function(msg){
					msg = msg.split('@@');
					if( msg[1]==="" ){
						alert('Synchronization failed');
						$('body').removeClass('blur');
					}else{
						$('#show-onlineNum, #online-monitor').text(num);
						tInfo.online_s = num;
						localStorage.setItem('tInfo', JSON.stringify(tInfo));
						initIsCompleted();
					}
				},
				error:function(xhr, ajaxOptions, thrownError){ 
					console.log(xhr.status); 
					console.log(thrownError);
				}
			});	
		},
		error:function(xhr, ajaxOptions, thrownError){ 
			console.log(xhr.status); 
			console.log(thrownError);
		}
	});
}

// 初始化 DB 的一些資訊
function init(tInfo){
	// 更新在線人數的資訊
	updateOnline_s();
	// 開始監聽 FireBase上 該房間的資訊 1s
	setInterval(function(){bindRoom(tInfo)},1000);
	// 抓取 Messages
	getLog(tInfo);
	// 抓取「最新的問題」
	getLatestQuestion(tInfo);
}

// 抓取「最新的問題」
function getLatestQuestion(tInfo){
	$.ajax({  
		url: '../php/index.php',
		data:{'action': 'getroomvalue','roomId':tInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');
			if( JSON.parse( msg[1] ).question !== null ){ // 這間 room -> 曾經發問過問題
					qId = tInfo.qAry[0];
					localStorage.setItem('tlatestQuesInfo', JSON.parse( msg[1] )[qId]);
					setResult( JSON.stringify(JSON.parse( msg[1] )[qId]) );
					$('#roomResult').removeClass('null');
					initIsCompleted();
			}else{
				localStorage.setItem('tlatestQuesInfo', JSON.stringify(''));
				initIsCompleted();
			}
		},
		error:function(xhr, ajaxOptions, thrownError){ 
			console.log(xhr.status); 
			console.log(thrownError);
		}
	});	
}

// 初始化所有的 EasyPieChart
function initPieChart(roomId, _){
	$a = $('#roomInfo nav'), size = 75;
	$a.find('div.chart-canvas').easyPieChart({
		lineWidth: 10,
		size: size,
		barColor: 'rgb(241,196,15)',
		trackColor: 'rgba(255,255,255,.2)',
		animate: 1500,
		scaleColor: !1,
		lineCap: 'square'
	});
	$.ajax({  
		url: '../php/teacher_db.php',
		data:{'action': 'initPieChart','roomId':roomId},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');
			setMoodInfo($a, msg[1]);
			setSpeedInfo($a, msg[2]);
		},
		error:function(xhr, ajaxOptions, thrownError){ 
			console.log(xhr.status); 
			console.log(thrownError);
		}
	});	
}

// 設置 Mood 的百分比
function setMoodInfo($a, a){
	var scores = parseInt(a.split('_')[0]), times = parseInt(a.split('_')[1]), percent = ( times === 0 ) ? 0 : Math.floor(100*((scores+3*times))/(6*times));
	$a.find('div[pieChart=mood]').children('div.chart-number').text(percent+'%').end().children('div.chart-canvas').attr('data-percent', percent).data('easyPieChart').update(percent);
	$('#mood-monitor').text(percent+'%');
}

// 設置 Speed 的百分比
function setSpeedInfo($a, a){
	var scores = parseInt(a.split('_')[0]), times = parseInt(a.split('_')[1]), percent = ( times === 0 ) ? 0 : Math.floor(100*((scores+3*times))/(6*times));
	$a.find('div[pieChart=speed]').children('div.chart-number').text(percent+'%').end().children('div.chart-canvas').attr('data-percent', percent).data('easyPieChart').update(percent);
	$('#speed-monitor').text(percent+'%');
}

// 取得 Message's logs
function getLog(tInfo){
	$.ajax({  
		url: '../php/index.php',
		data:{'action': 'getroomvalue','roomId':tInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');
			var ary = JSON.parse( msg[1] ).messages || null, tLog = [];
				if( ary !== null ){
					for( var i=0, aryLen = ary.length; i<aryLen; i++ ){
						tLog.unshift(ary[i]);
					}
				}
				showLogs(tLog, tInfo);
				initIsCompleted();
				console.log( tLog );
		},
		error:function(xhr, ajaxOptions, thrownError){ 
			console.log(xhr.status); 
			console.log(thrownError);
		}
	});	
}

// 產生 Question 並傳送到 FireBase
function createQuestion(e, title, tInfo, num){
	$('body').addClass('blur');
	var o_ques = {
		title : title,
		num : num,
		type : $(e).parents('#roomQues').attr('_type'),
		count: 0,
		s : [],
		answer : []
	}, qId = 'q_'+timestamp.get().num;
	tInfo.qAry.unshift( qId );
	console.log(o_ques.answer);
	json_ques = JSON.stringify(o_ques);
	$.ajax({  
		url: '../php/teacher_db.php',
		data:{'action': 'createQuestion','roomId':tInfo['roomId'],'qId':qId,'o_ques':json_ques},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');
			// creat question and update qid in php
			if(msg[1]===""){
				alert('Synchronization failed');
				$('body').removeClass('blur');
			}else{
				localStorage.setItem('tInfo', JSON.stringify(tInfo));
				localStorage.setItem('tlatestQuesInfo', json_ques);
				$('body').removeClass('blur');
				setResult(json_ques);
				$('#navigation').find('section.mobile > div[_nav=roomResult]').trigger('click');
			}
		},
		error:function(xhr, ajaxOptions, thrownError){ 
			console.log(xhr.status); 
			console.log(thrownError);
		}
	});	
}

// 老師回覆 : 送出 Text
function sendText(e, tInfo, text){
	$('body').addClass('blur');
	$.ajax({  
		url: '../php/index.php',
		data:{'action': 'getroomvalue','roomId':tInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');
			var ary = JSON.parse( msg[1] ).messages || null, o_send = {}, time = timestamp.get().read;
			o_send['teacher'] = 'text_'+time+'_'+text;
			if( ary === null ){
				ary = [];
				ary.push(o_send);
			}else{
				ary.unshift(o_send);
			}
			console.log(ary);			
			$.ajax({  
				url: '../php/index.php',
				data:{'action': 'setmessages','roomId':tInfo['roomId'],'messages':JSON.stringify(ary)},
				type: 'POST',
				dataType: 'html',
				success: function(msg){
					if( msg[1] === ""){
						alert('Synchronization failed');
						$('body').removeClass('blur');
					}else{
						$('body').removeClass('blur');
						$(e).siblings('div.input').children().val('');
					}
				$('body').removeClass('blur');
				$(e).siblings('div.input').children().val('');
				},
				error:function(xhr, ajaxOptions, thrownError){ 
					console.log(xhr.status); 
					console.log(thrownError);
				}
			});	
		},
		error:function(xhr, ajaxOptions, thrownError){ 
			console.log(xhr.status); 
			console.log(thrownError);
		}
	});
}

// 若 init() 裡面的非同步資訊都初始化完成 -> initCount = -1
function initIsCompleted(){
	if( initCount !== -1 ){
		console.log('initCount -> '+initCount);
		initCount++;
		if( initCount === 3 ){
			// 初始化完成
			initCount = -1;
			$('body').removeClass('blur');
		}
	}
}
