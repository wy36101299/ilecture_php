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
		$qInfo = $_POST['o_ques'];

		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomId'" );
		$result = mysql_query($query) or die('error@取得房間密碼失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary = unserialize($a['value']);
			}
		}
		$o_ary = serialize($ary);
		//新建問題
		$ary[$qId] = $qInfo;
		//刷新目前qid
		$ary['question'] = $qId;
		$ary=serialize($ary);
		$query = sprintf( "UPDATE `rooms` SET value = '$ary' WHERE key1 = '$roomId'" );
		$result = mysql_query($query);
		if( !$result ){
			$message  = 'error@更新新房間問題失敗。';
			die($message);
		}
		break;

	case 'online_s':
		$online_s = $_POST['online_s'];

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

	}
?>
