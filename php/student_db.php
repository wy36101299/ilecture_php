<?php
include('db.php');
switch ($_POST['action']) {

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
		$ary = serialize($ary);

		$query = sprintf( "UPDATE `rooms` SET value = '$ary' WHERE key1 = '$roomId'" );
		$result = mysql_query($query);
		if( !$result ){
			$message  = 'error@更新新房間messages失敗。';
			die($message);
		}
		break;

	case 'updateMood':
		$roomId = $_POST['roomId'];
		$score = $_POST['score'];

		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomId'" );
		$result = mysql_query($query) or die('error@取得房間資訊失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary = unserialize($a['value']);
			}
		}
		
		//刷新目前mood
		$ary['mood'] = $score;
		$ary = serialize($ary);

		$query = sprintf( "UPDATE `rooms` SET value = '$ary' WHERE key1 = '$roomId'" );
		$result = mysql_query($query);
		if( !$result ){
			$message  = 'error@更新新房間資訊失敗。';
			die($message);
		}
		break;

	case 'updateSpeed':
		$roomId = $_POST['roomId'];
		$score = $_POST['score'];

		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomId'" );
		$result = mysql_query($query) or die('error@取得房間資訊失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary = unserialize($a['value']);
			}
		}
		
		//刷新目前speed
		$ary['speed'] = $score;
		$ary = serialize($ary);

		$query = sprintf( "UPDATE `rooms` SET value = '$ary' WHERE key1 = '$roomId'" );
		$result = mysql_query($query);
		if( !$result ){
			$message  = 'error@更新新房間資訊失敗。';
			die($message);
		}
		break;

	case 'updateState':
		$roomId = $_POST['roomId'];
		$online_s = $_POST['online_s'];

		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomId'" );
		$result = mysql_query($query) or die('error@取得房間資訊失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary = unserialize($a['value']);
			}
		}
		//刷新目前online_s
		$ary['online_s'] = $online_s;
		$ary = serialize($ary);

		$query = sprintf( "UPDATE `rooms` SET value = '$ary' WHERE key1 = '$roomId'" );
		$result = mysql_query($query);
		if( !$result ){
			$message  = 'error@更新新房間online_s失敗。';
			die($message);
		}
		break;

	case 'sentAnswer':
		$roomId = $_POST['roomId'];
		$answer = $_POST['answer'];
		$qId = $_POST['qId'];

		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomId'" );
		$result = mysql_query($query) or die('error@取得房間資訊失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary = unserialize($a['value']);
			}
		}
		//刷新目前qId answer
		$ary[$qId] = $answer;
		$ary = serialize($ary);

		$query = sprintf( "UPDATE `rooms` SET value = '$ary' WHERE key1 = '$roomId'" );
		$result = mysql_query($query);
		if( !$result ){
			$message  = 'error@更新新房間messages失敗。';
			die($message);
		}
		break;
		
	case 'bindRoom':
		$ary_roomId = array();
		$query = sprintf( "SELECT key1 FROM `rooms`" );
		$result = mysql_query($query) or die('error@取得ary_roomId錯誤。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				array_push($ary_roomId,$a['key1']);
			}
		}
		echo 'success@@'.json_encode( (object)$ary_roomId );
		break;
	}

?>