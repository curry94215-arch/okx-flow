<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="theme-color" content="#040507"><title>OKX FLOW PRO</title><style>:root{--g:#00e676;--g2:rgba(0,230,118,.12);--g3:rgba(0,230,118,.22);--r:#ff3d5a;--r2:rgba(255,61,90,.12);--r3:rgba(255,61,90,.22);--a:#ffab00;--a2:rgba(255,171,0,.12);--pu:#b388ff;--pu2:rgba(179,136,255,.12);--bg0:#040507;--bg1:#080a0f;--bg2:#0e1219;--bg4:#1a2030;--b0:rgba(255,255,255,.05);--b1:rgba(255,255,255,.10);--t0:#dde1ee;--t1:#8b95aa;--t2:#4a5470}*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}body{background:var(--bg0);color:var(--t0);font-family:monospace;min-height:100dvh}::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:var(--bg4)}.hdr{position:sticky;top:0;z-index:200;background:rgba(4,5,7,.97);backdrop-filter:blur(16px);border-bottom:.5px solid var(--b0);padding:8px 12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px}.logo{font-size:12px;font-weight:700;letter-spacing:.12em}.logo em{color:var(--g);font-style:normal}.hdr-r{display:flex;align-items:center;gap:5px}.pill{font-size:9px;padding:2px 7px;border-radius:2px;font-weight:500}.plive{background:var(--g2);color:var(--g);border:.5px solid var(--g3)}.pload{background:var(--a2);color:var(--a);border:.5px solid rgba(255,171,0,.3)}.perr{background:var(--r2);color:var(--r)}.dot{display:inline-block;width:4px;height:4px;border-radius:50%;background:currentColor;margin-right:3px;animation:blink 1.5s infinite}@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}.rbtn{font-size:9px;padding:3px 8px;border:.5px solid var(--b1);border-radius:2px;background:transparent;color:var(--t1);cursor:pointer}#clk{font-size:9px;color:var(--t2)}.mkt{display:flex;gap:8px;padding:6px 12px;background:var(--bg2);border-bottom:.5px solid var(--b0);overflow-x:auto;font-size:9px;-webkit-overflow-scrolling:touch}.mkt-item{display:flex;align-items:center;gap:4px;white-space:nowrap;flex-shrink:0}.mkt-label{color:var(--t2)}.wrap{padding:8px 10px 60px;max-width:600px;margin:0 auto}.sumgrid{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:10px}.sm{background:var(--bg2);border:.5px solid var(--b0);border-left:2px solid transparent;border-radius:3px;padding:7px 9px}.sm.g{border-left-color:var(--g)}.sm.r{border-left-color:var(--r)}.sm.a{border-left-color:var(--a)}.sm.p{border-left-color:var(--pu)}.sm-l{font-size:7px;color:var(--t2);text-transform:uppercase;margin-bottom:2px;letter-spacing:.05em}.sm-v{font-size:17px;font-weight:700;line-height:1;margin-bottom:2px}.sm-s{font-size:8px;color:var(--t2)}.cg{color:var(--g)}.cr{color:var(--r)}.ca{color:var(--a)}.cp{color:var(--pu)}.sec{font-size:8px;color:var(--t2);letter-spacing:.1em;text-transform:uppercase;display:flex;align-items:center;gap:6px;margin:10px 0 6px}.sec::after{content:'';flex:1;height:.5px;background:var(--b0)}.tabs{display:flex;gap:3px;margin-bottom:6px;overflow-x:auto;-webkit-overflow-scrolling:touch}.tab{font-size:9px;padding:3px 9px;border:.5px solid var(--b0);border-radius:2px;background:transparent;color:var(--t2);cursor:pointer;white-space:nowrap}.tab.on{background:var(--g);color:#001a0e;font-weight:700}.tab.ron.on{background:var(--r);color:#fff}.srch{width:100%;margin-bottom:6px;font-size:11px;padding:5px 9px;background:var(--bg2);border:.5px solid var(--b0);border-radius:2px;color:var(--t0);outline:none}.srch::placeholder{color:var(--t2)}.list{display:flex;flex-direction:column;gap:5px}
.cc{background:var(--bg2);border:.5px solid var(--b0);border-radius:5px;padding:9px 11px;border-left:3px solid transparent}.cc.long{border-left-color:var(--g)}.cc.short{border-left-color:var(--r)}.cc.hot{background:rgba(0,230,118,.03)}
.alert-bar{padding:5px 8px;border-radius:3px;margin-bottom:6px;font-size:9px;font-weight:500}
.alert-danger{background:rgba(255,61,90,.15);color:#ff3d5a;border:.5px solid rgba(255,61,90,.3)}
.alert-warning{background:rgba(255,171,0,.15);color:#ffab00;border:.5px solid rgba(255,171,0,.3)}
.alert-success{background:rgba(0,230,118,.15);color:#00e676;border:.5px solid rgba(0,230,118,.3)}
.r1{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px}
.r1-left{display:flex;align-items:center;gap:5px}.csym{font-size:15px;font-weight:700}.cprice{font-size:14px;font-weight:600}
.htag{font-size:7px;padding:1px 3px;background:var(--g2);color:var(--g);border-radius:1px}
.otag{font-size:7px;padding:1px 3px;background:var(--a2);color:var(--a);border-radius:1px}
.scores-row{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px}
.score-box{background:rgba(0,0,0,.2);border-radius:3px;padding:5px 7px}
.score-box-label{font-size:7px;color:var(--t2);margin-bottom:2px}
.score-box-val{display:flex;align-items:center;gap:5px}
.score-num{font-size:16px;font-weight:700}
.score-bar{flex:1;height:4px;background:var(--bg4);border-radius:2px;overflow:hidden}
.score-fill{height:100%;border-radius:2px}
.resonance-box{padding:4px 8px;border-radius:3px;font-size:9px;font-weight:700;margin-bottom:6px;text-align:center}
.res-sl{background:rgba(0,230,118,.2);color:var(--g);border:.5px solid var(--g3)}
.res-ss{background:rgba(255,61,90,.2);color:var(--r);border:.5px solid var(--r3)}
.res-w{background:rgba(255,171,0,.1);color:var(--a);border:.5px solid rgba(255,171,0,.3)}
.r2{display:grid;grid-template-columns:repeat(4,1fr);gap:3px;margin-bottom:6px}
.dl{font-size:7px;color:var(--t2);margin-bottom:1px}.dv{font-size:10px;font-weight:600}
.frbar{width:100%;height:2px;background:var(--bg4);border-radius:1px;overflow:hidden;margin-top:2px}
.ff{height:100%}.ratbar{width:100%;height:3px;background:var(--bg4);border-radius:2px;overflow:hidden;display:flex;margin-top:2px}
.rbl{height:100%;background:var(--g)}.rbs{height:100%;background:var(--r)}
.vegas-box{border:.5px solid var(--b0);border-radius:3px;padding:6px 8px;margin-bottom:6px}
.vegas-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px}
.vbadge{font-size:8px;font-weight:700;padding:2px 6px;border-radius:2px}
.vb-sb{background:rgba(0,230,118,.25);color:var(--g)}.vb-b{background:rgba(0,230,118,.15);color:var(--g)}.vb-mb{background:rgba(0,230,118,.08);color:#69f0ae}.vb-n{background:rgba(255,255,255,.05);color:var(--t2)}.vb-ms{background:rgba(255,61,90,.08);color:#ff8a9a}.vb-s{background:rgba(255,61,90,.15);color:var(--r)}.vb-ss{background:rgba(255,61,90,.25);color:var(--r)}
.entry-box{background:rgba(0,230,118,.06);border:.5px solid rgba(0,230,118,.2);border-radius:3px;padding:6px 8px;margin-bottom:6px}
.entry-title{font-size:8px;color:var(--g);font-weight:700;margin-bottom:4px}
.entry-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px}
.el{font-size:7px;color:var(--t2)}.ev{font-size:10px;font-weight:600;margin-top:1px}
.r3{background:rgba(0,0,0,.2);border-radius:3px;padding:5px 7px;display:flex;flex-direction:column;gap:3px;margin-bottom:5px}
.rrow{display:flex;align-items:flex-start;gap:4px}.rlbl{font-size:7px;color:var(--t2);width:40px;flex-shrink:0;padding-top:1px}
.rtag{font-size:7px;font-weight:700;padding:1px 4px;border-radius:1px;flex-shrink:0}
.rt-g{background:rgba(0,230,118,.2);color:#00a84a}.rt-r{background:rgba(255,61,90,.2);color:#cc2040}.rt-a{background:rgba(255,171,0,.18);color:#b87800}.rt-d{background:rgba(255,255,255,.06);color:var(--t2)}
.rdesc{font-size:7px;color:var(--t1);flex:1;line-height:1.4}
.r4{display:flex;align-items:center;justify-content:space-between;padding-top:5px;border-top:.5px solid var(--b0)}
.sig{font-size:9px;font-weight:700;padding:3px 8px;border-radius:2px}.sl{background:rgba(0,230,118,.14);color:var(--g)}.ss{background:rgba(255,61,90,.14);color:var(--r)}.sn{background:rgba(255,255,255,.05);color:var(--t2)}
.sigtime{font-size:8px;color:var(--t2)}.scnum{font-size:18px;font-weight:700}
.larea{text-align:center;padding:40px 16px}.lbar{width:180px;height:2px;background:var(--bg4);border-radius:1px;overflow:hidden;margin:10px auto}.lfill{height:100%;background:var(--g);animation:prog 1.6s ease-in-out infinite}@keyframes prog{0%{width:0%;margin-left:0}50%{width:55%;margin-left:22%}100%{width:0%;margin-left:100%}}.lmsg{font-size:10px;color:var(--t2);margin-top:6px}
.sbar{position:fixed;bottom:0;left:0;right:0;background:rgba(4,5,7,.95);border-top:.5px solid var(--b0);padding:5px 12px;display:flex;justify-content:space-between;font-size:8px;color:var(--t2)}
.notif-btn{font-size:9px;padding:3px 8px;border:.5px solid var(--b1);border-radius:2px;background:transparent;color:var(--a);cursor:pointer}
</style></head><body>
<header class="hdr">
  <div class="logo">OKX <em>FLOW</em> <span style="font-size:8px;color:var(--t2);font-weight:400">PRO</span></div>
  <div class="hdr-r">
    <span id="stpill" class="pill pload"><span class="dot"></span>連接中</span>
    <span id="clk">--:--</span>
    <button class="notif-btn" id="notifBtn" onclick="reqNotif()">🔔</button>
    <button class="rbtn" onclick="load(true)">↻</button>
  </div>
</header>

<div class="mkt" id="mkt">
  <div class="mkt-item"><span class="mkt-label">恐貪指數</span><span id="fg">--</span></div>
  <div class="mkt-item"><span class="mkt-label">BTC期現差</span><span id="basis">--</span></div>
  <div class="mkt-item"><span class="mkt-label">更新</span><span id="lupd">--</span></div>
</div>

<div class="wrap">
  <div class="sumgrid" id="sum"><div class="sm g"><div class="sm-l">載入中</div><div class="sm-v" style="color:var(--t2)">---</div></div><div class="sm r"><div class="sm-l">請稍候</div><div class="sm-v" style="color:var(--t2)">---</div></div></div>
  <div class="sec">全部 USDT 永續合約</div>
  <div class="tabs">
    <button class="tab on" onclick="setTab('all',this)">全部</button>
    <button class="tab" onclick="setTab('long',this)">做多</button>
    <button class="tab ron" onclick="setTab('short',this)">做空</button>
    <button class="tab" onclick="setTab('resonance',this)">⚡共振</button>
    <button class="tab" onclick="setTab('callback',this)">🎯回調</button>
    <button class="tab" onclick="setTab('hot',this)">🔥強烈</button>
    <button class="tab" onclick="setTab('alert',this)">⚠️警報</button>
    <button class="tab" onclick="setTab('oia',this)">OI異常</button>
    <button class="tab" onclick="setTab('fr+',this)">高FR</button>
  </div>
  <input class="srch" id="srch" placeholder="搜尋幣種..." oninput="apply()">
  <div class="list" id="list"><div class="larea"><div style="font-size:12px;color:var(--t1)">⬡ OKX FLOW PRO</div><div class="lbar"><div class="lfill"></div></div><div class="lmsg">正在拉取即時數據...</div></div></div>
</div>
<div class="sbar"><span>OKX+幣安 數據 · 機構級分析</span><span id="lcnt">--</span></div>

<script>
let ALL=[],MKT={},curTab='all',autoT=null,notifOk=false;

setInterval(()=>{const n=new Date();document.getElementById('clk').textContent=n.toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',hour12:false})},1000);

async function reqNotif(){
  if(!('Notification' in window)){alert('此瀏覽器不支援通知');return;}
  const p=await Notification.requestPermission();
  if(p==='granted'){notifOk=true;document.getElementById('notifBtn').textContent='🔔✓';document.getElementById('notifBtn').style.color='var(--g)';}
  else alert('請允許通知權限');
}

function sendNotif(title,body){
  if(notifOk&&document.hidden)new Notification(title,{body,icon:'/favicon.ico'});
}

const fp=p=>{if(!p||isNaN(p))return'--';const n=+p;if(n>10000)return'$'+n.toLocaleString('en',{maximumFractionDigits:0});if(n>1000)return'$'+n.toLocaleString('en',{maximumFractionDigits:1});if(n>100)return'$'+n.toFixed(2);if(n>10)return'$'+n.toFixed(3);if(n>1)return'$'+n.toFixed(4);if(n>0.01)return'$'+n.toFixed(5);return'$'+n.toFixed(7)};
const fc=c=>(+c>=0?'+':'')+parseFloat(c).toFixed(2)+'%';
const ffr=v=>{const p=(+v*100).toFixed(4);return(+p>=0?'+':'')+p+'%'};
const fvol=v=>v>=1e9?'$'+(v/1e9).toFixed(1)+'B':v>=1e6?'$'+(v/1e6).toFixed(0)+'M':'$'+(v/1e3).toFixed(0)+'K';
const SC=s=>+s>=80?'#00e676':+s>=65?'#69f0ae':+s>=50?'#ffab00':+s>=35?'#ff7043':'#ff3d5a';
const vbc=vs=>vs==='strong-bull'?'vb-sb':vs==='bull'?'vb-b':vs==='mild-bull'?'vb-mb':vs==='mild-bear'?'vb-ms':vs==='bear'?'vb-s':vs==='strong-bear'?'vb-ss':'vb-n';

function reasons(c){
  const R=[];
  const chg=+c.chg24h,fr=+c.frVal,wl=+c.whaleLong,rl=+c.retailLong,oi=+c.oiChangePct1h;
  if(chg>6)R.push({l:'市場動能',t:'強勢看漲',cl:'rt-g',d:'24H漲幅 '+fc(chg)+' 1H '+fc(+c.chg1h)});
  else if(chg>2)R.push({l:'市場動能',t:'看漲',cl:'rt-g',d:'漲幅 '+fc(chg)});
  else if(chg<-6)R.push({l:'市場動能',t:'強勢看跌',cl:'rt-r',d:'24H跌幅 '+fc(chg)});
  else if(chg<-2)R.push({l:'市場動能',t:'看跌',cl:'rt-r',d:'跌幅 '+fc(chg)});
  else R.push({l:'市場動能',t:'方向不明',cl:'rt-a',d:'震盪 '+fc(chg)});
  if(fr>0.005)R.push({l:'資金費率',t:'偏多',cl:'rt-g',d:ffr(fr)+' 多方付費'+(c.frAnomaly?' ⚠異常':'')});
  else if(fr<-0.005)R.push({l:'資金費率',t:'偏空',cl:'rt-r',d:ffr(fr)+' 空方付費'});
  else R.push({l:'資金費率',t:'中性',cl:'rt-a',d:ffr(fr)+' 費率中性'});
  if(c.hasLSData){
    if(wl>62)R.push({l:'大戶動向',t:'大戶偏多',cl:'rt-g',d:'大戶多頭 '+wl+'% 空頭 '+(100-wl)+'%'});
    else if(wl<40)R.push({l:'大戶動向',t:'大戶偏空',cl:'rt-r',d:'大戶空頭 '+(100-wl)+'% 多頭 '+wl+'%'});
    else R.push({l:'大戶動向',t:'均衡',cl:'rt-d',d:'大戶多空均衡 '+wl+'% vs '+(100-wl)+'%'});
    if(rl<38)R.push({l:'散戶倉鼠',t:'散戶偏空',cl:'rt-g',d:'散戶空 '+(100-rl)+'% 反向做多機會'});
    else if(rl>62)R.push({l:'散戶倉鼠',t:'散戶偏多',cl:'rt-r',d:'散戶多 '+rl+'% 謹慎'});
    else R.push({l:'散戶倉鼠',t:'均衡',cl:'rt-d',d:'散戶多空均衡'});
  }
  if(oi>5)R.push({l:'OI持倉',t:'快速增倉',cl:'rt-g',d:'1H OI +'+oi.toFixed(1)+'% 24H '+fc(+c.oiChangePct24h)+(c.oiAnomalyCount>=3?' ⚡異常':'')});
  else if(oi<-5)R.push({l:'OI持倉',t:'快速減倉',cl:'rt-r',d:'1H OI '+oi.toFixed(1)+'% 24H '+fc(+c.oiChangePct24h)});
  else R.push({l:'OI持倉',t:c.oiTrend||'持平',cl:oi>0?'rt-g':oi<0?'rt-r':'rt-d',d:'1H '+（oi>=0?'+':'')+oi.toFixed(1)+'%'});
  if(c.relBTC>5)R.push({l:'相對強弱',t:'強於BTC',cl:'rt-g',d:'相較BTC強 +'+c.relBTC.toFixed(1)+'%'});
  else if(c.relBTC<-5)R.push({l:'相對強弱',t:'弱於BTC',cl:'rt-r',d:'相較BTC弱 '+c.relBTC.toFixed(1)+'%'});
  else R.push({l:'相對強弱',t:'近似BTC',cl:'rt-d',d:'與BTC走勢相近 '+（c.relBTC>=0?'+':'')+c.relBTC.toFixed(1)+'%'});
  if(c.liqShort>500000)R.push({l:'清算',t:'空單被清',cl:'rt-g',d:'空單清算 $'+(c.liqShort/1e6).toFixed(2)+'M 上漲加速'});
  else if(c.liqLong>500000)R.push({l:'清算',t:'多單被清',cl:'rt-r',d:'多單清算 $'+(c.liqLong/1e6).toFixed(2)+'M 下跌加速'});
  return R;
}

function renderSum(){
  const L=ALL.filter(c=>c.signal==='long').length;
  const S=ALL.filter(c=>c.signal==='short').length;
  const avgFR=ALL.reduce((s,c)=>s+(+c.frVal||0),0)/ALL.length;
  const resonance=ALL.filter(c=>c.resonance==='strong-long'||c.resonance==='strong-short').length;
  const callbacks=ALL.filter(c=>c.isCallbackEntry).length;
  const alerts=ALL.filter(c=>c.alerts&&c.alerts.length>0).length;
  const top=ALL[0];
  document.getElementById('sum').innerHTML=
    '<div class="sm g"><div class="sm-l">做多信號</div><div class="sm-v cg">'+L+'</div><div class="sm-s">共'+ALL.length+'合約</div></div>'+
    '<div class="sm r"><div class="sm-l">做空信號</div><div class="sm-v cr">'+S+'</div><div class="sm-s">觀望'+(ALL.length-L-S)+'個</div></div>'+
    '<div class="sm p"><div class="sm-l">⚡共振信號</div><div class="sm-v cp">'+resonance+'</div><div class="sm-s">資金流+Vegas一致</div></div>'+
    '<div class="sm g"><div class="sm-l">🎯回調進場</div><div class="sm-v cg">'+callbacks+'</div><div class="sm-s">4H多+1H回調+15M確認</div></div>'+
    '<div class="sm a"><div class="sm-l">⚠️警報</div><div class="sm-v ca">'+alerts+'</div><div class="sm-s">需要注意的幣種</div></div>'+
    '<div class="sm g"><div class="sm-l">今日最強</div><div class="sm-v cg" style="font-size:14px">'+(top?top.sym:'--')+'</div><div class="sm-s cg">'+(top?fc(top.chg24h):'--')+'</div></div>';
  document.getElementById('fg').textContent=(MKT.fearGreed||'--')+' '+（MKT.fearGreedText||'');
  document.getElementById('fg').style.color=MKT.fearGreed>70?'var(--r)':MKT.fearGreed<30?'var(--g)':'var(--a)';
  document.getElementById('basis').textContent=(MKT.btcBasis>=0?'+':'')+（MKT.btcBasis||0).toFixed(3)+'%';
  document.getElementById('lupd').textContent=MKT.updateTime||'--';
}

function renderList(coins){
  const el=document.getElementById('list');
  if(!coins.length){el.innerHTML='<div style="text-align:center;padding:24px;font-size:10px;color:var(--t2)">沒有符合條件的合約</div>';return;}

  // 推播通知強信號
  coins.filter(c=>c.isCallbackEntry).forEach(c=>{
    sendNotif('🎯 '+c.sym+' 回調進場機會！','4H多頭 + 1H回調到位 + 15M確認\n進場 '+fp(c.entry)+' 止損 '+fp(c.stopLoss));
  });

  el.innerHTML=coins.map(c=>{
    const chg=+c.chg24h||0,fr=+c.frVal||0,wl=+c.whaleLong||50,rl=+c.retailLong||50;
    const oi1h=+c.oiChangePct1h||0;
    const frBW=Math.min(100,Math.abs(fr/0.001)*100);
    const frBC=fr>0?'var(--g)':'var(--r)';
    const rs=reasons(c);
    const sig=c.signal==='long'?'<span class="sig sl">▲ 做多</span>':c.signal==='short'?'<span class="sig ss">▼ 做空</span>':'<span class="sig sn">— 觀望</span>';
    const countdown=c.countdown>0?c.countdown+'分後結算':'--';
    const resHtml=c.resonance==='strong-long'?'<div class="resonance-box res-sl">⚡ 強烈共振做多 — 資金流+Vegas一致</div>':c.resonance==='strong-short'?'<div class="resonance-box res-ss">⚡ 強烈共振做空 — 資金流+Vegas一致</div>':c.resonance==='long'?'<div class="resonance-box res-w">↑ 偏多共振</div>':c.resonance==='short'?'<div class="resonance-box res-w">↓ 偏空共振</div>':'';
    const alertsHtml=(c.alerts||[]).map(a=>'<div class="alert-bar alert-'+a.level+'">'+a.msg+'</div>').join('');
    const entryHtml=c.isCallbackEntry&&c.entry?`<div class="entry-box">
      <div class="entry-title">🎯 回調進場機會</div>
      <div class="entry-grid">
        <div><div class="el">進場區</div><div class="ev cg">${fp(c.entry)}</div></div>
        <div><div class="el">止損 ${c.slType||''}</div><div class="ev cr">${fp(c.stopLoss)}</div></div>
        <div><div class="el">目標1 (1:1)</div><div class="ev" style="color:#69f0ae">${fp(c.tp1)}</div></div>
        <div><div class="el">目標2 (1:2)</div><div class="ev cg">${fp(c.tp2)}</div></div>
      </div>
    </div>`:'';

    return`<div class="cc ${c.signal} ${c.isHot?'hot':''}">
      ${alertsHtml}
      <div class="r1">
        <div class="r1-left">
          <span class="csym">${c.sym}</span>
          ${c.isHot?'<span class="htag">HOT</span>':''}
          ${(+c.oiAnomalyCount||0)>=3?'<span class="otag">OI⚡</span>':''}
          ${c.isCallbackEntry?'<span class="htag" style="background:rgba(179,136,255,.15);color:var(--pu)">🎯</span>':''}
        </div>
        <span class="cprice">${fp(c.price)}</span>
      </div>
      <div class="scores-row">
        <div class="score-box">
          <div class="score-box-label">資金流評分</div>
          <div class="score-box-val">
            <span class="score-num" style="color:${SC(c.flowScore)}">${c.flowScore}</span>
            <div class="score-bar"><div class="score-fill" style="width:${c.flowScore}%;background:${SC(c.flowScore)}"></div></div>
          </div>
        </div>
        <div class="score-box">
          <div class="score-box-label">Vegas評分</div>
          <div class="score-box-val">
            <span class="score-num" style="color:${SC(c.vegasScore)}">${c.vegasScore}</span>
            <div class="score-bar"><div class="score-fill" style="width:${c.vegasScore}%;background:${SC(c.vegasScore)}"></div></div>
          </div>
        </div>
      </div>
      ${resHtml}
      <div class="r2">
        <div><div class="dl">24H漲跌</div><div class="dv ${chg>=0?'cg':'cr'}">${fc(chg)}</div><div class="dl" style="margin-top:2px">1H ${fc(+c.chg1h||0)}</div></div>
        <div>
          <div class="dl">資金費率</div>
          <div class="dv ${fr>0?'cg':fr<0?'cr':'ca'}">${ffr(fr)}</div>
          <div class="frbar"><div class="ff" style="width:${frBW}%;background:${frBC}"></div></div>
          <div class="dl" style="margin-top:2px">${countdown}</div>
        </div>
        <div>
          <div class="dl">OI 1H變化</div>
          <div class="dv ${oi1h>=0?'cg':'cr'}">${oi1h>=0?'+':''}${oi1h.toFixed(1)}%</div>
          <div class="dl" style="margin-top:2px">${c.oiTrend||'持平'}</div>
        </div>
        <div>
          <div class="dl">相對BTC</div>
          <div class="dv ${(+c.relBTC||0)>=0?'cg':'cr'}">${(+c.relBTC||0)>=0?'+':''}${(+c.relBTC||0).toFixed(1)}%</div>
          <div class="dl" style="margin-top:2px">期現差 ${(+c.basis||0)>=0?'+':''}${(+c.basis||0).toFixed(3)}%</div>
        </div>
      </div>
      <div class="vegas-box">
        <div class="vegas-row">
          <span style="font-size:7px;color:var(--t2)">4H趨勢</span>
          <span class="vbadge ${c.trend4hStr==='bull'?'vb-b':c.trend4hStr==='bear'?'vb-s':'vb-n'}">${c.trend4h||'中性'}</span>
        </div>
        <div class="vegas-row">
          <span style="font-size:7px;color:var(--t2)">1H Vegas</span>
          <span class="vbadge ${vbc(c.signal1hStr||'neutral')}">${c.signal1h||'通道中線'}</span>
        </div>
        <div class="vegas-row" style="margin-bottom:0">
          <span style="font-size:7px;color:var(--t2)">15M確認</span>
          <span class="vbadge ${vbc(c.confirm15mStr||'neutral')}">${c.confirm15m||'等待'}</span>
        </div>
      </div>
      ${entryHtml}
      <div class="r3">${rs.map(r=>`<div class="rrow"><span class="rlbl">${r.l}</span><span class="rtag ${r.cl}">${r.t}</span><span class="rdesc">${r.d}</span></div>`).join('')}</div>
      <div class="r4">
        <div style="display:flex;align-items:center;gap:5px">${sig}<span class="sigtime">${c.signalTime||'--'}</span></div>
        <div style="display:flex;align-items:center;gap:3px"><span style="font-size:7px;color:var(--t2)">綜合</span><span class="scnum" style="color:${SC(c.score)}">${c.score}</span></div>
      </div>
    </div>`;
  }).join('');
}

function setTab(t,btn){document.querySelectorAll('.tab').forEach(b=>b.classList.remove('on'));btn.classList.add('on');curTab=t;apply();}
function apply(){
  const q=document.getElementById('srch').value.toUpperCase().trim();
  let list=ALL.filter(c=>{
    if(q&&!c.sym.toUpperCase().includes(q))return false;
    if(curTab==='long')return c.signal==='long';
    if(curTab==='short')return c.signal==='short';
    if(curTab==='resonance')return c.resonance==='strong-long'||c.resonance==='strong-short';
    if(curTab==='callback')return c.isCallbackEntry;
    if(curTab==='hot')return c.isHot;
    if(curTab==='alert')return c.alerts&&c.alerts.length>0;
    if(curTab==='oia')return(+c.oiAnomalyCount||0)>=3;
    if(curTab==='fr+')return(+c.frVal||0)>0.0005;
    return true;
  });
  document.getElementById('lcnt').textContent=list.length+'個合約';
  renderList(list);
}

async function load(manual=false){
  const btn=document.querySelector('.rbtn');
  if(manual&&btn){btn.textContent='⏳';btn.disabled=true;}
  document.getElementById('stpill').className='pill pload';
  document.getElementById('stpill').innerHTML='<span class="dot"></span>更新中';
  try{
    const r=await fetch('/api/coins',{signal:AbortSignal.timeout(90000)});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const j=await r.json();
    if(!j.ok||!j.data?.length)throw new Error(j.error||'no data');
    ALL=j.data;MKT=j.market||{};
    renderSum();apply();
    document.getElementById('stpill').className='pill plive';
    document.getElementById('stpill').innerHTML='<span class="dot"></span>LIVE·'+ALL.length;
    clearTimeout(autoT);autoT=setTimeout(()=>load(),60000);
  }catch(e){
    document.getElementById('stpill').className='pill perr';
    document.getElementById('stpill').textContent='⚠失敗';
    document.getElementById('list').innerHTML='<div style="text-align:center;padding:24px;font-size:10px;color:var(--t2)"><div style="color:var(--r);margin-bottom:8px">⚠ '+e.message+'</div><button onclick="load(true)" style="font-size:10px;padding:6px 14px;border:.5px solid var(--b1);border-radius:2px;background:transparent;color:var(--t0);cursor:pointer">↻ 重新載入</button></div>';
    clearTimeout(autoT);autoT=setTimeout(()=>load(),30000);
  }finally{if(manual&&btn){btn.textContent='↻';btn.disabled=false;}}
}
load();
</script></body></html>
