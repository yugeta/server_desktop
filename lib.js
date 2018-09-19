
var $LIB=(function(){
    
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
            if(!op.path)    {op.path=core.data.path}
            if(!op.mode)    {op.mode=[]}
            if(!op.error)    {op.error=function(res){$LIB.ajax.error("Read-error !"+res)}}
            if(!op.timeout)    {op.timeout=function(res){$LIB.ajax.error("Read-error !"+res)}}
            
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
        	a.httpoj.send(op.mode.join('&'));
    	}
    };
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
    //camelize,capitalize;
    core.camelize(prop)
    概要：style属性などの文字列整形を行う※例)「font-type」→「fontType」
	[ prop:文字列 ]
    **********/
    core.string={
        url_encode:function(str,list){
            if(str=="" || typeof(str)=="undefined"){return ""}
            //var arr = ['&','"',"'",'=',' '];
            for(var i=0;i<list.length;i++){
                //str=str.split(arr[i]).join(encodeURIComponent(arr[i]));
                str=str.split(list[i]).join(escape(list[i]));
            }
            return str;
        },
        url_decode:function(str,list){
            //var arr = ['&','"',"'",'=',' '];
            for(var i=0;i<list.length;i++){
                //str=str.split(arr[i]).join(encodeURIComponent(arr[i]));
                str=str.split(escape(list[i])).join(list[i]);
            }
            return str;
        },
        camelize:function(v){
    	if(typeof(v)!='string'){return}
		return v.replace(/-([a-z])/g , function(m){return m.charAt(1).toUpperCase();});
	},
    $:0};
    /*
    core.camelize=function(v){
		if(typeof(v)!='string'){return}
		return v.replace(/-([a-z])/g , function(m){return m.charAt(1).toUpperCase();});
	};
    */
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


