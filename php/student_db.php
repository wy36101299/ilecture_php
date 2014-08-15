<?php
include('db.php');
switch ($_POST['action']) {
	case 'getmessages':
		$roomId = $_POST['roomId'];

		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomId'" );
		$result = mysql_query($query) or die('error@取得房間messages失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary = unserialize($a['value']);
			}
		}
		echo 'success@@'.json_encode( (object)$ary );
		break;

	case 'setmessages':
		$roomId = $_POST['roomId'];
		$messages = $_POST['messages'];

		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomId'" );
		$result = mysql_query($query) or die('error@取得房間資訊失敗。');
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
			$message  = 'error@更新新房間messages失敗。';
			die($message);
		}
		break;

	case 'sendMood':
		$roomId = $_POST['roomId'];

		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomId'" );
		$result = mysql_query($query) or die('error@取得房間資訊失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary = unserialize($a['value']);
			}
		}
		echo 'success@@'.json_encode( (object)$ary );
		break;

	case 'updateMood':
		$roomsId = $_POST['roomId'];
		$score = $_POST['score'];

		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomsId'" );
		$result = mysql_query($query) or die('error@取得房間資訊失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary = unserialize($a['value']);
			}
		}

		//刷新目前messages
		echo "updateMood".$score;
		$ary['mood'] = $score;

		$ary=serialize($ary);
		$query = sprintf( "UPDATE `rooms` SET value = '$ary' WHERE key1 = '$roomId'" );
		$result = mysql_query($query);
		if( !$result ){
			$message  = 'error@更新新房間資訊失敗。';
			die($message);
		}

		break;

	}
?>