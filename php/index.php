<?php
include('db.php');
switch ($_POST['action']) {
	case 'getary_roomId':
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
	case 'clear3daydata':
		$roomId = $_POST['roomId'];
		//取得$ary_codes
		$query = sprintf( "SELECT value FROM `codes` WHERE key1 = 'array'" );
		$result = mysql_query($query) or die('error@取得ary_codes錯誤。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary_codes = unserialize($a['value']);
			}
		}
		//清除房間資料
		$query = sprintf( "DELETE FROM `rooms` WHERE key1 = '$roomId'" );
		$result = mysql_query($query) or die('error@清除過期的rooms失敗');
		//清除過期的房間密碼
		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomId'" );
		$result = mysql_query($query) or die('error@取得過期房間密碼失敗。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary = unserialize($a['value']);
			}
		}
		$key = array_search($ary['code'],$ary_codes,true);
		unset($ary_codes[$key]);
		$ary_codes = serialize($ary_codes);
		$query = sprintf( "UPDATE `codes` SET value = '$ary_codes' WHERE key1 = 'array'" );
		$result = mysql_query($query);
		if( !$result ){
			$message  = 'error@更新過期的房間密碼失敗。';
			die($message);
		}
			break;
	case 'creatroom':
		$roomId = $_POST['roomId'];
		$roomCode = $_POST['roomCode'];
		$authNumber = $_POST['authNumber'];
		//取得$ary_codes
		$query = sprintf( "SELECT value FROM `codes` WHERE key1 = 'array'" );
		$result = mysql_query($query) or die('error@取得ary_codes錯誤。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary_codes = unserialize($a['value']);
			}
		}
		if ($ary_codes == null){
			$ary_codes = array($roomCode);
		}else{
			while( in_array($roomCode,$ary_codes) == true ){
				$a = rand(0,9);
				$b = rand(0,9);
				$c = rand(0,9);
				$d = rand(0,9);
				$roomCode = $a.$b.$c.$d;
			}
			array_push($ary_codes,$roomCode);
		}
		//更新新房間密碼
		$ary_codes = serialize($ary_codes);
		$query = sprintf( "UPDATE `codes` SET value = '$ary_codes' WHERE key1 = 'array'" );
		$result = mysql_query($query);
		if( !$result ){
			$message  = 'error@更新新房間密碼失敗。';
			die($message);
		}
		//建立新房間資訊
		$a=array("roomCode"=>$roomCode,"auth"=>$authNumber,"mood"=>"0_0","speed"=>"0_0","messages"=>null,"question"=>null,"online_s"=>null);
		$value=serialize($a);
		$query = sprintf( "INSERT INTO `rooms` (key1, value) VALUES ('%s', '%s')", mysql_real_escape_string($roomId), mysql_real_escape_string($value) );
		$result = mysql_query($query);
		if( !$result ){
			$message  = 'error@創建新房間資訊失敗。';
			die($message);
		}
		echo 'success@@'.$roomCode;
			break;
	}
?>