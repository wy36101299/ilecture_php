<?php
	include('db.php');

// $str_num= sprintf(“%d",$num); // 再把數字轉變成字串
	// include('db.php');
	// $a=array("1234","5678");
	// $aa="serialize($a)";

	// $query = sprintf( "UPDATE `codes` SET value = '$aa' WHERE key1 = 'array'" );
	// $result = mysql_query($query);
	// if( !$result ){
	// 	$message  = 'error@伺服器設定您的 Need 和 Skill 失敗。';
	// 	die($message);
	// }

	// $a=array("code"=>"1234","messages"=>"[]","mood"=>"0_0","online_s"=>"[{\"s_1407218157570\":1407218990546},{\"s_1407218286077\":1407222598666},{\"s_1407214663552\":1407220241712}]","question"=>"null","speed"=>"0_0");
	

	// // $query = sprintf( "UPDATE `rooms` SET value = '$aa' WHERE key1 = 'room_1407150155509'" );
	// // $result = mysql_query($query);
	// // if( !$result ){
	// // 	$message  = 'error@伺服器設定您的 Need 和 Skill 失敗。';
	// // 	die($message);
	// // }
	// $key1 = 'room_1407150155501';
	// $value = serialize($a);
	$query = sprintf( "INSERT INTO `codes` (key1) VALUES ('%s')", mysql_real_escape_string('array'));
	$result = mysql_query($query);
	if( !$result ){
		$message  = 'error@伺服器設定失敗。';
		die($message);
	}
?>