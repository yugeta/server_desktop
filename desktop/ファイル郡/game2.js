if(typeof($LIB)=='undefined'){$LIB={}}

/**
* game ランドマーク
* ・クォータービュー
* ・
* 
**/




/*transformation*/
$LIB.game={
	//各種データ
	data:{
		user:"test",
		chara:"test",
		map:"test",
		story:"test",
		size:{x:64,y:32},
		
		
		step:4,//1歩の分割数
		once:400,//1歩にかかるの時間
//		chara_pos:{x:2,y:4},
		viewmode:"center",
//		next_pos:{x:0,y:1},
		$:0
	},
	//ページ読み込み時の初期処理
	set:function(user,chara,map){
		
		
		
		//ユーザーID
		if(user){$LIB.game.data.user= user}
		//マイキャラ設置
		if(chara){$LIB.game.data.chara = chara}
		//マップ作成
		if(map){$LIB.game.data.map = map}
		//初期設定
		$LIB.event.add(window,"load",$LIB.game.init.query);
	},
	//初期化
	init:{
		//読み込み中画面(start)
		start:function(){
			var d = document.createElement("div");
			d.id  = "$LIB.game.loading";
			d.style.setProperty("background-color","black","important");
			d.style.setProperty("position","absolute","important");
			d.style.setProperty("top","0","important");
			d.style.setProperty("left","0","important");
			d.style.setProperty("z-index","100000000","important");
			
			var html = document.getElementsByTagName("html")[0];
			var size = {
				x:html.offsetWidth,
				y:html.offsetHeight
			};
			
			d.style.setProperty("width", size.x+"px","important");
			d.style.setProperty("height",size.y+"px","important");
			
//			alert(document.body);
			document.getElementsByTagName("body")[0].appendChild(d);
		},
		//読み込み中画面(end)
		end:function(){
			var e = document.getElementById("$LIB.game.loading");
			if(e==null){return}
			e.parentNode.removeChild(e);
		},
		img_load:function(){
			//土台セット
			var d1 = document.createElement("div");
			d1.id = "img_load";
			d1.style.setProperty("display","none",null);
			d1.style.setProperty("background-color","white",null);
			d1.style.setProperty("border","1px solid red",null);
			d1.style.setProperty("margin","20px",null);
			document.body.appendChild(d1);
			
			//サブキャラ画像読み込み
			if(typeof($LIB.chara)!='undefined'){
				for(var i in $LIB.chara){
					if(typeof($LIB.chara[i].img)=='undefined'){continue}
					var img = $LIB.chara[i].img;
					for(var j=0;j<img.length;j++){
						var d2= document.createElement("img");
						d2.src= "chara/"+i+"/"+img[j];
//						alert(d2.src);
						document.getElementById("img_load").appendChild(d2);
						
					}
				}
			}
			
			//map
			if(typeof($LIB.map.surface)!='undefined'){
				for(var i in $LIB.map.surface){
					if(typeof($LIB.map.surface[i].img)=='undefined'){continue}
//					var img = $LIB.map.surface[i].img;
//					for(var j=0;j<img.length;j++){
						var d2= document.createElement("img");
						d2.src= $LIB.map.surface[i].img;
//						alert(d2.src);
						document.getElementById("img_load").appendChild(d2);
						
//					}
				}
			}
			
		},
		//初期設定
		query:function(){
			//読み込み中画面(start)
			$LIB.game.init.start();
			
			//クエリ情報取得
			var q = $LIB.page.query();
			if(q){
				if(typeof(q.user)=='string'){
					$LIB.game.data.user = q.user;
				}
				if(typeof(q.chara)=='string'){
					$LIB.game.data.chara = q.chara;
				}
				if(typeof(q.map)=='string'){
					$LIB.game.data.map = q.map;
				}
			}
			
			//
			$LIB.chara={};
			
			//イベントセット
			$LIB.game.event.set();
			
			//next
			$LIB.game.init.story();
			
		},
		//storyセット
		story:function(){
			var story_ajax = $LIB.ajax.load("story/"+$LIB.game.data.story+".js?tmp="+(+new Date()));
			story_ajax.onreadystatechange = function(){
				//readyState値は4で受信完了;
				if (this.readyState==4){
					//コールバック
					eval("$LIB.story="+this.responseText+";");
//					$LIB.game.story.set();
					
					//初期値セット
					if(typeof($LIB.story.map)!='undefined'){
						$LIB.game.data.map = $LIB.story.map;
					}
					if(typeof($LIB.story.chara)!='undefined' && typeof($LIB.story.chara.type)!='undefined'){
						$LIB.game.data.chara = $LIB.story.chara.type;
					}
					
					
					//next
					$LIB.game.init.map();
				}
			};
			story_ajax.send();
			
		},
		//mapセット
		map:function(){
			var map_ajax = $LIB.ajax.load("map/"+$LIB.game.data.map+"/ini.js?tmp="+(+new Date()));
			map_ajax.onreadystatechange = function(){
				//readyState値は4で受信完了;
				if (this.readyState==4){
					//コールバック
					eval("$LIB.map="+this.responseText+";");
//					$LIB.game.map.set();
					
					//next
					$LIB.game.init.chara();
				}
			};
			map_ajax.send();
			
		},
		
		
		
		//キャラクターセット
		chara:function(){
//			if(typeof($LIB.chara[$LIB.game.data.chara])!='undefined'){
				var chr_ajax = $LIB.ajax.load("chara/"+$LIB.game.data.chara+"/ini.js?tmp="+(+new Date()));
				chr_ajax.onreadystatechange = function(){
					//readyState値は4で受信完了;
					if (this.readyState==4){
						//コールバック
						eval("$LIB.chara['"+$LIB.game.data.chara+"']="+this.responseText+";");
//						$LIB.game.chara.set();
						
						//next
						$LIB.game.init.finish();
						
					}
				};
				chr_ajax.send();
//			}
			/*
			else{alert(1);
				$LIB.game.chara.set();
				
				//next
				$LIB.game.init.finish();
			}
			*/
		},
		
		//最終セット
		finish:function(){
			
			//mapセット
			$LIB.game.map.set();
			
			
			
			//サブキャラセット
			$LIB.game.story.subchara();
			
			//キャラセット
			$LIB.game.chara.set();
			
			//画像のキャッシュ読み込み
			$LIB.game.init.img_load();
			
			//サブキャラ移動開始
			setTimeout($LIB.game.subchara.interval,2000);
			
			
			
			//読み込み中画面(start)
			$LIB.game.init.end();
		}
		
	},
	//シナリオスタート
	story:{
		set:function(){
			
			
			this.subchara();
			
		},
		
		//マップ配置サブキャラ
		subchara:function(){
			if(typeof($LIB.story.subchara)=='undefined'){return}
			var chr_ajax=[];
			var num=0;
			for(var i in $LIB.story.subchara){
				//キャラデータ読み込み
				if(typeof($LIB.chara[$LIB.story.subchara[i].type])=='undefined'){
					chr_ajax[num] = $LIB.ajax.load("chara/"+$LIB.story.subchara[i].type+"/ini.js?tmp="+(+new Date()));
					chr_ajax[num].onreadystatechange = function(){
						//readyState値は4で受信完了;
						if (this.readyState==4){
							//コールバック
							eval("$LIB.chara['"+$LIB.story.subchara[i].type+"']="+this.responseText+";");
							$LIB.game.chara.view("subchara_"+i,$LIB.story.subchara[i].pos,$LIB.story.subchara[i].type, $LIB.story.subchara[i].course);
						}
					};
					chr_ajax[num].send();
					num++;
				}
				else{
					$LIB.game.chara.view("subchara_"+i,$LIB.story.subchara[i].pos,$LIB.story.subchara[i].type, $LIB.story.subchara[i].course);
				}
			}
		}
	},
	//表示処理
	map:{
		set:function(){
			//初期設定
			var game = document.getElementById("game");
			var field = document.getElementById("field");
			var map = $LIB.map.data;
			
			$LIB.game.data.size = $LIB.map.size;
			
			if(!map || !map.length ){return}
			
			//背景色設定
			if($LIB.map.bgcolor){
				game.style.setProperty("background-color",$LIB.map.bgcolor,null);
			}
			if($LIB.map.bgimage){
				game.style.setProperty("background-image","url("+$LIB.map.bgimage+")",null);
			}
			
			//マップマトリクスデータ
			var map_width=0;
			for(var i=0;i<map.length;i++){
				if(map[i] && typeof(map[i])=="string"){
					map[i] = map[i].split(",");
				}
				//最長length判定
				if(map_width<map[i].length){
					map_width = map[i].length;
				}
			}
			
			//html作成
			var html='';
			for(var y=0;y<map.length + map_width;y++){
				
				//余白処理
				var land = map.length;
				
				if(y<land){
					land = y;
				}
				else if(y > map_width){
					land = map.length + map_width - y;
				}
				
				var yohaku = (y < map.length)?map.length - y : map_width-(map_width - (y - map.length));
				
				var rows_style="z-index:"+$LIB.game.map.z(y,1)+";";
				rows_style+="left:"+(yohaku*$LIB.game.data.size.x/2)+"px;";
				
				html+= "<div class='rows' style='"+rows_style+"'>";
				
				for(var x=0;x<map.length + map_width;x++){
					
					//x軸の座標
					var pos_x = x * $LIB.game.data.size.x;
					
					var img="";
					var style="";
					var bg="bg0";
					
					//マップ画像データ
					if(x >= land){continue}
					
					var img_addr = {
						h:(y<map.length)?y-x-1:y-x-(y-map.length)-1,
						w:(y<map.length)?x:x+(y-map.length)
					};
					
					if(typeof(map[img_addr.h])!="undefined"
					&& typeof(map[img_addr.h][img_addr.w])!="undefined"
					&& map[img_addr.h][img_addr.w]!=0
					&& typeof($LIB.map.surface[map[img_addr.h][img_addr.w]])!="undefined"
					&& typeof($LIB.map.surface[map[img_addr.h][img_addr.w]].img)!="undefined"){
						img = "<img src='"+$LIB.map.surface[map[img_addr.h][img_addr.w]].img+"' />";
					}
					
					if(map[img_addr.h][img_addr.w]){
						html+= "<div class='cols "+bg+"' style='left:"+pos_x+"px;' id='map_id_"+img_addr.w+"_"+img_addr.h+"'>"+img+"</div>";
					}
				}
				html+= "</div>";
			}
			field.innerHTML = html;
			/*
			//マップ配置キャラ
			if(typeof($LIB.map.chara)!='undefined'){
				var chr_ajax=[];
				var num=0;
				for(var i in $LIB.map.chara){
					//キャラデータ読み込み
					if(typeof($LIB.chara[$LIB.map.chara[i].type])=='undefined'){
						chr_ajax[num] = $LIB.ajax.load("chara/"+$LIB.map.chara[i].type+"/ini.js?tmp="+(+new Date()));
						chr_ajax[num].onreadystatechange = function(){
							//readyState値は4で受信完了;
							if (this.readyState==4){
								//コールバック
//								alert($LIB.map.chara[i].type);
								eval("$LIB.chara['"+$LIB.map.chara[i].type+"']="+this.responseText+";");
								$LIB.game.chara.view("subchara_"+i,$LIB.map.chara[i].pos,$LIB.map.chara[i].type);
							}
						};
						chr_ajax[num].send();
						
						num++;
					}
					else{
						$LIB.game.chara.view("subchara_"+i,$LIB.map.chara[i].pos,$LIB.map.chara[i].type);
					}
				}
			}
			*/
			
		},
		
		z:function(y,add){
			if(!add){add=0;}
			
			return (y*10 +add);
		}
	},
	
	//キャラクター
	chara:{
		data:{},
		set:function(){
			
			//初期位置データ確認
			if(typeof($LIB.map)=='undefined'){$LIB.map={}}
			if(typeof($LIB.story.chara.pos)=='undefined'){$LIB.story.chara.pos={x:0,y:0}}
			
			$LIB.game.chara.view("chara_"+$LIB.game.data.user,$LIB.story.chara.pos,$LIB.game.data.chara,$LIB.story.chara.course);
			
		},
		
		//mapアドレスから座標を取得
		map2pos:function(map){
			var game= document.getElementById("game");
			var e = document.getElementById("map_id_"+map.x+"_"+map.y);
			
			var pos = $LIB.trans.pos(e);
			
			pos.x -= game.offsetLeft;
			pos.y -= game.offsetTop;
			
			return pos;
			
		},
		
		//mapアドレスからzを取得
		map2z:function(map){
			var e = document.getElementById("map_id_"+map.x+"_"+map.y);
			
			return e.parentNode.style.zIndex;
		},
		
		//キャラクター表示（初期表示）
		view:function(id,chr_pos,chara,course){
			//方向
			if(!course){
				course = 3;
			}
			
			//初回キャラ作成
			if(document.getElementById(id)==null){this.make(id,chr_pos,chara)}
			
			//キャラelm
			var chr = document.getElementById(id);
			
			//mapアドレスから座標を取得
			var pos = $LIB.game.chara.map2pos(chr.pos);
			
			//mapアドレスからzを取得
			var z   = $LIB.game.chara.map2z(chr.pos);
			
			//座標
			chr.style.setProperty
			("left", pos.x+"px" , null);
			chr.style.setProperty("top" , pos.y+"px" , null);
			chr.style.setProperty("width"  , $LIB.game.data.size.x +"px" , null);
			chr.style.setProperty("height" , $LIB.game.data.size.y +"px" , null);
			chr.style.setProperty("z-index", (z+5) ,null);
			
			chr.innerHTML = "<img id='"+id+"' class='chara' src='"+"chara/"+chara+"/"+$LIB.chara[chara].img[$LIB.chara[chara].anm[course][0]]+"'>";
			
			//map中央処理
			$LIB.game.chara.center();
		},
		make:function(id,chr_pos,chara){
			var field = document.getElementById("field");
			var div = document.createElement("div");
			div.id  = id;
			div.chara = chara;
			div.className = "chara";
			
			//座標保持用
			div.pos ={
				x:chr_pos.x,
				y:chr_pos.y
			};
			
			//移動防止フラグ
			document.getElementById("map_id_"+div.pos.x+"_"+div.pos.y).map_flg=1;
			
			field.appendChild(div);
		},
		//キャラ移動処理
		move:function(e){//alert(e.keyCode);
			var id = "chara_"+$LIB.game.data.user;
			var chr = document.getElementById(id);
			if(chr==null){return}
			if(chr.move_flg){return}
			
			var chara = chr.chara;
			
			//↑up-right
			if(e.keyCode==38 || e.id=="pad_1"){
				chr.move_flg = 1;
			}
			//←up-left
			else if(e.keyCode==37 || e.id=="pad_4"){
				chr.move_flg = 4;
			}
			//→down-right
			else if(e.keyCode==39 || e.id=="pad_2"){
				chr.move_flg = 2;
			}
			//↓down-left
			else if(e.keyCode==40 || e.id=="pad_3"){
				chr.move_flg = 3;
			}
			//space
			else if(e.keyCode==32){
				$LIB.game.message.view("space");
			}
			
			if(!chr.move_flg){return}
			
			var next = $LIB.game.chara.course(chr.move_flg);
			
			chr.next = {
				x:chr.pos.x + next.x,
				y:chr.pos.y + next.y
			}
			
			//枠外判定 or 障害物（コリジョン）判定
			if($LIB.game.chara.move_check(id,$LIB.game.data.user, chr.next.x, chr.next.y)){
				chr.getElementsByTagName("img")[0].src= "chara/"+$LIB.game.data.chara+"/"+$LIB.chara[chara].img[$LIB.chara[chara].anm[chr.move_flg][0]];
				chr.move_flg = 0;
				delete chr.next;
			}
			//移動処理
			else if(chr.move_flg){
				//map-flg
				document.getElementById("map_id_"+chr.pos.x+"_"+chr.pos.y).map_flg=0;
				document.getElementById("map_id_"+chr.next.x+"_"+chr.next.y).map_flg=1;
				//
				setTimeout("$LIB.game.chara.moving(0,'"+id+"','"+$LIB.game.data.chara+"')",0);
			}
		},
		//方向に応じて、XY座標を計算
		course:function(course){
			
			var next ={x:0,y:0};
			
			if(course==1){
				next.y = -1;
			}
			else if(course==4){
				next.x = -1;
			}
			else if(course==2){
				next.x = 1;
			}
			else if(course==3){
				next.y = 1;
			}
			return next;
		},
		move_check:function(my_id,chara,x,y){
			/*
			if(typeof(x)=='undefined' || typeof(y)=='undefined'){
				return true;
			}
			*/
			
			//map無
			if(document.getElementById("map_id_"+x+"_"+y)==null){
				return true;
			}
			//画像（建物）有
			else if(!document.getElementById("map_id_"+x+"_"+y).getElementsByTagName("img").length){
				return true;
			}
			//通行フラグが立っている場合は、通行不可
			else if($LIB.map.surface[$LIB.map.data[y][x]].pass){
				return true;
			}
			
			var chr = document.getElementById(my_id);
			var map = document.getElementById("map_id_"+chr.next.x+"_"+chr.next.y);
			if(map!=null && map.map_flg==1){
				return true;
			}
			
			/*
			//my_next値判定
			var e = document.getElementById(my_id);
			if(e==null){return}
			var id = "chara_"+chara;
			
			//自キャラ判定
			if(my_id!=id){
				var e2 = document.getElementById(id);
				if(e2!=null && typeof(e2.next)=="undefined"){
					if(e.next.x==e2.next.x && e.next.y==e2.next.y){//alert(1);
						return true;
					}
					else if(e.next.x==e2.pos.x && e.next.y==e2.pos.y){//alert(2);
						return true;
					}
				}
			}
			
			//他キャラ判定(自キャラ以外)
			if(typeof($LIB.story.subchara)!='undefined'){
				for(var i in $LIB.story.subchara){
					var id = "subchara_"+i;
					if(my_id==id){continue}
					
					var e2 = document.getElementById(id);
					if(e2==null){continue}
					if(typeof(e2.next)=="undefined"){continue}
					
					if(e.next.x==e2.next.x && e.next.y==e2.next.y){//alert(3);
						return true;
					}
					else if(e.next.x==e2.pos.x && e.next.y==e2.pos.y){//alert(4);
						return true;
					}
				}
			}
			*/
		},
		moving:function(step,id,chara){
			
			var path = "chara/"+chara+"/";
			
			var chr = document.getElementById(id);
			if(chr==null){return}
			
			//フラグチェック
			if(chr.move_flg<=0 || chr.move_flg>4){return}
			
			//ステップ数追加
			if(typeof(step)=='undefined' || !step || step<0 || step=='undefined'){step=0}
			step++;
			
			var game_pos = $LIB.trans.pos(document.getElementById("game"));
			var field_pos= $LIB.trans.pos(document.getElementById("field"));
			var add_pos = {
				x:game_pos.x-field_pos.x,
				y:game_pos.y-field_pos.y
				
			};
			
			//元座標取得
			var pos1 = $LIB.game.chara.map2pos(chr.pos);
			
			//next座標取得
			var pos2 = $LIB.game.chara.map2pos(chr.next);
			
			//z
			var z = $LIB.game.chara.map2z(chr.next);
			
			//中間座標取得
			var pos0 = {
				x:pos1.x+((pos2.x-pos1.x)/$LIB.game.data.step*step),
				y:pos1.y+((pos2.y-pos1.y)/$LIB.game.data.step*step)
			};
			pos0.x += add_pos.x;
			pos0.y += add_pos.y;
			
			//キャラ移動
			chr.style.setProperty("left", pos0.x+"px" , null);
			chr.style.setProperty("top" , pos0.y+"px" , null);
			//下方向（座標のプラス方向）の場合は最初にz値を操作する
			if(chr.pos.x < chr.next.x || chr.pos.y < chr.next.y){
				chr.style.setProperty("z-index", z   , null);
			}
			
			//map中央処理
			$LIB.game.chara.center();
			
			//次処理
			if(step < $LIB.game.data.step){
				//歩きアニメ
				var step_num = step%$LIB.chara[chara].anm[chr.move_flg].length;
				var img = path+$LIB.chara[chara].img[$LIB.chara[chara].anm[chr.move_flg][step_num]];
				chr.getElementsByTagName("img")[0].src= img;
				
				setTimeout("$LIB.game.chara.moving("+step+",'"+id+"','"+chara+"')",($LIB.game.data.once/$LIB.game.data.step));
			}
			//処理終了
			else{
				//z
				chr.style.setProperty("z-index", z   , null);
				//img
				var img = path+$LIB.chara[chara].img[$LIB.chara[chara].anm[chr.move_flg][0]];
				chr.getElementsByTagName("img")[0].src= img;
				//flg-stop
				chr.move_flg = 0;
				chr.pos = chr.next;
				delete chr.next;
				
			}
			
		},
		center:function(){
			var chr = document.getElementById("chara_"+$LIB.game.data.user);
			var game = document.getElementById("game");
			var field = document.getElementById("field");
			
			if(chr==null || game==null || field==null){return}
			
			var chr_pos = $LIB.trans.pos(chr)
			var field_pos = $LIB.trans.pos(field);
			var game_size = $LIB.trans.size(game);
			
			var x = (game_size.x/2)-(chr_pos.x-field_pos.x)-($LIB.game.data.size.x/2);
			var y = (game_size.y/2)-(chr_pos.y-field_pos.y)-($LIB.game.data.size.y/2);
			
			field.style.setProperty("left", x+"px",null);
			field.style.setProperty("top",  y+"px",null);
		}
	},
	
	//タッチイベント
	event:{
		set:function(){
			var field = document.getElementById("field");
			var game = document.getElementById("game");
			if(field==null){return}
			
			//タッチイベントの存在確認
			if($LIB.event.device.check()=='smartphone'){
				
				//キャラの移動（キーパット）
				$LIB.event.add(window,"touchstart",	$LIB.game.event.cursor.down);
				$LIB.event.add(window,"touchmove",	$LIB.game.event.cursor.move);
				$LIB.event.add(window,"touchend",	$LIB.game.event.cursor.up);
				
			}
			//pc
			else{
				
				//キャラの移動（カーソル）
				$LIB.event.add(window,"keydown",	$LIB.game.chara.move);
				
				$LIB.event.add(window,"mousedown",	$LIB.game.event.cursor.down);
				$LIB.event.add(window,"mousemove",	$LIB.game.event.cursor.move);
				$LIB.event.add(window,"mouseup",	$LIB.game.event.cursor.up);
			}
		},
		cursor:{
			
			push:function(){
				
				if($LIB.game.event.cursor.flg){
					$LIB.game.chara.move($LIB.game.event.cursor.flg);
					
					setTimeout($LIB.game.event.cursor.push,$LIB.game.data.once*0.5);
				}
				
			},
			
			down:function(event){
				
				var e = event.target;
				
				if(!e.id
				|| (e.id!="pad_1" && e.id!="pad_2" && e.id!="pad_3" && e.id!="pad_4")
				){return}
				
				$LIB.game.event.cursor.flg=e;
				$LIB.game.event.cursor.push();
			},
			move:function(event){
				if(!$LIB.game.event.cursor.flg){return}
				
				var e = event.target;
				
				if(!e.id
				|| (e.id!="pad_1" && e.id!="pad_2" && e.id!="pad_3" && e.id!="pad_4")
				){return}
				
				
				
				$LIB.game.event.cursor.flg=e;
				
			},
			up:function(event){
				if($LIB.game.event.cursor.flg){
					delete $LIB.game.event.cursor.flg;
				}
			}
		},
		/*
		down:function(event){
			var e = event.target;
			var field = document.getElementById("field");
			
			//タッチ座標
			$LIB.game.event.field = $LIB.trans.pos(field);
			
			$LIB.game.event.pos = {x:event.pageX,y:event.pageY};
			$LIB.game.event.flg = true;
			
		},
		move:function(event){
			var e = event.target;
			var field = document.getElementById("field");
			
			//タッチ座標
			touch_pos = {x:event.pageX,y:event.pageY};
			game_pos = $LIB.trans.pos(document.getElementById("game"));
			
			//画面移動
			if($LIB.game.event.flg){
				//座標取得
				var x = $LIB.game.event.field.x + (touch_pos.x - $LIB.game.event.pos.x) - game_pos.x;
				var y = $LIB.game.event.field.y + (touch_pos.y - $LIB.game.event.pos.y) - game_pos.y;
				
				field.style.left = x+"px";
				field.style.top = y+"px";
			}
			
		},
		up:function(event){
			delete $LIB.game.event.pos;
			delete $LIB.game.event.field;
			$LIB.game.event.flg = false;
			
			document.getElementById("debug").value ="";
			
		}
		*/
	},
	//データオートセーブ
	save:function(){
		/*
		//game-id
		var game = document.getElementById("game");
		var data = game.getElementsByTagName("td");
		
		//データ作成
		var val=[];
		for(var i=0;i<data.length;i++){
			//既存値
			if(data[i].getAttribute("game_num")==null){
				val[val.length] = "";
			}
			//入力値
			else{
				val[val.length] = data[i].innerHTML;
			}
		}
		
		//データ保存
		$LIB.data.save("game.nample.data", $LIB.game.nample.data.game_data, val.join(","));
		*/
	},
	
	//メッセージ表示
	message:{
		id:'$LIB.game.message',
		view:function(){
			
			if(document.getElementById($LIB.game.message.id)!=null){
				$LIB.game.message.del();
				return;
			}
			
			var d=document.createElement("div");
			d.id=$LIB.game.message.id;
			d.style.setProperty("position","absolute","important");
			d.style.setProperty("z-index", "1000000","important");
			d.style.setProperty("margin","8px auto","important");
			d.style.setProperty("top","0","important");
			d.style.setProperty("left","0","important");
			d.style.setProperty("background-color","white","important");
			
			d.style.setProperty("width","90%","important");
//			d.style.setProperty("height","64px","important");
			
			d.style.setProperty("border","2px solid red","important");
			
			d.innerHTML="<div id='"+d.id+".value' style='margin:4px;fint-size:12px;line-height:16px;'>aa<br>bb<br>cc</div>";
			
			document.body.appendChild(d);
			
		},
		del:function(){
			
			var e = document.getElementById($LIB.game.message.id);
			
			if(e!=null){
				e.parentNode.removeChild(e);
			}
			
		}
	},
	
	//サブキャラの動作
	subchara:{
		interval:function(){
			if(typeof($LIB.map)=='undefined' || typeof($LIB.story.subchara)=='undefined'){return}
			
			for(var i in $LIB.story.subchara){
				var id = "subchara_"+i;
				var e = document.getElementById(id);
				
				if(e==null){continue}
				
				e.move_flg = parseInt(Math.random()*7);
				
				var next = $LIB.game.chara.course(e.move_flg);
				
				e.next = {
					x:e.pos.x + next.x,
					y:e.pos.y + next.y
				};
				
//				alert(id+"/"+i);
//				setTimeout("$LIB.game.chara.moving(0,'"+id+"','"+i+"');", 1000);
				if($LIB.game.chara.move_check(id,e.chara, e.next.x, e.next.y) && typeof($LIB.chara[e.chara].anm[e.move_flg])!='undefined'){
					
//					alert(e.chara+"/"+e.move_flg);
					var img_num = $LIB.chara[e.chara].anm[e.move_flg][0];
					e.getElementsByTagName("img")[0].src= "chara/"+e.chara+"/"+$LIB.chara[e.chara].img[img_num];
					e.move_flg = 0;
					delete e.next;
				}
				else{
					//map-flg
					document.getElementById("map_id_"+e.pos.x+"_"+e.pos.y).map_flg=0;
					document.getElementById("map_id_"+e.next.x+"_"+e.next.y).map_flg=1;
					//
					setTimeout("$LIB.game.chara.moving(0,'"+id+"','"+e.chara+"');", 0);
				}
				
			}
			setTimeout($LIB.game.subchara.interval,2000);
		}
	},
	
	$:0
};





/*
//URL分解
$LIB.game.data.href  = location.href.split("?");
$LIB.game.data.query = {};
if($LIB.game.data.href.length>1){
	var query = $LIB.game.data.href[1].split("&");
	for(var i=0;i<query.length;i++){
		var sp = query[i].split("=");
		$LIB.game.data.query[sp[0]]=sp[1];
	}
	
}
//起動コマンド※クエリがない場合
if($LIB.game.data.href.length==1){
	$LIB.game.set("test");
}

//EDITモード
else if($LIB.game.data.query['mode']=="edit"){
//	$LIB.game.edit();
	$LIB.event.add(window,"load",$LIB.game.edit);
}
*/
