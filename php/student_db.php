<?php
include('db.php');
switch ($_POST['action']) {
	case 'sendMood':
		$roomsId = $_POST['roomsId'];

		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomsId'" );
		$result = mysql_query($query) or die('error@取得房間密碼失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary = unserialize($a['value']);
			}
		}
		echo 'success@@'.json_encode( (object)$ary['messages'] );
		break;

	case 'getmessages':
		$roomsId = $_POST['roomsId'];
		$messages = $_POST['messages'];

		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomsId'" );
		$result = mysql_query($query) or die('error@取得房間密碼失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary = unserialize($a['value']);
			}
		}
		//刷新目前messages
		$ary['messages'] = $messages;
		$ary=serialize($ary);
		$query = sprintf( "UPDATE `rooms` SET value = '$ary' WHERE key1 = '$roomId'" );
		$result = mysql_query($query);
		if( !$result ){
			$message  = 'error@更新新房間問題失敗。';
			die($message);
		}
		break;

	case 'sendMood':
		$roomsId = $_POST['roomsId'];

		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomsId'" );
		$result = mysql_query($query) or die('error@取得房間密碼失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary = unserialize($a['value']);
			}
		}
		echo 'success@@'.$ary['mood'];
		break;

	case 'updateMood':
		$roomsId = $_POST['roomsId'];
		$score = $_POST['score'];

		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomsId'" );
		$result = mysql_query($query) or die('error@取得房間密碼失敗。');
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
			$message  = 'error@更新新房間問題失敗。';
			die($message);
		}
		break;

	}
?>