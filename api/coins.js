export const config={runtime:'edge'};
const OKX='https://www.okx.com';
const BN='https://fapi.binance.com';
async function get(url){try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(7000)});const j=await r.json();return Array.isArray(j)?j:j.data||j||[]}catch{return[]}}
async function okx(p){try{const r=await fetch(OKX+p,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(7000)});const j=await r.json();return j.data||[]}catch{return[]}}
function calcEMA(prices,period){if(prices.length<period)return null;const k=2/(period+1);let e=prices.slice(0,period).reduce((s,v)=>s+v,0)/period;for(let i=period;i<prices.length;i++)e=prices[i]*k+e*(1-k);return e;}
function calcScore(fr,chg,wl,rl,oiChg,frAnom){let s=50;const fp=fr*100;if(fp>0.10)s+=20;else if(fp>0.05)s+=13;else if(fp>0.02)s+=7;else if(fp>0.005)s+=3;else if(fp>0)s+=1;else if(fp<-0.10)s-=20;else if(fp<-0.05)s-=13;else if(fp<-0.02)s-=7;else if(fp<-0.005)s-=3;else if(fp<0)s-=1;if(chg>12)s+=16;else if(chg>6)s+=10;else if(chg>3)s+=6;else if(chg>1)s+=3;else if(chg>0)s+=1;else if(chg<-12)s-=16;else if(chg<-6)s-=10;else if(chg<-3)s-=6;else if(chg<-1)s-=3;else if(chg<0)s-=1;if(wl!==50){if(wl>68)s+=12;else if(wl>58)s+=7;else if(wl>52)s+=3;else if(wl<32)s-=12;else if(wl<42)s-=7;else if(wl<48)s-=3;}if(rl!==50){if(rl<32)s+=9;else if(rl<42)s+=5;else if(rl>68)s-=9;else if(rl>58)s-=5;}if(oiChg>20)s+=6;else if(oiChg>10)s+=3;else if(oiChg>5)s+=1;else if(oiChg<-20)s-=6;else if(oiChg<-10)s-=3;if(frAnom)s+=4;return Math.max(5,Math.min(99,Math.round(s)));}
export default async function handler(req){
  const h={'Access-Control-Allow-Origin':'*','Content-Type':'application/json','Cache-Control':'s-maxage=50'};
  if(req.method==='OPTIONS')return new Response(null,{status:200,headers:h});
  try{
    const now=new Date();
    const timeStr=now.toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
    const[bnLSD,bnGLSD,bnOID,tickersD,fgD]=await Promise.allSettled([
      get(`${BN}/futures/data/topLongShortAccountRatio?period=1h&limit=1`),
      get(`${BN}/futures/data/globalLongShortAccountRatio?period=1h&limit=1`),
      get(`${BN}/fapi/v1/openInterest`),
      okx('/api/v5/market/tickers?instType=SWAP'),
      get('https://api.alternative.me/fng/?limit=1')
    ]);
    const bnLSMap={},bnGLSMap={},bnOIMap={};
    (bnLSD.value||[]).forEach(x=>{const s=x.symbol?.replace('USDT','');if(s)bnLSMap[s]=Math.round(parseFloat(x.longAccount||0.5)*100)});
    (bnGLSD.value||[]).forEach(x=>{const s=x.symbol?.replace('USDT','');if(s)bnGLSMap[s]=Math.round(parseFloat(x.longAccount||0.5)*100)});
    (bnOID.value||[]).forEach(x=>{const s=x.symbol?.replace('USDT','');if(s)bnOIMap[s]=parseFloat(x.openInterest||0)});
    const fg=fgD.value?.data?.[0]||{};
    const top=(tickersD.value||[]).filter(t=>t.instId.endsWith('-USDT-SWAP')).sort((a,b)=>parseFloat(b.volCcy24h)-parseFloat(a.volCcy24h)).slice(0,60);
    const coins=await Promise.all(top.map(async t=>{
      const iid=t.instId,sym=iid.replace('-USDT-SWAP','');
      const price=parseFloat(t.last||0),open24=parseFloat(t.open24h||price||1),high24=parseFloat(t.high24h||price),low24=parseFloat(t.low24h||price);
      const chg24h=open24?(price-open24)/open24*100:0,vol24h=parseFloat(t.volCcy24h||0);
      const[frD,frHD,c1hD,c4hD,c15mD,oiHistD]=await Promise.allSettled([
        okx(`/api/v5/public/funding-rate?instId=${iid}`),
        okx(`/api/v5/public/funding-rate-history?instId=${iid}&limit=24`),
        okx(`/api/v5/market/candles?instId=${iid}&bar=1H&limit=200`),
        okx(`/api/v5/market/candles?instId=${iid}&bar=4H&limit=200`),
        okx(`/api/v5/market/candles?instId=${iid}&bar=15m&limit=200`),
        get(`${BN}/futures/data/openInterestHist?symbol=${sym}USDT&period=1h&limit=24`)
      ]);
      const fr=frD.value?.[0]||{},frVal=parseFloat(fr.fundingRate||0);
      const nextFT=parseInt(fr.nextFundingTime||0);
      const nextF=nextFT?new Date(nextFT).toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',hour12:false}):'--';
      const countdown=nextFT?Math.max(0,Math.round((nextFT-Date.now())/60000)):-1;
      const frHist=frHD.value||[],frRates=frHist.map(h=>Math.abs(parseFloat(h.fundingRate||0)));
      const frAvg=frRates.length?frRates.reduce((s,v)=>s+v,0)/frRates.length:0;
      const frAnom=frRates.some(r=>r>frAvg*2.5&&r>0.001),frAnomalyCount=frRates.filter(r=>r>frAvg*2.5&&r>0.001).length;
      const wl=bnLSMap[sym]||50,ws=100-wl,hasLS=!!bnLSMap[sym];
      const rl=bnGLSMap[sym]||50,rs=100-rl;
      const oiHist=oiHistD.value||[];
      let oiChg1h=0,oiChg24h=0,oiAnom=0,oiTrend='持平';
      if(oiHist.length>=2){
        const cur=parseFloat(oiHist[oiHist.length-1]?.sumOpenInterest||0);
        const prev1h=parseFloat(oiHist[oiHist.length-2]?.sumOpenInterest||cur||1);
        const prev24h=parseFloat(oiHist[0]?.sumOpenInterest||cur||1);
        oiChg1h=prev1h?(cur-prev1h)/prev1h*100:0;
        oiChg24h=prev24h?(cur-prev24h)/prev24h*100:0;
        const vals=oiHist.map(d=>parseFloat(d.sumOpenInterest||0));
        const avg=vals.reduce((s,v)=>s+v,0)/vals.length;
        oiAnom=vals.filter(v=>Math.abs(v-avg)>avg*0.15).length;
        if(oiChg1h>5)oiTrend='🔥快速增倉';else if(oiChg1h>2)oiTrend='緩慢增倉';else if(oiChg1h<-5)oiTrend='💧快速減倉';else if(oiChg1h<-2)oiTrend='緩慢減倉';
      }
      const p1h=(c1hD.value||[]).map(c=>parseFloat(c[4])).reverse();
      const p4h=(c4hD.value||[]).map(c=>parseFloat(c[4])).reverse();
      const p15m=(c15mD.value||[]).map(c=>parseFloat(c[4])).reverse();
      const e144_1h=calcEMA(p1h,144),e169_1h=calcEMA(p1h,169);
      const e144_4h=calcEMA(p4h,144),e169_4h=calcEMA(p4h,169);
      const e144_15m=calcEMA(p15m,144),e169_15m=calcEMA(p15m,169);
      const up1h=e144_1h&&e169_1h?Math.max(e144_1h,e169_1h):null;
      const lo1h=e144_1h&&e169_1h?Math.min(e144_1h,e169_1h):null;
      const up4h=e144_4h&&e169_4h?Math.max(e144_4h,e169_4h):null;
      const lo4h=e144_4h&&e169_4h?Math.min(e144_4h,e169_4h):null;
      const up15m=e144_15m&&e169_15m?Math.max(e144_15m,e169_15m):null;
      const lo15m=e144_15m&&e169_15m?Math.min(e144_15m,e169_15m):null;
      let trend4h='中性',trend4hStr='neutral';
      if(up4h&&price>up4h){trend4h='多頭';trend4hStr='bull';}
      else if(lo4h&&price<lo4h){trend4h='空頭';trend4hStr='bear';}
      let signal1h='通道中線',signal1hStr='neutral';
      let entry=null,stopLoss=null,tp1=null,tp2=null;
      if(up1h&&price>up1h){signal1h='突破上方';signal1hStr='bull';entry=price;stopLoss=+(e144_1h*0.985).toFixed(6);const r=entry-stopLoss;tp1=+(entry+r).toFixed(6);tp2=+(entry+r*2).toFixed(6);}
      else if(lo1h&&price<lo1h){signal1h='跌破下方';signal1hStr='bear';entry=price;stopLoss=+(e144_1h*1.015).toFixed(6);const r=stopLoss-entry;tp1=+(entry-r).toFixed(6);tp2=+(entry-r*2).toFixed(6);}
      else if(lo1h&&Math.abs(price-lo1h)/lo1h<0.015){signal1h='回調到位';signal1hStr='mild-bull';}
      else if(up1h&&Math.abs(price-up1h)/up1h<0.015){signal1h='壓力位';signal1hStr='mild-bear';}
      let confirm15m='等待',confirm15mStr='neutral';
      if(up15m&&price>up15m){confirm15m='15M買壓';confirm15mStr='bull';}
      else if(lo15m&&price<lo15m){confirm15m='15M賣壓';confirm15mStr='bear';}
      else if(e144_15m&&price>e144_15m){confirm15m='15M偏多';confirm15mStr='mild-bull';}
      else if(e144_15m&&price<e144_15m){confirm15m='15M偏空';confirm15mStr='mild-bear';}
      const isCallback=trend4hStr==='bull'&&signal1hStr==='mild-bull'&&confirm15mStr==='bull'||trend4hStr==='bear'&&signal1hStr==='mild-bear'&&confirm15mStr==='bear';
      const sc=calcScore(frVal,chg24h,wl,rl,oiChg1h,frAnom);
      const flowScore=sc;
      let vegasScore=50;
      if(trend4hStr==='bull')vegasScore+=20;else if(trend4hStr==='bear')vegasScore-=20;
      if(signal1hStr==='bull')vegasScore+=20;else if(signal1hStr==='mild-bull')vegasScore+=10;else if(signal1hStr==='bear')vegasScore-=20;else if(signal1hStr==='mild-bear')vegasScore-=10;
      if(confirm15mStr==='bull')vegasScore+=10;else if(confirm15mStr==='bear')vegasScore-=10;
      vegasScore=Math.max(5,Math.min(99,Math.round(vegasScore)));
      const signal=sc>=65?'long':sc<=38?'short':'neutral';
      const resonance=flowScore>=65&&vegasScore>=65?'strong-long':flowScore<=38&&vegasScore<=38?'strong-short':signal==='long'&&vegasScore>=55?'long':signal==='short'&&vegasScore<=45?'short':'watch';
      const alerts=[];
      if(chg24h>20&&frVal*100>0.05&&rl>65)alerts.push({type:'overheat',msg:'⚠️ 市場過熱！漲幅+'+chg24h.toFixed(1)+'% FR異常 散戶追高',level:'danger'});
      if(oiChg1h>15&&chg24h<2)alerts.push({type:'oi',msg:'⚡ OI暴增但價格未漲，主力可能建空',level:'warning'});
      if(oiChg1h>15&&chg24h>5)alerts.push({type:'oi_up',msg:'🔥 OI暴增+價格上漲，強勢突破',level:'success'});
      if(isCallback)alerts.push({type:'entry',msg:'🎯 回調進場機會！4H多頭+1H回調+15M確認',level:'success'});
      const priceRange=high24-low24,pricePos=priceRange>0?(price-low24)/priceRange:0.5;
      const cvdScore=Math.min(99,Math.max(1,Math.round(30+pricePos*40+(chg24h>0?10:0)+(frVal>0?10:0))));
      return{sym,instId:iid,price,high24h:high24,low24h:low24,chg24h:Math.round(chg24h*100)/100,vol24h,frVal,frAvg7d:Math.round(frAvg*1e6)/10000,frAnomalyCount,frAnomaly:frAnom,nextFunding:nextF,countdown,whaleLong:wl,whaleShort:ws,retailLong:rl,retailShort:rs,hasLSData:hasLS,oiChangePct1h:Math.round(oiChg1h*100)/100,oiChangePct24h:Math.round(oiChg24h*100)/100,oiAnomalyCount:oiAnom,oiTrend,cvdTrend:cvdScore>50?1:-1,cvdScore,relBTC:0,basis:0,liqLong:0,liqShort:0,trend4h,trend4hStr,signal1h,signal1hStr,confirm15m,confirm15mStr,isCallbackEntry:isCallback,entry,stopLoss,tp1,tp2,score:sc,flowScore,vegasScore,signal,resonance,isHot:sc>=78,alerts,signalTime:timeStr};
    }));
    coins.sort((a,b)=>b.score-a.score);
    const btcChg=coins.find(c=>c.sym==='BTC')?.chg24h||0;
    coins.forEach(c=>{c.relBTC=Math.round((c.chg24h-btcChg)*100)/100;});
    return new Response(JSON.stringify({ok:true,data:coins,market:{fearGreed:parseInt(fg.value||50),fearGreedText:fg.value_classification||'中性',updateTime:timeStr},ts:Date.now(),count:coins.length,updateTime:timeStr}),{status:200,headers:h});
  }catch(e){return new Response(JSON.stringify({ok:false,error:e.message}),{status:500,headers:h});}
}
