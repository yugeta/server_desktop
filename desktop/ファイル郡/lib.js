//if(typeof($NC)=='undefined'){$NC={}}

//--------------------------------------------------
// 
// 更新日:2011.4.25
// version:1.000.000
/*




$NC.$.id(id)
    概要：IDの取得(getElementById())
	[ id:ID値 ]

$NC.$.remove(element or ID)
	概要：対象のID値、または対象項目を削除する
	[ element(or id):文字列の場合はID値とする。項目の指定も可 ]

$NC.$.tag(tag , element)
	概要：DOM内のタグ一覧を取得(getElementsByTagName())
	[ tag:DIV等 e:基準となる項目※未記入可 ]

$NC.$.className(word , element)
	概要：特定のclass名を持つ項目一覧を取得(getElementsByClassName)
	[ word:対象文字列※正規表現可 element:※未記入可 ]

$NC.$.create(tag,attribute)
	概要：タグ項目を作成する
	[ tag:作成するタグ種別 , attribute:属性※連想配列にて記述 ]






	
$NC.$.mouse.x
$NC.$.mouse.y
	概要：マウスの座標が自動で格納される。
	

	
$NC.$.swf(wmode)
	概要：SWFファイルに自動でwmodeを設定する
	[ wmode:transparent※未記入可 , opaque ]
	

	

	
$NC.$.attribute
	$NC.$.attribute.focus(element)
		概要：対象項目の属性をハイライト表示する
		[ element:対象項目 style:属性]
	

	
$NC.$.link_kill
	概要：ページ内のリンクを遷移しないようにする
	


NC.$.eval_play
	概要：文字列（関数名）から、実行を行う。※関数が存在しない場合は、未処理
	使用方法：[ str:文字列関数名 ]



$NC.$.count_value
	概要：文字列を指定文字数に丸めこむ
	使用方法：[ val:文字列 n:文字数 ]


//$NC.$.hash_copy
//	概要：連想配列のコピー※多次元対応
//	使用方法：$HOGE = $NC.$.hash_copy("元データ（連想配列データ）");



*/

//--------------------------------------------------

if(typeof($LIB)=="undefined"){var $LIB={}}

$LIB=(function(){
    
    var core={};
    
    /***********
    core.pos(element , target)
    概要：対象項目の座標を取得
	param:e  elesment
    param:t  target(特定項目内での座標取得も可※未記入OK) ]
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
    core.size(element)
    概要：対象項目のサイズを取得(指定がない場合はwindow(body)サイズ)
	param:e  対象element
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
    //URLからクエリ値を連想配列で返す;
    core.url(url)
    概要：表示しているページのブラウザアドレスのURLクエリを連想配列で返します。
	param:url  未記入可
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
     * **********/
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
    core.document(element)
    概要：document.bodyサイズ（スクロール域も含めた）または、対象項目のサイズ
	[ element:対象項目※未記入可 ]
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
	//スクロール値;
    $NC.$.scroll(element)
    概要：スクロール値の取得
	[ element:対象項目※未記入可 ]
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
	//ブラウザ画面サイズ;
    $NC.$.browser()
    概要：ブラウザの表示画面サイズ
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
    概要：イベント情報の追記登録
	[ target:window,document mode:load,mousedown※onを抜かす function:実行関数 ]
     * **********/
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
     * **********/
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
            if(!op.flg)     {op.flg=false}
            if(!op.type)    {op.type='Content-Type'}
            if(!op.app)     {op.app='application/x-www-form-urlencoded'} 
            if(!op.method)  {op.method='post'}
//            if(!op.path)    {op.path='//192.168.1.15/codiad/workspace/labo/bookmark/core.php'}
            if(!op.path)    {op.path=core.data.path}
            //path:"http://mushroom.m78.com/labo/core.php",
            //path:"http://192.168.1.15/codiad/workspace/labo/bookmark/core.php",
            if(!op.mode)    {op.mode=[]}
            
            
            
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
                
//                this.func.success(this.responseText);
    		};
            
//            if(op.mode && op.mode.length){
    //            alert(op.mode.join('&'));
        	a.httpoj.send(op.mode.join('&'));
//            }
    	}
    };
    /*
    core.ajax={
        createHttpRequest:function(){
            //Win ie用
    		if(window.ActiveXObject){
                //MSXML2以降用;
    			try {return new ActiveXObject("Msxml2.XMLHTTP")}
    			 catch(e){
                    //旧MSXML用;
    				try {return new ActiveXObject("Microsoft.XMLHTTP")}
    				catch(e2){return null}
    			}
    		}
    		//Win ie以外のXMLHttpRequestオブジェクト実装ブラウザ用;
    		else if(window.XMLHttpRequest){return new XMLHttpRequest()}
    		else{return null}
    	},
        
        option:function(op){
            if(!op){op={}}
            if(!op.flg)     {op.flg=false}
            if(!op.type)    {op.type='Content-Type'}
            if(!op.app)     {op.app='application/x-www-form-urlencoded'} 
            if(!op.method)  {op.method='post'}
//            if(!op.path)    {op.path=core.data.path}
//            if(!op.mode)    {op.mode=[]}
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
        		// 40x, 50xなどのサーバーエラー
        		else{
        			this.func.timeout(this.responseText+"/"+s);
        		}
    		};
        	a.httpoj.send(op.mode.join('&'));
    	},
        error:function(res){
            alert("Error ! ["+res+"]");
        }
        
    };
    */
    /**********
    //style値を取得
    core.get_style(element , style)
    概要：対象項目のCSS値を取得
	param:element  対象項目
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
			d = e.currentStyle[$NC.$.camelize(s)];
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
    //camelize,capitalize;
    core.camelize(prop)
    概要：style属性などの文字列整形を行う※例)「font-type」→「fontType」
	[ prop:文字列 ]
    **********/
    core.camelize=function(v){
		if(typeof(v)!='string'){return}
		return v.replace(/-([a-z])/g , function(m){return m.charAt(1).toUpperCase();});
	};
    
    /***********
    //脆弱性文字列変換処理;
    
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
    //elementのDOM階層（対象elementの階層dom構造をユニーク値で返す）;
    //element → id(途中でIDがあれば、そこで止まる);
    $NC.$.unique
    概要：対象項目の「ページ内DOM構造ユニークID」を出力する（エンコード）
	[ element:対象項目 ]
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
    		if($NC.$.id(id)!=null){return $NC.$.id(id)}
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
    			else if($NC.$.id(d1[i])!=null){
    				elm = $NC.$.id(d1[i]);
    				flg++;
    			}
    			else if($NC.$.id(d1[i])==null){return}
    		}
    		if(!flg){return}
    		return elm;
    	}
	};
    /**********
    //elementの透明度設定;
    core.alpha(element , num(%))
    概要：対象項目の透明度を設定
	[ element:対象項目 num:%]
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
    //Table要素に行要素を追加する(全ブラウザ対応版)
    core.table_add
    概要：Table要素に行要素を追加する
	使用方法：[ table:table要素 html:HTML記述※tr含む]
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
    //select項目操作;
	core.select_add
    概要：select項目に値を追加する。
	使用方法：[ e , key , value ,title ]
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
//        alert(e.value);
//        alert(e.tagName);
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
    $:0};
    
    
    return core;
})();



 /*  
$NC.$={
	//読み込み完了フラグ;
	load:'conplete',
	//element座標;
	
	
	//getElementById;
	id:function(id){
		if(!id){return}
		return document.getElementById(id);
	},
	//削除;
	remove:function(e){
		if(typeof(e)=='string'){
			e=$NC.$.id(e);
		}
		if(typeof(e)=='undefined' || e==null || !e){return}
		e.parentNode.removeChild(e);
	},
	//getElementsByTagName;
	tag:function(t,elm){
		if(!t){t="*"}
		var e = document;
		if(typeof(elm)!='undefined'){
			e = elm;
		}
		return e.getElementsByTagName(t);
	},
	//getElementsByClassName:classNameチェック※正規表現可能;
	className:function(w,e){
		if(typeof(w)=='undefined'){return}
		
		if(typeof(e)=='undefined'){
			e = document;
		}
		//検索対象一覧取得;
		var t = $NC.$.tag("*",e);
		var d=[];
		//正規表現可能;
		if(typeof(w)=='function'){
			//対象項目;
			for(var i=0;i<t.length;i++){
				if(!t[i].className){continue}
				var flg=0;
				//class分解;
				var s = t[i].className.split(" ");
				for(var j=0;j<s.length;j++){
					if(s[j].match(w)){flg++}
				}
				if(flg){
					d.push(t[i]);
				}
			}
		}
		//正規表現不可;
		else if(typeof(w)=='string'){
			//対象項目;
			for(var i=0;i<t.length;i++){
				if(!t[i].className){continue}
				var flg=0;
				//class分解;
				var s = t[i].className.split(" ");
				for(var j=0;j<s.length;j++){
					if(s[j]==w){flg++}
				}
				if(flg){
					d.push(t[i]);
				}
			}
		}
		return d;
	},
	create:function(t,a){
		if(!t){return}
		var elm = document.createElement(t);
		if(typeof(a)!='undefined'){
			for(var i in a){
				$NC.$proc.hash2attribute(elm,i,a[i]);
			}
		}
		return elm;
	},
	//URLから付随するデータを抽出するを連想配列で返す;
	url2data:function(u){
		if(!u){
			u = location.href;
		}
		
		var data={};
		
		//クエリ付き判定;
		//?分解;
		var u0=[];
		if(u.indexOf("?")!=-1){
			u0 = u.split("?");
		}
		else if(u.indexOf(";")!=-1){
			u0 = u.split(";");
		}
		else{
			u0[0] = u;
			u0[1] = '';
		}
		//基本情報取得;
		var u3 = u0[0].split("/");
		data.$={
			url:u0[0],
			dir:this.dir(u),
			query:u0[1],
			domain:u3[2],
			protocol:u3[0].replace(":","")
		};
		
		if(u0[1]){
			var u1 = u0[1].split("&");
			
			//ハッシュ処理;
			for(var i=0;i<u1.length;i++){
				var u2 = u1[i].split("=");
				if(!u2[0]){continue}
				data[u2[0]] = u2[1];
			}
		}
		
		return data;
	},
	
	
	
	//マウス座標※自動更新;
	mouse:{x:0,y:0},
	
	//sef-hack;
	swf:function(f){
//		$NC.$.addEvent(window,"load",function(){
			$NC.$proc.swf.set(f);
//		});
	},
	
	style_width:function(e){
		return e.offsetWidth + parseInt($NC.$.style(e,'margin-left'))+parseInt($NC.$.style(e,'margin-right'));
	},
	style_height:function(e){
		return e.offsetHeight + parseInt($NC.$.style(e,'margin-top'))+parseInt($NC.$.style(e,'margin-bottom'));
	},
	
	
	unique_decode_iframe:function(id){
		
		var iframe;
		
		if(!id){return}
		else if(id.indexOf("$NC_iframe")==-1){return}
		
		//iframe処理
		else if(id.match(/^\$NC\.iframe\[(.*?)\](.*)$/)){
			alert(RegExp.$1+"/"+RegExp.$2);return;
			if(!document.getElementsByTagName("frame").length || typeof(document.getElementsByTagName("frame")[RegExp.$2].contentWindow)=='undefined' || typeof(document.getElementsByTagName("frame")[RegExp.$2].contentWindow.document)=='undefined'){return}
			
			iframe = document.getElementsByTagName("frame")[RegExp.$2].contentWindow.document.body;
		}
		else{return}
		
		
		//element抽出処理
		var elm= iframe;
		var d1 = id.split(".");
		var flg=0;
		for(var i=1;i<d1.length;i++){
			if(d1[i].match(/^(.*?)\[(.*?)\]$/)){
				var tag = RegExp.$1;
				var num = RegExp.$2;
				var cnt = 0;
				if(tag=='' || num==''){
					alert("tag名が不整合です。 : "+d1[i]);
					return;
				}
				var e2 = elm.childNodes;
				for(var j=0;j<e2.length;j++){
					if(typeof(e2[j])=='undefined'){return}
					if(e2[j].tagName != tag.toUpperCase()){continue}
					if(cnt == num){
						elm = e2[j];
					}
					cnt++;
				}
				flg++;
			}
			else if($NC.$.id(d1[i])!=null){
				elm = $NC.$.id(d1[i]);
				flg++;
			}
		}
		if(!flg){return}
		return elm;
	},
	//uniqueIDでの削除;
	unique_remove:function(id){
		if(!id){return;}
		var e = $NC.$.unique_decode(id);
		if(typeof(e)=='undefined'){return}
		$NC.$.remove(e);
//		e.style.border ="1px solid red";
//		alert(id);
	},
	//ページ内のリンクを遷移しないようにする。（管理ページ用）;
	link_kill:function(){
		$NC.$.addEvent(window,"load",  function(){
//			var l = document.links;
			var l = document.getElementsByTagName("*");
			for(var i=0;i<l.length;i++){
//				l[i].onmousedown= function(){return false};
				l[i].onmouseup  = function(){return false};
				l[i].onclick    = function(){return false};
				l[i].onfocus    = function(){this.blur();return false};
			}
			var f = document.forms;
			for(var i=0;i<f.length;i++){
				f[i].onsubmit= function(){return false};
			}
		});
	},
	
	
	//JSファイル読み込み完了チェック※特定の関数が読み込まれているかどうかで判別;
	function_read_check:function(fn,next){
		if(!fn){return}
		if($NC.$proc.function_read_check.count > $NC.$proc.function_read_check.max){return}

		if(typeof(eval(fn))=='undefined'){
			//停止フラグカウント;
			$NC.$proc.function_read_check.count += $NC.$proc.function_read_check.add;
			//再チェック;
			setTimeout(function(){$NC.$.function_read_check(fn,next)},$NC.$proc.function_read_check.add);
		}
		else if(next){
			eval(next);
		}
	},
	function_read_check2:function(fn,next){
		if(!fn){return}
		if($NC.$proc.function_read_check.count > $NC.$proc.function_read_check.max){return}
		if(fn.indexOf(".")!=-1){
			var flg=0;
			var fns = fn.split(".");
			for(var i=0;i<fns.length;i++){
				var fn2=fns.splice(0,i).join(".");
				if(typeof(eval(fn2))=='undefined'){
					flg++;
				}
			}
			if(flg==fns.length && next){
				eval(next);
			}
			else{
				//停止フラグカウント;
				$NC.$proc.function_read_check.count += $NC.$proc.function_read_check.add;
				//再チェック;
				setTimeout(function(){$NC.$.function_read_check(fn,next)},$NC.$proc.function_read_check.add);
			}
		}
		else{
			if(typeof(eval(fn))=='undefined'){
				//停止フラグカウント;
				$NC.$proc.function_read_check.count += $NC.$proc.function_read_check.add;
				//再チェック;
				setTimeout(function(){$NC.$.function_read_check(fn,next)},$NC.$proc.function_read_check.add);
			}
			else if(next){
				eval(next);
			}
		}
	},
	//文字列から関数を実行;
	eval_play:function(str){
		if(!str){return}
		
		if(str.match(/(.*)\((.*)\)/)){
			var str1 = RegExp.$1;
			var str2 = RegExp.$2;
			//引数処理;
			var str3 = [str2];
			if(str2.indexOf(",")!=-1){
				str3 = str2.split(",");
			}
			for(var i=0;i<str3.length;i++){
				if(typeof(str3[i])=="string"){
					str3[i] = "'"+str3[i]+"'";
				}
			}
			str2 = str3.join(",");
			
			
			if(str.indexOf(".")!=-1){
				var fs = str1.split(".");
				
				var fnc=[];
				
				for(var i=0;i<fs.length;i++){
					fnc.push(fs[i]);
					
					if(typeof(eval(fnc.join(".")))=='undefined'){return}
					
				}
				eval(fnc.join(".")+"("+str2+")");
			}
			else{
				eval(str1+"("+str2+")");
			}
		}
		else{
			if(str.indexOf(".")!=-1){
				var fs = str.split(".");
				
				var fnc=[];
				
				for(var i=0;i<fs.length;i++){
					fnc.push(fs[i]);
					
					if(typeof(eval(fnc.join(".")))=='undefined'){return}
					
				}
				eval(fnc.join("."));
			}
			else{
				eval(str);
			}
		}
	},
	
	//任意文字数分のみ表示;
	count_value:function(val,n){
		if(!val){return '';}
		var val2=val.substr(0,n);
		if(val2.length < val.length){
			val2+= "<font style='color:red;'>...</forn>";//…
		}
		return val2;
	},
	
	//年月日時分秒の14桁を返す;
	ymdhis:function(){
		var date = new Date();
		var d={
			y:date.getFullYear(),
			m:date.getMonth()+1,
			d:date.getDate(),
			h:date.getHours(),
			i:date.getMinutes(),
			s:date.getSeconds()
		};
		for(var i in d){
			if(d[i] < 10){
				d[i] = "0"+String(d[i]);
			}
			else{
				d[i] = String(d[i]);
			}
		}
		return d.y + d.m + d.d + d.h + d.i + d.s;
	},
	//14桁のYMDHISデータを配列で返す
	datetime:function(d){
		if(!d){return}
		
		var dt={
			year:d.substring(0,4),
			month:d.substring(4,6),
			day:d.substring(6,8),
			hour:d.substring(8,10),
			min:d.substring(10,12),
			sec:d.substring(12,14)
		};
		
		return dt;
	},
	//compatmode判定を行い（ブラウザ別＆compatmode別）document.bodyの値を返す
	compat:function(e){
		//document判別（iframeにも対応）
		if(typeof(e)=='undefined'){
			e = document;
		}
		else{
			e = e.document;
		}
		
		//compatモード判別[CSS1Compat,BackCompat]
		
		//IE
		if(navigator.userAgent.indexOf("MSIE")!=-1){
			if(e.compatMode=="BackCompat"){
				return e.body;
			}
			else{
				return e.documentElement;
			}
		}
		//Firefox
		else if(navigator.userAgent.indexOf("Firefox")!=-1){
			if(e.compatMode=='CSS1Compat'){
				return e.documentElement;
			}
			else{
				return e.body;
			}
		}
		//webkit
		else{
			return e.body;
		}
		
	},
	
$:''};



//----------
//cookie処理
//----------
if(typeof($NC.$cookie)=='undefined'){$NC.$cookie={}}
//各種初期設定
$NC.$cookie.data={
	name:"NavicastApi",
	day:0,
	hour:6,
	min:0,
	sec:0
};
//日付算出（有効期限用）
$NC.$cookie.date=function(d,h,m,s){
	var exp=new Date();
	exp.setTime(exp.getTime()+(d*1000*60*60*24)+(h*1000*60*60)+(m*1000*60)+(s*1000));
	return exp.toGMTString();
};
//ssl判定
$NC.$cookie.secure=function(){
	if (location.href.match(/^https/)){
		return true;
	}
	else{
		return;
	}
};
//cookie書き込み
$NC.$cookie.write=function(nm , val ,d,h,m,s){
	//脆弱性処理
	val = $NC.$.xss(val);
	
	if(this.secure()){
		document.cookie = nm+"\="+val+";expires\="+this.date(d,h,m,s)+";secure";
//		document.cookie = nm+"\="+val+";expires\="+this.date(d,h,m,s)+";path=/;secure";
	}
	else{
		document.cookie = nm+"\="+val+";expires\="+this.date(d,h,m,s);
//		document.cookie = nm+"\="+val+";expires\="+this.date(d,h,m,s)+";path=/;";
	}
};
//cookie読み込み
$NC.$cookie.read=function(nm){
	var ck0=document.cookie.split(" ").join("");
	var ck1=ck0.split(";");
	for(var i=0;i<ck1.length;i++){
		var ck2=ck1[i].split("=");
		if(ck2[0]==nm){
			//脆弱性処理
			ck2[1] = $NC.$.xss(ck2[1]);
			return ck2[1];
		}
	}
	return '';
};



//swf設定
//$NC.$.swf();

//マウス座標取得用;
$NC.$.addEvent(document,"mousemove",$NC.$proc.mouse);
*/


