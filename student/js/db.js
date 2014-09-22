initCount = 0;
timeVar =0;
// 檢查 room 是否正確
function checkRoom(sInfo){
	$.ajax({  
		url: '../php/index.php',
		data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');
			if ( msg[1] !=="" ) {
				if( JSON.parse( msg[1] ).roomCode === sInfo['roomCode'] ){
					// 初始化 DB 的一些資訊
				init(sInfo);
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

// 開始監聽 FireBase上 該房間的資訊
function bindRoom(sInfo){
	var sInfo = JSON.parse(localStorage.getItem('sInfo'));
	$.ajax({  
		url: '../php/index.php',
		data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');
			// Key 更新 : Messages
			var message = JSON.parse( msg[1] ).messages;
			var localMessage = sInfo.messages;
			if ( JSON.stringify(message) !== JSON.stringify(localMessage) ) {
				if( message[0]['teacher'] ){
					var $a = $('#show-message');
					if( $a.children('div.item:last-child').find('span.timestamp').text() ){ // 若 Messages 不為空
						console.log( compareDateTime($a.children('div.item:last-child').find('span.timestamp').text(), message[0]['teacher'].split('_')[1]) );
						if( !compareDateTime($a.children('div.item:last-child').find('span.timestamp').text(), message[0]['teacher'].split('_')[1]) ){ // 若 new message 沒比較新，則不動作
							console.log('addMessages 不動作');
							return 0;
						}
					}
					$a.append(getMessagesHtml('Text', message[0]['teacher'].substr(25), message[0]['teacher'].split('_')[1], 'teacher'));
					// scrolling 滑到最下面
					var $b = $('#roomMessage').children('section');
					$b.animate({scrollTop: $b.prop('scrollHeight')}, 500);
				}
				sInfo.messages = message;
				localStorage.setItem('sInfo', JSON.stringify(sInfo));
			};	
			// Teacher 有提出問題
			var qId = JSON.parse( msg[1] ).question;
			var localqId = sInfo.question;
			if ( JSON.stringify(qId) != JSON.stringify(localqId) ) {
				sInfo.question = qId;
				localStorage.setItem('sInfo', JSON.stringify(sInfo));
				$.ajax({  
					url: '../php/index.php',
					data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
					type: 'POST',
					dataType: 'html',
					success: function(msg){
						msg = msg.split('@@');
						localStorage.setItem('slatestQuesInfo',JSON.parse( msg[1] )[qId]);
						console.log('// 開始監聽 FireBase上 該房間的資訊')
						console.log(msg)
						console.log(JSON.parse( msg[1] ))
						console.log(qId)
						// match index.js data format
						setQuestion(JSON.stringify(JSON.parse( msg[1] )[qId]));
						setResult(JSON.stringify(JSON.parse( msg[1] )[qId]));
						// 顯示 #roomQues 頁面
						$('#navigation').find('div.item.active').removeClass('active').end().find('[_nav=roomQues]').addClass('active');
						$('#container').children().children('section.active').removeClass('active').end().children('#roomQues').addClass('active');
					},
					error:function(xhr, ajaxOptions, thrownError){ 
						console.log(xhr.status); 
						console.log(thrownError);
					}
				});					
			};
			// Key 更新 : 某個 Question
			console.log(qId)
			if (qId !== null) {
				var o_ques = JSON.parse( msg[1] )[qId];
				var localO_ques = localStorage.getItem('slatestQuesInfo')
				console.log(o_ques)
				console.log(localO_ques)
				if( JSON.stringify(o_ques) !== localO_ques ){  // 取得投票的結果
					localStorage.setItem('slatestQuesInfo', JSON.stringify(o_ques));
					setResult(JSON.stringify(o_ques));
				}							
			}
		},
		error:function(xhr, ajaxOptions, thrownError){ 
			console.log(xhr.status); 
			console.log(thrownError);
		}
	});
}

// 更新連線狀態
function updateState(sInfo){
	$.ajax({  
		url: '../php/index.php',
		data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');

			var _GET = getUrlVars(),
			roomId = _GET['room_id'] || null,
			roomCode = _GET['code'] || null,
			sInfo = JSON.parse(localStorage.sInfo) || null,
			num = 0;
			if( roomId === null || roomCode === null ){
				alert('參數缺失。');
				localStorage.removeItem('sInfo');
				localStorage.removeItem('slatestQuesInfo');
				window.location.replace('../error/index.html');
				return 0;
			}
			if( sInfo.roomCode !== roomCode || sInfo.roomId !== roomId ){
				alert('一個瀏覽器，只能夠同時使用一間教室。');
				window.location.replace('../error/index.html');
				return 0;
			}
			var ary = JSON.parse( msg[1] ).online_s || null, o_state = {}, count = -1;
			o_state[sInfo['sId']] = timestamp.get().num;
			if( ary !== null ){
				for( var i=0, aryLen=ary.length; i<aryLen; i++ ){
					// 尋找是否有就得連線狀態 ? 更新並覆寫 : push，用 count 來判斷
					if( Object.keys(ary[i])[0].split('-')[0] === sInfo['sId'].split('-')[0] ){
						ary[i] = o_state;
						count = 1;
						break;
					}
				}
				if( count < 0 ){
					ary.push(o_state);
				}
			}else{
				ary = [];
				ary.push(o_state);
			}
			$.ajax({  
				url: '../php/student_db.php',
				data:{'action': 'updateState','roomId':sInfo['roomId'],'online_s':JSON.stringify(ary)},
				type: 'POST',
				dataType: 'html',
				success: function(msg){
					initIsCompleted();
					// 每「10秒」更新一次
					timeVar = setTimeout(function(){ updateState(JSON.parse(localStorage.sInfo)); }, 1*10*1000);
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

// 送出 Mood
function sendMood(e, sInfo){
	$('body').addClass('blur');
	$.ajax({  
		url: '../php/index.php',
		data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');
			var ary = JSON.parse( msg[1] ).messages || null, o_send = {}, count = -1, time = timestamp.get().read, oldScores = 0, nowScores = parseInt($(e).attr('_mood')), newTimes = 1;
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
			console.log( ary );
			$.ajax({  
				url: '../php/index.php',
				data:{'action': 'setmessages','roomId':sInfo['roomId'],'messages':JSON.stringify(ary)},
				type: 'POST',
				dataType: 'html',
				success: function(msg){
					if ( msg[1]==="") {
						alert('Synchronization failed');
						$('body').removeClass('blur');
					}else{
						$.ajax({  
							url: '../php/index.php',
							data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
							type: 'POST',
							dataType: 'html',
							success: function(msg){
								msg = msg.split('@@');
								var scores = parseInt(JSON.parse( msg[1] ).mood.split('_')[0]) - oldScores + nowScores, times = parseInt(JSON.parse( msg[1] ).mood.split('_')[1]) + newTimes;
								scores = scores+'_'+times;
								$.ajax({  
									url: '../php/student_db.php',
									data:{'action': 'updateMood','roomId':sInfo['roomId'],'score':scores},
									type: 'POST',
									dataType: 'html',
									success: function(msg){
										msg = msg.split('@@');
										if ( msg[1]==="") {
											alert('Synchronization failed');
											$('body').removeClass('blur');
										}else{
											$('body').removeClass('blur');
											addMessages('Mood', e, nowScores, time, sInfo['sId']);
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
	$('body').addClass('blur');
	$.ajax({  
		url: '../php/index.php',
		data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');
			console.log(msg)
			var ary = JSON.parse( msg[1] ).messages || null, o_send = {}, count = -1, time = timestamp.get().read, oldScores = 0, nowScores = parseInt($(e).attr('_speed')), newTimes = 1;
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
					console.log(ary);
			$.ajax({  
				url: '../php/index.php',
				data:{'action': 'setmessages','roomId':sInfo['roomId'],'messages':JSON.stringify(ary)},
				type: 'POST',
				dataType: 'html',
				success: function(msg){
					msg = msg.split('@@');
					if ( msg[1]==="" ){
						alert('Synchronization failed');
						$('body').removeClass('blur');
					}else{
						$.ajax({  
							url: '../php/index.php',
							data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
							type: 'POST',
							dataType: 'html',
							success: function(msg){
								msg = msg.split('@@');
								// scores : 學生的 scores 皆不重複，times : 全部學生發送 Speed 的次數
								var scores = parseInt(JSON.parse( msg[1] ).speed.split('_')[0]) - oldScores + nowScores, times = parseInt(JSON.parse( msg[1] ).speed.split('_')[1]) + newTimes;
								scores = scores+'_'+times;
								$.ajax({  
									url: '../php/student_db.php',
									data:{'action': 'updateSpeed','roomId':sInfo['roomId'],'score':scores},
									type: 'POST',
									dataType: 'html',
									success: function(msg){
										msg = msg.split('@@');
										console.log('222')
										console.log(msg)
										if ( msg[1]==="") {
											alert('Synchronization failed');
											$('body').removeClass('blur');
										}else{
											$('body').removeClass('blur');
											console.log(e)
											console.log(nowScores)
											console.log(time)
											addMessages('Speed', e, nowScores, time, sInfo['sId']);
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
	$('body').addClass('blur');	
	$.ajax({  
		url: '../php/index.php',
		data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');
			var ary = JSON.parse( msg[1] ).messages || null, o_send = {}, time = timestamp.get().read;
			o_send[sInfo['sId']] = 'text_'+time+'_'+text;
			if( ary === null ){
				ary = [];
				ary.push(o_send);
			}else{
				ary.unshift(o_send);
			}
			console.log(ary);
			$.ajax({  
				url: '../php/index.php',
				data:{'action': 'setmessages','roomId':sInfo['roomId'],'messages':JSON.stringify(ary)},
				type: 'POST',
				dataType: 'html',
				success: function(msg){
					msg = msg.split('@@');
					if (msg[1]==="") {
						alert('Synchronization failed');
						$('body').removeClass('blur');
					}else{
						$('body').removeClass('blur');
						addMessages('Text', e, text, time, sInfo['sId']);						
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
// 取得 Message's logs
function getLog(sInfo){
	$.ajax({  
		url: '../php/index.php',
		data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');
			var ary = JSON.parse( msg[1] ).messages || null, sLog = [];
			if( ary !== null && ary.length > 0 ){
				for( var i=0, aryLen = ary.length; i<aryLen; i++ ){
					if( sInfo['sId'] in ary[i] || 'teacher' in ary[i] ){
						sLog.unshift(ary[i]);
					}
				}
				console.log(sLog);
				showLogs(sLog, sInfo);
			}
			initIsCompleted();
		},
		error:function(xhr, ajaxOptions, thrownError){ 
			console.log(xhr.status); 
			console.log(thrownError);
		}
	});		
}

// 提交 答案
function sentAnswer(e, answerAry, sInfo){
	$('body').addClass('blur');
	$.ajax({  
		url: '../php/index.php',
		data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');
			var qId = JSON.parse( msg[1] ).question;			
			var o_ques = JSON.parse( msg[1] )[qId], o_answer = {};
			for( var i=0, iLen=answerAry.length; i<iLen; i++ ){
				o_ques.answer.push(answerAry[i]);
			}
			o_ques.count++;
			o_ques.s.unshift(sInfo['sId']);
			console.log(o_ques);
			var json_ques = JSON.stringify(o_ques);
			$.ajax({  
				url: '../php/student_db.php',
				data:{'action': 'sentAnswer','roomId':sInfo['roomId'],'qId':qId,'answer':json_ques},
				type: 'POST',
				dataType: 'html',
				success: function(msg){
					msg = msg.split('@@');
					if ( msg[1]==="" ) {
						alert('Synchronization failed');
						$('body').removeClass('blur');
					}else{
						localStorage.setItem('slatestQuesInfo', json_ques);
						$(e).hide().siblings('div.answered').show();
						$('body').removeClass('blur');
						setResult(json_ques);
						$('#navigation').find('[_nav=roomResult]').trigger('click');	
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

// 設定 Student'Id : sId
function setStudentId(sInfo, mode){
	if( mode ){
		$.ajax({  
			url: '../php/index.php',
			data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
			type: 'POST',
			dataType: 'html',
			success: function(msg){
				msg = msg.split('@@');
				var ary = JSON.parse( msg[1] ).online_s || null, sNumber = randomInt(1, 100);
				console.log(ary);
				if( ary !== null ){
					var num = checkSIdIndex(ary, sInfo['sId']);
					while( num >= 0 ){
						sInfo['sId'] = 's_'+randomInt(1, 100);
						num = checkSIdIndex(ary, sInfo['sId']);
					}
					localStorage.setItem('sInfo', JSON.stringify(sInfo));
				}
				console.log(sInfo);
				checkRoom(sInfo);
			},
			error:function(xhr, ajaxOptions, thrownError){ 
				console.log(xhr.status); 
				console.log(thrownError);
			}
		});	
	}else{
		checkRoom(sInfo);
	}
}

// 更新 FireBase 的 sId 名稱
function sentStudentName(name, sInfo){
	$('body').addClass('blur');
	oldId = sInfo['sId'], newId = ( name === null ) ? sInfo['sId'].split('-')[0] : sInfo['sId'].split('-')[0]+'-'+name;
	$.ajax({  
		url: '../php/index.php',
		data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');
			// arg
			var qId = JSON.parse( msg[1] ).question;
			var o_ques = JSON.parse( msg[1] )[qId];
			// 抓取 Messages 的資訊
			var ary = JSON.parse( msg[1] ).messages || null, tempAry1 = [];
			console.log(ary);
			if( ary !== null ){
				for( var i=0, aryLen=ary.length; i<aryLen; i++ ){
					if( Object.keys(ary[i])[0].split('-')[0] === oldId.split('-')[0] ){
						var temp_o = {};
						temp_o[newId] = ary[i][oldId];
						tempAry1[i] = temp_o;
					}else{
						tempAry1[i] = ary[i];
					}
				}
				console.log(tempAry1);
				$.ajax({  
					url: '../php/index.php',
					data:{'action': 'setmessages','roomId':sInfo['roomId'],'messages':JSON.stringify(tempAry1)},
					type: 'POST',
					dataType: 'html',
					success: function(msg){
						msg = msg.split('@@');
						if ( msg[1]==="" ) {
							alert('Synchronization failed');
							$('body').removeClass('blur');
						}else{
							if( qId !== null ){ // 這間 room -> 曾經發問過問題
								// 抓取最新問題的資訊
								var ary = o_ques || null, sAry = ary.s, tempAry2 = [];
								console.log(ary);
								if( sAry.length !== 0 ){ // Student -> 曾經回答過問題
									for( var i=0, aryLen=sAry.length; i<aryLen; i++ ){
										if( sAry[i].split('-')[0] === oldId.split('-')[0] ){
											tempAry2[i] = newId;
										}else{
											tempAry2[i] = sAry[i];
										}
									}
									ary.s = tempAry2;
									console.log(ary);
									$.ajax({  
										url: '../php/index.php',
										data:{'action': 'setmessages','roomId':sInfo['roomId'],'messages':JSON.stringify(ary)},
										type: 'POST',
										dataType: 'html',
										success: function(msg){
											msg = msg.split('@@');	
											if ( msg[1]==="" ) {
												alert('Synchronization failed');
												$('body').removeClass('blur');
											}else{
												sInfo.sId = newId;
												localStorage.setItem('sInfo', JSON.stringify(sInfo));
												// 清除 updateState TimeOut 計數
												clearTimeout(timeVar);
												// 更新 online_s 的 sId
												updateState(sInfo);
												// 更新 Messages
												getLog(JSON.parse(localStorage.sInfo));
												$('#show-sId').text('No.'+newId.split('_')[1]);
												$('body').removeClass('blur');
												// 更新 sName，讓 Teacher 得知該學生有更新 Name
												$.post( '../php/teacher_db.php', {'action': 'updatesName','roomId':sInfo['roomId'],'updateTime':timestamp.get().num} );											
												$('#show-sId').parent('nav.user').removeClass('active').siblings('.active').removeClass('active').end().siblings('footer').attr('_now', 'none').children('div').removeClass('active');
											}										
										},
										error:function(xhr, ajaxOptions, thrownError){ 
											console.log(xhr.status); 
											console.log(thrownError);
										}
									});
								}else{
									sInfo.sId = newId;
									localStorage.setItem('sInfo', JSON.stringify(sInfo));
									// 清除 updateState TimeOut 計數
									clearTimeout(timeVar);
									// 更新 online_s 的 sId
									updateState(sInfo);
									// 更新 Messages
									getLog(JSON.parse(localStorage.sInfo));
									$('#show-sId').text('No.'+newId.split('_')[1]);
									$('body').removeClass('blur');
									// 更新 sName，讓 Teacher 得知該學生有更新 Name
									$.post( '../php/teacher_db.php', {'action': 'updatesName','roomId':sInfo['roomId'],'updateTime':timestamp.get().num} );																				
									$('#show-sId').parent('nav.user').removeClass('active').siblings('.active').removeClass('active').end().siblings('footer').attr('_now', 'none').children('div').removeClass('active');									
								}										
							}else{ // 這間 room -> 從未發問過問題
								sInfo.sId = newId;
								localStorage.setItem('sInfo', JSON.stringify(sInfo));
								// 清除 updateState TimeOut 計數
								clearTimeout(timeVar);
								// 更新 online_s 的 sId
								updateState(sInfo);
								// 更新 Messages
								getLog(JSON.parse(localStorage.sInfo));
								$('#show-sId').text('No.'+newId.split('_')[1]);
								$('body').removeClass('blur');
								// 更新 sName，讓 Teacher 得知該學生有更新 Name
								$.post( '../php/teacher_db.php', {'action': 'updatesName','roomId':sInfo['roomId'],'updateTime':timestamp.get().num} );											
								$('#show-sId').parent('nav.user').removeClass('active').siblings('.active').removeClass('active').end().siblings('footer').attr('_now', 'none').children('div').removeClass('active');
							}
						}
					},
					error:function(xhr, ajaxOptions, thrownError){ 
						console.log(xhr.status); 
						console.log(thrownError);
					}
				});	
			}
		},
		error:function(xhr, ajaxOptions, thrownError){ 
			console.log(xhr.status); 
			console.log(thrownError);
		}
	});		
}


// 初始化 DB 的一些資訊
function init(sInfo){
	// 抓歷史 Message;s Logs
	getLog(sInfo);
	// 開始監聽 FireBase上 該房間的資訊
	setInterval(function(){bindRoom(sInfo)},1000);
	// 更新連線狀態
	updateState(sInfo);
	// 抓取「最新的問題」
	getLatestQuestion(sInfo);
}

// 抓取「最新的問題」
function getLatestQuestion(sInfo){
	$.ajax({  
		url: '../php/index.php',
		data:{'action': 'getroomvalue','roomId':sInfo['roomId']},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');
			var sInfo = JSON.parse(localStorage.sInfo);
			sInfo.question = JSON.parse( msg[1] ).question;
			localStorage.setItem('sInfo', JSON.stringify(sInfo));
			if( JSON.parse( msg[1] ).question !== null ){ // 這間 room -> 曾經發問過問題
					var qId = JSON.parse( msg[1] ).question
					console.log(JSON.parse( msg[1] )[qId]);
					localStorage.setItem('slatestQuesInfo', JSON.parse( msg[1] )[qId]);
					console.log('抓取「最新的問題」')
					setQuestion(JSON.stringify(JSON.parse( msg[1] )[qId]));
					setResult(JSON.stringify(JSON.parse( msg[1] )[qId]));
					$('#roomResult, #roomQues').removeClass('null');
					initIsCompleted();
			}else{
				localStorage.setItem('slatestQuesInfo', JSON.stringify(''));
				initIsCompleted();
			}
		},
		error:function(xhr, ajaxOptions, thrownError){ 
			console.log(xhr.status); 
			console.log(thrownError);
		}
	});	
}

// 隨機產生範圍 min~max 的整數
function randomInt(min, max){
    return Math.round(min + Math.random()*(max-min));
}

// 檢查 sId 是否重覆
function checkSIdIndex(ary, sNumber){
	for( var i=0, aryLen = ary.length; i<aryLen; i++ ){
		// 檢查是否有重覆 ?
		if( Object.keys(ary[0])[0] === sNumber ){
			return i;
			break;
		}
	}
	return -1;
}

// 檢查 array values 是否重覆
function checkArrayByIndex(ary, s){
	for( var i=0, aryLen = ary.length; i<aryLen; i++ ){
		if( ary[i] === s ){
			return i;
			break;
		}
	}
	return -1;
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