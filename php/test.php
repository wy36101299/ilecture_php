<?php
	include('db.php');
		$ary='111';
		$key1 = 'room_1408167458345';
		$query = sprintf( "UPDATE `rooms` SET value = '$ary' WHERE key1 = '$roomId'" );
		$result = mysql_query($query);
		if( !$result ){
			$message  = 'error@更新新房間資訊失敗。';
			die($message);
		}
?>