export const config={maxDuration:60};
const OKX='https://www.okx.com';
const BN='https://fapi.binance.com';
async function get(url){try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(8000)});const j=await r.json();return Array.isArray(j)?j:j.data||j||[]}catch{return[]}}
async function okx(p){try{const r=await fetch(OKX+p,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(8000)});const j=await r.json();return j.data||[]}catch{return[]}}
function calcScore(fr,chg,wl,rl,oiChg,frAnom){let s=50;const fp=fr*100;if(fp>0.10)s+=20;else if(fp>0.05)s+=13;else if(fp>0.02)s+=7;else if(fp>0.005)s+=3;else if(fp>0)s+=1;else if(fp<-0.10)s-=20;else if(fp<-0.05)s-=13;else if(fp<-0.02)s-=7;else if(fp<-0.005)s-=3;else if(fp<0)s-=1;if(chg>12)s+=16;else if(chg>6)s+=10;else if(chg>3)s+=6;else if(chg>1)s+=3;else if(chg>0)s+=1;else if(chg<-12)s-=16;else if(chg<-6)s-=10;else if(chg<-3)s-=6;else if(chg<-1)s-=3;else if(chg<0)s-=1;if(wl!==50){if(wl>68)s+=12;else if(wl>58)s+=7;else if(wl>52)s+=3;else if(wl<32)s-=12;else if(wl<42)s-=7;else if(wl<48)s-=3;}if(rl!==50){if(rl<32)s+=9;else if(rl<42)s+=5;else if(rl>68)s-=9;else if(rl>58)s-=5;}if(oiChg>20)s+=6;else if(oiChg>10)s+=3;else if(oiChg>5)s+=1;else if(oiChg<-20)s-=6;else if(oiChg<-10)s-=3;if(frAnom)s+=4;return Math.max(5,Math.min(99,Math.round(s)));}
export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Cache-Control','s-maxage=50');
  if(req.method==='OPTIONS'){res.status(200).end();return;}
  try{
    const now=new Date();
    const timeStr=now.toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
    const[bnLS,bnGLS,bnOIRaw,tickers,fgD]=await Promise.allSettled([
      get(`${BN}/futures/data/topLongShortAccountRatio?period=1h&limit=1`),
      get(`${BN}/futures/data/globalLongShortAccountRatio?period=1h&limit=1`),
      get(`${BN}/fapi/v1/openInterest`),
      okx('/api/v5/market/tickers?instType=SWAP'),
      get('https://api.alternative.me/fng/?limit=1')
    ]);
    const bnLSMap={},bnGLSMap={};
    (bnLS.value||[]).forEach(x=>{const s=x.symbol?.replace('USDT','');if(s)bnLSMap[s]=Math.round(parseFloat(x.longAccount||0.5)*100)});
    (bnGLS.value||[]).forEach(x=>{const s=x.symbol?.replace('USDT','');if(s)bnGLSMap[s]=Math.round(parseFloat(x.longAccount||0.5)*100)});
    const fg=fgD.value?.data?.[0]||{};
    const top=(tickers.value||[]).filter(t=>t.instId.endsWith('-USDT-SWAP')).sort((a,b)=>parseFloat(b.volCcy24h)-parseFloat(a.volCcy24h)).slice(0,30);
    const coins=await Promise.all(top.map(async t=>{
      const iid=t.instId,sym=iid.replace('-USDT-SWAP','');
      const price=parseFloat(t.last||0),open24=parseFloat(t.open24h||price||1),high24=parseFloat(t.high24h||price),low24=parseFloat(t.low24h||price);
      const chg24h=open24?(price-open24)/open24*100:0,vol24h=parseFloat(t.volCcy24h||0);
      const[frD,frHD,oiHistD]=await Promise.allSettled([
        okx(`/api/v5/public/funding-rate?instId=${iid}`),
        okx(`/api/v5/public/funding-rate-history?instId=${iid}&limit=24`),
        get(`${BN}/futures/data/openInterestHist?symbol=${sym}USDT&per
