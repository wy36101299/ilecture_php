
// PinCode 自動 focus
function moveOnMax(e, next){
    if( e.value.length === 1 ){
        document.getElementById(next).focus();
    }
}

// 取得 : Student 輸入的 Pincode
function getPincode(){
	var a = $('#pincode-1').val().trim() || null
	, b = $('#pincode-2').val().trim() || null
	, c = $('#pincode-3').val().trim() || null
	, d = $('#pincode-4').val().trim() || null;
	if( a === null || b === null || c === null || d === null ){
		alert('Pincode 格式錯誤。');
	}else{ // 輸入格式正確
		checkPincode(a+b+c+d);
	}
}

// 檢查 : Student 輸入的 Pincode
function checkPincode(pincode){
	console.log(pincode);
	bodyId = document.getElementById('body');
	bodyId.className = bodyId.className.replace('', 'blur');
	$.ajax({  
		url: '../php/index.php',
		data:{'action': 'getallroomvalue'},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			msg = msg.split('@@');
			var ary_room = JSON.parse( msg[1] );
			if (ary_room !== null) {
				for( var key in ary_room ){
					console.log(ary_room[key])
					if( ary_room[key].roomCode === pincode ){ // 找到房間
						window.location.href = '../student/index.html?room_id='+ary_room[key].roomId+'&code='+pincode;
						return 0;
					}				
				}      
				alert('未找到符合 Pincode 的房間。');
				bodyId.className = bodyId.className.replace('blur', '');				
			}else{
				alert('未有房間可以進入。');
				bodyId.className = bodyId.className.replace('blur', '');
			}

		},
		error:function(xhr, ajaxOptions, thrownError){ 
			console.log(xhr.status); 
			console.log(thrownError);
		}
	});		
}