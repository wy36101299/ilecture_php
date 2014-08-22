<?php
	include('db.php');

		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = 'room_1408679451097'" );
		$result = mysql_query($query) or die('error@取得房間value失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$up_value = unserialize($a['value']);
				
			}
		}
		print('222');
		print_r($up_value['roomCode']);
		// echo $up_value.'333';
?>