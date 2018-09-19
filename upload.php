<?php

//ini_set('upload_tmp_dir','/mnt/data/web/tmp');

$upload = new FILE_UPLOAD();

//upload処理$upload
if($_REQUEST[mode]=='upload'){
    
    //複数ファイル対応
    if(count($_FILES[file_data][error])){
        for($i=0;$i< count($_FILES[file_data][error]);$i++){
            
            $data = $upload->file_update_property($_FILES[file_data],$i);
            
            //情報表示（デバッグ用）
            $upload->file_update_info($data);
            
            //ファイル設置
            $upload->file_upload_start($data,$_REQUEST[dir]);
        }
    }
    exit;
}
//階層内のリスト表示
else if($_REQUEST[mode]=='folder_list'){
    
//    header("Access-Control-Allow-Origin: *");
    header("Content-Type: text/html; charset=UTF-8");
    
    $d = @dir($_REQUEST[dir]);
    
    if(is_dir($_REQUEST[dir]) && $d){
        unset($data,$list,$file,$folder,$sys);
		while ($entry = $d->read()) {
			if ($entry == '.' || $entry == '..'){continue;}
//			$data[] = $entry;
            if(is_dir($_REQUEST[dir]."/".$entry)){
                //new_dir
                if(preg_match("/^new_file_/",$entry)){
                    $sys[] = $entry;
                }
                else{
                    $folder[] = $entry;
                }
            }
            else{
                $file[] = $entry;
            }
		}
//		@sort($data);
        @rsort($sys);
        @sort($folder);
        @sort($file);
        /*
        for($i=0;$i< count($data);$i++){
            $genre = "file";
            if(is_dir($_REQUEST[dir]."/".$data[$i])){
                $genre="folder";
            }
            else if(is_link($_REQUEST[dir]."/".$data[$i])){
                $genre="link";
            }
            
//            $list[] = "'".$data[$i]."':{genre:'".$genre."',type:''}";
//            $list[] = "'".$update->value_encode($data[$i])."':{genre:'".$genre."',type:''}";
            $list[] = "'".str_replace("'",rawurlencode("'"),$data[$i])."':{genre:'".$genre."',type:''}";
        }
        */
        
        $list = array();
        
        for($i=0;$i< count($sys);$i++){
            $type = $upload->check_type($_REQUEST[dir]."/".$sys[$i]);
            $list[] = "'".str_replace("'",rawurlencode("'"),$sys[$i])."':{type:'".$type."'}";
        }
        for($i=0;$i< count($folder);$i++){
            $type = $upload->check_type($_REQUEST[dir]."/".$folder[$i]);
            $list[] = "'".str_replace("'",rawurlencode("'"),$folder[$i])."':{type:'".$type."'}";
        }
        for($i=0;$i< count($file);$i++){
            $type = $upload->check_type($_REQUEST[dir]."/".$file[$i]);
            $size = 0;
            if(is_file($_REQUEST[dir]."/".$file[$i])){
                $size = filesize($_REQUEST[dir]."/".$file[$i]);
            }
            $list[] = "'".str_replace("'",rawurlencode("'"),$file[$i])."':{type:'".$type."',size:".$size."}";
        }
        //if(count($list)){
            echo join(",",$list);
        //}
        
    }
    
    else{
        echo "'error !!':'<br>'";
    }
    
    exit;
}
//データ削除処理
else if($_REQUEST[mode]=="del"){
    $path = $_REQUEST[dir].$_REQUEST[file];
    if($path && file_exists($path)){
        
        unlink($path);
        /*
        if($_REQUEST[type]=='file' && is_file($path)){
            unlink($path);
        }
        else if($_REQUEST[type]=='folder' && is_dir($path)){
            exec("rm -rf ".$upload->value_exec($path);
        }
        */
        //削除できない場合、強制コマンド
        if(file_exists($path)){
            exec("rm -rf ".$upload->value_exec($path));
        }
    }
//    echo $_REQUEST[dir];
    echo "type:".$_REQUEST[type]."/";
    echo $path;
//    echo $_REQUEST[dir].$_REQUEST[file];
    exit;
}
//名前変更
else if($_REQUEST[mode]=='rename'){
    $path1 = $_REQUEST[dir].$_REQUEST[file];
//    $path2 = $_REQUEST[dir].rawurldecode($_REQUEST[new_name]);
    $path2 = $_REQUEST[dir].$_REQUEST[new_name];
    
    rename($path1,$path2);
    
    echo $_REQUEST[dir];
//    echo $path1.",".$path2;
    exit;
}
//フォルダー作成
else if($_REQUEST[mode]=='make_folder'){
    //単一作成
    $path = $_REQUEST[dir].$_REQUEST[new_name];
    if(!file_exists($path)){
        mkdir($path);
        echo $path;
    }
    //複数作成
    if(count($_REQUEST[path])){
        for($i=0;$i< count($_REQUEST[path]);$i++){
            if(!file_exists($_REQUEST[path][$i])){
                mkdir($_REQUEST[path][$i]);
            }
        }
    }
    /*
    echo 'dir:'."'".$_REQUEST[dir]."',";
    echo 'file:'."'".$_REQUEST[new_name]."',";
    echo "$:0";
    */
    exit();
}

//ダウンロード
else if($_REQUEST[mode]=='download'){
    $file = $_REQUEST[dir].$_REQUEST[file];
    if (file_exists($file)) {
        
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        //header('Content-Disposition: attachment; filename=aa'.basename($file));
        header('Content-Disposition: attachment; filename='.$_REQUEST[file]);
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file));
        //ob_clean();
        //flush();
        readfile($file);
        //file_get_contents($file);
        
        
        //echo basename($file);
        //exit;
        /*
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Transfer-Encoding: binary');
        */
        //echo file_get_contents($file);
        //echo basename($file)."/".filesize($file);
        //echo $file;
        
    }
    else{
        echo "alert('no-file : ".$file."');";
    }
    
    exit();
}
//file-open
else if($_REQUEST[mode]=='file_open'){
    
    $path = $_REQUEST[dir].$_REQUEST[file];
    
    //存在可否
    if(!file_exists($path)){exit(0);}
    
    //ファイルorフォルダorその他の確認
    if(filetype($path)!="file"){exit(0);}
    
    //テキストファイル確認
    if(preg_match("/"."^text\/"."/",mime_content_type($path))){
        echo 'type:"text",';
        echo 'data:"'.rawurlencode(file_get_contents($path)).'"';
    }
    else if(preg_match("/"."^image\/"."/",mime_content_type($path))){
        $imgbinary = fread(fopen($path, "r"), filesize($path)); // バイナリデータを読み込み
        //$img_str = base64_encode($imgbinary); // base64エンコード
        echo 'head:"'.mime_content_type($path).'",';
        echo 'type:"image",';
        echo 'data:"'.base64_encode($imgbinary).'"';
    }
    
    exit();
}
//text_edit
else if($_REQUEST[mode]=='text_edit'){
    
    $path = $_REQUEST[dir].$_REQUEST[file];
    
    //存在可否
    if(!file_exists($path)){exit(0);}
    
    //存在可否
    if(file_exists($path)){
        //テキストファイル確認
        echo 'type:"text",';
        echo 'path:"'.$path.'",';
        echo 'data:"'.rawurlencode(file_get_contents($path)).'"';
    }
    exit();
}
//ゴミ箱へ移動
else if($_REQUEST[mode]=='trash_move'){
    if($_REQUEST[target] && $_REQUEST[send]){
        rename($_REQUEST[target] , $_REQUEST[send]);
    }
    exit();
}
//ゴミ箱を空へ
else if($_REQUEST[mode]=='trash_empty'){
    if($_REQUEST[trash]){
        exec("rm -rf ./".$_REQUEST[trash]."/*");
    }
    exit();
}
//テキストファイルセーブ
else if($_REQUEST[mode]=='file_save'){
    if($_REQUEST[dir] && $_REQUEST[file]){
        file_put_contents($_REQUEST[dir].$_REQUEST[file], $_REQUEST[data]);
    }
    exit();
}
//移動
else if($_REQUEST[mode]=='file_move'){
    exec("mv ".$_REQUEST[dir1].$_REQUEST[file1]." ".$_REQUEST[dir2].$_REQUEST[file2]);
    
    echo "mv ".$_REQUEST[dir1].$_REQUEST[file1]." ".$_REQUEST[dir2].$_REQUEST[file2];
    
    exit();
}
else{
    echo "-";
    exit();
}



class FILE_UPLOAD{
    //複数アップロードデータを単一データに変換
    function file_update_property($file , $num){
        
        unset($data);
        $data[name] = $file[name][$num];
        $data[tmp_name] = $file[tmp_name][$num];
        $data[type] = $file[type][$num];
        $data[size] = $file[size][$num];
        $data[error] = $file[error][$num];
        
        return $data;
    }
    
    //ファイル情報
    function file_update_info($f){
        unset($i);
        $i[] = "Name:".$f[name];
        $i[] = "tmp_name:".$f[tmp_name];
        $i[] = "type:".$f[type];
        $i[] = "size:".$f[size]."Bite";
        $i[] = "error:".$f[error];
        
        echo join("<br>",$i)."<hr>";
        return $i;
    }
    
    function file_upload_start($f,$dir="",$parent=""){
        
        if(!$dir){
            $dir="data/";
        }
        $parent = $this->make_dir($parent);
        $dir = $this->make_dir($dir);
        
        //データをテンポラリから本番へ移動
        if(!$f[error] && file_exists($f[tmp_name])){
//            exec("mv ".$f[tmp_name]." ".$parent.$dir.$f[name]);
            rename($f[tmp_name] , $parent.$dir.$f[name]);
//            move_uploaded_file($f[tmp_name] , $parent.$dir.$f[name]);
        }
    }
    
    //多重階層作成（ディレクトリのみ）[階層文字列を返す]
    function make_dir($dir,$parent=""){
        if(!$dir){return;}
        
        $path = $parent.$dir;
        
        //同名ファイルとして存在確認
        if(file_exists($path)){}
        //ディレクトリの存在確認
        else if(is_dir($path)){}
        //上記ヒット無い場合はフォルダ作成
        else{
            $dirs = split("\/",$dir);
            $dir_path = "";
            //階層が複数ある場合は、ループ処理
            if(count($dirs)>1){
                for($i=0;$i< count($dirs);$i++){
                    $dir_path.= $dirs[$i]."/";
                    if(is_dir($parent.$dir_path)){continue;}
                    mkdir($parent.$dir_path);
                }
            }
            else{
                $dir_path = $dirs[0];
                mkdir($parent.$dir_path);
            }
            $path = $parent.$dir_path;
            
        }
        
        //階層表記判定
        if(!preg_match("/\/$/",$path)){
            $path .= "/";
        }
        
        return $path;
    }
    
    //ディレクトリ内のリストを取得
    function searchDir($path,$val){
        
    	if($d = @dir($path)){
    		while ($entry = $d->read()) {
    			if ($entry != '.' && $entry != '..' && preg_match('/'.$val.'/',$entry,$match)){
    				$data[] = $entry;
    			}
    		}
    		unset($d); $d = null;
    		@sort($data);
    		return $data;
    	}
    }
    
    //文字列のエンコード処理
    function value_encode($str){
        $arr = array('&','"',"'",'=',' ');
        
        for($i=0;$i< count($arr);$i++){
            $str = str_replace($arr[$i],rawurlencode($arr[$i]),$str);
        }
        return $str;
    }
    //コマンド用文字列変換
    function value_exec($str){
        $arr = array('&','"',"'",'=',' ');
        
        for($i=0;$i< count($arr);$i++){
            $str = str_replace($arr[$i],"\\".$arr[$i],$str);
        }
        return $str;
    }
    
    //type値を取得
    function check_type($path){
        if(is_link($path)){
            return "link";
        }
        if(is_file($path)){
            return "file";
        }
        else if(is_dir($path)){
            return "folder";
        }
        else{
            return "";
        }
        
        
    }
    
}




