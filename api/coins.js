export const config={runtime:'edge'};
const OKX='https://www.okx.com';
const BN='https://fapi.binance.com';
async function get(url){try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(8000)});const j=await r.json();return Array.isArray(j)?j:j.data||[]}catch{return[]}}
async function okx(p){try{const r=await fetch(OKX+p,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(8000)});const j=await r.json();return j.data||[]}catch{return[]}}
function calcScore(fr,chg,wl,rl,oiChg,frAnom){let s=50;const fp=fr*100;if(fp>0.10)s+=20;else if(fp>0.05)s+=13;else if(fp>0.02)s+=7;else if(fp>0.005)s+=3;else if(fp>0)s+=1;else if(fp<-0.10)s-=20;else if(fp<-0.05)s-=13;else if(fp<-0.02)s-=7;else if(fp<-0.005)s-=3;else if(fp<0)s-=1;if(chg>12)s+=16;else if(chg>6)s+=10;else if(chg>3)s+=6;else if(chg>1)s+=3;else if(chg>0)s+=1;else if(chg<-12)s-=16;else if(chg<-6)s-=10;else if(chg<-3)s-=6;else if(chg<-1)s-=3;else if(chg<0)s-=1;if(wl!==50){if(wl>68)s+=12;else if(wl>58)s+=7;else if(wl>52)s+=3;else if(wl<32)s-=12;else if(wl<42)s-=7;else if(wl<48)s-=3;}if(rl!==50){if(rl<32)s+=9;else if(rl<42)s+=5;else if(rl>68)s-=9;else if(rl>58)s-=5;}if(oiChg>20)s+=6;else if(oiChg>10)s+=3;else if(oiChg>5)s+=1;else if(oiChg<-20)s-=6;else if(oiChg<-10)s-=3;if(frAnom)s+=4;return Math.max(5,Math.min(99,Math.round(s)));}
export default async function handler(req){
  const h={'Access-Control-Allow-Origin':'*','Content-Type':'application/json','Cache-Control':'s-maxage=45'};
  if(req.method==='OPTIONS')return new Response(null,{status:200,headers:h});
  try{
    const now=new Date();
    const timeStr=now.toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
    const[bnLS,bnGLS,bnOIRaw,tickers]=await Promise.allSettled([
      get(`${BN}/futures/data/topLongShortAccountRatio?period=1h&limit=1`),
      get(`${BN}/futures/data/globalLongShortAccountRatio?period=1h&limit=1`),
      get(`${BN}/fapi/v1/openInterest`),
      okx('/api/v5/market/tickers?instType=SWAP')
    ]);
    const bnLSMap={},bnGLSMap={},bnOIMap={};
    (bnLS.value||[]).forEach(x=>{const s=x.symbol?.replace('USDT','');if(s)bnLSMap[s]={wl:Math.round(parseFloat(x.longAccount||0.5)*100)}});
    (bnGLS.value||[]).forEach(x=>{const s=x.symbol?.replace('USDT','');if(s)bnGLSMap[s]={rl:Math.round(parseFloat(x.longAccount||0.5)*100)}});
    (bnOIRaw.value||[]).forEach(x=>{const s=x.symbol?.replace('USDT','');if(s)bnOIMap[s]=parseFloat(x.openInterest||0)});
    const top=(tickers.value||[]).filter(t=>t.instId.endsWith('-USDT-SWAP')).sort((a,b)=>parseFloat(b.volCcy24h)-parseFloat(a.volCcy24h)).slice(0,60);
    const coins=await Promise.all(top.map(async t=>{
      const iid=t.instId,sym=iid.replace('-USDT-SWAP','');
      const price=parseFloat(t.last||0),open24=parseFloat(t.open24h||price||1),high24=parseFloat(t.high24h||price),low24=parseFloat(t.low24h||price);
      const chg24h=open24?(price-open24)/open24*100:0,vol24h=parseFloat(t.volCcy24h||0);
      const[frD,frHD,bnOIHistD]=await Promise.allSettled([
        okx(`/api/v5/public/funding-rate?instId=${iid}`),
        okx(`/api/v5/public/funding-rate-history?instId=${iid}&limit=24`),
        get(`${BN}/futures/data/openInterestHist?symbol=${sym}USDT&period=5m&limit=12`)
      ]);
      const fr=frD.value?.[0]||{},frVal=parseFloat(fr.fundingRate||0);
      const nextF=fr.nextFundingTime?new Date(parseInt(fr.nextFundingTime)).toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',hour12:false}):'--';
      const frHist=frHD.value||[],frRates=frHist.map(h=>Math.abs(parseFloat(h.fundingRate||0)));
      const frAvg=frRates.length?frRates.reduce((s,v)=>s+v,0)/frRates.length:0;
      const frAnom=frRates.some(r=>r>frAvg*2.5&&r>0.001),frAnomalyCount=frRates.filter(r=>r>frAvg*2.5&&r>0.001).length;
      const wl=bnLSMap[sym]?.wl||50,ws=100-wl,hasLS=!!bnLSMap[sym];
      const rl=bnGLSMap[sym]?.rl||50,rs=100-rl;
      const oiHist=bnOIHistD.value||[];
      let oiChg=0,oiAnom=0,oiTrend='持平';
      if(oiHist.length>=2){
        const cur=parseFloat(oiHist[oiHist.length-1]?.sumOpenInterest||0);
        const prev=parseFloat(oiHist[0]?.sumOpenInterest||cur||1);
        oiChg=prev?(cur-prev)/prev*100:0;
        const vals=oiHist.map(d=>parseFloat(d.sumOpenInterest||0));
        const avg=vals.reduce((s,v)=>s+v,0)/vals.length;
        oiAnom=vals.filter(v=>Math.abs(v-avg)>avg*0.15).length;
        if(oiChg>8)oiTrend='快速增倉';else if(oiChg>3)oiTrend='緩慢增倉';else if(oiChg<-8)oiTrend='快速減倉';else if(oiChg<-3)oiTrend='緩慢減倉';
      }
      const priceRange=high24-low24,pricePos=priceRange>0?(price-low24)/priceRange:0.5;
      const cvdScore=Math.min(99,Math.max(1,Math.round(30+pricePos*40+(chg24h>0?10:0)+(frVal>0?10:0))));
      const sc=calcScore(frVal,chg24h,wl,rl,oiChg,frAnom);
      const signal=sc>=65?'long':sc<=38?'short':'neutral';
      let vegas='通道中線',vegasDetail='EMA144/169 區間整理',vegasStr='neutral';
      if(sc>=85&&chg24h>5){vegas='強勢突破';vegasDetail='強力突破 EMA144/169，趨勢確立';vegasStr='strong-bull';}
      else if(sc>=72&&chg24h>2){vegas='突破上方';vegasDetail='突破 EMA144 壓力，多方主導';vegasStr='bull';}
      else if(sc>=60&&chg24h>0){vegas='站上通道';vegasDetail='站上 EMA144 支撐，偏多';vegasStr='mild-bull';}
      else if(sc<=18&&chg24h<-5){vegas='強勢跌破';vegasDetail='跌破 EMA144/169，空方主導';vegasStr='strong-bear';}
      else if(sc<=32&&chg24h<-2){vegas='跌破下方';vegasDetail='跌破 EMA144 支撐，空方接管';vegasStr='bear';}
      else if(sc<=44&&chg24h<0){vegas='跌入通道';vegasDetail='回落至 EMA 壓力區間';vegasStr='mild-bear';}
      return{sym,instId:iid,price,high24h:high24,low24h:low24,chg24h:Math.round(chg24h*100)/100,vol24h,frVal,frAvg7d:Math.round(frAvg*1e6)/10000,frAnomalyCount,frAnomaly:frAnom,nextFunding:nextF,whaleLong:wl,whaleShort:ws,retailLong:rl,retailShort:rs,hasLSData:hasLS,oiChangePct:Math.round(oiChg*100)/100,oiAnomalyCount:oiAnom,oiTrend,cvdTrend:cvdScore>50?1:-1,cvdScore,score:sc,signal,vegas,vegasDetail,vegasStrength:vegasStr,isHot:sc>=78,signalTime:timeStr};
    }));
    coins.sort((a,b)=>b.score-a.score);
    return new Response(JSON.stringify({ok:true,data:coins,ts:Date.now(),count:coins.length,updateTime:timeStr}),{status:200,headers:h});
  }catch(e){return new Response(JSON.stringify({ok:false,error:e.message}),{status:500,headers:h});}
}
