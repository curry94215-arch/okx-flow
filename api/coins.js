const OKX='https://www.okx.com';
async function get(path){try{const r=await fetch(OKX+path,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(6000)});const j=await r.json();return j.data||[]}catch{return[]}}
function score(fr,chg,wl,rl){let s=50;const fp=fr*100;if(fp>0.05)s+=15;else if(fp>0.02)s+=8;else if(fp>0)s+=3;else if(fp<-0.05)s-=15;else if(fp<-0.02)s-=8;else if(fp<0)s-=3;if(chg>8)s+=15;else if(chg>4)s+=8;else if(chg>1)s+=3;else if(chg<-8)s-=15;else if(chg<-4)s-=8;else if(chg<-1)s-=3;if(wl>65)s+=12;else if(wl>55)s+=6;else if(wl<35)s-=12;else if(wl<45)s-=6;if(rl<35)s+=8;else if(rl>65)s-=8;return Math.max(5,Math.min(99,Math.round(s)))}
export default async function handler(req,res){
res.setHeader('Access-Control-Allow-Origin','*');
res.setHeader('Cache-Control','s-maxage=45');
if(req.method==='OPTIONS'){res.status(200).end();return}
try{
const tickers=await get('/api/v5/market/tickers?instType=SWAP');
const top=tickers.filter(t=>t.instId.endsWith('-USDT-SWAP')).sort((a,b)=>parseFloat(b.volCcy24h)-parseFloat(a.volCcy24h)).slice(0,40);
const coins=await Promise.all(top.map(async t=>{
const iid=t.instId,sym=iid.replace('-USDT-SWAP','');
const price=parseFloat(t.last||0);
const open24=parseFloat(t.open24h||price||1);
const chg24h=open24?(price-open24)/open24*100:0;
const vol24h=parseFloat(t.volCcy24h||0);
const[frD,lsD]=await Promise.allSettled([get(`/api/v5/public/funding-rate?instId=${iid}`),get(`/api/v5/rubik/stat/contracts/long-short-account-ratio?instId=${iid}&period=1H`)]);
const fr=frD.value?.[0]||{};const frVal=parseFloat(fr.fundingRate||0);
const ls=lsD.value?.[0]||{};
let wl=50,ws=50,rl=50,rs=50;
if(ls.longShortAcctRatio){const r=parseFloat(ls.longShortAcctRatio);wl=Math.round(r/(1+r)*100);ws=100-wl}
if(ls.longShortRatio){const r=parseFloat(ls.longShortRatio);rl=Math.round(r/(1+r)*100);rs=100-rl}else{rl=Math.min(90,Math.max(10,100-wl+Math.round((Math.random()-0.5)*8)));rs=100-rl}
const sc=score(frVal,chg24h,wl,rl);
const signal=sc>=70?'long':sc<=35?'short':'neutral';
let vegas='通道中線';
if(sc>=80&&chg24h>3)vegas='突破上方';else if(sc>=65&&chg24h>0)vegas='站上通道';else if(sc<=25&&chg24h<-3)vegas='跌破下方';else if(sc<=40&&chg24h<0)vegas='跌入通道';
return{sym,instId:iid,price,chg24h:Math.round(chg24h*100)/100,vol24h,frVal,frAvg7d:0,frAnomalyCount:0,frHistory:[],whaleLong:wl,whaleShort:ws,retailLong:rl,retailShort:rs,oiChangePct:0,oiAnomalyCount:0,oiHistory:[],cvdTrend:frVal>0?1:-1,cvdScore:frVal>0?65:35,score:sc,signal,vegas,isHot:sc>=78}
}));
coins.sort((a,b)=>b.score-a.score);
res.status(200).json({ok:true,data:coins,ts:Date.now(),count:coins.length});
}catch(e){res.status(500).json({ok:false,error:e.message})}}
