<?php
	include('db.php');

		$roomsId = $_POST['roomId'];
		$score = $_POST['score'];

		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = 'room_1408101562206'" );
		$result = mysql_query($query) or die('error@取得房間資訊失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary = unserialize($a['value']);
			}
		}
		//刷新目前messages
		$ary['mood'] = $score;
		$ary=serialize($ary);
		$query = sprintf( "UPDATE `rooms` SET value = '$ary' WHERE key1 = '$roomId'" );
		$result = mysql_query($query);
		if( !$result ){
			$message  = 'error@更新新房間資訊失敗。';
			die($message);
		}
?>