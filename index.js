// 清除超過 3天 的 rooms
var now = timestamp.get().num;
$.ajax({    
      url: './php/index.php',
      type: 'POST',
      data:{'action': 'getary_roomId'},
      dataType: 'html',
      success: function(msg){
        msg = msg.split('@@');
        console.log(msg);
        var ary_roomId = JSON.parse( msg[1] );var now = timestamp.get().num;
		for( var key in ary_roomId ){
			if( Math.abs( now - parseInt(ary_roomId[key].substr(5)) ) > 1*3 ){
				console.log( 'remove->'+ary_roomId[key] );
				$.ajax({  
					url: './php/index.php',
					data:{'action': 'clear3daydata','roomId':ary_roomId[key]},
					type: 'POST',
					dataType: 'html',
					success: function(msg){
						console.log(msg)
					},
					error:function(xhr, ajaxOptions, thrownError){ 
						console.log(xhr.status); 
						console.log(thrownError);
					}
				});				
			}
		}        
      },
      error:function(xhr, ajaxOptions, thrownError){ 
        console.log(xhr.status); 
        console.log(thrownError);
      }
});
//create room
$(document).on('click', '#create-room', function(){
	var roomId = 'room_' + timestamp.get().num, roomCode = $.password(4), authNumber = RandomNumber(10);
	$.ajax({  
		url: './php/index.php',
		data:{'action': 'creatroom','roomId':roomId,'roomCode':roomCode,'authNumber':authNumber},
		type: 'POST',
		dataType: 'html',
		success: function(msg){
			console.log(msg);
			msg = msg.split('@@');
			if (msg[1] === "") {
				console.log('Synchronization failed');
				alert('Synchronization failed');
				$('body').removeClass('blur');
			}else{
				var roomCode = msg[1];
				window.location.href = './teacher/index.html?room_id='+roomId+'&code='+roomCode+'&auth='+authNumber;
			}
		},
		error:function(xhr, ajaxOptions, thrownError){ 
			console.log(xhr.status); 
			console.log(thrownError);
		}
	});		
});
// 產生 auth 亂數
function RandomNumber(num){
    var ary = new Array("0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"), Str = '';
    for ( var i=1; i<=num; i++ ){
        var index = Math.floor(Math.random()*ary.length);
        Str += ary[index];
    }
  　return Str;
}
