if(typeof($LIB)=="undefined"){$LIB={}}
if(typeof($LIB.FUP)=="undefined"){$LIB.FUP={}}

$LIB.FUP={
    //各種データ
    data:{
        cls:{
            explorer:'window',
            text_editor:'text_editor',
            upload:"file_upload",
            contents:"contents",
            on:"on",
            title:"title",
            resize:"resize",
            close:"close",
            move:"move",
            drag:"drag",
            property:"property",
            reload:"reload",
            icon:"icon",
            save:"save",
        $:0},
        new_file:"new_file",
        update_name:"file_name",
        ajax_path:"upload.php?tmp="+(+new Date()),
        url_string:['&','"',"'",'=',' '],
        //explorer_minsize:100,
        window:{
            margin:30,
            padding:10,
            x:100,
            y:20
        },
        trash:"trash",
        icon_margin:8,
        
    $:0},
    
    
    //iframe初期表示処理
    iframes_set:function(){
        //対象項目取得
        var e = document.getElementsByClassName(this.data.cls.upload);
        
        for(var i=0;i< e.length;i++){
            //既にiframeが存在する場合は、処理無し
            if(e[i].getElementsByTagName("iframe").length){continue}
            if(e[i].innerHTML==""){continue}
            
            //指定クラス名のDIVタグにiframeを埋め込む
            var iframe = document.createElement("iframe");
            iframe.dir = e[i].innerHTML;
            e[i].innerHTML = "";
            e[i].appendChild(iframe);
        }
    },
    
    
    //イベント処理
    event:{
        set:function(){
            $LIB.event(window,"mousedown",   $LIB.FUP.context_menu.select);
            $LIB.event(window,"mousemove",   $LIB.FUP.drag.move_action);
            $LIB.event(window,"mouseup",     $LIB.FUP.drag.move_end);
            $LIB.event(window,"keydown",     $LIB.FUP.event.keydown);
            $LIB.event(window,"beforeunload",$LIB.FUP.unload);
            //ファイルドラッグ
            $LIB.event(window,"mouseover",$LIB.FUP.drop.out);
            $LIB.event(window,"dragenter",$LIB.FUP.drop.start);//ブラウザ画面にドラッグでINした歳
            //$LIB.event(window,"dragover", $LIB.FUP.drop.move);//ドラッグでの移動中
            //$LIB.event(window,"dragleave",$LIB.FUP.drop.out);//画面外に外れた時
            //$LIB.event(window,"dragenter",$LIB.FUP.drop.enter);//ドラッグ可能なオブジェクトと重なった歳
            //$LIB.event(window,"drop",     $LIB.FUP.drop.end);//マウスアップした場合
            
            //$LIB.event(window,"mouseover",$LIB.FUP.drag_move_end);
            //$LIB.event(window,"contextmenu",$LIB.FUP.event.right_click);
            //右クリック制御
            window.oncontextmenu=$LIB.FUP.event.right_click;
            //$LIB.event(window,"contextmenu",$LIB.FUP.event.right_click);
            //window.onclick=function(){alert(123)};
            //window.ondblclick=$LIB.FUP.event.right_click;
            //window.onclick=$LIB.FUP.right_click;
        },
        keydown:function(e){
            //F5
            if(e.keyCode==116){return false}
            
        },
        //クリック処理
        right_click:function(){//console.log("right");
            
            //対象エレメント
            var e = event.target;
            if(!e){return}
            if(typeof(e.data)=='undefined'){e.data={}}
            //if(typeof(e.data)=="undefined"){e.data={}}
            
            //エレメントタイプ別処理 [file , folder , etc...]
            var type = $LIB.FUP.check_element(e);
            if(!type){return false}
            
            //カラーリング
            else if(type=='folder'||type=='file'||type=='link'){
                //e.style.setProperty("background-color","#FED","");
                e.className = $LIB.css.name("add",e.className,$LIB.FUP.data.cls.on);
            }
            
            //メニューを閉じる
            $LIB.FUP.context_menu.close($LIB.FUP.context_menu.id);
            
            //マウス座標を元に配置
            var x = event.pageX +16;
            var y = event.pageY -8;
            
            var d = document.createElement("div");
            d.id  = $LIB.FUP.context_menu.id;
            //d.target = e;
            var win = $LIB.search.css(e.parentNode,$LIB.FUP.data.cls.explorer);
            
            //console.log(e.data.file);
            
            d.data={
                target:e,
                type:type,
                dir: win.data.dir,
                file:((typeof(e.data)!='undefined'&&e.data.file)?e.data.file:"")
            };
            
            d.style.setProperty("left",x+"px","");
            d.style.setProperty("top", y+"px","");
            var z = $LIB.FUP.drag.move_zindex();
            d.style.setProperty("z-index",(z+1),"");
            d.innerHTML=$LIB.FUP.context_menu.html(type,e.data.dir);
            document.body.appendChild(d);
            
            //表示エリア調整
            var screen = $LIB.browser();
            if(screen.y < y+d.offsetHeight){
                d.style.setProperty("top", (screen.y-d.offsetHeight)+"px","");
            }
            
            return false;
        }
    },
    
    //右クリック実行処理
    context_menu:{
        id:'context_menu',
        html:function(type,dir){
            //console.log(type);
            
            var html="";
            html+="<ul>";
            
            //file,folderのみ
            if(type=='file'||type=='folder'||type=='link'){
                //open
                html+="<li class='file_open' onclick='$LIB.FUP.context_menu.open()'>開く</li>";
                
                //change-name
                html+="<li class='rename' onclick='$LIB.FUP.context_menu.name_change()'>名前変更</li>";
                
                //アーカイブ
                html+="<li class='download' onclick='$LIB.FUP.context_menu.archive()'>圧縮</li>";
                /*
                //delete
                //var val = '"'+type+'"';
                html+="<li class='data_delete' onclick='$LIB.FUP.context_menu.file_delete()'>データ削除</li>";
                */
            }
            //編集
            if(type=='file'){
                //change-name
                html+="<li class='text_edit' onclick='$LIB.FUP.context_menu.text_edit()'>編集</li>";
            }
            //make-folder
            html+="<li class='make_folder' onclick='$LIB.FUP.context_menu.make_folder()'>フォルダ作成</li>";
            
            //ダウンロード
            if(type=='file'){
                html+="<li class='download' onclick=\"$LIB.FUP.context_menu.download('file')\">ダウンロード</li>";
            }
            
            //trash
            if(type=='file'||type=='folder'||type=='link'){
                html+="<li class='"+$LIB.FUP.data.trash+"' onclick='$LIB.FUP.context_menu.trash()'>ゴミ箱へ移動</li>";
            }
            
            
            
            html+="</ul>";
            
            return html;
        },
        //デスクトップ用
        desktop:function(type,dir){
            var html="";
            html+="<ul>";
            
            //開く
            html+="<li class='file_open' onclick='$LIB.FUP.window.open(document.getElementById($LIB.FUP.context_menu.id).data);$LIB.FUP.context_menu.close($LIB.FUP.context_menu.id);'>開く</li>";
            
            //編集
            if(type=='file'){
                //change-name
                html+="<li class='text_edit' onclick='$LIB.FUP.context_menu.text_edit()'>編集</li>";
            }
            
            //trashのみ
            if(type=='trash'){
                //trash-delete
                html+="<li class='trash_empty' onclick='$LIB.FUP.context_menu.trash_empty()'>ゴミ箱を空にする</li>";
                
            }
            
            html+="</ul>";
            
            return html;
        },
        //右クリックメニューを元に、対象explorerウィンドウ、階層パス（dir）、対象ファイル名を抽出
        config:function(){
            var e = document.getElementById($LIB.FUP.context_menu.id);
            if(!e.data.target){
                return {
                    dir:'',
                    file:''
                }
            }
            
            var t = e.data.target;
            
            //var explorer = $LIB.search.css(e.target.parentNode,$LIB.FUP.data.cls.explorer);
            //var dir = explorer.data.dir;
            //dir += (dir.match(/\/$/))?"":"/";
            return {
                explorer:$LIB.search.css(t.parentNode,$LIB.FUP.data.cls.explorer),
                dir:t.data.dir,
                file:t.data.file
            };
        },
        
        //開く
        open:function(e){
            //if(!e){
                
                /*
                //右クリックメニュー削除
                $LIB.FUP.context_menu.close($LIB.FUP.context_menu.id);
                return;
                */
            //}
            
            var menu = document.getElementById($LIB.FUP.context_menu.id);
            if(menu==null){return}
            
            //console.log("open : "+e);
            
            //ダブルクリック時と同じ処理
            $LIB.FUP.window.dblclick(menu.data.target);
            
            //右クリックメニュー削除
            $LIB.FUP.context_menu.close($LIB.FUP.context_menu.id);
        },
        //右クリックメニューを選択（クリック）した後
        select:function(){
            
            //エレメント判定
            var e = document.getElementById($LIB.FUP.context_menu.id);
            if(e==null){return}
            
            var mouse ={
                x:event.pageX,
                y:event.pageY
            };
            var pos = $LIB.pos(e);
            var size =$LIB.size(e);
            
            if(mouse.x>pos.x && mouse.y>pos.y && mouse.x<(pos.x+size.x) && mouse.y<(pos.y+size.y)){return}
            
            //コンテキストメニュー削除
            $LIB.FUP.context_menu.close($LIB.FUP.context_menu.id);
            
        },
        //コンテキストメニューの削除
        close:function(id){
            if(!id){id=$LIB.FUP.context_menu.id}
            var e = document.getElementById(id);
            
            if(e!=null){
                if(e.data.target){
                    //e.data.target.style.setProperty("background-color","transparent","");
                    e.data.target.className = $LIB.css.name("del",e.data.target.className,$LIB.FUP.data.cls.on);
                    
                    //alert(e.target.className);
                }
                e.parentNode.removeChild(e);
            }
        },
        //削除
        file_delete:function(){
            var menu = document.getElementById($LIB.FUP.context_menu.id);
            if(menu==null){return}
            //var conf = this.config();
            
            var e = menu.data.target;
            
            if(confirm("ファイルを削除しますか？\n"+e.data.dir+e.data.file)){
                $LIB.ajax.set({
                    path:$LIB.FUP.data.ajax_path,
                    mode:[
                        'mode=del',
                        'type='+e.data.type,
                        'dir=' +$LIB.string.url_encode(e.data.dir,  $LIB.FUP.data.url_string),
                        'file='+$LIB.string.url_encode(e.data.file, $LIB.FUP.data.url_string)
                    ],
                    elm:$LIB.search.css(e.parentNode,$LIB.FUP.data.cls.explorer),
                    data:{
                        type:"folder",
                        dir:e.data.dir,
                        file:e.data.file
                        
                    },
                    
                    //リロード処理
                    success:function(res){
                        //alert(res);
                        $LIB.FUP.window.contents(this.elm,this.data);
                        //右クリックメニュー削除
                        $LIB.FUP.context_menu.close($LIB.FUP.context_menu.id);
                    }
                });
            }
            else{
                //右クリックメニュー削除
                $LIB.FUP.context_menu.close($LIB.FUP.context_menu.id);
            }
        },
        //フォルダ作成
        make_folder:function(){
            //var conf = this.config();
            
            var menu = document.getElementById($LIB.FUP.context_menu.id);
            if(menu==null){return}
            //var e = menu.data.target;
            
            //alert(menu.data.dir);return;
            
            var new_file = $LIB.FUP.data.new_file+'_'+(+new Date());
            //alert(menu.data.dir);
            
            $LIB.ajax.set({
                path:$LIB.FUP.data.ajax_path,
                mode:[
                    'mode=make_folder',
                    'dir='+$LIB.string.url_encode(menu.data.dir,$LIB.FUP.data.url_string),
                    'new_name='+new_file
                ],
                elm:$LIB.search.css(menu.data.target.parentNode,$LIB.FUP.data.cls.explorer),
                data:{
                    type:"folder",
                    dir:menu.data.dir,
                    file:new_file
                },
                //new_file:new_file,
                //リロード処理
                success:function(res){
                    var menu = document.getElementById($LIB.FUP.context_menu.id);
                    var contents = $LIB.search.css(menu.data.target,$LIB.FUP.data.cls.contents);
                    var win = $LIB.search.css(menu.data.target,$LIB.FUP.data.cls.explorer);
                    //alert(this.elm.className);
                    $LIB.FUP.window.contents(this.elm);
                    
                    //リネーム処理
                    var li = contents.getElementsByTagName("li");
                    //ファイル検索
                    for(var i=0;i<li.length;i++){
                        if(li[i].data.file==this.data.file){
                            menu.data.target = li[i];
                            menu.data.file = this.data.file;
                        }
                    }
                    $LIB.FUP.context_menu.name_change();
                    
                    //右クリックメニュー削除
                    $LIB.FUP.context_menu.close($LIB.FUP.context_menu.id);
                }
            });
        },
        //名前変更
        name_change:function(){
            var menu = document.getElementById($LIB.FUP.context_menu.id);
            var on = '$LIB.FUP.context_menu.name_change2(this)';
            var str = menu.data.file;
            menu.data.target.innerHTML = "<input type='text' class='"+$LIB.FUP.data.update_name+"' id='"+$LIB.FUP.data.update_name+"' name='"+$LIB.FUP.data.update_name+"' onchange='"+on+"' onblur='"+on+"'>";
            
            var e = document.getElementById($LIB.FUP.data.update_name);
            e.value = str;
            //e.target = menu.data.target;
            e.data={
                win:$LIB.search.css(menu.data.target.parentNode,$LIB.FUP.data.cls.explorer),
                target:menu.data.target,
                type:menu.data.type,
                dir:menu.data.dir,
                file:menu.data.file
            };
            //e.explorer = $LIB.search.css(e.target.parentNode,$LIB.FUP.data.cls.explorer);
            //e.dir      = e.explorer.getElementsByClassName($LIB.FUP.data.cls.title)[0].title;
            e.data.dir += (e.dir.match(/\/$/))?"":"/";
            
            e.focus();
            e.select();
            
            //右クリックメニュー非表示
            $LIB.FUP.context_menu.close($LIB.FUP.context_menu.id);
        },
        //名前変更実行処理
        name_change2:function(e){
            if($LIB.FUP.context_menu.name_change_flg){return}
            
            else if(e.value==""){
                alert("ファイル名が入力されていません。");
                //リロード処理
                e.focus();
                return;
            }
            //同一名称の場合は、処理なし
            else if(e.data.target && e.value == e.data.dir){
                //リロード処理
                e.data.target.innerHTML = e.value;
                return;
            }
            
            //同一階層に同じファイル名がないかチェック
            
            $LIB.FUP.context_menu.name_change_flg=true;
            
            $LIB.ajax.set({
                path:$LIB.FUP.data.ajax_path,
                mode:[
                    'mode=rename',
                    'dir='+$LIB.string.url_encode(e.data.dir,$LIB.FUP.data.url_string),
                    'file='+$LIB.string.url_encode(e.data.file,$LIB.FUP.data.url_string),
                    'new_name='+$LIB.string.url_encode(e.value,$LIB.FUP.data.url_string)
                ],
                elm:$LIB.search.css(e.data.target.parentNode,$LIB.FUP.data.cls.explorer),
                data:{
                    type:e.data.file,
                    dir:e.data.dir,
                    file:e.data.file
                },
                
                //target:e.data.target,
                input:e,
                //リロード処理
                success:function(res){
                    $LIB.FUP.window.contents(this.elm);
                    $LIB.FUP.context_menu.name_change_flg=false;
                }
            });
        },
        download:function(type){//console.log(type);
            var conf = this.config();
            //alert(conf.dir+"/"+conf.file);
            
            //ダウンロード処理(getで別ウィンドウを開いてDL)
            window.open($LIB.FUP.data.ajax_path+"&mode=download"+"&dir="+conf.dir+"&file="+conf.file);
            console.log($LIB.FUP.data.ajax_path+"&mode=download"+"&dir="+conf.dir+"&file="+conf.file);
            
            //右クリックメニュー非表示
            $LIB.FUP.context_menu.close($LIB.FUP.context_menu.id);
        },
        //ゴミ箱
        trash:function(){
            //右クリックメニュー
            var menu = document.getElementById($LIB.FUP.context_menu.id);
            if(menu==null){return}
            
            //console.log("trash");
            $LIB.ajax.set({
                path:$LIB.FUP.data.ajax_path,
                mode:[
                    'mode=trash_move',
                    'target='+$LIB.string.url_encode(menu.data.dir+menu.data.file,$LIB.FUP.data.url_string),
                    'send='+$LIB.string.url_encode($LIB.FUP.data.trash+"/"+menu.data.file+"."+(+new Date()),$LIB.FUP.data.url_string)
                ],
                elm:$LIB.search.css(menu.data.target.parentNode,$LIB.FUP.data.cls.explorer),
                //リロード処理
                success:function(res){
                    $LIB.FUP.window.contents(this.elm);
                }
            });
            
            
            //右クリックメニューを閉じる
            $LIB.FUP.context_menu.close($LIB.FUP.context_menu.id);
        },
        trash_empty:function(){
//            alert("まだ搭載してません。");
            
            if(!confirm("ゴミ箱の中を空にします。\n（この操作はやり直しができません）")){return}
            
            $LIB.ajax.set({
                path:$LIB.FUP.data.ajax_path,
                mode:[
                    'mode=trash_empty',
                    'trash='+$LIB.string.url_encode($LIB.FUP.data.trash,$LIB.FUP.data.url_string)
                ],
                //リロード処理
                success:function(res){
                    var win = document.getElementsByClassName($LIB.FUP.data.cls.explorer);
                    for(var i=0;i<win.length;i++){
                        if(win[i].data.type!='trash'){continue}
                        $LIB.FUP.window.contents(win[i]);
                    }
                    
                }
            });
            
            //右クリックメニュー削除
            $LIB.FUP.context_menu.close($LIB.FUP.context_menu.id);
        },
        archive:function(){
            alert("まだ搭載してません。");
            
            //右クリックメニュー削除
            $LIB.FUP.context_menu.close($LIB.FUP.context_menu.id);
        },
        text_edit:function(){
            //右クリックメニュー
            var menu = document.getElementById($LIB.FUP.context_menu.id);
            if(menu==null){return}
            
            //var win = $LIB.search.css(menu.data.target.parentNode,$LIB.FUP.data.cls.explorer);
            
            //$LIB.FUP.window.contents(this.elm);
            $LIB.FUP.window.open({type:'text_edit',dir:menu.data.target.data.dir,file:menu.data.target.data.file});
            
            //右クリックメニューを閉じる
            $LIB.FUP.context_menu.close($LIB.FUP.context_menu.id);
            /*
            
            
            //console.log("trash");
            $LIB.ajax.set({
                path:$LIB.FUP.data.ajax_path,
                mode:[
                    'mode=text_edit',
                    'path='+$LIB.string.url_encode(menu.data.dir+menu.data.file,$LIB.FUP.data.url_string)
                ],
                win:$LIB.search.css(menu.data.target.parentNode,$LIB.FUP.data.cls.explorer),
                //リロード処理
                success:function(res){
                    //$LIB.FUP.window.contents(this.elm);
                    $LIB.FUP.window.open({type:'file',dir:this.win.data.dir,file:this.win.data.file});
                    //右クリックメニューを閉じる
                    $LIB.FUP.context_menu.close($LIB.FUP.context_menu.id);
                }
            });
            */
        },
    $:0},
    
    //対象項目の判別[icon,list,body]
    check_element:function(e){
        if(!e||!e.tagName||e.tagName=="BODY"){return ""}
        
        var property = e.getElementsByClassName($LIB.FUP.data.cls.property);
        if($LIB.css.check_name(e.className,$LIB.FUP.data.cls.contents)){return $LIB.FUP.data.cls.contents}
        if(!property.length || !property[0].innerHTML){return ""}
        eval("var data={"+property[0].innerHTML+"}");
        
        return data.type;
        /*
        //icon
        if($LIB.css.check_name(e.className,"icon")){
            //return "icon";
        }
        
        //explorer-folder
        else if($LIB.css.check_name(e.className,"folder")){
            return "folder";
        }
        //explorer-file
        else if($LIB.css.check_name(e.className,"file")){
            return "file";
        }
        //explorer-link
        else if($LIB.css.check_name(e.className,"link")){
            //return "link";
        }
        //explorer-contents(non-file)
        else if($LIB.css.check_name(e.className,$LIB.FUP.data.cls.contents)){
            return $LIB.FUP.data.cls.contents;
        }
        */
        //parentをチェック
        //return $LIB.FUP.check_element(e.parentNode);
    },
    
    
    unload:function(){
        //if(!confirm("ページが切り替わりますが、よろしいですか？")){return}
        if(!$LIB.FUP.data.save_flg){return}
        else{return "保存していないデータは破棄されます。"}
    },
    
    //ファイルドロップイン処理
    drop:{
        //ドラッグ→up
        start:function(e){
            //console.log("start:"+e.target.tagName);
            var explorer = document.getElementsByClassName($LIB.FUP.data.cls.explorer);
            for(var i=0;i<explorer.length;i++){
                var file_upload = explorer[i].getElementsByClassName($LIB.FUP.data.cls.upload);
                if(!file_upload.length){continue}
                //file_upload[0].style.setProperty("visibility","visible","");
                file_upload[0].style.setProperty("display","block","");
                //file_upload[0].style.setProperty("border","4px solid red","");
            }
            
        },
        move:function(e){
            //console.log("move:"+e.target.tagName);
        },
        out:function(e){
            //console.log("out:"+e.target.tagName);
            
            var explorer = document.getElementsByClassName($LIB.FUP.data.cls.explorer);
            for(var i=0;i<explorer.length;i++){
                var file_upload = explorer[i].getElementsByClassName($LIB.FUP.data.cls.upload);
                if(!file_upload.length){continue}
                //file_upload[0].style.setProperty("visibility","hidden","");
                file_upload[0].style.setProperty("display","none","");
            }
            
        },
        enter:function(e){
            //console.log("enter:"+e.target.tagName);
        },
        end:function(e){
            e.preventDefault();
            
            //iframe(file-upload)
            $LIB.FUP.drop.out();
            
        }
    },
    //マウスドラッグ処理（ウィンドウ移動等）
    drag:{
        //ページ内の全てのオブジェクトの移動処理
        set:function(){
            var drag = document.getElementsByClassName($LIB.FUP.data.cls.drag);
            for(var i=0;i<drag.length;i++){
                if(drag[i].onmousedown){continue}
                //if(e && drag[i]!=e){continue}
                
                drag[i].onmousedown=function(){
                    $LIB.FUP.drag.move_start(this);
                }
            }
        },
        //マウスドラッグでオブジェクトを移動させる。
        move_start:function(evt){
            
            var mouse={
                x:event.pageX,
                y:event.pageY
            };
            
            var e = $LIB.search.css(evt,$LIB.FUP.data.cls.move);
            if(!e){return}
            
            var pos = $LIB.pos(e);
            $LIB.FUP.drag.move_flg={
                elm:e,
                pos:{
                    x:(mouse.x-pos.x),
                    y:(mouse.y-pos.y)
                },
                screen:{
                    x:document.body.offsetWidth,
                    y:document.body.offsetHeight
                }
            };
            var z = $LIB.FUP.drag.move_zindex();
            e.style.setProperty("z-index",(z+1),"");
        },
        move_action:function(evt){
            /*
            //$LIB.FUP.data.iframe_mouseover_flg
            if($LIB.FUP.data.iframe_mouseover_flg){
                console.log("test");
                $LIB.FUP.data.iframe_mouseover_flg.style.setProperty("border","1px solid red","");
            }
            */
            
            //resize
            $LIB.FUP.window.resize.move(evt);
            
            if(typeof($LIB.FUP.drag.move_flg)=='undefined'){return}
            var mouse={
                x:event.pageX,
                y:event.pageY
            };
            
            var data = $LIB.FUP.drag.move_flg;
            
            //画面外にマウスが出た場合は、移動キャンセル
            if(mouse.x<=0 || mouse.x>=data.screen.x || mouse.y<=0 || mouse.y>=data.screen.y){
                delete $LIB.FUP.drag.move_flg;
                return;
            }
            
            data.elm.style.setProperty("left",(mouse.x-data.pos.x)+"px","");
            data.elm.style.setProperty("top", (mouse.y-data.pos.y)+"px","");
        },
        move_end:function(){
            
            //resize
            $LIB.FUP.window.resize.end();
            
            //iframe(file-upload)
            $LIB.FUP.drop.out();
            
            delete $LIB.FUP.drag.move_flg;
        },
        //z-indexで最前値を取得
        move_zindex:function(){
            var move = document.getElementsByClassName($LIB.FUP.data.cls.move);
            var zindex=0;
            for(var i=0;i<move.length;i++){
                var z = parseInt($LIB.get_style(move[i],"z-index"));
                if(z>=zindex){
                    zindex = z;
                }
            }
            return zindex;
        }
    },
    
    /*
    デスクトップ処理
    */
    desktop:{
        set:function(){
            
            
            this.icon_set();
        },
        
        icon_set:function(e){
            var icon = document.getElementsByClassName($LIB.FUP.data.cls.icon);
            
            var x=$LIB.FUP.data.icon_margin;
            var y=$LIB.FUP.data.icon_margin;
            
            for(var i=0;i< icon.length;i++){
                
                //プロパティが存在しない場合は、処理しない
                var data = icon[i].getElementsByClassName($LIB.FUP.data.cls.property);
                if(!data.length){continue}
                if(!data[0].innerHTML){continue}
                
                //指定がある場合は、指定のみ
                if(e && e!=icon[i]){continue}
                
                //データ処理
                //alert("var tmp={"+data[0].innerHTML+"}");
                eval("var tmp={"+data[0].innerHTML+"}");
                icon[i].data = tmp;
                icon[i].data_flg = data[0].innerHTML;
                
                //title属性
                icon[i].title = tmp.dir;
                
                //img処理
                var img = icon[i].getElementsByTagName("img");
                if(tmp.img && !img.length){
                    var html="";
                    html+= "<img src='"+tmp.img+"' />";
                    html+= "<div class='dir_name'>"+tmp.name+"</div>";
                    icon[i].innerHTML=html;
                }
                //属性処理
                if(!tmp.img && img.length){
                    tmp.img = img[0].src;
                }
                //名称
                var nm = icon[i].getElementsByClassName("dir_name");
                //属性処理
                if(!tmp.name && nm.length){
                    tmp.name = nm[0].innerHTML;
                }
                
                //座標調整
                //icon[i].style.setProperty("left",x+"px","");
                //icon[i].style.setProperty("top", y+"px","");
                y += icon[i].offsetHeight + $LIB.FUP.data.icon_margin;
                
                //イベント処理
                $LIB.event(icon[i],"dblclick",function(){
                    //console.log(this.data);
                    //console.log(this.innerHTML);
                    eval("var tmp={"+this.data_flg+"}");
                    this.data = tmp;
                    //this.data = this.data_flg;
                    $LIB.FUP.window.open(this.data);
                });
                //右クリック
                //icon[i].oncontextmenu=function(event){
                $LIB.event(icon[i],"contextmenu",function(event){
                    //console.log(1234);
                    //ゴミ箱以外はメニューなし
                    //if(e.data.type!='trash'){return}
                    
                    //メニューを閉じる
                    $LIB.FUP.context_menu.close($LIB.FUP.context_menu.id);
                    
                    var e = this;
                    
                    //マウス座標を元に配置
                    var x = event.pageX +16;
                    var y = event.pageY -8;
                    
                    var d = document.createElement("div");
                    d.id  = $LIB.FUP.context_menu.id;
                    //var win = $LIB.search.css(e.parentNode,$LIB.FUP.data.cls.explorer);
                    d.data={
                        target:e,
                        type:e.data.type,
                        dir:e.data.dir,
                        file:""
                    };
                    
                    d.style.setProperty("left",x+"px","");
                    d.style.setProperty("top", y+"px","");
                    var z = $LIB.FUP.drag.move_zindex();
                    d.style.setProperty("z-index",(z+1),"");
                    d.innerHTML=$LIB.FUP.context_menu.desktop(e.data.type,e.data.dir);
                    var li = d.getElementsByTagName("li");
                    if(!li.length){return}
                    
                    document.body.appendChild(d);
                    
                    //表示エリア調整
                    var screen = $LIB.browser();
                    if(screen.y < y+d.offsetHeight){
                        d.style.setProperty("top", (screen.y-d.offsetHeight)+"px","");
                    }
                    return false;
                });
                //};
            }
        },
    $:0},
    
    window:{
        //新規windowを開く
        open:function(data){
            
            //console.log("window.open : "+data.type+"@"+data.dir+"@"+data.file);
            
            var d = document.createElement("div");
            document.body.appendChild(d);
            d.className= $LIB.FUP.data.cls.explorer+" "+$LIB.FUP.data.cls.move;
            
            //property
            /*
            d.data = {
                type:data.type,
                dir:data.dir,
                file:data.file
            };
            */
            d.data = data;
            
            //表示順位設定
            var z = $LIB.FUP.drag.move_zindex();
            d.style.setProperty("z-index",(z+1),"");
            
            //表示位置（ウィンドウ数により変動）
            var cnt = document.getElementsByClassName($LIB.FUP.data.cls.explorer);
            var x = $LIB.FUP.data.window.x + (cnt.length * $LIB.FUP.data.window.margin);
            var y = $LIB.FUP.data.window.y + (cnt.length * $LIB.FUP.data.window.margin);
            
            // size-set
            var win_size = $LIB.browser();
            // if previous object existing then that size get.
            var w = (cnt.length>1)?cnt[0].offsetWidth :(win_size.x*0.8<500)?win_size.x*0.8:500;
            var h = (cnt.length>1)?cnt[0].offsetHeight:(win_size.y*0.8<500)?win_size.y*0.8:500;
            //size-over-check
            if(x+w > win_size.x-($LIB.FUP.data.window.padding)){w = (w-((x+w)-win_size.x)-($LIB.FUP.data.window.padding));}
            if(y+h > win_size.y-($LIB.FUP.data.window.padding)){h = (h-((y+h)-win_size.y)-($LIB.FUP.data.window.padding));}
            //max-size
            if(w<100){w=100}
            if(h<100){h=100}
            //size-out-window-check
            if(x > win_size.x-w-$LIB.FUP.data.window.padding){x = win_size.x-w-$LIB.FUP.data.window.padding}
            if(y > win_size.y-h-$LIB.FUP.data.window.padding){y = win_size.y-h-$LIB.FUP.data.window.padding}
            
            console.log(x+":"+y+"/"+w+":"+h);

            //value-set
            d.style.setProperty("left",x+"px","");
            d.style.setProperty("top", y+"px","");
            d.style.setProperty("width" , w+"px","");
            d.style.setProperty("height", h+"px","");
            
            //ウィンドウの内容を表示
            $LIB.FUP.window.inner(d);            
            
            //イベント処理
            $LIB.FUP.drag.set(d);
            
        },
        //explorerを閉じる
        close:function(e,cls){
            if(!cls){cls=$LIB.FUP.data.cls.explorer}
            var e = $LIB.search.css(e.parentNode,cls);
            if(!e){return}
            
            if(e.data.type=="file"){
                var textarea = e.getElementsByTagName("textarea");
                if(textarea.length && textarea[0].save_flg){
                    if(!confirm("内容が変更されています。\nウィンドウを閉じると変更内容が失われますがよろしいですか？")){return}
                }
            }
            
            e.parentNode.removeChild(e);
        },
        //iframe処理(uploader)
        iframe_set:function(e){
            var iframe = e.getElementsByClassName($LIB.FUP.data.cls.upload);
            if(!iframe.length){return}
            
            //CSSセット
            $LIB.css.header_add(
                [
                    {   s:"body",
                        d:[
                            "width:100%",
                            "height:100%",
                            "border:0",
                            "padding:0",
                            "margin:0",
                            "overflow:hidden"
                        ]
                    },
                    {   s:"input[type='file']",
                        d:[
                            "width:100%",
                            "height:100%"
                        ]
                    }
                ],
                "",
                iframe[0].contentWindow.document
            );
            
            var html="";
            html+= "<html>";
            html+= "<head>";
            html+= "<title>iframe</title>";
            html+= "</head>";
            html+= "<body>";
            html+= "<form name='form1' method='post' action='"+$LIB.FUP.data.ajax_path+"' enctype='multipart/form-data'>";
            html+= "<input type='hidden' name='mode' value='upload'>";
            html+= "<input type='hidden' name='dir' value='"+e.data.dir+"'>";
            html+= "<input type='file' name='file_data[]' multiple='multiple' onchange='parent.$LIB.FUP.data.save_flg=true;submit()'>";
            html+= "</form>";
            html+= "</body>";
            html+= "</html>";
            
            iframe[0].contentWindow.document.body.innerHTML = html;
            
            //console.log(iframe[0].contentWindow.document.body.innerHTML);
            
            //アップロード後の処理
            iframe[0].onload=function(){
            //iframe[0].contentWindow.document.body.onload=function(){
                //console.log("load");
                
                $LIB.FUP.window.iframe_set(this);
                
                //コンテンツ更新（リロード処理）
                $LIB.FUP.window.inner($LIB.search.css(this.parentNode,$LIB.FUP.data.cls.explorer));

                $LIB.FUP.data.save_flg=false;
            }
            
            //マウスオーバー・アウト時の画面表示処理
            iframe[0].onmouseover=function(){
                
                $LIB.FUP.data.iframe_mouseover_flg = $LIB.search.css(e,$LIB.FUP.data.cls.contents);
            };
            iframe[0].onmouseout=function(){
                //$LIB.FUP.data.iframe_mouseover_flg.style.setProperty("border","0","");
                
                if(typeof($LIB)=='undefined'
                || typeof($LIB.FUB)=='undefined'
                || typeof($LIB.FUB.data)=='undefined'
                ){return}
                
                $LIB.FUP.data.iframe_mouseover_flg = false;
            };
            
            /*
            iframe[0].contentWindow.document.oncontextwindow=function(){
                //console.log(1234);
                //alert(1234);
            };
            */
        },
        //explorerの表示内容
        inner:function(e){
            if(!e.data){return}
            
            var dir  = (e.data.dir.match(/\/$/))?e.data.dir:e.data.dir+"/";
            var type = (!e.data.type)?"folder":e.data.type;
            var file = e.data.file;
            
            //console.log(type);
            
            var html="";
            
            //閉じるボタン
            var close = "<div class='"+$LIB.FUP.data.cls.close+"' onclick='$LIB.FUP.window.close(this,$LIB.FUP.data.cls.explorer)'>X</div>";
            var reload= "<div class='"+$LIB.FUP.data.cls.reload+"' onclick='$LIB.FUP.window.contents($LIB.search.css(this,$LIB.FUP.data.cls.explorer))'></div>";
            var save  = "<div class='"+$LIB.FUP.data.cls.save+"' onclick='$LIB.FUP.window.file_save($LIB.search.css(this,$LIB.FUP.data.cls.explorer))'></div>";
            var drag  = "onmousedown='$LIB.FUP.drag.move_start(this)'";
            
            if(type=='folder'){
                html+= "<div class='"+$LIB.FUP.data.cls.title+" "+$LIB.FUP.data.cls.drag+"' title='"+dir+"' "+drag+">"+dir+reload+close+"</div>";
                html+= "<div class='"+$LIB.FUP.data.cls.contents+"'>Loading...</div>";
                html+= "<iframe class='"+$LIB.FUP.data.cls.upload+"'>%file_upload%</iframe>";
            }
            else if(type=='trash'){
                html+= "<div class='"+$LIB.FUP.data.cls.title+" "+$LIB.FUP.data.cls.drag+"' title='"+dir+"' "+drag+">"+dir+reload+close+"</div>";
                html+= "<div class='"+$LIB.FUP.data.cls.contents+"'>Loading...</div>";
            }
            else if(type=='file'){
                html+= "<div class='"+$LIB.FUP.data.cls.title+" "+$LIB.FUP.data.cls.drag+"' title='"+dir+file+"' "+drag+">"+file+save+close+"</div>";
                html+= "<div class='"+$LIB.FUP.data.cls.contents+"'></div>";
            }
            else if(type=='text_edit'){
                html+= "<div class='"+$LIB.FUP.data.cls.title+" "+$LIB.FUP.data.cls.drag+"' title='"+dir+file+"' "+drag+">"+file+save+close+"</div>";
                html+= "<div class='"+$LIB.FUP.data.cls.contents+"'></div>";
            }
            
            //リサイズエリア
            html+= "<div class='"+$LIB.FUP.data.cls.resize+"' onmousedown=\"$LIB.FUP.window.resize.start(this,event,'"+$LIB.FUP.data.cls.explorer+"')\"></div>";
            
            //画面適用
            e.innerHTML = html;
            
            //contents書き込み
            if(type=='folder'){
                //内容処理（コンテンツ）
                $LIB.FUP.window.contents(e);
                //folderの場合は、iframeを設定する。
                $LIB.FUP.window.iframe_set(e);
            }
            else if(type=='trash'){
                //内容処理（コンテンツ）
                $LIB.FUP.window.contents(e);
            }
            else if(type=='file'){
                //内容処理（コンテンツ）
                $LIB.FUP.window.contents_text(e);
            }
            else if(type=='text_edit'){
                //内容処理（コンテンツ）
                $LIB.FUP.window.text_edit(e);
            }
            
            //contentsの縦サイズ調整
            var h = (e.offsetHeight)-(e.getElementsByClassName($LIB.FUP.data.cls.title)[0].offsetHeight);
            e.getElementsByClassName($LIB.FUP.data.cls.contents)[0].style.setProperty("height",h+"px","");
            
            
        },
        //コンテン内更新
        contents:function(e){//console.log(e.data.dir);
            //フォルダ内容の読み込み
            $LIB.ajax.set({
                path:$LIB.FUP.data.ajax_path,
                mode:[
                    'mode=folder_list',
                    'dir='+$LIB.string.url_encode(e.data.dir,$LIB.FUP.data.url_string)
                ],
                elm:e,
                data:{
                    type:e.data.type,
                    dir:$LIB.string.url_encode(e.data.dir,$LIB.FUP.data.url_string),
                    file:e.data.file
                },
                success:function(res){
                    //console.log(res);
                    $LIB.FUP.window.list(this.elm, res)
                }
            });
        },
        //テキストファイルの中身表示
        contents_text:function(e){
            var contents = e.getElementsByClassName($LIB.FUP.data.cls.contents);
            if(!contents.length){return}
            
            $LIB.ajax.set({
                path:$LIB.FUP.data.ajax_path,
                mode:[
                    'mode=file_open',
                    'dir='+$LIB.string.url_encode(e.data.dir,$LIB.FUP.data.url_string),
                    'file='+$LIB.string.url_encode(e.data.file,$LIB.FUP.data.url_string)
                ],
                contents:contents[0],
                //dir:e.data.dir,
                //file:e.data.file,
                //リロード処理
                success:function(res){
                    eval("var d={"+res+"}");
                    //alert(d.type);
                    if(d.type=="text"){
                        this.contents.style.setProperty("overflow","hidden","");
//                        $LIB.FUP.window.file_open(this.dir,this.file,decodeURIComponent(d.data));
                        this.contents.innerHTML = "<textarea onkeyup='$LIB.FUP.window.file_save_flg(this)'>"+decodeURIComponent(d.data)+"</textarea>";
                        //メモリ
                        var textarea = this.contents.getElementsByTagName("textarea")[0];
                        textarea.value_start = textarea.value.toString();
                        
                    }
                    else if(d.type=="image"){
                        this.contents.innerHTML = "<img src='data:"+d.head+";base64,"+d.data+"' />";
                    }
                    else{
                        this.contents.innerHTML = d.type;
                    }
                    //右クリックメニュー削除
                    $LIB.FUP.context_menu.close($LIB.FUP.context_menu.id);
                }
            });
        },
        //テキストファイルの中身表示
        text_edit:function(e){
            var contents = e.getElementsByClassName($LIB.FUP.data.cls.contents);
            if(!contents.length){return}
            
            $LIB.ajax.set({
                path:$LIB.FUP.data.ajax_path,
                mode:[
                    'mode=text_edit',
                    'dir='+$LIB.string.url_encode(e.data.dir,$LIB.FUP.data.url_string),
                    'file='+$LIB.string.url_encode(e.data.file,$LIB.FUP.data.url_string)
                ],
                contents:contents[0],
                //dir:e.data.dir,
                //file:e.data.file,
                //リロード処理
                success:function(res){//console.log(res);
                    eval("var d={"+res+"}");
                    //alert(d.type);
                    if(d.type=="text"){
                        this.contents.style.setProperty("overflow","hidden","");
//                        $LIB.FUP.window.file_open(this.dir,this.file,decodeURIComponent(d.data));
                        this.contents.innerHTML = "<textarea onkeyup='$LIB.FUP.window.file_save_flg(this)'>"+decodeURIComponent(d.data)+"</textarea>";
                        //メモリ
                        var textarea = this.contents.getElementsByTagName("textarea")[0];
                        textarea.value_start = textarea.value.toString();
                        
                    }
                    else if(d.type=="image"){
                        this.contents.innerHTML = "<img src='data:"+d.head+";base64,"+d.data+"' />";
                    }
                    else{
                        this.contents.innerHTML = d.type;
                    }
                    //右クリックメニュー削除
                    $LIB.FUP.context_menu.close($LIB.FUP.context_menu.id);
                }
            });
        },
        //フォルダ読み込みリストの表示処理(res:json形式)
        list:function(e,res){//console.log(e+"/"+res);
            if(!e || !e.data){return}
            e.data.dir += (e.data.dir.match(/\/$/))?"":"/";
            
            var html="<ul>";
            
            //sys(parent移動)
            var folder = "ondblclick='$LIB.FUP.window.dblclick(this)'";
            //folder+= " oncontextwindow='console.log(1357)'";
            //folder+= " onclick='console.log(1357)'";
            
            //parentが存在する場合
            if(e.data.dir.split('/').length>2){
                
                //ひとつ上の階層
                var paths = e.data.dir.split("/");
                paths.splice(paths.length-2, 2);
                paths.push("");
                
                //表示
                html+= "<li class='folder' "+folder+">";
                html+=  "<div class='property'>";
                html+=      "type:'parent',";
                html+=      "dir:'"+paths.join("/")+"',";
                html+=      "file:'',";
                html+=      "name:'..'";
                html+=  "</div>";
                html+= "..";
                html+= "</li>";
            }
            
            //リスト作成
            if(res){
                eval("var list={"+res+"}");
                for(var i in list){
                    if(typeof(list[i])=='undefined'){list[i]={}}
                    var type = (typeof(list[i].type)=="undefined")?"":list[i].type;
                    var size = (typeof(list[i].size)=="undefined")?"":$LIB.FUP.file_size_check(list[i].size);
                    
                    html+= "<li class='"+type+"' ondblclick='$LIB.FUP.window.dblclick(this)'>";
                    html+=  "<div class='"+$LIB.FUP.data.cls.property+"'>";
                    html+=      "type:'"+type+"',";
                    html+=      "dir:'"+e.data.dir+"',";
                    html+=      "file:'"+i+"',";
                    html+=      "name:'"+i+"'";
                    html+=  "</div>";
                    html+= $LIB.string.url_decode(i,$LIB.FUP.data.url_string);
                    html+= ((!size)?"":" <span class='size'>("+size+")</span>");
                    html+= "</li>";
                }
            }
            html+="</ul>";
            
            var c = e.getElementsByClassName($LIB.FUP.data.cls.contents);
            
            if(!c.length || !c[0]){return}
            c[0].innerHTML = html;
            
            //データ埋め込み処理
            var li = c[0].getElementsByTagName("li");
            for(var i=0;i<li.length;i++){
                var property = li[i].getElementsByClassName($LIB.FUP.data.cls.property);
                if(!property.length || !property[0].innerHTML){continue}
                eval("var data={"+property[0].innerHTML+"}");
                li[i].data={
                    type:data.type,
                    dir:data.dir,
                    file:data.file,
                    name:data.name
                };
            }
            
        },
        
        //ファイル・フォルダをクリックした歳の処理
        dblclick:function(e){
            
            if(!e){
                var e = event.target.data.target;
                
            }
            
            var win = $LIB.search.css(e,$LIB.FUP.data.cls.explorer);
            if(!win.data){return}
            
            var property = e.getElementsByClassName($LIB.FUP.data.cls.property);//alert(property.length);
            //console.log(property[0].innerHTML);
            if(!property.length || !property[0].innerHTML){return}
            
            eval("var data={"+property[0].innerHTML+"}");
            //alert(win.data.type);
            
            
            if(data.type=="folder" || data.type=="parent"){
                //データ調整
                win.data.dir = data.dir + data.file;
                //表示切り替え
                $LIB.FUP.window.inner(win);
            }
            else if(data.type=='file'){
                //内容ウィンドウオープン
                $LIB.FUP.window.open({type:'file',dir:win.data.dir,file:data.file});
                
            }
            else{
                alert(data.type);
            }
            
        },
        //テキストファイルが変更されたらマーキングする。
        file_save_flg:function(textarea){
            //console.log((textarea.value == textarea.value_start)+"/"+textarea.value.length+"/"+textarea.value_start.length);
            if(textarea.value == textarea.value_start){return}
            
            var win = $LIB.search.css(textarea.parentNode,$LIB.FUP.data.cls.explorer);
            var contents = win.getElementsByClassName($LIB.FUP.data.cls.contents);
            
            contents[0].style.setProperty("border","2px solid red","");
            textarea.save_flg=true;
            
        },
        //テキストファイルの保存
        file_save:function(win){
            var contents = win.getElementsByClassName($LIB.FUP.data.cls.contents);
            var textarea = contents[0].getElementsByTagName("textarea");
            //console.log(win.data.type+"@"+win.data.dir+"@"+win.data.file);
            
            //データセーブ
            $LIB.ajax.set({
                path:$LIB.FUP.data.ajax_path,
                mode:[
                    'mode=file_save',
                    'dir='+$LIB.string.url_encode(win.data.dir,$LIB.FUP.data.url_string),
                    'file='+$LIB.string.url_encode(win.data.file,$LIB.FUP.data.url_string),
                    'data='+$LIB.string.url_encode(textarea[0].value,$LIB.FUP.data.url_string)
                ],
                //win:win,
                success:function(res){}
            });
            
            
            
            
            contents[0].style.setProperty("border","0","");
            
            
            textarea[0].save_flg=false;
        },
        //ウィンドウのリサイズ
        resize:{
            //explorerのリサイズ開始
            start:function(e,evt,type){
                if(!type){return}
                
                var w = $LIB.search.css(e.parentNode,type);
                if(!w){return}
                
                var size = $LIB.size(w);
                
                $LIB.FUP.window.resize.flg = {
                    elm:w,
                    resize:e,
                    size:{
                        x:size.x,
                        y:size.y
                    },
                    event:{
                        x:evt.pageX,
                        y:evt.pageY
                    }
                };
                
                
            },
            //explorerのリサイズ処理
            move:function(event){
                if(typeof($LIB.FUP.window.resize.flg)=='undefined'){return}
                
                var flg = $LIB.FUP.window.resize.flg;
                var pos = $LIB.pos(flg.resize);
                
                var x = (flg.size.x +(event.pageX - flg.event.x));
                var y = (flg.size.y +(event.pageY - flg.event.y));
                
                //if(x<$LIB.FUP.data.explorer_minsize){x=$LIB.FUP.data.explorer_minsize}
                //if(y<$LIB.FUP.data.explorer_minsize){y=$LIB.FUP.data.explorer_minsize}
                
                flg.elm.style.setProperty("width", x+"px","");
                flg.elm.style.setProperty("height",y+"px","");
                
                //contentsの縦サイズ調整
                var h = (flg.elm.offsetHeight)-(flg.elm.getElementsByClassName($LIB.FUP.data.cls.title)[0].offsetHeight);
                flg.elm.getElementsByClassName($LIB.FUP.data.cls.contents)[0].style.setProperty("height",h+"px","");
            },
            //explorerのリサイズ終了
            end:function(){
                delete $LIB.FUP.window.resize.flg;
            }
        },
        
    $:0},
    
    /*
    //対象explorer内から指定のファイル（フォルダ）を検索する。
    title_click:function(e){
        var explorer = $LIB.search.css(e,$LIB.FUP.data.cls.explorer);
        $LIB.FUP.window.inner(explorer,e.title);
    },
    */
    //ファイルサイズ（単位調整）
    file_size_check:function(size){
        //byte
        if(size<1024){
            return size+"bite";
        }
        //KB
        else if(size<(1024*1024)){
            return parseInt(size/1024*10,10)/10+"KB";
        }
        //MB
        else if(size<(1024*1024*1024)){
            return parseInt(size/1024/1024*10,10)/10+"MB";
        }
        //GB
        else if(size<(1024*1024*1024*1024)){
            return parseInt(size/1024/1024/1024*10,10)/10+"GB";
        }
        
        
    },
    
    //読み込み伍初期処理
    load:function(){
        
        //icon並べ替え
        //$LIB.FUP.icon_set();
        
        //デスクトップ初期設定
        $LIB.FUP.desktop.set();
        
        //iframeセット
        $LIB.FUP.iframes_set();
        
        //イベント処理
        $LIB.FUP.event.set();
        
        //移動処理
        $LIB.FUP.drag.set();
        
        //ゴミ箱フォルダ作成
        $LIB.ajax.set({
            path:$LIB.FUP.data.ajax_path,
            mode:[
                'mode=make_folder',
//                'dir='+$LIB.string.url_encode(menu.data.dir,$LIB.FUP.data.url_string),
                'path[]=desktop',
                'path[]='+$LIB.FUP.data.trash,
                ''
            ],
            success:function(res){}
        });
        
    },
    
$:0};

//起動処理(ページ読み込み後、起動)
$LIB.event(window,"load",$LIB.FUP.load);
