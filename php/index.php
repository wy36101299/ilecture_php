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
		$roomsId = $_POST['roomId'];
		//取得$ary_codes
		$query = sprintf( "SELECT value FROM `codes` WHERE key1 = 'array'" );
		$result = mysql_query($query) or die('error@取得ary_codes錯誤。');
		if( mysql_num_rows( $result ) > 0 ){    // 有資料
			while( $a = mysql_fetch_array($result) ){
				$ary_codes = unserialize($a['value']);
			}
		}
		//清除房間資料
		$query = sprintf( "DELETE FROM `rooms` WHERE key1 = '$roomsId'" );
		$result = mysql_query($query) or die('error@清除過期的rooms失敗');
		//清除過期的房間密碼
		$query = sprintf( "SELECT value FROM `rooms` WHERE key1 = '$roomsId'" );
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
		$a=array("roomCode"=>$roomCode,"auth"=>$authNumber,"mood"=>"0_0","speed"=>"0_0","messages"=>serialize(array()),"question"=>null,"online_s"=>serialize(array()));
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




	// $SQLStr = "select * from `ilecture`";
 //    $res = mysql_query($SQLStr) or die('error@取得資訊錯誤。');
 //    $data = mysql_fetch_array($res);
 //    echo json_decode($data[0]);

	// $a=array("code"=>"1333","messages"=>"[]","mood"=>"0_0","online_s"=>"[{\"s_1407218157570\":1407218990546},{\"s_1407218286077\":1407222598666},{\"s_1407214663552\":1407220241712}]","question"=>"null","speed"=>"0_0");
	// $aa=serialize($a);

	// $query = sprintf( "UPDATE `rooms` SET value = '$aa' WHERE key1 = 'room_1407150155509'" );
	// $result = mysql_query($query);
	// if( !$result ){
	// 	$message  = 'error@伺服器設定您的 Need 和 Skill 失敗。';
	// 	die($message);
	// }
	// print("arg");


	// $query = sprintf( "SELECT value FROM `rooms` WHERE key1 = 'room_1407150155509'" );
	// $result = mysql_query($query) or die('error@取得rooms-key錯誤。');
	// if( mysql_num_rows( $result ) > 0 ){    // 有資料
	// 	while( $a = mysql_fetch_array($result) ){
	// 		// print_r(unserialize($a['value']));
	// 		$ary = unserialize($a['value']);
	// 	}
	// }
	// print($ary['code']);

	// $query = sprintf( "SELECT value FROM `codes` WHERE key1 = 'array'" );
	// $result = mysql_query($query) or die('error@取得rooms-key錯誤。');
	// if( mysql_num_rows( $result ) > 0 ){    // 有資料
	// 	while( $a = mysql_fetch_array($result) ){
	// 		// print_r(unserialize($a['value']));
	// 		$codes_ary = unserialize($a['value']);
	// 	}
	// }
	// print_r($ary);

	// $query = sprintf( "SELECT value FROM `rooms` WHERE key1 = 'room_1407150155509'" );
	// $result = mysql_query($query) or die('error@取得rooms-key錯誤。');
	// if( mysql_num_rows( $result ) > 0 ){    // 有資料
	// 	while( $a = mysql_fetch_array($result) ){
	// 		// print_r(unserialize($a['value']));
	// 		$ary = unserialize($a['value']);
	// 	}
	// }
	// print($ary['code']);

	// if ( in_array($ary['code'], $codes_ary, true) ){
	// 	echo "yes";
	// }
	// else{
	// 	echo "no";
	// }
	// print('222');

	// $qq2=unserialize($aa);
	// print_r($qq2);
?>