import{m as l,aZ as _e,o as E,t as bt,aA as ee,W as wt,e as ke,r as Et,C as Fe,D as Pe,B as ie,T as Ce,k as ve,w as Le,v as Ee,S as De}from"./mermaid.esm.min-KqHW0GF5.js";import"./app-DDou_qg2.js";var Dt=function(){var t=l(function(H,s,c,o){for(c=c||{},o=H.length;o--;c[H[o]]=s);return c},"o"),n=[1,3],d=[1,4],u=[1,5],h=[1,6],f=[1,7],g=[1,4,5,10,12,13,14,18,25,35,37,39,41,42,48,50,51,52,53,54,55,56,57,60,61,63,64,65,66,67],S=[1,4,5,10,12,13,14,18,25,28,35,37,39,41,42,48,50,51,52,53,54,55,56,57,60,61,63,64,65,66,67],a=[55,56,57],T=[2,36],p=[1,37],y=[1,36],A=[1,38],m=[1,35],x=[1,43],q=[1,41],U=[1,14],j=[1,23],K=[1,18],pt=[1,19],ut=[1,20],dt=[1,21],xt=[1,22],ft=[1,24],gt=[1,25],i=[1,26],zt=[1,27],Nt=[1,28],Wt=[1,29],$=[1,32],Q=[1,33],_=[1,34],k=[1,39],F=[1,40],P=[1,42],C=[1,44],M=[1,62],O=[1,61],v=[4,5,8,10,12,13,14,18,44,47,49,55,56,57,63,64,65,66,67],Bt=[1,65],Rt=[1,66],$t=[1,67],Qt=[1,68],Ht=[1,69],Xt=[1,70],Ut=[1,71],Mt=[1,72],Ot=[1,73],Yt=[1,74],jt=[1,75],Kt=[1,76],z=[4,5,6,7,8,9,10,11,12,13,14,15,18],Z=[1,90],J=[1,91],tt=[1,92],et=[1,99],it=[1,93],at=[1,96],nt=[1,94],st=[1,95],rt=[1,97],lt=[1,98],_t=[1,102],Gt=[10,55,56,57],B=[4,5,6,8,10,11,13,17,18,19,20,55,56,57],kt={trace:l(function(){},"trace"),yy:{},symbols_:{error:2,idStringToken:3,ALPHA:4,NUM:5,NODE_STRING:6,DOWN:7,MINUS:8,DEFAULT:9,COMMA:10,COLON:11,AMP:12,BRKT:13,MULT:14,UNICODE_TEXT:15,styleComponent:16,UNIT:17,SPACE:18,STYLE:19,PCT:20,idString:21,style:22,stylesOpt:23,classDefStatement:24,CLASSDEF:25,start:26,eol:27,QUADRANT:28,document:29,line:30,statement:31,axisDetails:32,quadrantDetails:33,points:34,title:35,title_value:36,acc_title:37,acc_title_value:38,acc_descr:39,acc_descr_value:40,acc_descr_multiline_value:41,section:42,text:43,point_start:44,point_x:45,point_y:46,class_name:47,"X-AXIS":48,"AXIS-TEXT-DELIMITER":49,"Y-AXIS":50,QUADRANT_1:51,QUADRANT_2:52,QUADRANT_3:53,QUADRANT_4:54,NEWLINE:55,SEMI:56,EOF:57,alphaNumToken:58,textNoTagsToken:59,STR:60,MD_STR:61,alphaNum:62,PUNCTUATION:63,PLUS:64,EQUALS:65,DOT:66,UNDERSCORE:67,$accept:0,$end:1},terminals_:{2:"error",4:"ALPHA",5:"NUM",6:"NODE_STRING",7:"DOWN",8:"MINUS",9:"DEFAULT",10:"COMMA",11:"COLON",12:"AMP",13:"BRKT",14:"MULT",15:"UNICODE_TEXT",17:"UNIT",18:"SPACE",19:"STYLE",20:"PCT",25:"CLASSDEF",28:"QUADRANT",35:"title",36:"title_value",37:"acc_title",38:"acc_title_value",39:"acc_descr",40:"acc_descr_value",41:"acc_descr_multiline_value",42:"section",44:"point_start",45:"point_x",46:"point_y",47:"class_name",48:"X-AXIS",49:"AXIS-TEXT-DELIMITER",50:"Y-AXIS",51:"QUADRANT_1",52:"QUADRANT_2",53:"QUADRANT_3",54:"QUADRANT_4",55:"NEWLINE",56:"SEMI",57:"EOF",60:"STR",61:"MD_STR",63:"PUNCTUATION",64:"PLUS",65:"EQUALS",66:"DOT",67:"UNDERSCORE"},productions_:[0,[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[3,1],[16,1],[16,1],[16,1],[16,1],[16,1],[16,1],[16,1],[16,1],[16,1],[16,1],[21,1],[21,2],[22,1],[22,2],[23,1],[23,3],[24,5],[26,2],[26,2],[26,2],[29,0],[29,2],[30,2],[31,0],[31,1],[31,2],[31,1],[31,1],[31,1],[31,2],[31,2],[31,2],[31,1],[31,1],[34,4],[34,5],[34,5],[34,6],[32,4],[32,3],[32,2],[32,4],[32,3],[32,2],[33,2],[33,2],[33,2],[33,2],[27,1],[27,1],[27,1],[43,1],[43,2],[43,1],[43,1],[62,1],[62,2],[58,1],[58,1],[58,1],[58,1],[58,1],[58,1],[58,1],[58,1],[58,1],[58,1],[58,1],[59,1],[59,1],[59,1]],performAction:l(function(H,s,c,o,b,e,N){var r=e.length-1;switch(b){case 23:this.$=e[r];break;case 24:this.$=e[r-1]+""+e[r];break;case 26:this.$=e[r-1]+e[r];break;case 27:this.$=[e[r].trim()];break;case 28:e[r-2].push(e[r].trim()),this.$=e[r-2];break;case 29:this.$=e[r-4],o.addClass(e[r-2],e[r]);break;case 37:this.$=[];break;case 42:this.$=e[r].trim(),o.setDiagramTitle(this.$);break;case 43:this.$=e[r].trim(),o.setAccTitle(this.$);break;case 44:case 45:this.$=e[r].trim(),o.setAccDescription(this.$);break;case 46:o.addSection(e[r].substr(8)),this.$=e[r].substr(8);break;case 47:o.addPoint(e[r-3],"",e[r-1],e[r],[]);break;case 48:o.addPoint(e[r-4],e[r-3],e[r-1],e[r],[]);break;case 49:o.addPoint(e[r-4],"",e[r-2],e[r-1],e[r]);break;case 50:o.addPoint(e[r-5],e[r-4],e[r-2],e[r-1],e[r]);break;case 51:o.setXAxisLeftText(e[r-2]),o.setXAxisRightText(e[r]);break;case 52:e[r-1].text+=" ⟶ ",o.setXAxisLeftText(e[r-1]);break;case 53:o.setXAxisLeftText(e[r]);break;case 54:o.setYAxisBottomText(e[r-2]),o.setYAxisTopText(e[r]);break;case 55:e[r-1].text+=" ⟶ ",o.setYAxisBottomText(e[r-1]);break;case 56:o.setYAxisBottomText(e[r]);break;case 57:o.setQuadrant1Text(e[r]);break;case 58:o.setQuadrant2Text(e[r]);break;case 59:o.setQuadrant3Text(e[r]);break;case 60:o.setQuadrant4Text(e[r]);break;case 64:this.$={text:e[r],type:"text"};break;case 65:this.$={text:e[r-1].text+""+e[r],type:e[r-1].type};break;case 66:this.$={text:e[r],type:"text"};break;case 67:this.$={text:e[r],type:"markdown"};break;case 68:this.$=e[r];break;case 69:this.$=e[r-1]+""+e[r];break}},"anonymous"),table:[{18:n,26:1,27:2,28:d,55:u,56:h,57:f},{1:[3]},{18:n,26:8,27:2,28:d,55:u,56:h,57:f},{18:n,26:9,27:2,28:d,55:u,56:h,57:f},t(g,[2,33],{29:10}),t(S,[2,61]),t(S,[2,62]),t(S,[2,63]),{1:[2,30]},{1:[2,31]},t(a,T,{30:11,31:12,24:13,32:15,33:16,34:17,43:30,58:31,1:[2,32],4:p,5:y,10:A,12:m,13:x,14:q,18:U,25:j,35:K,37:pt,39:ut,41:dt,42:xt,48:ft,50:gt,51:i,52:zt,53:Nt,54:Wt,60:$,61:Q,63:_,64:k,65:F,66:P,67:C}),t(g,[2,34]),{27:45,55:u,56:h,57:f},t(a,[2,37]),t(a,T,{24:13,32:15,33:16,34:17,43:30,58:31,31:46,4:p,5:y,10:A,12:m,13:x,14:q,18:U,25:j,35:K,37:pt,39:ut,41:dt,42:xt,48:ft,50:gt,51:i,52:zt,53:Nt,54:Wt,60:$,61:Q,63:_,64:k,65:F,66:P,67:C}),t(a,[2,39]),t(a,[2,40]),t(a,[2,41]),{36:[1,47]},{38:[1,48]},{40:[1,49]},t(a,[2,45]),t(a,[2,46]),{18:[1,50]},{4:p,5:y,10:A,12:m,13:x,14:q,43:51,58:31,60:$,61:Q,63:_,64:k,65:F,66:P,67:C},{4:p,5:y,10:A,12:m,13:x,14:q,43:52,58:31,60:$,61:Q,63:_,64:k,65:F,66:P,67:C},{4:p,5:y,10:A,12:m,13:x,14:q,43:53,58:31,60:$,61:Q,63:_,64:k,65:F,66:P,67:C},{4:p,5:y,10:A,12:m,13:x,14:q,43:54,58:31,60:$,61:Q,63:_,64:k,65:F,66:P,67:C},{4:p,5:y,10:A,12:m,13:x,14:q,43:55,58:31,60:$,61:Q,63:_,64:k,65:F,66:P,67:C},{4:p,5:y,10:A,12:m,13:x,14:q,43:56,58:31,60:$,61:Q,63:_,64:k,65:F,66:P,67:C},{4:p,5:y,8:M,10:A,12:m,13:x,14:q,18:O,44:[1,57],47:[1,58],58:60,59:59,63:_,64:k,65:F,66:P,67:C},t(v,[2,64]),t(v,[2,66]),t(v,[2,67]),t(v,[2,70]),t(v,[2,71]),t(v,[2,72]),t(v,[2,73]),t(v,[2,74]),t(v,[2,75]),t(v,[2,76]),t(v,[2,77]),t(v,[2,78]),t(v,[2,79]),t(v,[2,80]),t(g,[2,35]),t(a,[2,38]),t(a,[2,42]),t(a,[2,43]),t(a,[2,44]),{3:64,4:Bt,5:Rt,6:$t,7:Qt,8:Ht,9:Xt,10:Ut,11:Mt,12:Ot,13:Yt,14:jt,15:Kt,21:63},t(a,[2,53],{59:59,58:60,4:p,5:y,8:M,10:A,12:m,13:x,14:q,18:O,49:[1,77],63:_,64:k,65:F,66:P,67:C}),t(a,[2,56],{59:59,58:60,4:p,5:y,8:M,10:A,12:m,13:x,14:q,18:O,49:[1,78],63:_,64:k,65:F,66:P,67:C}),t(a,[2,57],{59:59,58:60,4:p,5:y,8:M,10:A,12:m,13:x,14:q,18:O,63:_,64:k,65:F,66:P,67:C}),t(a,[2,58],{59:59,58:60,4:p,5:y,8:M,10:A,12:m,13:x,14:q,18:O,63:_,64:k,65:F,66:P,67:C}),t(a,[2,59],{59:59,58:60,4:p,5:y,8:M,10:A,12:m,13:x,14:q,18:O,63:_,64:k,65:F,66:P,67:C}),t(a,[2,60],{59:59,58:60,4:p,5:y,8:M,10:A,12:m,13:x,14:q,18:O,63:_,64:k,65:F,66:P,67:C}),{45:[1,79]},{44:[1,80]},t(v,[2,65]),t(v,[2,81]),t(v,[2,82]),t(v,[2,83]),{3:82,4:Bt,5:Rt,6:$t,7:Qt,8:Ht,9:Xt,10:Ut,11:Mt,12:Ot,13:Yt,14:jt,15:Kt,18:[1,81]},t(z,[2,23]),t(z,[2,1]),t(z,[2,2]),t(z,[2,3]),t(z,[2,4]),t(z,[2,5]),t(z,[2,6]),t(z,[2,7]),t(z,[2,8]),t(z,[2,9]),t(z,[2,10]),t(z,[2,11]),t(z,[2,12]),t(a,[2,52],{58:31,43:83,4:p,5:y,10:A,12:m,13:x,14:q,60:$,61:Q,63:_,64:k,65:F,66:P,67:C}),t(a,[2,55],{58:31,43:84,4:p,5:y,10:A,12:m,13:x,14:q,60:$,61:Q,63:_,64:k,65:F,66:P,67:C}),{46:[1,85]},{45:[1,86]},{4:Z,5:J,6:tt,8:et,11:it,13:at,16:89,17:nt,18:st,19:rt,20:lt,22:88,23:87},t(z,[2,24]),t(a,[2,51],{59:59,58:60,4:p,5:y,8:M,10:A,12:m,13:x,14:q,18:O,63:_,64:k,65:F,66:P,67:C}),t(a,[2,54],{59:59,58:60,4:p,5:y,8:M,10:A,12:m,13:x,14:q,18:O,63:_,64:k,65:F,66:P,67:C}),t(a,[2,47],{22:88,16:89,23:100,4:Z,5:J,6:tt,8:et,11:it,13:at,17:nt,18:st,19:rt,20:lt}),{46:[1,101]},t(a,[2,29],{10:_t}),t(Gt,[2,27],{16:103,4:Z,5:J,6:tt,8:et,11:it,13:at,17:nt,18:st,19:rt,20:lt}),t(B,[2,25]),t(B,[2,13]),t(B,[2,14]),t(B,[2,15]),t(B,[2,16]),t(B,[2,17]),t(B,[2,18]),t(B,[2,19]),t(B,[2,20]),t(B,[2,21]),t(B,[2,22]),t(a,[2,49],{10:_t}),t(a,[2,48],{22:88,16:89,23:104,4:Z,5:J,6:tt,8:et,11:it,13:at,17:nt,18:st,19:rt,20:lt}),{4:Z,5:J,6:tt,8:et,11:it,13:at,16:89,17:nt,18:st,19:rt,20:lt,22:105},t(B,[2,26]),t(a,[2,50],{10:_t}),t(Gt,[2,28],{16:103,4:Z,5:J,6:tt,8:et,11:it,13:at,17:nt,18:st,19:rt,20:lt})],defaultActions:{8:[2,30],9:[2,31]},parseError:l(function(H,s){if(s.recoverable)this.trace(H);else{var c=new Error(H);throw c.hash=s,c}},"parseError"),parse:l(function(H){var s=this,c=[0],o=[],b=[null],e=[],N=this.table,r="",Tt=0,Vt=0,me=0,qe=2,Zt=1,Ae=e.slice.call(arguments,1),L=Object.create(this.lexer),G={yy:{}};for(var Ft in this.yy)Object.prototype.hasOwnProperty.call(this.yy,Ft)&&(G.yy[Ft]=this.yy[Ft]);L.setInput(H,G.yy),G.yy.lexer=L,G.yy.parser=this,typeof L.yylloc>"u"&&(L.yylloc={});var Pt=L.yylloc;e.push(Pt);var be=L.options&&L.options.ranges;typeof G.yy.parseError=="function"?this.parseError=G.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function Se(W){c.length=c.length-2*W,b.length=b.length-W,e.length=e.length-W}l(Se,"popStack");function Jt(){var W;return W=o.pop()||L.lex()||Zt,typeof W!="number"&&(W instanceof Array&&(o=W,W=o.pop()),W=s.symbols_[W]||W),W}l(Jt,"lex");for(var I,Ct,V,R,$e,vt,ot={},mt,Y,te,qt;;){if(V=c[c.length-1],this.defaultActions[V]?R=this.defaultActions[V]:((I===null||typeof I>"u")&&(I=Jt()),R=N[V]&&N[V][I]),typeof R>"u"||!R.length||!R[0]){var Lt="";qt=[];for(mt in N[V])this.terminals_[mt]&&mt>qe&&qt.push("'"+this.terminals_[mt]+"'");L.showPosition?Lt="Parse error on line "+(Tt+1)+`:
`+L.showPosition()+`
Expecting `+qt.join(", ")+", got '"+(this.terminals_[I]||I)+"'":Lt="Parse error on line "+(Tt+1)+": Unexpected "+(I==Zt?"end of input":"'"+(this.terminals_[I]||I)+"'"),this.parseError(Lt,{text:L.match,token:this.terminals_[I]||I,line:L.yylineno,loc:Pt,expected:qt})}if(R[0]instanceof Array&&R.length>1)throw new Error("Parse Error: multiple actions possible at state: "+V+", token: "+I);switch(R[0]){case 1:c.push(I),b.push(L.yytext),e.push(L.yylloc),c.push(R[1]),I=null,Ct?(I=Ct,Ct=null):(Vt=L.yyleng,r=L.yytext,Tt=L.yylineno,Pt=L.yylloc,me>0);break;case 2:if(Y=this.productions_[R[1]][1],ot.$=b[b.length-Y],ot._$={first_line:e[e.length-(Y||1)].first_line,last_line:e[e.length-1].last_line,first_column:e[e.length-(Y||1)].first_column,last_column:e[e.length-1].last_column},be&&(ot._$.range=[e[e.length-(Y||1)].range[0],e[e.length-1].range[1]]),vt=this.performAction.apply(ot,[r,Vt,Tt,G.yy,R[1],b,e].concat(Ae)),typeof vt<"u")return vt;Y&&(c=c.slice(0,-1*Y*2),b=b.slice(0,-1*Y),e=e.slice(0,-1*Y)),c.push(this.productions_[R[1]][0]),b.push(ot.$),e.push(ot._$),te=N[c[c.length-2]][c[c.length-1]],c.push(te);break;case 3:return!0}}return!0},"parse")},Te=function(){var H={EOF:1,parseError:l(function(s,c){if(this.yy.parser)this.yy.parser.parseError(s,c);else throw new Error(s)},"parseError"),setInput:l(function(s,c){return this.yy=c||this.yy||{},this._input=s,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},"setInput"),input:l(function(){var s=this._input[0];this.yytext+=s,this.yyleng++,this.offset++,this.match+=s,this.matched+=s;var c=s.match(/(?:\r\n?|\n).*/g);return c?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),s},"input"),unput:l(function(s){var c=s.length,o=s.split(/(?:\r\n?|\n)/g);this._input=s+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-c),this.offset-=c;var b=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),o.length-1&&(this.yylineno-=o.length-1);var e=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:o?(o.length===b.length?this.yylloc.first_column:0)+b[b.length-o.length].length-o[0].length:this.yylloc.first_column-c},this.options.ranges&&(this.yylloc.range=[e[0],e[0]+this.yyleng-c]),this.yyleng=this.yytext.length,this},"unput"),more:l(function(){return this._more=!0,this},"more"),reject:l(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:l(function(s){this.unput(this.match.slice(s))},"less"),pastInput:l(function(){var s=this.matched.substr(0,this.matched.length-this.match.length);return(s.length>20?"...":"")+s.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:l(function(){var s=this.match;return s.length<20&&(s+=this._input.substr(0,20-s.length)),(s.substr(0,20)+(s.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:l(function(){var s=this.pastInput(),c=new Array(s.length+1).join("-");return s+this.upcomingInput()+`
`+c+"^"},"showPosition"),test_match:l(function(s,c){var o,b,e;if(this.options.backtrack_lexer&&(e={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(e.yylloc.range=this.yylloc.range.slice(0))),b=s[0].match(/(?:\r\n?|\n).*/g),b&&(this.yylineno+=b.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:b?b[b.length-1].length-b[b.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+s[0].length},this.yytext+=s[0],this.match+=s[0],this.matches=s,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(s[0].length),this.matched+=s[0],o=this.performAction.call(this,this.yy,this,c,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),o)return o;if(this._backtrack){for(var N in e)this[N]=e[N];return!1}return!1},"test_match"),next:l(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var s,c,o,b;this._more||(this.yytext="",this.match="");for(var e=this._currentRules(),N=0;N<e.length;N++)if(o=this._input.match(this.rules[e[N]]),o&&(!c||o[0].length>c[0].length)){if(c=o,b=N,this.options.backtrack_lexer){if(s=this.test_match(o,e[N]),s!==!1)return s;if(this._backtrack){c=!1;continue}else return!1}else if(!this.options.flex)break}return c?(s=this.test_match(c,e[b]),s!==!1?s:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:l(function(){var s=this.next();return s||this.lex()},"lex"),begin:l(function(s){this.conditionStack.push(s)},"begin"),popState:l(function(){var s=this.conditionStack.length-1;return s>0?this.conditionStack.pop():this.conditionStack[0]},"popState"),_currentRules:l(function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},"_currentRules"),topState:l(function(s){return s=this.conditionStack.length-1-Math.abs(s||0),s>=0?this.conditionStack[s]:"INITIAL"},"topState"),pushState:l(function(s){this.begin(s)},"pushState"),stateStackSize:l(function(){return this.conditionStack.length},"stateStackSize"),options:{"case-insensitive":!0},performAction:l(function(s,c,o,b){switch(o){case 0:break;case 1:break;case 2:return 55;case 3:break;case 4:return this.begin("title"),35;case 5:return this.popState(),"title_value";case 6:return this.begin("acc_title"),37;case 7:return this.popState(),"acc_title_value";case 8:return this.begin("acc_descr"),39;case 9:return this.popState(),"acc_descr_value";case 10:this.begin("acc_descr_multiline");break;case 11:this.popState();break;case 12:return"acc_descr_multiline_value";case 13:return 48;case 14:return 50;case 15:return 49;case 16:return 51;case 17:return 52;case 18:return 53;case 19:return 54;case 20:return 25;case 21:this.begin("md_string");break;case 22:return"MD_STR";case 23:this.popState();break;case 24:this.begin("string");break;case 25:this.popState();break;case 26:return"STR";case 27:this.begin("class_name");break;case 28:return this.popState(),47;case 29:return this.begin("point_start"),44;case 30:return this.begin("point_x"),45;case 31:this.popState();break;case 32:this.popState(),this.begin("point_y");break;case 33:return this.popState(),46;case 34:return 28;case 35:return 4;case 36:return 11;case 37:return 64;case 38:return 10;case 39:return 65;case 40:return 65;case 41:return 14;case 42:return 13;case 43:return 67;case 44:return 66;case 45:return 12;case 46:return 8;case 47:return 5;case 48:return 18;case 49:return 56;case 50:return 63;case 51:return 57}},"anonymous"),rules:[/^(?:%%(?!\{)[^\n]*)/i,/^(?:[^\}]%%[^\n]*)/i,/^(?:[\n\r]+)/i,/^(?:%%[^\n]*)/i,/^(?:title\b)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?: *x-axis *)/i,/^(?: *y-axis *)/i,/^(?: *--+> *)/i,/^(?: *quadrant-1 *)/i,/^(?: *quadrant-2 *)/i,/^(?: *quadrant-3 *)/i,/^(?: *quadrant-4 *)/i,/^(?:classDef\b)/i,/^(?:["][`])/i,/^(?:[^`"]+)/i,/^(?:[`]["])/i,/^(?:["])/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?::::)/i,/^(?:^\w+)/i,/^(?:\s*:\s*\[\s*)/i,/^(?:(1)|(0(.\d+)?))/i,/^(?:\s*\] *)/i,/^(?:\s*,\s*)/i,/^(?:(1)|(0(.\d+)?))/i,/^(?: *quadrantChart *)/i,/^(?:[A-Za-z]+)/i,/^(?::)/i,/^(?:\+)/i,/^(?:,)/i,/^(?:=)/i,/^(?:=)/i,/^(?:\*)/i,/^(?:#)/i,/^(?:[\_])/i,/^(?:\.)/i,/^(?:&)/i,/^(?:-)/i,/^(?:[0-9]+)/i,/^(?:\s)/i,/^(?:;)/i,/^(?:[!"#$%&'*+,-.`?\\_/])/i,/^(?:$)/i],conditions:{class_name:{rules:[28],inclusive:!1},point_y:{rules:[33],inclusive:!1},point_x:{rules:[32],inclusive:!1},point_start:{rules:[30,31],inclusive:!1},acc_descr_multiline:{rules:[11,12],inclusive:!1},acc_descr:{rules:[9],inclusive:!1},acc_title:{rules:[7],inclusive:!1},title:{rules:[5],inclusive:!1},md_string:{rules:[22,23],inclusive:!1},string:{rules:[25,26],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,6,8,10,13,14,15,16,17,18,19,20,21,24,27,29,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51],inclusive:!0}}};return H}();kt.lexer=Te;function yt(){this.yy={}}return l(yt,"Parser"),yt.prototype=kt,kt.Parser=yt,new yt}();Dt.parser=Dt;var Ie=Dt,w=_e(),ht,we=(ht=class{constructor(){this.classes=new Map,this.config=this.getDefaultConfig(),this.themeConfig=this.getDefaultThemeConfig(),this.data=this.getDefaultData()}getDefaultData(){return{titleText:"",quadrant1Text:"",quadrant2Text:"",quadrant3Text:"",quadrant4Text:"",xAxisLeftText:"",xAxisRightText:"",yAxisBottomText:"",yAxisTopText:"",points:[]}}getDefaultConfig(){var n,d,u,h,f,g,S,a,T,p,y,A,m,x,q,U,j,K;return{showXAxis:!0,showYAxis:!0,showTitle:!0,chartHeight:((n=E.quadrantChart)==null?void 0:n.chartWidth)||500,chartWidth:((d=E.quadrantChart)==null?void 0:d.chartHeight)||500,titlePadding:((u=E.quadrantChart)==null?void 0:u.titlePadding)||10,titleFontSize:((h=E.quadrantChart)==null?void 0:h.titleFontSize)||20,quadrantPadding:((f=E.quadrantChart)==null?void 0:f.quadrantPadding)||5,xAxisLabelPadding:((g=E.quadrantChart)==null?void 0:g.xAxisLabelPadding)||5,yAxisLabelPadding:((S=E.quadrantChart)==null?void 0:S.yAxisLabelPadding)||5,xAxisLabelFontSize:((a=E.quadrantChart)==null?void 0:a.xAxisLabelFontSize)||16,yAxisLabelFontSize:((T=E.quadrantChart)==null?void 0:T.yAxisLabelFontSize)||16,quadrantLabelFontSize:((p=E.quadrantChart)==null?void 0:p.quadrantLabelFontSize)||16,quadrantTextTopPadding:((y=E.quadrantChart)==null?void 0:y.quadrantTextTopPadding)||5,pointTextPadding:((A=E.quadrantChart)==null?void 0:A.pointTextPadding)||5,pointLabelFontSize:((m=E.quadrantChart)==null?void 0:m.pointLabelFontSize)||12,pointRadius:((x=E.quadrantChart)==null?void 0:x.pointRadius)||5,xAxisPosition:((q=E.quadrantChart)==null?void 0:q.xAxisPosition)||"top",yAxisPosition:((U=E.quadrantChart)==null?void 0:U.yAxisPosition)||"left",quadrantInternalBorderStrokeWidth:((j=E.quadrantChart)==null?void 0:j.quadrantInternalBorderStrokeWidth)||1,quadrantExternalBorderStrokeWidth:((K=E.quadrantChart)==null?void 0:K.quadrantExternalBorderStrokeWidth)||2}}getDefaultThemeConfig(){return{quadrant1Fill:w.quadrant1Fill,quadrant2Fill:w.quadrant2Fill,quadrant3Fill:w.quadrant3Fill,quadrant4Fill:w.quadrant4Fill,quadrant1TextFill:w.quadrant1TextFill,quadrant2TextFill:w.quadrant2TextFill,quadrant3TextFill:w.quadrant3TextFill,quadrant4TextFill:w.quadrant4TextFill,quadrantPointFill:w.quadrantPointFill,quadrantPointTextFill:w.quadrantPointTextFill,quadrantXAxisTextFill:w.quadrantXAxisTextFill,quadrantYAxisTextFill:w.quadrantYAxisTextFill,quadrantTitleFill:w.quadrantTitleFill,quadrantInternalBorderStrokeFill:w.quadrantInternalBorderStrokeFill,quadrantExternalBorderStrokeFill:w.quadrantExternalBorderStrokeFill}}clear(){this.config=this.getDefaultConfig(),this.themeConfig=this.getDefaultThemeConfig(),this.data=this.getDefaultData(),this.classes=new Map,bt.info("clear called")}setData(n){this.data={...this.data,...n}}addPoints(n){this.data.points=[...n,...this.data.points]}addClass(n,d){this.classes.set(n,d)}setConfig(n){bt.trace("setConfig called with: ",n),this.config={...this.config,...n}}setThemeConfig(n){bt.trace("setThemeConfig called with: ",n),this.themeConfig={...this.themeConfig,...n}}calculateSpace(n,d,u,h){let f=this.config.xAxisLabelPadding*2+this.config.xAxisLabelFontSize,g={top:n==="top"&&d?f:0,bottom:n==="bottom"&&d?f:0},S=this.config.yAxisLabelPadding*2+this.config.yAxisLabelFontSize,a={left:this.config.yAxisPosition==="left"&&u?S:0,right:this.config.yAxisPosition==="right"&&u?S:0},T=this.config.titleFontSize+this.config.titlePadding*2,p={top:h?T:0},y=this.config.quadrantPadding+a.left,A=this.config.quadrantPadding+g.top+p.top,m=this.config.chartWidth-this.config.quadrantPadding*2-a.left-a.right,x=this.config.chartHeight-this.config.quadrantPadding*2-g.top-g.bottom-p.top,q=m/2,U=x/2;return{xAxisSpace:g,yAxisSpace:a,titleSpace:p,quadrantSpace:{quadrantLeft:y,quadrantTop:A,quadrantWidth:m,quadrantHalfWidth:q,quadrantHeight:x,quadrantHalfHeight:U}}}getAxisLabels(n,d,u,h){let{quadrantSpace:f,titleSpace:g}=h,{quadrantHalfHeight:S,quadrantHeight:a,quadrantLeft:T,quadrantHalfWidth:p,quadrantTop:y,quadrantWidth:A}=f,m=!!this.data.xAxisRightText,x=!!this.data.yAxisTopText,q=[];return this.data.xAxisLeftText&&d&&q.push({text:this.data.xAxisLeftText,fill:this.themeConfig.quadrantXAxisTextFill,x:T+(m?p/2:0),y:n==="top"?this.config.xAxisLabelPadding+g.top:this.config.xAxisLabelPadding+y+a+this.config.quadrantPadding,fontSize:this.config.xAxisLabelFontSize,verticalPos:m?"center":"left",horizontalPos:"top",rotation:0}),this.data.xAxisRightText&&d&&q.push({text:this.data.xAxisRightText,fill:this.themeConfig.quadrantXAxisTextFill,x:T+p+(m?p/2:0),y:n==="top"?this.config.xAxisLabelPadding+g.top:this.config.xAxisLabelPadding+y+a+this.config.quadrantPadding,fontSize:this.config.xAxisLabelFontSize,verticalPos:m?"center":"left",horizontalPos:"top",rotation:0}),this.data.yAxisBottomText&&u&&q.push({text:this.data.yAxisBottomText,fill:this.themeConfig.quadrantYAxisTextFill,x:this.config.yAxisPosition==="left"?this.config.yAxisLabelPadding:this.config.yAxisLabelPadding+T+A+this.config.quadrantPadding,y:y+a-(x?S/2:0),fontSize:this.config.yAxisLabelFontSize,verticalPos:x?"center":"left",horizontalPos:"top",rotation:-90}),this.data.yAxisTopText&&u&&q.push({text:this.data.yAxisTopText,fill:this.themeConfig.quadrantYAxisTextFill,x:this.config.yAxisPosition==="left"?this.config.yAxisLabelPadding:this.config.yAxisLabelPadding+T+A+this.config.quadrantPadding,y:y+S-(x?S/2:0),fontSize:this.config.yAxisLabelFontSize,verticalPos:x?"center":"left",horizontalPos:"top",rotation:-90}),q}getQuadrants(n){let{quadrantSpace:d}=n,{quadrantHalfHeight:u,quadrantLeft:h,quadrantHalfWidth:f,quadrantTop:g}=d,S=[{text:{text:this.data.quadrant1Text,fill:this.themeConfig.quadrant1TextFill,x:0,y:0,fontSize:this.config.quadrantLabelFontSize,verticalPos:"center",horizontalPos:"middle",rotation:0},x:h+f,y:g,width:f,height:u,fill:this.themeConfig.quadrant1Fill},{text:{text:this.data.quadrant2Text,fill:this.themeConfig.quadrant2TextFill,x:0,y:0,fontSize:this.config.quadrantLabelFontSize,verticalPos:"center",horizontalPos:"middle",rotation:0},x:h,y:g,width:f,height:u,fill:this.themeConfig.quadrant2Fill},{text:{text:this.data.quadrant3Text,fill:this.themeConfig.quadrant3TextFill,x:0,y:0,fontSize:this.config.quadrantLabelFontSize,verticalPos:"center",horizontalPos:"middle",rotation:0},x:h,y:g+u,width:f,height:u,fill:this.themeConfig.quadrant3Fill},{text:{text:this.data.quadrant4Text,fill:this.themeConfig.quadrant4TextFill,x:0,y:0,fontSize:this.config.quadrantLabelFontSize,verticalPos:"center",horizontalPos:"middle",rotation:0},x:h+f,y:g+u,width:f,height:u,fill:this.themeConfig.quadrant4Fill}];for(let a of S)a.text.x=a.x+a.width/2,this.data.points.length===0?(a.text.y=a.y+a.height/2,a.text.horizontalPos="middle"):(a.text.y=a.y+this.config.quadrantTextTopPadding,a.text.horizontalPos="top");return S}getQuadrantPoints(n){let{quadrantSpace:d}=n,{quadrantHeight:u,quadrantLeft:h,quadrantTop:f,quadrantWidth:g}=d,S=ee().domain([0,1]).range([h,g+h]),a=ee().domain([0,1]).range([u+f,f]);return this.data.points.map(T=>{let p=this.classes.get(T.className);return p&&(T={...p,...T}),{x:S(T.x),y:a(T.y),fill:T.color??this.themeConfig.quadrantPointFill,radius:T.radius??this.config.pointRadius,text:{text:T.text,fill:this.themeConfig.quadrantPointTextFill,x:S(T.x),y:a(T.y)+this.config.pointTextPadding,verticalPos:"center",horizontalPos:"top",fontSize:this.config.pointLabelFontSize,rotation:0},strokeColor:T.strokeColor??this.themeConfig.quadrantPointFill,strokeWidth:T.strokeWidth??"0px"}})}getBorders(n){let d=this.config.quadrantExternalBorderStrokeWidth/2,{quadrantSpace:u}=n,{quadrantHalfHeight:h,quadrantHeight:f,quadrantLeft:g,quadrantHalfWidth:S,quadrantTop:a,quadrantWidth:T}=u;return[{strokeFill:this.themeConfig.quadrantExternalBorderStrokeFill,strokeWidth:this.config.quadrantExternalBorderStrokeWidth,x1:g-d,y1:a,x2:g+T+d,y2:a},{strokeFill:this.themeConfig.quadrantExternalBorderStrokeFill,strokeWidth:this.config.quadrantExternalBorderStrokeWidth,x1:g+T,y1:a+d,x2:g+T,y2:a+f-d},{strokeFill:this.themeConfig.quadrantExternalBorderStrokeFill,strokeWidth:this.config.quadrantExternalBorderStrokeWidth,x1:g-d,y1:a+f,x2:g+T+d,y2:a+f},{strokeFill:this.themeConfig.quadrantExternalBorderStrokeFill,strokeWidth:this.config.quadrantExternalBorderStrokeWidth,x1:g,y1:a+d,x2:g,y2:a+f-d},{strokeFill:this.themeConfig.quadrantInternalBorderStrokeFill,strokeWidth:this.config.quadrantInternalBorderStrokeWidth,x1:g+S,y1:a+d,x2:g+S,y2:a+f-d},{strokeFill:this.themeConfig.quadrantInternalBorderStrokeFill,strokeWidth:this.config.quadrantInternalBorderStrokeWidth,x1:g+d,y1:a+h,x2:g+T-d,y2:a+h}]}getTitle(n){if(n)return{text:this.data.titleText,fill:this.themeConfig.quadrantTitleFill,fontSize:this.config.titleFontSize,horizontalPos:"top",verticalPos:"center",rotation:0,y:this.config.titlePadding,x:this.config.chartWidth/2}}build(){let n=this.config.showXAxis&&!!(this.data.xAxisLeftText||this.data.xAxisRightText),d=this.config.showYAxis&&!!(this.data.yAxisTopText||this.data.yAxisBottomText),u=this.config.showTitle&&!!this.data.titleText,h=this.data.points.length>0?"bottom":this.config.xAxisPosition,f=this.calculateSpace(h,n,d,u);return{points:this.getQuadrantPoints(f),quadrants:this.getQuadrants(f),axisLabels:this.getAxisLabels(h,n,d,f),borderLines:this.getBorders(f),title:this.getTitle(u)}}},l(ht,"QuadrantBuilder"),ht),ct,At=(ct=class extends Error{constructor(n,d,u){super(`value for ${n} ${d} is invalid, please use a valid ${u}`),this.name="InvalidStyleError"}},l(ct,"InvalidStyleError"),ct);function It(t){return!/^#?([\dA-Fa-f]{6}|[\dA-Fa-f]{3})$/.test(t)}l(It,"validateHexCode");function ae(t){return!/^\d+$/.test(t)}l(ae,"validateNumber");function ne(t){return!/^\d+px$/.test(t)}l(ne,"validateSizeInPixels");var ze=wt();function X(t){return Pe(t.trim(),ze)}l(X,"textSanitizer");var D=new we;function se(t){D.setData({quadrant1Text:X(t.text)})}l(se,"setQuadrant1Text");function re(t){D.setData({quadrant2Text:X(t.text)})}l(re,"setQuadrant2Text");function le(t){D.setData({quadrant3Text:X(t.text)})}l(le,"setQuadrant3Text");function oe(t){D.setData({quadrant4Text:X(t.text)})}l(oe,"setQuadrant4Text");function he(t){D.setData({xAxisLeftText:X(t.text)})}l(he,"setXAxisLeftText");function ce(t){D.setData({xAxisRightText:X(t.text)})}l(ce,"setXAxisRightText");function ue(t){D.setData({yAxisTopText:X(t.text)})}l(ue,"setYAxisTopText");function de(t){D.setData({yAxisBottomText:X(t.text)})}l(de,"setYAxisBottomText");function St(t){let n={};for(let d of t){let[u,h]=d.trim().split(/\s*:\s*/);if(u==="radius"){if(ae(h))throw new At(u,h,"number");n.radius=parseInt(h)}else if(u==="color"){if(It(h))throw new At(u,h,"hex code");n.color=h}else if(u==="stroke-color"){if(It(h))throw new At(u,h,"hex code");n.strokeColor=h}else if(u==="stroke-width"){if(ne(h))throw new At(u,h,"number of pixels (eg. 10px)");n.strokeWidth=h}else throw new Error(`style named ${u} is not supported.`)}return n}l(St,"parseStyles");function xe(t,n,d,u,h){let f=St(h);D.addPoints([{x:d,y:u,text:X(t.text),className:n,...f}])}l(xe,"addPoint");function fe(t,n){D.addClass(t,St(n))}l(fe,"addClass");function ge(t){D.setConfig({chartWidth:t})}l(ge,"setWidth");function pe(t){D.setConfig({chartHeight:t})}l(pe,"setHeight");function ye(){let t=wt(),{themeVariables:n,quadrantChart:d}=t;return d&&D.setConfig(d),D.setThemeConfig({quadrant1Fill:n.quadrant1Fill,quadrant2Fill:n.quadrant2Fill,quadrant3Fill:n.quadrant3Fill,quadrant4Fill:n.quadrant4Fill,quadrant1TextFill:n.quadrant1TextFill,quadrant2TextFill:n.quadrant2TextFill,quadrant3TextFill:n.quadrant3TextFill,quadrant4TextFill:n.quadrant4TextFill,quadrantPointFill:n.quadrantPointFill,quadrantPointTextFill:n.quadrantPointTextFill,quadrantXAxisTextFill:n.quadrantXAxisTextFill,quadrantYAxisTextFill:n.quadrantYAxisTextFill,quadrantExternalBorderStrokeFill:n.quadrantExternalBorderStrokeFill,quadrantInternalBorderStrokeFill:n.quadrantInternalBorderStrokeFill,quadrantTitleFill:n.quadrantTitleFill}),D.setData({titleText:ie()}),D.build()}l(ye,"getQuadrantData");var Ne=l(function(){D.clear(),ke()},"clear"),We={setWidth:ge,setHeight:pe,setQuadrant1Text:se,setQuadrant2Text:re,setQuadrant3Text:le,setQuadrant4Text:oe,setXAxisLeftText:he,setXAxisRightText:ce,setYAxisTopText:ue,setYAxisBottomText:de,parseStyles:St,addPoint:xe,addClass:fe,getQuadrantData:ye,clear:Ne,setAccTitle:Ce,getAccTitle:ve,setDiagramTitle:Le,getDiagramTitle:ie,getAccDescription:Ee,setAccDescription:De},Be=l((t,n,d,u)=>{var xt,ft,gt;function h(i){return i==="top"?"hanging":"middle"}l(h,"getDominantBaseLine");function f(i){return i==="left"?"start":"middle"}l(f,"getTextAnchor");function g(i){return`translate(${i.x}, ${i.y}) rotate(${i.rotation||0})`}l(g,"getTransformation");let S=wt();bt.debug(`Rendering quadrant chart
`+t);let a=S.securityLevel,T;a==="sandbox"&&(T=Et("#i"+n));let p=(a==="sandbox"?Et(T.nodes()[0].contentDocument.body):Et("body")).select(`[id="${n}"]`),y=p.append("g").attr("class","main"),A=((xt=S.quadrantChart)==null?void 0:xt.chartWidth)??500,m=((ft=S.quadrantChart)==null?void 0:ft.chartHeight)??500;Fe(p,m,A,((gt=S.quadrantChart)==null?void 0:gt.useMaxWidth)??!0),p.attr("viewBox","0 0 "+A+" "+m),u.db.setHeight(m),u.db.setWidth(A);let x=u.db.getQuadrantData(),q=y.append("g").attr("class","quadrants"),U=y.append("g").attr("class","border"),j=y.append("g").attr("class","data-points"),K=y.append("g").attr("class","labels"),pt=y.append("g").attr("class","title");x.title&&pt.append("text").attr("x",0).attr("y",0).attr("fill",x.title.fill).attr("font-size",x.title.fontSize).attr("dominant-baseline",h(x.title.horizontalPos)).attr("text-anchor",f(x.title.verticalPos)).attr("transform",g(x.title)).text(x.title.text),x.borderLines&&U.selectAll("line").data(x.borderLines).enter().append("line").attr("x1",i=>i.x1).attr("y1",i=>i.y1).attr("x2",i=>i.x2).attr("y2",i=>i.y2).style("stroke",i=>i.strokeFill).style("stroke-width",i=>i.strokeWidth);let ut=q.selectAll("g.quadrant").data(x.quadrants).enter().append("g").attr("class","quadrant");ut.append("rect").attr("x",i=>i.x).attr("y",i=>i.y).attr("width",i=>i.width).attr("height",i=>i.height).attr("fill",i=>i.fill),ut.append("text").attr("x",0).attr("y",0).attr("fill",i=>i.text.fill).attr("font-size",i=>i.text.fontSize).attr("dominant-baseline",i=>h(i.text.horizontalPos)).attr("text-anchor",i=>f(i.text.verticalPos)).attr("transform",i=>g(i.text)).text(i=>i.text.text),K.selectAll("g.label").data(x.axisLabels).enter().append("g").attr("class","label").append("text").attr("x",0).attr("y",0).text(i=>i.text).attr("fill",i=>i.fill).attr("font-size",i=>i.fontSize).attr("dominant-baseline",i=>h(i.horizontalPos)).attr("text-anchor",i=>f(i.verticalPos)).attr("transform",i=>g(i));let dt=j.selectAll("g.data-point").data(x.points).enter().append("g").attr("class","data-point");dt.append("circle").attr("cx",i=>i.x).attr("cy",i=>i.y).attr("r",i=>i.radius).attr("fill",i=>i.fill).attr("stroke",i=>i.strokeColor).attr("stroke-width",i=>i.strokeWidth),dt.append("text").attr("x",0).attr("y",0).text(i=>i.text.text).attr("fill",i=>i.text.fill).attr("font-size",i=>i.text.fontSize).attr("dominant-baseline",i=>h(i.text.horizontalPos)).attr("text-anchor",i=>f(i.text.verticalPos)).attr("transform",i=>g(i.text))},"draw"),Re={draw:Be},Xe={parser:Ie,db:We,renderer:Re,styles:l(()=>"","styles")};export{Xe as diagram};
