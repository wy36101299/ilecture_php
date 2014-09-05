<?php
include('db.php');
switch ($_POST['action']) {
	case 'checkAuth':
		$roomsId = $_POST['roomsId'];
		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomsId'" );
		$result = mysql_query($query) or die('error@取得房間密碼失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary = unserialize($a['value']);
			}
		}
		echo 'success@@'.$ary['auth'];
		break;
	case 'initPieChart':
		$roomId = $_POST['roomId'];
		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomId'" );
		$result = mysql_query($query) or die('error@取得房間密碼失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary = unserialize($a['value']);
			}
		}
		echo 'success@@'.$ary['mood'].'@@'.$ary['speed'];
		break;

	case 'createQuestion':
		$roomId = $_POST['roomId'];
		$qId = $_POST['qId'];
		$qInfo = json_decode($_POST['o_ques']);

		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomId'" );
		$result = mysql_query($query) or die('error@取得房間密碼失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary = unserialize($a['value']);
			}
		}
		//新建問題
		$ary[$qId] = $qInfo;
		//刷新目前qid
		$ary['question'] = $qId;
		$ary=serialize($ary);
		$query = sprintf( "UPDATE `rooms` SET value = '$ary' WHERE key1 = '$roomId'" );
		$result = mysql_query($query);
		if( !$result ){
			$message  = 'error@新建房間問題失敗。';
			die($message);
		}
		break;

	case 'setonline_s':
		$online_s = json_decode($_POST['online_s']);

		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomId'" );
		$result = mysql_query($query) or die('error@取得房間資訊失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary = unserialize($a['value']);
			}
		}
		//刷新目前問題資訊
		$ary['online_s'] = $online_s;
		$ary = serialize($ary);

		$query = sprintf( "UPDATE `rooms` SET value = '$ary' WHERE key1 = '$roomId'" );
		$result = mysql_query($query);
		if( !$result ){
			$message  = 'error@更新新房間online_s失敗。';
			die($message);
		}
		break;

	case 'tea_bindRoom':

		$roomId = $_POST['roomId'];
		$query = sprintf( "SELECT value,ini_value FROM `rooms` WHERE key1 = '$roomId'" );
		$result = mysql_query($query) or die('error@取得房間value失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$up_value = unserialize($a['value']);
				$ini_value = unserialize($a['ini_value']);
			}
		}
		if ($ini_value !== $up_value) {
			// 刷新 ini_value
			$aa = serialize($up_value);
			$query = sprintf( "UPDATE `rooms` SET ini_value = '$aa' WHERE key1 = '$roomId'" );
			$result = mysql_query($query);
			if( !$result ){
				$message  = 'error@刷新ini_value失敗。';
				die($message);
			}
			$qid = $ini_value['question'];
			// Key 更新 : Mood
			if ( $ini_value['mood'] !== $up_value['mood'] ) {
				echo 'mood@@'.json_encode( (object)$up_value );
			// Key 更新 : Speed
			}elseif ($ini_value['speed'] !== $up_value['speed']) {
				echo "speed@@".json_encode( (object)$up_value );
			// Key 更新 : Messages
			}elseif ($ini_value['messages'] !== $up_value['messages']) {
				echo "messages@@".json_encode( (object)$up_value );
			// Key 更新 : online_s
			}elseif ($ini_value['online_s'] !== $up_value['online_s']) {
				echo "online_s@@".json_encode( (object)$up_value );
			}
			// Key 更新 : 某個 Question
			elseif ($ini_value[$qid] !== $up_value[$qid]) {
				echo "question@@".json_encode( (object)$up_value );
			}
		}
		break;
	}
?>
