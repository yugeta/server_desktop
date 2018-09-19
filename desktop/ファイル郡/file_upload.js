if(typeof($LIB.FUP)=="undefined"){$LIB.FUP={}}

$LIB.FUP={
    data:{
        cls:"file_upload",
        
    $:0},
    load:function(){
        /*
        //CSSセット
        $LIB.css.header_add("",[
            {s:"body",d:["border:4px solid red;"]}
        ]);
        */
        //対象項目取得
        var e = document.getElementsByClassName($LIB.FUP.data.cls);
        
        for(var i=0;i< e.length;i++){
            if(e[i].tagName!="DIV"){continue}
            if(e[i].getElementsByTagName("iframe").length){continue}
            if(e[i].innerHTML==""){continue}
            
            //指定クラス名のDIVタグにiframeを埋め込む
            var iframe = document.createElement("iframe");
            iframe.dir = e[i].innerHTML;
            e[i].innerHTML = "";
            e[i].appendChild(iframe);
            
            iframe.onload=function(){
                $LIB.FUP.iframe_set(this);
                //コンテンツ更新
//                alert(this.dir);
//                alert($LIB.FUP.check_parent_class(this.parentNode,"explorer"));
                $LIB.FUP.icon.open_folder_list(this.dir,$LIB.FUP.check_parent_class(this.parentNode,"explorer"));
            }
            $LIB.FUP.iframe_set(iframe);
            
        }
        
        //イベント処理
        $LIB.FUP.event();
        
        //移動処理
        $LIB.FUP.drag_set();
        
        //icon並べ替え
        $LIB.FUP.icon.sort();
    },
    event:function(){
        $LIB.event(window,"mousedown",$LIB.FUP.click_start);
        $LIB.event(window,"mousemove",$LIB.FUP.drag_move_action);
        $LIB.event(window,"mouseup",  $LIB.FUP.drag_move_end);
//        $LIB.event(window,"mouseover",$LIB.FUP.drag_move_end);
//        $LIB.event(window,"contextmenu",$LIB.FUP.right_click);
        //右クリック制御
        window.oncontextmenu=$LIB.FUP.right_click;
//        window.onclick=$LIB.FUP.right_click;
    },
    //クリック処理
    right_click:function(){
        alert("能力");
        var id="context_menu";
        $LIB.FUP.context_menu_del(id);
        
        var d = document.createElement("div");
        d.id  = id;
        d.style.setProperty("left",event.pageX+"px","");
        d.style.setProperty("top", event.pageY+"px","");
        document.body.appendChild(d);
        
        //メニューの中身
        var html="";
        html+="<ul>";
        html+="<li onclick='alert(this.innerHTML)'>データ削除</li>";
        html+="</ul>";
        d.innerHTML=html;
        
        return false;
    },
    //
    click_start:function(){
        var id = "context_menu";
        
        //エレメント判定
        var e = document.getElementById(id);
        if(e==null){return}
//        if(event.target.id==id){return}
        
        var mouse ={
            x:event.pageX,
            y:event.pageY
        };
        var pos = $LIB.pos(e);
        var size =$LIB.size(e);
        
        if(mouse.x>pos.x && mouse.y>pos.y && mouse.x<(pos.x+size.x) && mouse.y<(pos.y+size.y)){return}
        
        //コンテキストメニュー削除
        $LIB.FUP.context_menu_del(id);
        
    },
    //コンテキストメニューの削除
    context_menu_del:function(id){
        var e = document.getElementById(id);
        if(e!=null){e.parentNode.removeChild(e)}
    },
    drag_set:function(){
        var drag = document.getElementsByClassName("drag");
        for(var i=0;i<drag.length;i++){
            if(drag[i].onmousedown){continue}
            
            drag[i].onmousedown=function(){
                $LIB.FUP.drag_move_start(this);
            }
        }
    },
    
    //マウスドラッグでオブジェクトを移動させる。
    drag_move_start:function(evt){
        
        var mouse={
            x:event.pageX,
            y:event.pageY
        };
        
        var e = $LIB.FUP.check_parent_class(evt,"move");
//        alert(evt.tagName+"/"+evt.className+"/"+e);
        if(!e){return}
        
        var pos = $LIB.pos(e);
        $LIB.FUP.drag_move_flg={
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
        var z = $LIB.FUP.drag_move_zindex();
        e.style.setProperty("z-index",(z+1),"");
//        alert(z);
//        alert(e.className);
    },
    drag_move_action:function(){
        if(typeof($LIB.FUP.drag_move_flg)=='undefined'){return}
        var mouse={
            x:event.pageX,
            y:event.pageY
        };
        
        var data = $LIB.FUP.drag_move_flg;
        
        //画面外にマウスが出た場合は、移動キャンセル
        if(mouse.x<=0 || mouse.x>=data.screen.x || mouse.y<=0 || mouse.y>=data.screen.y){
            delete $LIB.FUP.drag_move_flg;
            return;
        }
        
        
        data.elm.style.setProperty("left",(mouse.x-data.pos.x)+"px","");
        data.elm.style.setProperty("top", (mouse.y-data.pos.y)+"px","");
//        data.elm.style.setProperty("z-index",($LIB.FUP.drag_move_zindex()+1),"");
    },
    drag_move_end:function(){
        
        delete $LIB.FUP.drag_move_flg;
    },
    //z-indexで最前値を取得
    drag_move_zindex:function(){
        var move = document.getElementsByClassName("move");
        var zindex=0;
        for(var i=0;i<move.length;i++){
            var z = $LIB.get_style(move[i],"z-index");
            if(z>=zindex){
                zindex = z;
            }
        }
        return zindex;
    },
    
    iframe_set:function(iframe){
        //CSSセット
        $LIB.css.header_add(
            
            [{s:"body",d:[
                "border:0",
                "padding:0",
                "margin:0",
                "overflow:hidden"
            ]}
            
            ],
            "",
            iframe.contentWindow.document
        );
        
//        alert(iframe.dir);
        
        var html="";
        html+= "<form name='form1' method='post' action='upload.php' enctype='multipart/form-data'>";
        html+= "<input type='hidden' name='mode' value='upload'>";
        html+= "<input type='hidden' name='dir' value='"+iframe.dir+"'>";
        html+= "<input type='file' name='file_data[]' multiple='multiple' style='width:100%;height:100%;' onchange='parent.$LIB.drag(this);document.form1.submit();'>";
        html+= "</form>";
        
        iframe.contentWindow.document.body.innerHTML = html;
    },
    
    icon:{
        sort:function(){
            var icon = document.getElementsByClassName("icon");
            
            var margin=8;
            var x=margin;
            var y=margin;
            for(var i=0;i< icon.length;i++){
                icon[i].style.setProperty("left",x+"px","");
                icon[i].style.setProperty("top", y+"px","");
                y+=icon[i].offsetHeight+margin;
            }
            
        },
        open_folder:function(dir){
            
            var d = document.createElement("div");
            d.className="explorer move";
            d.style.setProperty("z-index",$LIB.FUP.drag_move_zindex(),"");
            document.body.appendChild(d);
            
            $LIB.FUP.icon.open_folder_inner(d,dir);
        },
        open_folder_inner:function(d,dir){
            var html="";
            html+= "<div class='title drag' title='"+dir+"'>"+$LIB.FUP.pankuzu(dir)+"<div class='close' onclick='$LIB.FUP.icon.close(this)'>X</div>"+"</div>";
            html+= "<div class='"+$LIB.FUP.data.cls+"'>"+dir+"</div>";
            html+= "<div class='contents'>Loading...</div>";
            d.innerHTML = html;
            
            $LIB.FUP.load();
            
            var h = (d.offsetHeight)-(d.getElementsByClassName("title")[0].offsetHeight)-(d.getElementsByClassName($LIB.FUP.data.cls)[0].offsetHeight);
            
            //contentsの縦サイズ調整
            d.getElementsByClassName("contents")[0].style.setProperty("height",h+"px","");
            
            $LIB.FUP.icon.open_folder_list(dir,d);
            
        },
        //コンテン内更新
        open_folder_list:function(dir,elm){
            //フォルダ内容の読み込み
            $LIB.ajax.set({
                path:"upload.php?tmp="+(+new Date()),
                mode:[
                    'mode=folder_list',
                    'dir='+dir
                ],
                elm:elm,
                success:function(res){$LIB.FUP.folder_list(this,res)},
                error:function(res){$LIB.ajax.error("Read-error !"+res)},
                timeout:function(res){$LIB.ajax.error("Time-out ! "+res)}
            });
        },
        close:function(e){
//            var e = this.check_explorer(e.parentNode);
            var e = $LIB.FUP.check_parent_class(e.parentNode,"explorer");
            if(!e){return}
            
            e.parentNode.removeChild(e);
        },
        check_explorer:function(e){
            if(!e.tagName || e.tagName=="BODY"){return}
//            if(e.className=="explorer"){return e}
            if($LIB.FUP.check_class(e.className,"explorer")){return e}
            e = this.check_explorer(e.parentNode,"explorer");
            return e;
        }
    },
    //対象クラス名が存在するまで、親階層を検索する。
    check_parent_class:function(e,val){
        if(!e.tagName || e.tagName=="BODY"){return}
        if($LIB.FUP.check_class(e.className,val)){return e}
        e = this.check_parent_class(e.parentNode,val);
        return e;
    },
    //対象tagが存在するまで、親階層を検索する。
    check_parent_tag:function(e,val){
        if(!e){return}
        if(e.tagName==val.toUpperCase()){return e}
        e = this.check_parent_tag(e.parentNode,val);
        return e;
    },
    //class名のマッチング判定
    check_class:function(cls,val){
        var arr = cls.split(" ");
        for(var i=0;i<arr.length;i++){
            if(arr[i]==val){return true}
        }
    },
    //フォルダ読み込みリストの表示処理(res:json形式)
    folder_list:function(func,res){
        
        /*
        var e = this.func;
        var a="";
        for(var i in this){
            a+=i+":"+this[i]+"\n";
//            a+=i+":"+this[i]+"\n";
        }
        */
        var e = func.elm;
        if(!e){return}
//        e.style.setProperty("border","4px solid red","");
        if(res){
//            alert(res);
            eval("var list={"+res+"}");
            
            var html="<ul>";
            for(var i in list){
                if(typeof(list[i])=='undefined'){list[i]={}}
                genre = (typeof(list[i].genre)=="undefined")?"":list[i].genre;
                type = (typeof(list[i].type)=="undefined")?"":list[i].type;
                
                //folderの場合はクリック処理を追加
                var folder="";
                if(genre=="folder"){
                    folder = "ondblclick='$LIB.FUP.folder_click(this)'";
                }
                
                html+= "<li class='"+genre+"' title='"+i+"' "+folder+">"+i+"</li>";
            }
            html+="</ul>";
        }
        else{
            html="not-file";
        }
        
        var c = e.getElementsByClassName("contents");
        if(!c.length){return}
        e.getElementsByClassName("contents")[0].innerHTML=html;
        
//        return html;
    },
    pankuzu:function(title){
        var dir = title.split("/");
        
        var html="";
        var link="";
        for(var i=0;i<dir.length;i++){
            link+= dir[i]+"/";
            if(dir[i]!=""){
                html+= "<span class='pankuzu' title='"+link+"' onclick='$LIB.FUP.title_click(this)'>"+dir[i]+"</span>";
            }
            if(dir[i]!=""||i==0){
                html+= "/";
            }
        }
        
        return html;
    },
    folder_click:function(e){
        var explorer = $LIB.FUP.check_parent_class(e,"explorer");
        
        var title = explorer.getElementsByClassName("title")[0].title;
        var dir   = e.title;
        
        $LIB.FUP.icon.open_folder_inner(explorer,title+dir+"/");
    },
    title_click:function(e){
        var explorer = $LIB.FUP.check_parent_class(e,"explorer");
        $LIB.FUP.icon.open_folder_inner(explorer,e.title);
    },
$:0};

$LIB.event(window,"load",$LIB.FUP.load);