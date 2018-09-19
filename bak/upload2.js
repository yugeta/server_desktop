(function(){
	var $={};

	//各種データ
	$.data={
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
	$:0};
	
	//読み込み伍初期処理
	$.start=function(){
		
		//icon並べ替え
		//$.icon_set();
		
		//デスクトップ初期設定
		$.desktop.set();
		
		//iframeセット
		$.iframes_set();
		
		//イベント処理
		$.event.set();
		
		//移動処理(ウィンドウ、mv処理)
		$.drag.set();
		
		//ゴミ箱フォルダ作成
		$.lib.ajax.set({
			path:$.data.ajax_path,
			mode:[
				'mode=make_folder',
				'path[]=desktop',
				'path[]='+$.data.trash,
				''
			],
			success:function(res){}
		});
		
	};
	
	//iframe初期表示処理
	$.iframes_set=function(){
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
	};
	
	//イベント処理
	$.event={
		set:function(){
			$.lib.event(window,"mousedown",  $.context_menu.select);
			//file_move
			$.lib.event(window,"mousemove",  $.file_move.move_action);
			$.lib.event(window,"mouseup",	 $.file_move.move_up);
			//drag
			$.lib.event(window,"mousemove",  $.drag.move_action);
			$.lib.event(window,"mouseup",	 $.drag.move_end);
			//--
			$.lib.event(window,"keydown",	 $.event.keydown);
			$.lib.event(window,"beforeunload",$.unload);
			//ファイルドラッグ
			$.lib.event(window,"mouseover",  $.drop.out);
			$.lib.event(window,"dragenter",  $.drop.start);//ブラウザ画面にドラッグでINした歳
			//$.lib.event(window,"dragover", $.drop.move);//ドラッグでの移動中
			//$.lib.event(window,"dragleave",$.drop.out);//画面外に外れた時
			//$.lib.event(window,"dragenter",$.drop.enter);//ドラッグ可能なオブジェクトと重なった歳
			//$.lib.event(window,"drop",	 $.drop.end);//マウスアップした場合
			
			//$.lib.event(window,"mouseover",$.drag_move_end);
			//$.lib.event(window,"contextmenu",$.event.right_click);
			//右クリック制御
			window.oncontextmenu=$.event.right_click;
			//$.lib.event(window,"contextmenu",$.event.right_click);
			//window.onclick=function(){alert(123)};
			//window.ondblclick=$.event.right_click;
			//window.onclick=$.right_click;
		},
		keydown:function(e){
			//F5
			if(e.keyCode==116){return false}
		},
		//クリック処理
		right_click:function(){
			
			//対象エレメント
			var e = event.target;
			if(!e){return}
			if(typeof(e.data)=='undefined'){e.data={}}
			//if(typeof(e.data)=="undefined"){e.data={}}
			
			//エレメントタイプ別処理 [file , folder , etc...]
			var type = $.check_element(e);
			if(!type){return false}
			
			//カラーリング
			else if(type=='folder'||type=='file'||type=='link'){
				//e.style.setProperty("background-color","#FED","");
				e.className = $.lib.css.name("add",e.className,$.data.cls.on);
			}
			
			//メニューを閉じる
			$.context_menu.close($.context_menu.id);
			
			//マウス座標を元に配置
			var x = event.pageX +16;
			var y = event.pageY -8;
			
			var d = document.createElement("div");
			d.id  = $.context_menu.id;
			//d.target = e;
			var win = $.lib.search.css(e.parentNode,$.data.cls.explorer);
			
			//console.log(e.data.file);
			
			d.data={
				target:e,
				type:type,
				dir: win.data.dir,
				file:((typeof(e.data)!='undefined'&&e.data.file)?e.data.file:"")
			};
			
			d.style.setProperty("left",x+"px","");
			d.style.setProperty("top", y+"px","");
			var z = $.drag.move_zindex();
			d.style.setProperty("z-index",(z+1),"");
			d.innerHTML=$.context_menu.html(type,e.data.dir);
			document.body.appendChild(d);
			$.context_menu.html_addEvent(d);
			
			//表示エリア調整
			var screen = $.lib.browser();
			if(screen.y < y+d.offsetHeight){
				d.style.setProperty("top", (screen.y-d.offsetHeight)+"px","");
			}
			
			return false;
		}
	};
	
	//右クリック実行処理
	$.context_menu={
		id:'context_menu',
		data:{
			basic:{
				file_open:	{name:'開く'	   ,type:['file','folder','link']},
				rename:	   {name:'名前変更'	,type:['file','folder','link']},
				archive:	  {name:'圧縮'	   ,type:['file','folder','link']},
				text_edit:	{name:'編集'	   ,type:['file']},
				make_folder:  {name:'フォルダ作成',type:'all'},
				file_download:{name:'ダウンロード',type:['file']},
				trash:		{name:'ゴミ箱へ移動',type:['file','folder','link']}
				//del:		{name:'データ完全削除',type:['file','folder','link']}
			},
			desktop:{
				file_open:	{name:'開く'		  ,type:['file']},
				text_edit:	{name:'編集'		  ,type:['folder']},
				trash_empty:  {name:'ゴミ箱を空にする',type:['trash']}
			}
		},
		html:function(type,dir,mode){
			var data;
			if(!mode){
				data = this.data.basic;
			}
			else{
				data = this.data[mode];
			}
			
			var html="";
			html+="<ul>";
			for(var i in data){
				if(type && typeof(data[i].type)=='object' && data[i].type.indexOf(type)!=-1){
					
				}
				else if(typeof(data[i].type)=='string' && data[i].type=='all'){
					
				}
				else{continue}
				//html
				html+="<li class='"+i+"'>"+data[i].name+"</li>";
			}
			html+="</ul>";
			
			return html;
		},
		/*
		//デスクトップ用
		html_desktop:function(type,dir){
			var html="";
			html+="<ul>";
			
			//開く
			if(type=='folder'){
				html+="<li class='file_open2'>開く</li>";
			}
			
			//編集
			if(type=='file'){
				//change-name
				html+="<li class='text_edit'>編集</li>";
			}
			
			//trashのみ
			if(type=='trash'){
				//trash-delete
				html+="<li class='trash_empty'>ゴミ箱を空にする</li>";
			}
			
			html+="</ul>";
			
			return html;
		},
		*/
		html_addEvent:function(elm){
			if(!elm){return}
			var file_open = elm.getElementsByClassName('file_open');
			if(file_open.length){
				file_open[0].onclick=$.context_menu.open;
			}

			var rename = elm.getElementsByClassName('rename');
			if(rename.length){
				rename[0].onclick=$.context_menu.name_change;
			}

			var download = elm.getElementsByClassName('download');
			if(download.length){
				download[0].onclick=$.context_menu.archive;
			}
			var file_download = elm.getElementsByClassName('file_download');
			if(download.length){
				download[0].onclick=function(){$.context_menu.archive('file')};
			}

			var text_edit = elm.getElementsByClassName('text_edit');
			if(text_edit.length){
				text_edit[0].onclick=$.context_menu.text_edit;
			}

			var make_folder = elm.getElementsByClassName('make_folder');
			if(make_folder.length){
				make_folder[0].onclick=$.context_menu.make_folder;
			}
			var trash = elm.getElementsByClassName($.data.trash);
			if(trash.length){
				trash[0].onclick=$.context_menu.trash;
			}

			var file_open2 = elm.getElementsByClassName('file_open2');
			if(file_open2.length){
				file_open2[0].onclick=function(){
					$.window.open(document.getElementById($.context_menu.id).data);
					$.context_menu.close($.context_menu.id);
				};
			}
			var trash_empty = elm.getElementsByClassName('trash_empty');
			if(trash_empty.length){
				trash_empty[0].onclick=$.context_menu.trash_empty;
			}
		},
		
		//右クリックメニューを元に、対象explorerウィンドウ、階層パス（dir）、対象ファイル名を抽出
		config:function(){
			var e = document.getElementById($.context_menu.id);
			if(!e.data.target){
				return {
					dir:'',
					file:''
				}
			}
			
			var t = e.data.target;
			
			//var explorer = $.lib.search.css(e.target.parentNode,$.data.cls.explorer);
			//var dir = explorer.data.dir;
			//dir += (dir.match(/\/$/))?"":"/";
			return {
				explorer:$.lib.search.css(t.parentNode,$.data.cls.explorer),
				dir:t.data.dir,
				file:t.data.file
			};
		},
		
		//開く
		open:function(e){
			//if(!e){
				
				/*
				//右クリックメニュー削除
				$.context_menu.close($.context_menu.id);
				return;
				*/
			//}
			
			var menu = document.getElementById($.context_menu.id);
			if(menu==null){return}
			
			//console.log("open : "+e);
			
			//ダブルクリック時と同じ処理
			$.window.dblclick(menu.data.target);
			
			//右クリックメニュー削除
			$.context_menu.close($.context_menu.id);
		},
		/*
		 * 右クリックメニューを選択（クリック）した後
		*/
		select:function(){
			
			//エレメント判定
			var e = document.getElementById($.context_menu.id);
			if(e==null){return}

			var mouse ={
				x:event.pageX,
				y:event.pageY
			};
			var pos = $.lib.pos(e);
			var size =$.lib.size(e);
			
			if(mouse.x>pos.x && mouse.y>pos.y && mouse.x<(pos.x+size.x) && mouse.y<(pos.y+size.y)){return}
			
			//コンテキストメニュー削除
			$.context_menu.close($.context_menu.id);
			
		},
		//コンテキストメニューの削除
		close:function(id){
			if(!id){id=$.context_menu.id}
			var e = document.getElementById(id);
			
			if(e!=null){
				if(e.data.target){
					//e.data.target.style.setProperty("background-color","transparent","");
					e.data.target.className = $.lib.css.name("del",e.data.target.className,$.data.cls.on);
					
					//alert(e.target.className);
				}
				e.parentNode.removeChild(e);
			}
		},
		//削除
		file_delete:function(){
			var menu = document.getElementById($.context_menu.id);
			if(menu==null){return}
			//var conf = this.config();
			
			var e = menu.data.target;
			
			if(confirm("ファイルを削除しますか？\n"+e.data.dir+e.data.file)){
				$.lib.ajax.set({
					path:$.data.ajax_path,
					mode:[
						'mode=del',
						'type='+e.data.type,
						'dir=' +$.lib.string.url_encode(e.data.dir,  $.data.url_string),
						'file='+$.lib.string.url_encode(e.data.file, $.data.url_string)
					],
					elm:$.lib.search.css(e.parentNode,$.data.cls.explorer),
					data:{
						type:"folder",
						dir:e.data.dir,
						file:e.data.file
						
					},
					
					//リロード処理
					success:function(res){
						//alert(res);
						$.window.contents(this.elm,this.data);
						//右クリックメニュー削除
						$.context_menu.close($.context_menu.id);
					}
				});
			}
			else{
				//右クリックメニュー削除
				$.context_menu.close($.context_menu.id);
			}
		},
		//フォルダ作成
		make_folder:function(){
			//var conf = this.config();
			
			var menu = document.getElementById($.context_menu.id);
			if(menu==null){return}
			//var e = menu.data.target;
			
			//alert(menu.data.dir);return;
			
			var new_file = $.data.new_file+'_'+(+new Date());
			//alert(menu.data.dir);
			
			$.lib.ajax.set({
				path:$.data.ajax_path,
				mode:[
					'mode=make_folder',
					'dir='+$.lib.string.url_encode(menu.data.dir,$.data.url_string),
					'new_name='+new_file
				],
				elm:$.lib.search.css(menu.data.target.parentNode,$.data.cls.explorer),
				data:{
					type:"folder",
					dir:menu.data.dir,
					file:new_file
				},
				//new_file:new_file,
				//リロード処理
				success:function(res){
					var menu = document.getElementById($.context_menu.id);
					var contents = $.lib.search.css(menu.data.target,$.data.cls.contents);
					var win = $.lib.search.css(menu.data.target,$.data.cls.explorer);
					//alert(this.elm.className);
					$.window.contents(this.elm);
					
					//リネーム処理
					var li = contents.getElementsByTagName("li");
					//ファイル検索
					for(var i=0;i<li.length;i++){
						if(li[i].data.file==this.data.file){
							menu.data.target = li[i];
							menu.data.file = this.data.file;
						}
					}
					$.context_menu.name_change();
					
					//右クリックメニュー削除
					$.context_menu.close($.context_menu.id);
				}
			});
		},
		//名前変更
		name_change:function(){
			var menu = document.getElementById($.context_menu.id);
			//var on = '$.context_menu.name_change2(this)';
			var str = menu.data.file;
			menu.data.target.innerHTML = "<input type='text' class='"+$.data.update_name+"' id='"+$.data.update_name+"' name='"+$.data.update_name+"'>";
			var update_name = menu.data.target.getElementsByClassName($.data.update_name);
			if(update_name.length){
				update_name[0].onchange=update_name[0].onblur=function(){$.context_menu.name_change2(this)};
			}

			var e = document.getElementById($.data.update_name);
			e.value = str;
			//e.target = menu.data.target;
			e.data={
				win:$.lib.search.css(menu.data.target.parentNode,$.data.cls.explorer),
				target:menu.data.target,
				type:menu.data.type,
				dir:menu.data.dir,
				file:menu.data.file
			};
			//e.explorer = $.lib.search.css(e.target.parentNode,$.data.cls.explorer);
			//e.dir	  = e.explorer.getElementsByClassName($.data.cls.title)[0].title;
			e.data.dir += (e.dir.match(/\/$/))?"":"/";
			
			e.focus();
			e.select();
			
			//右クリックメニュー非表示
			$.context_menu.close($.context_menu.id);
		},
		//名前変更実行処理
		name_change2:function(e){
			if($.context_menu.name_change_flg){return}
			
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
			
			$.context_menu.name_change_flg=true;
			
			$.lib.ajax.set({
				path:$.data.ajax_path,
				mode:[
					'mode=rename',
					'dir='+$.lib.string.url_encode(e.data.dir,$.data.url_string),
					'file='+$.lib.string.url_encode(e.data.file,$.data.url_string),
					'new_name='+$.lib.string.url_encode(e.value,$.data.url_string)
				],
				elm:$.lib.search.css(e.data.target.parentNode,$.data.cls.explorer),
				data:{
					type:e.data.file,
					dir:e.data.dir,
					file:e.data.file
				},
				
				//target:e.data.target,
				input:e,
				//リロード処理
				success:function(res){
					$.window.contents(this.elm);
					$.context_menu.name_change_flg=false;
				}
			});
		},
		download:function(type){//console.log(type);
			var conf = this.config();
			//alert(conf.dir+"/"+conf.file);
			
			//ダウンロード処理(getで別ウィンドウを開いてDL)
			window.open($.data.ajax_path+"&mode=download"+"&dir="+conf.dir+"&file="+conf.file);
			console.log($.data.ajax_path+"&mode=download"+"&dir="+conf.dir+"&file="+conf.file);
			
			//右クリックメニュー非表示
			$.context_menu.close($.context_menu.id);
		},
		//ゴミ箱
		trash:function(){
			//右クリックメニュー
			var menu = document.getElementById($.context_menu.id);
			if(menu==null){return}
			
			//console.log("trash");
			$.lib.ajax.set({
				path:$.data.ajax_path,
				mode:[
					'mode=trash_move',
					'target='+$.lib.string.url_encode(menu.data.dir+menu.data.file,$.data.url_string),
					'send='+$.lib.string.url_encode($.data.trash+"/"+menu.data.file+"."+(+new Date()),$.data.url_string)
				],
				elm:$.lib.search.css(menu.data.target.parentNode,$.data.cls.explorer),
				//リロード処理
				success:function(res){
					$.window.contents(this.elm);
				}
			});
			
			
			//右クリックメニューを閉じる
			$.context_menu.close($.context_menu.id);
		},
		trash_empty:function(){
//			alert("まだ搭載してません。");
			
			if(!confirm("ゴミ箱の中を空にします。\n（この操作はやり直しができません）")){return}
			
			$.lib.ajax.set({
				path:$.data.ajax_path,
				mode:[
					'mode=trash_empty',
					'trash='+$.lib.string.url_encode($.data.trash,$.data.url_string)
				],
				//リロード処理
				success:function(res){
					var win = document.getElementsByClassName($.data.cls.explorer);
					for(var i=0;i<win.length;i++){
						if(win[i].data.type!='trash'){continue}
						$.window.contents(win[i]);
					}
					
				}
			});
			
			//右クリックメニュー削除
			$.context_menu.close($.context_menu.id);
		},
		archive:function(){
			alert("まだ搭載してません。");
			
			//右クリックメニュー削除
			$.context_menu.close($.context_menu.id);
		},
		text_edit:function(){
			//右クリックメニュー
			var menu = document.getElementById($.context_menu.id);
			if(menu==null){return}
			
			//var win = $.lib.search.css(menu.data.target.parentNode,$.data.cls.explorer);
			
			//$.window.contents(this.elm);
			$.window.open({type:'text_edit',dir:menu.data.target.data.dir,file:menu.data.target.data.file});
			
			//右クリックメニューを閉じる
			$.context_menu.close($.context_menu.id);
			/*
			
			
			//console.log("trash");
			$.lib.ajax.set({
				path:$.data.ajax_path,
				mode:[
					'mode=text_edit',
					'path='+$.lib.string.url_encode(menu.data.dir+menu.data.file,$.data.url_string)
				],
				win:$.lib.search.css(menu.data.target.parentNode,$.data.cls.explorer),
				//リロード処理
				success:function(res){
					//$.window.contents(this.elm);
					$.window.open({type:'file',dir:this.win.data.dir,file:this.win.data.file});
					//右クリックメニューを閉じる
					$.context_menu.close($.context_menu.id);
				}
			});
			*/
		},
	$:0};
	
	//対象項目の判別[icon,list,body]
	$.check_element=function(e){
		if(!e||!e.tagName||e.tagName=="BODY"){return ""}
		
		var property = e.getElementsByClassName($.data.cls.property);
		if($.lib.css.check_name(e.className,$.data.cls.contents)){return $.data.cls.contents}
		if(!property.length || !property[0].innerHTML){return ""}
		eval("var data={"+property[0].innerHTML+"}");
		
		return data.type;
		/*
		//icon
		if($.lib.css.check_name(e.className,"icon")){
			//return "icon";
		}
		
		//explorer-folder
		else if($.lib.css.check_name(e.className,"folder")){
			return "folder";
		}
		//explorer-file
		else if($.lib.css.check_name(e.className,"file")){
			return "file";
		}
		//explorer-link
		else if($.lib.css.check_name(e.className,"link")){
			//return "link";
		}
		//explorer-contents(non-file)
		else if($.lib.css.check_name(e.className,$.data.cls.contents)){
			return $.data.cls.contents;
		}
		*/
		//parentをチェック
		//return $.check_element(e.parentNode);
	};
	
	
	$.unload=function(){
		//if(!confirm("ページが切り替わりますが、よろしいですか？")){return}
		if(!$.data.save_flg){return}
		else{return "保存していないデータは破棄されます。"}
	};
	
	//ファイルドロップイン処理
	$.drop={
		//ドラッグ→up
		start:function(e){
			//console.log("start:"+e.target.tagName);
			var explorer = document.getElementsByClassName($.data.cls.explorer);
			for(var i=0;i<explorer.length;i++){
				var file_upload = explorer[i].getElementsByClassName($.data.cls.upload);
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
			
			var explorer = document.getElementsByClassName($.data.cls.explorer);
			for(var i=0;i<explorer.length;i++){
				var file_upload = explorer[i].getElementsByClassName($.data.cls.upload);
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
			$.drop.out();
			
		}
	};
	//
	$.file_move={
		//移動中判定用フラグ
		flg:false,
		target_flg:false,
		id:'file_move',
		set:function(local_win){
			if(!local_win){return}
			//console.log("file_move:"+(+new Date()));
			var folders = local_win.getElementsByClassName('folder');
			var files   = local_win.getElementsByClassName('file');
			//console.log(folders.length+"/"+files.length);
			for(var i=0;i<folders.length;i++){
				this.add_event(folders[i]);
			}
			for(var i=0;i<files.length;i++){
				this.add_event(files[i]);
			}
			
			//z-index
			//local_win.onclick=function(){console.log("click!")};
			$.lib.event(local_win,"click",this.z_click);
			/*
			var z = $.drag.move_zindex();
			e.style.setProperty("z-index",(z+1),"");
			*/
		},
		add_event:function(fl){
			if(!fl){return}
			var property = fl.getElementsByClassName("property");
			if(!property.length){return}
			eval("var prop={"+property[0].innerHTML+"}");
			if(prop.name=='..'){return}
			
			
			$.lib.event(fl,"mousedown",this.move_start);
			//$.lib.event(window,"mouseup"  ,this.move_up);
			//console.log(prop.name);
		},
		move_start:function(evt){
			if(!evt){evt = event}
			
			var mouse={
				x:evt.pageX,
				y:evt.pageY
			};
			
			var e = evt.target;
			//targetなしの時
			if(!e){return}
			
			//INPUTタグは無視する
			if(e.tagName=="INPUT"){return}
			//console.log(e.tagName+"/"+e.className);
			
			$.file_move.flg=e;
			
		},
		move_action:function(evt){
			if(!evt){return}
			
			//フラグ無しの時（通常）
			if($.file_move.flg==false){return}
			
			var dammy= document.getElementById($.file_move.id);
			
			//初回
			if(dammy==null){
				var elm = $.file_move.flg;
				var pos = $.lib.pos(elm);
				var size= $.lib.size(elm);
				
				dammy = document.createElement("div");
				dammy.id = $.file_move.id;
				dammy.style.setProperty("top"   ,pos.y+"px","");
				dammy.style.setProperty("left"  ,pos.x+"px","");
				dammy.style.setProperty("width" ,size.x+"px","");
				dammy.style.setProperty("height",size.y+"px","");
				
				var mouse={
					x:evt.pageX,
					y:evt.pageY
				};
				
				dammy.setAttribute("data-pos_x",pos.x);
				dammy.setAttribute("data-pos_y",pos.y);
				//dammy.setAttribute("data-size_x",size.x);
				//dammy.setAttribute("data-size_y",size.y);
				dammy.setAttribute("data-mouse_x",mouse.x);
				dammy.setAttribute("data-mouse_y",mouse.y);
				
				document.body.appendChild(dammy);
				
				//対象項目非表示
				//elm.style.setProperty("display","none","");
				elm.style.setProperty("background-color","#888","");
				//内容コピー
				dammy.innerHTML = elm.innerHTML;
				dammy.className = elm.className;
				//dammy.className = (elm.className.indexOf('file'))?'file':'folder';
				
			}
			
			//２回目移行
			else{
				var mouse={
					x:evt.pageX,
					y:evt.pageY
				};
				
				var data={
					pos:{
						x:dammy.getAttribute("data-pos_x"),
						y:dammy.getAttribute("data-pos_y")
					},
					/*
					size:{
						x:dammy.getAttribute("data-size_x"),
						y:dammy.getAttribute("data-size_y")
					},
					*/
					mouse:{
						x:dammy.getAttribute("data-mouse_x"),
						y:dammy.getAttribute("data-mouse_y")
					}
				};
				
				dammy.style.setProperty("top"   ,(data.pos.y-(data.mouse.y-mouse.y))+"px","");
				dammy.style.setProperty("left"  ,(data.pos.x-(data.mouse.x-mouse.x))+"px","");
				
				
				
			}
		},
		move_up:function(evt){
			
			//対象項目-移動処理(移動元項目と移動先項目)
			if($.file_move.flg && $.file_move.target_flg){
				var prop1 = $.file_move.flg.getElementsByClassName("property");
				var prop2 = $.file_move.target_flg.getElementsByClassName("property");
				
				
				if(prop1.length
				&& prop2.length
				&& prop1[0].innerHTML
				&& prop2[0].innerHTML
				&& prop2[0].className){
					//console.log(prop1[0].className+"/"+prop2[0].className);
					eval("var data1={"+prop1[0].innerHTML+"}");
					eval("var data2={"+prop2[0].innerHTML+"}");
					
					if(data2.type=="folder"){
						
						//console.log(data1.dir+data1.file+" : "+data2.dir+data2.file);
						/*
						//check
						if(data1.dir+data1.file == data2.dir+data2.file){
							alert("移動できません。");
						}
						*/
						//移動
						//console.log("mv "+data1.dir+data1.file+" "+data2.dir+data2.file);
						//exec("mv "+data1.dir+data1.file+" "+data2.dir+data2.file);
						$.lib.ajax.set({
							path:$.data.ajax_path,
							mode:[
								'mode=file_move',
								'dir1=' +$.lib.string.url_encode(data1.dir ,$.data.url_string),
								'file1='+$.lib.string.url_encode(data1.file,$.data.url_string),
								'dir2=' +$.lib.string.url_encode(data2.dir ,$.data.url_string),
								'file2='+$.lib.string.url_encode(data2.file,$.data.url_string),
							],
							elm1:$.lib.search.css($.file_move.flg       ,$.data.cls.explorer),
							elm2:$.lib.search.css($.file_move.target_flg,$.data.cls.explorer),
							/*
							data:{
								type:e.data.type,
								dir:$.lib.string.url_encode(e.data.dir,$.data.url_string),
								file:e.data.file
							},
							*/
							success:function(res){
								//console.log(res);
								//$.window.list(this.elm1, res);
								//$.window.list(this.elm2, res);
								$.window.contents(this.elm1);
								$.window.contents(this.elm2);
								//console.log(this.dir1+this.file1+" : "+this.dir2+this.file2);
							}
						});
					}
				}
			}
			
			var e = document.getElementById($.file_move.id);
			if(e!=null){
				//対象項目表示
				//$.file_move.flg.style.setProperty("display","block","");
				$.file_move.flg.style.removeProperty("background-color");
				
				//ダミー項目削除
				e.parentNode.removeChild(e);
			}
			//flg-off
			$.file_move.flg=false;
			
			//target-flg
			if($.file_move.target_flg){
				$.file_move.target_out({target:$.file_move.target_flg});
				$.file_move.target_flg=false;
			}
		},
		//対象ディレクトリ判定
		target_over:function(evt){
			if(!evt){return}
			//フラグ無しの時（通常）
			if($.file_move.flg == false){return}
			
			var target = evt.target;
			
			//対象外チェック
			if($.file_move.flg == target){return}
			
			target.style.setProperty("background-color","#CCF","");
			
			$.file_move.target_flg = target;
		},
		target_out:function(evt){
			if(!evt){return}
			//フラグ無しの時（通常）
			if($.file_move.target_flg){
				evt.target.style.removeProperty("background-color");
				$.file_move.target_flg=false;
			}
			
		}
	};
	//マウスドラッグ処理（ウィンドウ移動等）
	$.drag={
		//ページ内の全てのオブジェクトの移動処理
		set:function(){
			var drag = document.getElementsByClassName($.data.cls.drag);
			for(var i=0;i<drag.length;i++){
				if(drag[i].onmousedown){continue}
				//if(e && drag[i]!=e){continue}
				
				drag[i].onmousedown=function(){
					$.drag.move_start(this);
				}
			}
		},
		//マウスドラッグでオブジェクトを移動させる。
		move_start:function(evt){
			
			var mouse={
				x:event.pageX,
				y:event.pageY
			};
			
			var e = $.lib.search.css(evt,$.data.cls.move);
			if(!e){return}
			
			var pos = $.lib.pos(e);
			$.drag.move_flg={
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
			var z = $.drag.move_zindex();
			e.style.setProperty("z-index",(z+1),"");
		},
		move_action:function(evt){
			/*
			//$.data.iframe_mouseover_flg
			if($.data.iframe_mouseover_flg){
				console.log("test");
				$.data.iframe_mouseover_flg.style.setProperty("border","1px solid red","");
			}
			*/
			
			//resize
			$.window.resize.move(evt);
			
			if(typeof($.drag.move_flg)=='undefined'){return}
			var mouse={
				x:event.pageX,
				y:event.pageY
			};
			
			var data = $.drag.move_flg;
			
			//画面外にマウスが出た場合は、移動キャンセル
			if(mouse.x<=0 || mouse.x>=data.screen.x || mouse.y<=0 || mouse.y>=data.screen.y){
				delete $.drag.move_flg;
				return;
			}
			
			data.elm.style.setProperty("left",(mouse.x-data.pos.x)+"px","");
			data.elm.style.setProperty("top", (mouse.y-data.pos.y)+"px","");
			
			//$.file_move.move_action(evt);
		},
		move_end:function(evt){
			
			//resize
			$.window.resize.end();
			
			//iframe(file-upload)
			$.drop.out();
			
			delete $.drag.move_flg;
			
			//file_move
			//$.file_move.move_up(evt);
		},
		//z-indexで最前値を取得
		move_zindex:function(){
			var move = document.getElementsByClassName($.data.cls.move);
			var zindex=0;
			for(var i=0;i<move.length;i++){
				var z = parseInt($.lib.get_style(move[i],"z-index"));
				if(z>=zindex){
					zindex = z;
				}
			}
			return zindex;
		}
	};
	
	/*
	デスクトップ処理
	*/
	$.desktop={
		set:function(){
			
			
			this.icon_set();
		},
		
		icon_set:function(e){
			var icon = document.getElementsByClassName($.data.cls.icon);
			
			var x=$.data.icon_margin;
			var y=$.data.icon_margin;
			
			for(var i=0;i< icon.length;i++){
				
				//プロパティが存在しない場合は、処理しない
				var data = icon[i].getElementsByClassName($.data.cls.property);
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
				y += icon[i].offsetHeight + $.data.icon_margin;
				
				//イベント処理
				$.lib.event(icon[i],"dblclick",function(){
					//console.log(this.data);
					//console.log(this.innerHTML);
					eval("var tmp={"+this.data_flg+"}");
					this.data = tmp;
					//this.data = this.data_flg;
					$.window.open(this.data);
				});
				//右クリック
				//icon[i].oncontextmenu=function(event){
				$.lib.event(icon[i],"contextmenu",function(event){
					//console.log(1234);
					//ゴミ箱以外はメニューなし
					//if(e.data.type!='trash'){return}
					
					//メニューを閉じる
					$.context_menu.close($.context_menu.id);
					
					var e = this;
					
					//マウス座標を元に配置
					var x = event.pageX +16;
					var y = event.pageY -8;
					
					var d = document.createElement("div");
					d.id  = $.context_menu.id;
					//var win = $.lib.search.css(e.parentNode,$.data.cls.explorer);
					d.data={
						target:e,
						type:e.data.type,
						dir:e.data.dir,
						file:""
					};
					
					d.style.setProperty("left",x+"px","");
					d.style.setProperty("top", y+"px","");
					var z = $.drag.move_zindex();
					d.style.setProperty("z-index",(z+1),"");
					d.innerHTML=$.context_menu.html(e.data.type,e.data.dir,'desktop');
					var li = d.getElementsByTagName("li");
					if(!li.length){return}
					
					document.body.appendChild(d);
					$.context_menu.html_addEvent(d);

					
					//表示エリア調整
					var screen = $.lib.browser();
					if(screen.y < y+d.offsetHeight){
						d.style.setProperty("top", (screen.y-d.offsetHeight)+"px","");
					}
					return false;
				});
				//};
			}
		},
	$:0};
	
	$.window={
		//新規windowを開く
		open:function(data){
			
			//console.log("window.open : "+data.type+"@"+data.dir+"@"+data.file);
			
			var d = document.createElement("div");
			document.body.appendChild(d);
			d.className= $.data.cls.explorer+" "+$.data.cls.move;
			
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
			var z = $.drag.move_zindex();
			d.style.setProperty("z-index",(z+1),"");
			
			//表示位置（ウィンドウ数により変動）
			var cnt = document.getElementsByClassName($.data.cls.explorer);
			var x = $.data.window.x + (cnt.length * $.data.window.margin);
			var y = $.data.window.y + (cnt.length * $.data.window.margin);
			
			// size-set
			var win_size = $.lib.browser();
			// if previous object existing then that size get.
			var w = (cnt.length>1)?cnt[0].offsetWidth :(win_size.x*0.8<500)?win_size.x*0.8:500;
			var h = (cnt.length>1)?cnt[0].offsetHeight:(win_size.y*0.8<500)?win_size.y*0.8:500;
			//size-over-check
			if(x+w > win_size.x-($.data.window.padding)){w = (w-((x+w)-win_size.x)-($.data.window.padding));}
			if(y+h > win_size.y-($.data.window.padding)){h = (h-((y+h)-win_size.y)-($.data.window.padding));}
			//max-size
			if(w<100){w=100}
			if(h<100){h=100}
			//size-out-window-check
			if(x > win_size.x-w-$.data.window.padding){x = win_size.x-w-$.data.window.padding}
			if(y > win_size.y-h-$.data.window.padding){y = win_size.y-h-$.data.window.padding}

			//value-set
			d.style.setProperty("left",x+"px","");
			d.style.setProperty("top", y+"px","");
			d.style.setProperty("width" , w+"px","");
			d.style.setProperty("height", h+"px","");
			
			//ウィンドウの内容を表示
			$.window.inner(d);			
			
			//イベント処理
			$.drag.set(d);
			
		},
		//explorerを閉じる
		close:function(e,cls){
			if(!cls){cls=$.data.cls.explorer}
			var e = $.lib.search.css(e.parentNode,cls);
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
			var iframe = e.getElementsByClassName($.data.cls.upload);
			if(!iframe.length){return}
			
			//CSSセット
			$.lib.css.header_add(
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
			html+= "<form name='form1' method='post' action='"+$.data.ajax_path+"' enctype='multipart/form-data'>";
			html+= "<input type='hidden' name='mode' value='upload'>";
			html+= "<input type='hidden' name='dir' value='"+e.data.dir+"'>";
			html+= "<input type='file' id='file_data' name='file_data[]' multiple='multiple'>";
			html+= "</form>";
			html+= "</body>";
			html+= "</html>";
			
			iframe[0].contentWindow.document.body.innerHTML = html;
			var file_data = iframe[0].contentWindow.document.getElementById("file_data");
			if(file_data!=null){
				file_data.onchange=function(){
					//alert(typeof(parent)+"/"+typeof(parent.$LIB));
					parent.$LIB.FUP.data.save_flg=true;
					this.form.submit();
				};
			}
			
			//console.log(iframe[0].contentWindow.document.body.innerHTML);
			
			//アップロード後の処理
			iframe[0].onload=function(){
			//iframe[0].contentWindow.document.body.onload=function(){
				//console.log("load");
				
				$.window.iframe_set(this);
				
				//コンテンツ更新（リロード処理）
				$.window.inner($.lib.search.css(this.parentNode,$.data.cls.explorer));

				$.data.save_flg=false;
			}
			
			//マウスオーバー・アウト時の画面表示処理
			iframe[0].onmouseover=function(){
				$.data.iframe_mouseover_flg = $.lib.search.css(e,$.data.cls.contents);
			};
			iframe[0].onmouseout=function(){
				$.data.iframe_mouseover_flg = false;
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
			var close = "<div class='"+$.data.cls.close+"'>X</div>";
			var reload= "<div class='"+$.data.cls.reload+"'></div>";
			var save  = "<div class='"+$.data.cls.save+"'></div>";
			//var drag  = "onmousedown='$.drag.move_start(this)'";
			
			if(type=='folder'){
				html+= "<div class='"+$.data.cls.title+" "+$.data.cls.drag+"' title='"+dir+"'>"+dir+reload+close+"</div>";
				html+= "<div class='"+$.data.cls.contents+"'>Loading...</div>";
				html+= "<iframe class='"+$.data.cls.upload+"'>%file_upload%</iframe>";
			}
			else if(type=='trash'){
				html+= "<div class='"+$.data.cls.title+" "+$.data.cls.drag+"' title='"+dir+"'>"+dir+reload+close+"</div>";
				html+= "<div class='"+$.data.cls.contents+"'>Loading...</div>";
			}
			else if(type=='file'){
				html+= "<div class='"+$.data.cls.title+" "+$.data.cls.drag+"' title='"+dir+file+"'>"+file+save+close+"</div>";
				html+= "<div class='"+$.data.cls.contents+"'></div>";
			}
			else if(type=='text_edit'){
				html+= "<div class='"+$.data.cls.title+" "+$.data.cls.drag+"' title='"+dir+file+"'>"+file+save+close+"</div>";
				html+= "<div class='"+$.data.cls.contents+"'></div>";
			}
			
			//リサイズエリア
			html+= "<div class='"+$.data.cls.resize+"'></div>";
			
			//画面適用
			e.innerHTML = html;
			
			//event
			var cls_close = e.getElementsByClassName($.data.cls.close);
			if(cls_close.length){
				cls_close[0].onclick=function(){$.window.close(this,$.data.cls.explorer)};
			}
			var cls_reload = e.getElementsByClassName($.data.cls.reload);
			if(cls_reload.length){
				cls_reload[0].onclick=function(){$.window.contents($.lib.search.css(this,$.data.cls.explorer))};
			}
			var cls_save = e.getElementsByClassName($.data.cls.save);
			if(cls_save.length){
				cls_save[0].onclick=function(){$.window.file_save($.lib.search.css(this,$.data.cls.explorer))};
			}
			var cls_title = e.getElementsByClassName($.data.cls.title);
			if(cls_title.length){
				cls_title[0].onmousedown=function(){$.drag.move_start(this)};
			}
			var cls_resize = e.getElementsByClassName($.data.cls.resize);
			if(cls_resize.length){
				cls_resize[0].onmousedown = function(){
					$.window.resize.start(this,event,$.data.cls.explorer)
				};
			}

			//contents書き込み
			if(type=='folder'){
				//内容処理（コンテンツ）
				$.window.contents(e);
				//folderの場合は、iframeを設定する。
				$.window.iframe_set(e);
			}
			else if(type=='trash'){
				//内容処理（コンテンツ）
				$.window.contents(e);
			}
			else if(type=='file'){
				//内容処理（コンテンツ）
				$.window.contents_text(e);
			}
			else if(type=='text_edit'){
				//内容処理（コンテンツ）
				$.window.text_edit(e);
			}
			
			//contentsの縦サイズ調整
			var h = (e.offsetHeight)-(e.getElementsByClassName($.data.cls.title)[0].offsetHeight);
			e.getElementsByClassName($.data.cls.contents)[0].style.setProperty("height",h+"px","");
			
			
		},
		//コンテン内更新
		contents:function(e){//console.log(e.data.dir);
			//フォルダ内容の読み込み
			$.lib.ajax.set({
				path:$.data.ajax_path,
				mode:[
					'mode=folder_list',
					'dir='+$.lib.string.url_encode(e.data.dir,$.data.url_string)
				],
				elm:e,
				data:{
					type:e.data.type,
					dir:$.lib.string.url_encode(e.data.dir,$.data.url_string),
					file:e.data.file
				},
				success:function(res){
					//console.log(res);
					$.window.list(this.elm, res)
				}
			});
		},
		//テキストファイルの中身表示
		contents_text:function(e){
			var contents = e.getElementsByClassName($.data.cls.contents);
			if(!contents.length){return}
			
			$.lib.ajax.set({
				path:$.data.ajax_path,
				mode:[
					'mode=file_open',
					'dir='+$.lib.string.url_encode(e.data.dir,$.data.url_string),
					'file='+$.lib.string.url_encode(e.data.file,$.data.url_string)
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
//						$.window.file_open(this.dir,this.file,decodeURIComponent(d.data));
						this.contents.innerHTML = "<textarea>"+decodeURIComponent(d.data)+"</textarea>";
						//メモリ
						var textarea = this.contents.getElementsByTagName("textarea")[0];
						textarea.value_start = textarea.value.toString();
						textarea.onkeyup = function(){$.window.file_save_flg(this)};
						
					}
					else if(d.type=="image"){
						this.contents.innerHTML = "<img src='data:"+d.head+";base64,"+d.data+"' />";
					}
					else{
						this.contents.innerHTML = d.type;
					}
					//右クリックメニュー削除
					$.context_menu.close($.context_menu.id);
				}
			});
		},
		//テキストファイルの中身表示
		text_edit:function(e){
			var contents = e.getElementsByClassName($.data.cls.contents);
			if(!contents.length){return}
			
			$.lib.ajax.set({
				path:$.data.ajax_path,
				mode:[
					'mode=text_edit',
					'dir='+$.lib.string.url_encode(e.data.dir,$.data.url_string),
					'file='+$.lib.string.url_encode(e.data.file,$.data.url_string)
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
//						$.window.file_open(this.dir,this.file,decodeURIComponent(d.data));
						this.contents.innerHTML = "<textarea>"+decodeURIComponent(d.data)+"</textarea>";
						//メモリ
						var textarea = this.contents.getElementsByTagName("textarea")[0];
						textarea.value_start = textarea.value.toString();
						textarea.onkeyup=function(){$.window.file_save_flg(this)};
						
					}
					else if(d.type=="image"){
						this.contents.innerHTML = "<img src='data:"+d.head+";base64,"+d.data+"' />";
					}
					else{
						this.contents.innerHTML = d.type;
					}
					//右クリックメニュー削除
					$.context_menu.close($.context_menu.id);
				}
			});
		},
		//フォルダ読み込みリストの表示処理(res:json形式)
		//ウィンドウ：オープン後、アップロード後の中身入れ替え処理（一括入れ替え）
		list:function(e,res){
			if(!e || !e.data){return}
			e.data.dir += (e.data.dir.match(/\/$/))?"":"/";
			
			var html="<ul>";
			
			//parentが存在する場合
			if(e.data.dir.split('/').length>2){
				
				//ひとつ上の階層
				var paths = e.data.dir.split("/");
				paths.splice(paths.length-2, 2);
				paths.push("");
				
				//表示
				html+= "<li class='folder dblclick'>";
				html+=  "<div class='property'>";
				html+=	  "type:'parent',";
				html+=	  "dir:'"+paths.join("/")+"',";
				html+=	  "file:'',";
				html+=	  "name:'..'";
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
					var size = (typeof(list[i].size)=="undefined")?"":$.file_size_check(list[i].size);
					
					html+= "<li class='dblclick "+type+"'>";
					html+=  "<div class='"+$.data.cls.property+"'>";
					html+=	  "type:'"+type+"',";
					html+=	  "dir:'"+e.data.dir+"',";
					html+=	  "file:'"+i+"',";
					html+=	  "name:'"+i+"'";
					html+=  "</div>";
					html+= $.lib.string.url_decode(i,$.data.url_string);
					html+= ((!size)?"":" <span class='size'>("+size+")</span>");
					html+= "</li>";
				}
			}
			html+="</ul>";
			
			var c = e.getElementsByClassName($.data.cls.contents);
			
			if(!c.length || !c[0]){return}
			c[0].innerHTML = html;
			var dblclick = c[0].getElementsByClassName('dblclick');
			for(var i=0;i<dblclick.length;i++){
				dblclick[i].ondblclick=function(){$.window.dblclick(this)};
			}

			//データ埋め込み処理
			var li = c[0].getElementsByTagName("li");
			for(var i=0;i<li.length;i++){
				var property = li[i].getElementsByClassName($.data.cls.property);
				if(!property.length || !property[0].innerHTML){continue}
				eval("var data={"+property[0].innerHTML+"}");
				li[i].data={
					type:data.type,
					dir:data.dir,
					file:data.file,
					name:data.name
				};
				
				//file_move
				$.lib.event(li[i],"mouseover",$.file_move.target_over);
				$.lib.event(li[i],"mouseout" ,$.file_move.target_out);
				
			}
			
			//file_move_event
			$.file_move.set(e);
		},
		
		//ファイル・フォルダをクリックした歳の処理
		dblclick:function(e){
			
			if(!e){
				var e = event.target.data.target;
				
			}
			
			var win = $.lib.search.css(e,$.data.cls.explorer);
			if(!win.data){return}
			
			var property = e.getElementsByClassName($.data.cls.property);//alert(property.length);
			//console.log(property[0].innerHTML);
			if(!property.length || !property[0].innerHTML){return}
			
			eval("var data={"+property[0].innerHTML+"}");
			//alert(win.data.type);
			
			
			if(data.type=="folder" || data.type=="parent"){
				//データ調整
				win.data.dir = data.dir + data.file;
				//表示切り替え
				$.window.inner(win);
			}
			else if(data.type=='file'){
				//内容ウィンドウオープン
				$.window.open({type:'file',dir:win.data.dir,file:data.file});
				
			}
			else{
				alert(data.type);
			}
			
		},
		//テキストファイルが変更されたらマーキングする。
		file_save_flg:function(textarea){
			//console.log((textarea.value == textarea.value_start)+"/"+textarea.value.length+"/"+textarea.value_start.length);
			if(textarea.value == textarea.value_start){return}
			
			var win = $.lib.search.css(textarea.parentNode,$.data.cls.explorer);
			var contents = win.getElementsByClassName($.data.cls.contents);
			
			contents[0].style.setProperty("border","2px solid red","");
			textarea.save_flg=true;
			
		},
		//テキストファイルの保存
		file_save:function(win){
			var contents = win.getElementsByClassName($.data.cls.contents);
			var textarea = contents[0].getElementsByTagName("textarea");
			//console.log(win.data.type+"@"+win.data.dir+"@"+win.data.file);
			
			//データセーブ
			$.lib.ajax.set({
				path:$.data.ajax_path,
				mode:[
					'mode=file_save',
					'dir='+$.lib.string.url_encode(win.data.dir,$.data.url_string),
					'file='+$.lib.string.url_encode(win.data.file,$.data.url_string),
					'data='+$.lib.string.url_encode(textarea[0].value,$.data.url_string)
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
				
				var w = $.lib.search.css(e.parentNode,type);
				if(!w){return}
				
				var size = $.lib.size(w);
				
				$.window.resize.flg = {
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
				if(typeof($.window.resize.flg)=='undefined'){return}
				
				var flg = $.window.resize.flg;
				var pos = $.lib.pos(flg.resize);
				
				var x = (flg.size.x +(event.pageX - flg.event.x));
				var y = (flg.size.y +(event.pageY - flg.event.y));
				
				//if(x<$.data.explorer_minsize){x=$.data.explorer_minsize}
				//if(y<$.data.explorer_minsize){y=$.data.explorer_minsize}
				
				flg.elm.style.setProperty("width", x+"px","");
				flg.elm.style.setProperty("height",y+"px","");
				
				//contentsの縦サイズ調整
				var h = (flg.elm.offsetHeight)-(flg.elm.getElementsByClassName($.data.cls.title)[0].offsetHeight);
				flg.elm.getElementsByClassName($.data.cls.contents)[0].style.setProperty("height",h+"px","");
			},
			//explorerのリサイズ終了
			end:function(){
				delete $.window.resize.flg;
			}
		},
	$:0};
	
	/*
	 * //対象explorer内から指定のファイル（フォルダ）を検索する。
	 * title_click:function(e){
	 * 	var explorer = $.lib.search.css(e,$.data.cls.explorer);
	 * 	$.window.inner(explorer,e.title);
	 * },
	*/
	//ファイルサイズ（単位調整）
	$.file_size_check=function(size){
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
	};
	
	

	//各種ライブラリ
	$.lib=(function(){
		
		var core={};
		
		/***********
		 * core.pos(element , target)
		 * 概要：対象項目の座標を取得
		 * param:e  elesment
		 * param:t  target(特定項目内での座標取得も可※未記入OK) ]
		***********/
		core.pos=function(e,t){
			if(typeof(t)=='undefined' || t==null){
				t = document.body;
			}
			//座標算出;
			var pos={x:0,y:0};
			
			if(typeof(e)=='undefined' || e==null){return pos;}
			
			//通常座標;
			var flg=0;
			do{
				if(e == t){break}
				pos.x += e.offsetLeft;
				pos.y += e.offsetTop;
				if(flg>10000){break}
				flg++;
			}
			while(e = e.offsetParent);
			
			return pos;
		};
		/***********
		 * core.size(element)
		 * 概要：対象項目のサイズを取得(指定がない場合はwindow(body)サイズ)
		 * param:e  対象element
		***********/
		core.size=function(e){
			if(!e){return{x:0,y:0}}
			//対象element
			if(typeof(e)=='undefined'){
				if (navigator.userAgent.match("MSIE")&&document.compatMode!='BackCompat'){
					e = document.documentElement;
				}
				else{
					e = document.getElementsByTagName("body")[0];
				}
			}
			//サイズ取得;
			var size={
				x:e.offsetWidth,
				y:e.offsetHeight
			};
			
			//子階層依存※下に１つのみの子を持つ場合サイズチェックを行う;
			if(e.childNodes.length==1 && e.tagName=='A'){
				var chk ={
					x:e.childNodes[0].offsetWidth,
					y:e.childNodes[0].offsetHeight
				};
				if(chk.x > size.x){
					size.x = chk.x;
				}
				if(chk.y > size.y){
					size.y = chk.y;
				}
			}
			return size;
		};
		/***********
		 * URLからクエリ値を連想配列で返す;
		 * core.url(url)
		 * 概要：表示しているページのブラウザアドレスのURLクエリを連想配列で返します。
		 * param:url  未記入可
		***********/
		core.url=function(uri){
			if(!uri){
				uri = location.href;
			}
			var data={};
			
			//URLとクエリ分離分解;
			var query=[];
			if(u.indexOf("?")!=-1){
				query = uri.split("?");
			}
			else if(u.indexOf(";")!=-1){
				query = uri.split(";");
			}
			else{
				query[0] = uri;
				query[1] = '';
			}
			
			//基本情報取得;
			var sp = query[0].split("/");
			var data={
				dir:this.dir(uri),
				domain:sp[2],
				protocol:sp[0].replace(":",""),
				
				query:(query[1])?(function(q){
					var d={};
					var sp1 = q.split("&");
					for(var i=0;i<sp1.length;i++){
						var kv = sp1[i].split("=");
						if(!kv[0]){continue}
						d[kv[0]]=kv[1];
					}
					return d;
				})(query[1]):{},
				
				url:query[0]
			};
			
			return data;
		};
		/***********
		 * core.domain(url)
		 * 概要：表示しているページのブラウザアドレスのドメイン（サブドメイン）を返します。
		 * param:url  URL指定も可※未記入可
		***********/
		core.domain=function(u){
			if(typeof(u)=='undefined' || !u){
				u = location.href;
			}
			//正常なURLかどうかチェック;
			if(!u.match(/:\/\//)){return}
			var a = u.split("/");
			return a[2];
		};
		/***********
		 * core.dir(url)
		 * 概要：表示しているページのブラウザアドレスのURLのアクセスファイルの値を返します。
		 * param:url  URL指定も可※未記入可
		**********/
		core.dir=function(u){
			if(!u){
				u = location.href;
			}
			var u1 = u.split("?")[0].split("/");
			var url='';
			for(var i=0;i<u1.length-1;i++){
				url+=u1[i]+"/";
			}
			return url;
		};
		/***********
		 * core.document(element)
		 * 概要：document.bodyサイズ（スクロール域も含めた）または、対象項目のサイズ
		 * [ element:対象項目※未記入可 ]
		**********/
		core.document=function(e){
			//対象element;
			if(typeof(e)=='undefined'){
				if (navigator.userAgent.match("MSIE") && document.compatMode!='BackCompat'){
					e = document.documentElement;
				}
				else{
					e = document.getElementsByTagName("body")[0];
				}
			}
			//サイズ取得;
			var size={
				x : e.scrollWidth,
				y : e.scrollHeight
			};
			return size;
		};
		/**********
		 * //スクロール値;
		 * $NC.$.scroll(element)
		 * 概要：スクロール値の取得
		 * [ element:対象項目※未記入可 ]
		**********/
		core.scroll=function(e){
			//初期設定;
			var scroll={x:0,y:0};
			//ブラウザ判定処理;
			if(navigator.userAgent.indexOf("iPhone")!=-1 || navigator.userAgent.indexOf("iPad")!=-1){
				return {x:window.scrollX,y:window.scrollY};
			}
			else if(typeof(e)=='undefined' || e==null){
				if(document.compatMode=='BackCompat' || navigator.userAgent.indexOf("Safari")!=-1){
					e = document.getElementsByTagName("body")[0];
				}
				else{
					e = document.documentElement;
				}
			}
			//スクロール値;
			scroll={
				x:e.scrollLeft,
				y:e.scrollTop
			};
			return scroll;
		};
		/**********
		 * //ブラウザ画面サイズ;
		 * $NC.$.browser()
		 * 概要：ブラウザの表示画面サイズ
		**********/
		core.browser=function(){
			var d={x:0,y:0};
			var e;
			if(window.innerWidth){
				d.x = window.innerWidth;
				d.y = window.innerHeight;
			}
			else if(navigator.userAgent.indexOf("MSIE")!=-1&&document.compatMode=='BackCompat'){
				d.x = document.body.clientWidth;
				d.y = document.body.clientHeight;
			}
			else{
				d.x = document.documentElement.clientWidth;
				d.y = document.documentElement.clientHeight;
			}
			return d;
		};
		/**********
		 * $NC.$.addEvent(target , mode , function)
		 * 概要：イベント情報の追記登録
		 * [ target:window,document mode:load,mousedown※onを抜かす function:実行関数 ]
		**********/
		core.event=function(t, m, f){
			//other IE;
			if (t.addEventListener){
				t.addEventListener(m, f, false);
			}
			//IE;
			else{
				if(m=='load'){
					var d = document.body;
					if(typeof(d)!='undefined'){d = window;}
					
					if((typeof(onload)!='undefined' && typeof(d.onload)!='undefined' && onload == d.onload) || typeof(eval(onload))=='object'){
						t.attachEvent('on' + m, function() { f.call(t , window.event); });
					}
					else{
						f.call(t, window.event);
					}
				}
				else{
					t.attachEvent('on' + m, function() { f.call(t , window.event); });
				}
			}
		};
		/**********
		 * AJAX
		 * 
		**********/
		core.ajax={
			createHttpRequest:function(){
				//Win ie用
				if(window.ActiveXObject){
					try {
						//MSXML2以降用;
						return new ActiveXObject("Msxml2.XMLHTTP")
					}
					catch(e){
						try {
							//旧MSXML用;
							return new ActiveXObject("Microsoft.XMLHTTP")
						}
						catch(e2){
							return null
						}
					}
				}
				//Win ie以外のXMLHttpRequestオブジェクト実装ブラウザ用;
				else if(window.XMLHttpRequest){
					return new XMLHttpRequest()
				}
				else{
					return null
				}
			},
			
			option:function(op){
				if(!op){op={}}
				if(!op.flg)	 {op.flg=false}
				if(!op.type)	{op.type='Content-Type'}
				if(!op.app)	 {op.app='application/x-www-form-urlencoded'} 
				if(!op.method)  {op.method='post'}
				if(!op.path)	{op.path=core.data.path}
				if(!op.mode)	{op.mode=[]}
				if(!op.error)	{op.error=function(res){$.lib.ajax.error("Read-error !"+res)}}
				if(!op.timeout)	{op.timeout=function(res){$.lib.ajax.error("Read-error !"+res)}}
				
				return op;
			},
			
			//ajax登録
			set:function(op){
				
				op=this.option(op);
				
				var a={};
				a.httpoj=this.createHttpRequest();
				a.httpoj.func=op;
				a.httpoj.open( op.method , op.path , op.flg );
				a.httpoj.setRequestHeader(op.type, op.app);
				a.httpoj.onreadystatechange = function(){
					
					var s = parseInt(this.status, 10);
					
					// 成功
					if(this.readyState==4){
						this.func.success(this.responseText);
					}
					// 通信不可
					else if(s < 1){
						this.func.error(this.responseText+"("+s+"/"+this.status+"/"+this.readyState+")");
					}
					/*
					// 成功
					else if(s < 400){
						this.func.success(this.responseText);
					}
					*/
					// 40x, 50xなどのサーバーエラー
					else{
						this.func.timeout(this.responseText+"/"+s);
					}
				};
				a.httpoj.send(op.mode.join('&'));
			}
		};
		/**********
		 * //style値を取得
		 * core.get_style(element , style)
		 * 概要：対象項目のCSS値を取得
		 * param:element  対象項目
		**********/
		core.get_style=function(e,s){
			if(!s){return}
			//対象項目チェック;
			if(typeof(e)=='undefined' || e==null || !e){
				e = document.body;
			}
			//属性チェック;
			var d='';
			if(typeof(e.currentStyle)!='undefined'){
				d = e.currentStyle[core.string.camelize(s)];
				if(d=='medium'){
					d = "0";
				}
			}
			else if(typeof(document.defaultView)!='undefined'){
				d = document.defaultView.getComputedStyle(e,'').getPropertyValue(s);
			}
			return d;
		};
		/**********
		 * 文字列操作
		 * //camelize,capitalize;
		 * core.camelize(prop)
		 * 概要：style属性などの文字列整形を行う※例)「font-type」→「fontType」
		 * [ prop:文字列 ]
		**********/
		core.string={
			url_encode:function(str,list){
				if(str=="" || typeof(str)=="undefined"){return ""}
				
				for(var i=0;i<list.length;i++){
					str=str.split(list[i]).join(escape(list[i]));
				}
				return str;
			},
			url_decode:function(str,list){
				for(var i=0;i<list.length;i++){
					str=str.split(escape(list[i])).join(list[i]);
				}
				return str;
			},
			camelize:function(v){
				if(typeof(v)!='string'){return}
				return v.replace(/-([a-z])/g , function(m){return m.charAt(1).toUpperCase();});
			}
		};
		/*
		core.camelize=function(v){
			if(typeof(v)!='string'){return}
			return v.replace(/-([a-z])/g , function(m){return m.charAt(1).toUpperCase();});
		};
		*/

		/***********
		 * //脆弱性文字列変換処理;
		 * 
		***********/
		core.secure_value={
			xss:function(v){
				if(!v){return v;}
				var d="-";
				v+="";
				v = v.split("\r").join("").split("\n").join("");
				v = v.split("<").join(d).split("%3c").join(d).split("%3C").join(d);
				v = v.split(">").join(d).split("%3e").join(d).split("%3E").join(d);
				return v;
			},
			encode:function(v){
				v = v.split("\r").join("%r%");
				v = v.split("\n").join("%n%");
				v = v.split(" ").join("%sp%");
				v = v.split("'").join("%qt%");
				v = v.split('"').join("%dqt%");
				v = v.split("<br>").join("%br%");
				return v;
			},
			decode:function(v){
				v = v.split("%r%").join("\r");
				v = v.split("%n%").join("\n");
				v = v.split("%sp%").join(" ");
				v = v.split("%qt%").join("'");
				v = v.split("%dqt%").join('"');
				v = v.split("%br%").join("<br>");
				return v;
			}
		};
		/**********
		 * //elementのDOM階層（対象elementの階層dom構造をユニーク値で返す）;
		 * //element → id(途中でIDがあれば、そこで止まる);
		 * $NC.$.unique
		 * 概要：対象項目の「ページ内DOM構造ユニークID」を出力する（エンコード）
		 * [ element:対象項目 ]
		**********/
		core.elm_id={
			encode:function(e){
			if(typeof(e)=='undefined' || e==null || !e){return}
				var dom = [];
				var f=0;
				do{
					if(e.id && e == document.getElementById(e.id)){
						dom[dom.length] = e.id;
						break;
					}
					else if(!e.parentNode){break}
					
					var num = 0;
					var cnt = 0;
					if(e.parentNode.childNodes.length){
						for(var i=0;i<e.parentNode.childNodes.length;i++){
							if(typeof(e.parentNode.childNodes[i].tagName)=='undefined'){continue}
							if(e.parentNode.childNodes[i].tagName != e.tagName){continue}
							if(e.parentNode.childNodes[i] == e){
								num=cnt;
								break;
							}
							cnt++;
						}
					}
					//小文字英数字で形成する。;
					dom[dom.length] = e.tagName.toLowerCase() + "["+num+"]";
					if(e == document.body){break}
					f++;
					if(f>10000){break}
				}
				while (e = e.parentNode);
				//rsort;
				var dom2 = [];
				for(var i=dom.length-1;i>=0;i--){
					dom2[dom2.length] = dom[i];
				}
				return dom2.join(".");
			},
			//ID化した文字列をエレメントに戻す（変換）
			decode:function(id){
				if(!id || typeof(id)!='string'){return}
				//単一IDの場合;
				if(document.getElementById(id)!=null){return document.getElementById(id)}
				//element抽出処理
				var elm= document.getElementsByTagName("html")[0];
				var d1 = id.split(".");
				var flg=0;
				for(var i=0;i<d1.length;i++){
					if(d1[i].match(/^(.*?)\[(.*?)\]$/)){
						var tag = RegExp.$1;
						var num = RegExp.$2;
						var cnt = 0;
						var flg2= 0;
						if(tag=='' || num==''){
							alert("tag名が不整合です。 : "+d1[i]);
							return;
						}
						var e2 = elm.childNodes;
						
						for(var j=0;j<e2.length;j++){
							if(!e2[j].tagName || typeof(e2[j])=='undefined'){continue}
							if(e2[j].tagName != tag.toUpperCase()){continue}
							if(cnt == num){
								elm = e2[j];
								flg2++;
								break;
							}
							cnt++;
						}
						//存在しないelement処理
						if(flg2==0){return}
						flg++;
					}
					else if(document.getElementById(d1[i])!=null){
						elm = $document.getElementById(d1[i]);
						flg++;
					}
					else if(document.getElementById(d1[i])==null){return}
				}
				if(!flg){return}
				return elm;
			}
		};
		/**********
		 * //elementの透明度設定;
		 * core.alpha(element , num(%))
		 * 概要：対象項目の透明度を設定
		 * [ element:対象項目 num:%]
		**********/
		core.alpha=function(e , n){
			//IE
			if (navigator.userAgent.indexOf("MSIE")!=-1){
				if (n < 0){
					n = parseInt(parseFloat(RegExp.$1) + (n));
					if (n <= 0) {n = 0;} else if (n >= 100) {n = 100;}
				}
				e.style.filter = 'alpha(opacity='+n+')';
			}
			//FireFox;
			else if (navigator.userAgent.indexOf("Firefox")!=-1){
				if (n < 0){
					if (n <= 0) {n = 0;} else if (n >= 1) {n = 1;}
				}else{n = n/100;}
				e.style.opacity = n;
				
			}
			//Opera & Safari;
			else if ((navigator.userAgent.indexOf("Opera")!=-1)||(navigator.userAgent.indexOf("Safari")!=-1)){
				if (n < 0){
					if (n <= 0) {n = 0;} else if (n >= 1) {n = 1;}
				}else{n = n/100;}
				e.style.opacity = n;
			}
			//Netscape;
			else if (navigator.userAgent.indexOf("Netscape")!=-1){
				if (n < 0){
					if (n <= 0) {n = 0;} else if (n >= 1) {n = 1;}
				}else{n = n/100;}
				e.style.MozOpacity = n;
			}
			return e;
		};
		/**********
		 * //Table要素に行要素を追加する(全ブラウザ対応版)
		 * core.table_add
		 * 概要：Table要素に行要素を追加する
		 * 使用方法：[ table:table要素 html:HTML記述※tr含む]
		**********/
		core.table_add=function(t,h){
			if(typeof(t)=='undefined' || t==null || !t){return;}
			if(!h){return}
			var d = document.createElement("div");
			d.innerHTML = "<table>"+h+"</table>";
			var tr = d.getElementsByTagName("tbody");
			for(var i=0;i<tr.length;i++){
				t.appendChild(tr[i]);
			}
		};
		/**********
		 * //select項目操作;
		 * core.select_add
		 * 概要：select項目に値を追加する。
		 * 使用方法：[ e , key , value ,title ]
		**********/
		core.select_add=function(e, key , value , title){
			if(typeof(e)=='undefined' || e==null || !e){return}
			
			var num = e.length;
			
			//key,value 設定;
			e.options[num] = new Option(value , key);
			
			//title値;
			if(title){
				e.options[num].title = title;
			}
		};
		
		core.drag=function(e){
			//alert(e.value);
			//alert(e.tagName);
		};
		
		/*
		
		*/
		core.search={
			
			//対象エレメントより上位にclass名を持つエレメントを検索
			css:function(e,val){
				if(!e || !e.tagName || e.tagName=="BODY"){return}
				
				//マッチするエレメントがある場合
				if(core.css.check_name(e.className,val)){return e}
				
				//上階層チェック
				e = this.css(e.parentNode,val);
				return e;
			}
		};
		
		//css操作
		core.css={
			header_add:function(data,id,header){
				
				if(id && document.getElementById(id)!=null){return}
				if(!data || !data.length){return}
				
				if(!header){
					header = document;
				}
				
				//ブラウザ判別
				if(navigator.userAgent.toLowerCase().indexOf('msie')!=-1){
					return;
				}
				else{
					//初期設定
					var css = header.styleSheets;
					var sheet = header.styleSheets[css.length - 1];
					
					//新規sheet作成
					var style = header.createElement('style');
					style.type='text/css';
					if(id){
						style.id = id;
					}
					
					//適用
					header.getElementsByTagName('head')[0].appendChild(style);
					var sheet = style.sheet;
					
					//データセット
					if(typeof(data)=='undefined' || !data.length){return}
					for(var i=0;i<data.length;i++){
						if(!data[i].s || !data[i].d || !data[i].d.length){continue}
						sheet.insertRule(data[i].s +'{'+ data[i].d.join(';') +'}', (sheet.cssRules)?sheet.cssRules.length:0);
						
					}
				}
			},
			//クラス操作(半角スペース区切り)
			name:function(type,name,value){
				var val2 = name.split(" ");
				
				if(type=='add'){
					var flg=0;
					for(var i=0;i<val2.length;i++){
						if(val2[i]==value){flg++;}
					}
					//同一name値が無い場合のみ追加
					if(!flg){val2[val2.length]=value}
					
					return val2.join(" ");
				}
				else if(type=='del'){
					var val3=[];
					for(var i=0;i<val2.length;i++){
						if(val2[i]!=value){
						val3[val3.length]=val2[i];
						}
					}
					
					return val3.join(" ");
				}
				
				
			},
			//class内にスペース区切りで存在するセレクタnameで特定の文字列があるかチェック
			check_name:function(target_name,check_name){
				if(!target_name || !check_name){return}
				var arr = target_name.split(" ");
				for(var i=0;i<arr.length;i++){
					if(arr[i]==check_name){return true}
				}
			},
		$:0};
		
		return core;
	})();

	//起動処理(ページ読み込み後、起動)
	$.lib.event(window,"load",$.start);
	if(typeof(window.$LIB)=="undefined"){window.$LIB={}}
	window.$LIB.FUP=$;

})();
