// 開始監聽 FireBase上 該房間的資訊
// function bindRoom(sInfo){
// 	var roomRef = myRootRef.child('rooms').child(sInfo['roomId']);
// 	roomRef.on('child_changed', function(snapshot, prevChildName){
// 		if( snapshot.name() === 'question' ){ // Teacher 有提出問題
// 			console.log(snapshot.val());
// 			sInfo.qAry = [];
// 			sInfo.qAry.unshift(snapshot.val());
// 			localStorage.setItem('sInfo', JSON.stringify(sInfo));
// 			roomRef.child(snapshot.val()).once('value', function(data){
// 				showVote(JSON.parse(data.val()));
// 			});
// 		}else if( snapshot.name() === 'messages' ){  // Key 更新 : Messages
// 			var message = JSON.parse(snapshot.val());
// 			if( message[0]['teacher'] ){
// 				var $a = $('#container');
// 				$a.children().children().append(getMessagesHtml('Text', message[0]['teacher'].substr(25), message[0]['teacher'].split('_')[1] , 'teacher'));
// 				$a.animate({scrollTop: $a.prop('scrollHeight')}, 500);
// 			}
// 		}
// 	});
// }

// 
// function getVoteResults(e, sInfo){
// 	var roomRef = myRootRef.child('rooms').child(sInfo['roomId']), sId = sInfo.sId, qId = sInfo.qAry[0] || null;
// 	if( qId !== null){
// 		roomRef.child(qId).once('value', function(data){
// 			var o_ques = JSON.parse(data.val()), answerAry = o_ques.answer.sort(), resultAry = [], current = null, count = 0;
// 			for( var i=0, iLen=o_ques.num; i<=iLen; i++ ){
// 				resultAry[i] = 0;
// 			}
// 			for( var i=0, iLen=answerAry.length; i<iLen; i++ ){
// 				if( answerAry[i] != current ){
// 					if( count > 0 ){
// 						resultAry[current] = count;
// 					}
// 					current = answerAry[i];
// 					count = 1;
// 				}else{
// 					count++;
// 				}
// 			}
// 			if( count > 0 ){
// 				resultAry[current] = count;
// 			}
// 			console.log(answerAry);
// 			console.log(resultAry);
// 			// 顯示投票的結果
// 			drawBarChart(e, resultAry);
// 		});
// 	}else{  // 沒有任何問題時...
// 		drawBarChart(e, [0]);
// 	}
// }

// // 更新連線狀態
// function updateState(sInfo){
// 	var online_sRef = myRootRef.child('rooms').child(sInfo['roomId']).child('online_s');
// 	online_sRef.once('value', function(data){
// 		var ary = JSON.parse(data.val()) || null, o_state = {}, count = -1;
// 		o_state[sInfo['sId']] = timestamp.get().num;
// 		if( ary !== null ){
// 			for( var i=0, aryLen = ary.length; i<aryLen; i++ ){
// 				// 尋找是否有就得連線狀態 ? 更新並覆寫 : push，用 count 來判斷
// 				if( sInfo['sId'] in ary[i] ){
// 					ary[i] = o_state;
// 					count = 1;
// 					break;
// 				}
// 			}
// 			if( count < 0 ){
// 				ary.push(o_state);
// 			}
// 		}else{
// 			ary = [];
// 			ary.push(o_state);
// 		}
// 		console.log( ary );
// 		online_sRef.set(JSON.stringify(ary));
// 	});
// 	// 每「10秒」更新一次
// 	setTimeout(function(){ updateState(sInfo); }, 1*10*1000);
// }

// 送出 Mood
function sendMood(e, sInfo){
	$.ajax({  
		url: '../php/student_db.php',
		data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			console.log(msg);
			msg = msg.split('@@');
			var ary = JSON.parse(JSON.parse( msg[1] ).messages) || null, o_send = {}, count = -1, time = timestamp.get().read, oldScores = 0, nowScores = parseInt($(e).attr('_mood')), newTimes = 1;
			o_send[sInfo['sId']] = 'mood_'+time+'_'+nowScores;
			if( ary !== null ){
				for( var i=0, aryLen = ary.length; i<aryLen; i++ ){
					// 尋找是否已經有送出過 Mood ? 覆寫 : unshift，用 count 來判斷
					if( sInfo['sId'] in ary[i] ){
						console.log( ary[i][sInfo['sId']] );
						if( ary[i][sInfo['sId']].split('_')[0] === 'mood' ){
							oldScores = parseInt(ary[i][sInfo['sId']].split('_')[2]);
							newTimes = 0;
							for( var j=i; j>0; j-- ){
								ary[j] = ary[j-1];
							}
							ary[0] = o_send;
							count = 1;
							break;
						}
					}
				}
				if( count < 0 ){
					ary.unshift(o_send);
				}
			}else{
				ary = [];
				ary.push(o_send);
			}
			$.ajax({  
				url: '../php/student_db.php',
				data:{'action': 'setmessages','roomId':sInfo['roomId'],'messages':JSON.stringify(ary)},
				type: 'POST',
				dataType: 'html',
				success: function(msg){
					console.log(msg);
					addMessage('Mood', e, nowScores, time, sInfo['sId']);
				},
				error:function(xhr, ajaxOptions, thrownError){ 
					console.log(xhr.status); 
					console.log(thrownError);
				}
			});	
			$.ajax({  
				url: '../php/student_db.php',
				data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
				type: 'POST',
				dataType: 'html',
				success: function(msg){
					console.log(msg);
					msg = msg.split('@@');
					var scores = parseInt(JSON.parse( msg[1] ).mood.split('_')[0]) - oldScores + nowScores, times = parseInt(msg[1].split('_')[1]) + newTimes;
					scores = scores+'_'+times;
					$.ajax({  
						url: '../php/student_db.php',
						data:{'action': 'updateMood','roomId':sInfo['roomId'],'score':scores},
						type: 'POST',
						dataType: 'html',
						success: function(msg){
							console.log(msg);
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
		},
		error:function(xhr, ajaxOptions, thrownError){ 
			console.log(xhr.status); 
			console.log(thrownError);
		}
	});	
}

// 送出 Speed
function sendSpeed(e, sInfo){
	$.ajax({  
		url: '../php/student_db.php',
		data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			console.log(msg);
			msg = msg.split('@@');
			var ary = JSON.parse(JSON.parse( msg[1] ).messages) || null, o_send = {}, count = -1, time = timestamp.get().read, oldScores = 0, nowScores = parseInt($(e).attr('_speed')), newTimes = 1;
			o_send[sInfo['sId']] = 'speed_'+time+'_'+nowScores;
			if( ary !== null ){
				for( var i=0, aryLen = ary.length; i<aryLen; i++ ){
					// 尋找是否已經有送出過 Speed ? 覆寫 : unshift，用 count 來判斷
					if( sInfo['sId'] in ary[i] ){
						console.log( ary[i][sInfo['sId']] );
						if( ary[i][sInfo['sId']].split('_')[0] === 'speed' ){
							oldScores = parseInt(ary[i][sInfo['sId']].split('_')[2]);
							newTimes = 0;
							for( var j=i; j>0; j-- ){
								ary[j] = ary[j-1];
							}
							ary[0] = o_send;
							count = 1;
							break;
						}
					}
				}
				if( count < 0 ){
					ary.unshift(o_send);
				}
			}else{
				ary = [];
				ary.push(o_send);
			}
			$.ajax({  
				url: '../php/student_db.php',
				data:{'action': 'setmessages','roomId':sInfo['roomId'],'messages':JSON.stringify(ary)},
				type: 'POST',
				dataType: 'html',
				success: function(msg){
					console.log(msg);
					addMessage('Speed', e, nowScores, time, sInfo['sId']);
				},
				error:function(xhr, ajaxOptions, thrownError){ 
					console.log(xhr.status); 
					console.log(thrownError);
				}
			});	
			$.ajax({  
				url: '../php/student_db.php',
				data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
				type: 'POST',
				dataType: 'html',
				success: function(msg){
					console.log(msg);
					msg = msg.split('@@');
					var scores = parseInt(JSON.parse( msg[1] ).speed.split('_')[0]) - oldScores + nowScores, times = parseInt(msg[1].split('_')[1]) + newTimes;
					scores = scores+'_'+times;
					$.ajax({  
						url: '../php/student_db.php',
						data:{'action': 'updateSpeed','roomId':sInfo['roomId'],'score':scores},
						type: 'POST',
						dataType: 'html',
						success: function(msg){
							console.log(msg);
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
		},
		error:function(xhr, ajaxOptions, thrownError){ 
			console.log(xhr.status); 
			console.log(thrownError);
		}
	});	
}


// 送出 Text
function sendText(e, sInfo, text){
	$.ajax({  
		url: '../php/student_db.php',
		data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			console.log(msg);
			msg = msg.split('@@');

			var ary = JSON.parse(JSON.parse( msg[1] ).messages) || null, o_send = {}, time = timestamp.get().read;
			o_send[sInfo['sId']] = 'text_'+time+'_'+text;
			if( ary === null ){
				ary = [];
				ary.push(o_send);
			}else{
				ary.unshift(o_send);
			}
			console.log(ary);
			$.ajax({  
				url: '../php/student_db.php',
				data:{'action': 'setmessages','roomId':sInfo['roomId'],'messages':JSON.stringify(ary)},
				type: 'POST',
				dataType: 'html',
				success: function(msg){
					console.log(msg);
					addMessage('Text', e, text, time, sInfo['sId']);
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

// 取得 Message's logs
function getLog(sInfo){
	$.ajax({  
		url: '../php/student_db.php',
		data:{'action': 'getmessages','roomId':sInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			console.log(msg);
			msg = msg.split('@@');
			var ary = JSON.parse(JSON.parse( msg[1] ).messages) || null, sLog = [];
			if( ary !== null ){
				for( var i=0, aryLen = ary.length; i<aryLen; i++ ){
					if( sInfo['sId'] in ary[i] || 'teacher' in ary[i] ){
						sLog.unshift(ary[i]);
					}
				}
			}
			console.log(sLog);
			$(function(){ showLogs(sLog, sInfo); });
		},
		error:function(xhr, ajaxOptions, thrownError){ 
			console.log(xhr.status); 
			console.log(thrownError);
		}
	});	
}

// // 提交 答案
// function sentAnswer(answerAry, sInfo){
// 	var questionRef = myRootRef.child('rooms').child(sInfo['roomId']).child(sInfo.qAry.shift());
// 	questionRef.once('value', function(data){ console.log(data.val());
// 		var o_ques = JSON.parse(data.val()), o_answer = {};
// 		for( var i=0, iLen=answerAry.length; i<iLen; i++ ){
// 			o_ques.answer.push(answerAry[i]);
// 		}
// 		o_ques.count++;
// 		console.log(o_ques);
// 		questionRef.set(JSON.stringify(o_ques));
// 		closeVote();
// 	});
// }
