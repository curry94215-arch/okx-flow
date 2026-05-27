export const config={runtime:'edge'};
const OKX='https://www.okx.com';
const BN='https://fapi.binance.com';
const BNS='https://api.binance.com';

async function get(url){
  try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(9000)});
  const j=await r.json();return Array.isArray(j)?j:j.data||j||[]}catch{return[]}
}
async function okx(p){
  try{const r=await fetch(OKX+p,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(9000)});
  const j=await r.json();return j.data||[]}catch{return[]}
}

function calcEMA(prices,period){
  if(prices.length<period)return null;
  const k=2/(period+1);
  let e=prices.slice(0,period).reduce((s,v)=>s+v,0)/period;
  for(let i=period;i<prices.length;i++)e=prices[i]*k+e*(1-k);
  return e;
}

function vegasChannel(c1h,c4h,c15m,price){
  const p1h=c1h.map(c=>parseFloat(c[4])).reverse();
  const p4h=c4h.map(c=>parseFloat(c[4])).reverse();
  const p15m=c15m.map(c=>parseFloat(c[4])).reverse();
  const e144_1h=calcEMA(p1h,144),e169_1h=calcEMA(p1h,169);
  const e144_4h=calcEMA(p4h,144),e169_4h=calcEMA(p4h,169);
  const e144_15m=calcEMA(p15m,144),e169_15m=calcEMA(p15m,169);
  const upper1h=e144_1h&&e169_1h?Math.max(e144_1h,e169_1h):null;
  const lower1h=e144_1h&&e169_1h?Math.min(e144_1h,e169_1h):null;
  const upper4h=e144_4h&&e169_4h?Math.max(e144_4h,e169_4h):null;
  const lower4h=e144_4h&&e169_4h?Math.min(e144_4h,e169_4h):null;
  const upper15m=e144_15m&&e169_15m?Math.max(e144_15m,e169_15m):null;
  const lower15m=e144_15m&&e169_15m?Math.min(e144_15m,e169_15m):null;

  // 4H 大趨勢
  let trend4h='中性',trend4hStr='neutral';
  if(upper4h&&price>upper4h){trend4h='多頭';trend4hStr='bull';}
  else if(lower4h&&price<lower4h){trend4h='空頭';trend4hStr='bear';}

  // 1H 主力訊號
  let signal1h='通道內',signal1hStr='neutral';
  let entry=null,stopLoss=null,tp1=null,tp2=null,slType='';
  if(upper1h&&price>upper1h){
    signal1h='突破上方';signal1hStr='bull';
    entry=price;
    stopLoss=parseFloat((e144_1h*0.985).toFixed(6));
    slType='EMA144下方1.5%';
    const risk=entry-stopLoss;
    tp1=parseFloat((entry+risk).toFixed(6));
    tp2=parseFloat((entry+risk*2).toFixed(6));
  }else if(lower1h&&price<lower1h){
    signal1h='跌破下方';signal1hStr='bear';
    entry=price;
    stopLoss=parseFloat((e144_1h*1.015).toFixed(6));
    slType='EMA144上方1.5%';
    const risk=stopLoss-entry;
    tp1=parseFloat((entry-risk).toFixed(6));
    tp2=parseFloat((entry-risk*2).toFixed(6));
  }else if(upper1h&&lower1h){
    const distToUpper=Math.abs(price-upper1h)/upper1h;
    const distToLower=Math.abs(price-lower1h)/lower1h;
    if(distToLower<0.01){signal1h='回調到位';signal1hStr='mild-bull';}
    else if(distToUpper<0.01){signal1h='壓力位';signal1hStr='mild-bear';}
  }

  // 15M 進場確認
  let confirm15m='等待',confirm15mStr='neutral';
  if(upper15m&&price>upper15m){confirm15m='15M買壓確認';confirm15mStr='bull';}
  else if(lower15m&&price<lower15m){confirm15m='15M賣壓確認';confirm15mStr='bear';}
  else if(e144_15m&&price>e144_15m){confirm15m='15M偏多';confirm15mStr='mild-bull';}
  else if(e144_15m&&price<e144_15m){confirm15m='15M偏空';confirm15mStr='mild-bear';}

  // 回調進場偵測
  let isCallbackEntry=false;
  if(trend4hStr==='bull'&&signal1hStr==='mild-bull'&&confirm15mStr==='bull')isCallbackEntry=true;
  if(trend4hStr==='bear'&&signal1hStr==='mild-bear'&&confirm15mStr==='bear')isCallbackEntry=true;

  return{
    trend4h,trend4hStr,signal1h,signal1hStr,
    confirm15m,confirm15mStr,isCallbackEntry,
    entry,stopLoss,tp1,tp2,slType,
    ema144_1h:e144_1h,ema169_1h:e169_1h,
    ema144_4h:e144_4h,ema169_4h:e169_4h,
    ema144_15m:e144_15m,ema169_15m:e169_15m
  };
}

function calcScore(fr,chg,wl,rl,oiChg,frAnom,vegasStr,relBTC){
  let s=50;
  const fp=fr*100;
  if(fp>0.10)s+=20;else if(fp>0.05)s+=13;else if(fp>0.02)s+=7;else if(fp>0.005)s+=3;else if(fp>0)s+=1;
  else if(fp<-0.10)s-=20;else if(fp<-0.05)s-=13;else if(fp<-0.02)s-=7;else if(fp<-0.005)s-=3;else if(fp<0)s-=1;
  if(chg>12)s+=16;else if(chg>6)s+=10;else if(chg>3)s+=6;else if(chg>1)s+=3;else if(chg>0)s+=1;
  else if(chg<-12)s-=16;else if(chg<-6)s-=10;else if(chg<-3)s-=6;else if(chg<-1)s-=3;else if(chg<0)s-=1;
  if(wl!==50){if(wl>68)s+=12;else if(wl>58)s+=7;else if(wl>52)s+=3;else if(wl<32)s-=12;else if(wl<42)s-=7;else if(wl<48)s-=3;}
  if(rl!==50){if(rl<32)s+=9;else if(rl<42)s+=5;else if(rl>68)s-=9;else if(rl>58)s-=5;}
  if(oiChg>20)s+=6;else if(oiChg>10)s+=3;else if(oiChg>5)s+=1;else if(oiChg<-20)s-=6;else if(oiChg<-10)s-=3;
  if(frAnom)s+=4;
  if(vegasStr==='bull')s+=8;else if(vegasStr==='mild-bull')s+=4;
  else if(vegasStr==='bear')s-=8;else if(vegasStr==='mild-bear')s-=4;
  if(relBTC>10)s+=6;else if(relBTC>5)s+=3;else if(relBTC<-10)s-=6;else if(relBTC<-5)s-=3;
  return Math.max(5,Math.min(99,Math.round(s)));
}

function alertLevel(chg,fr,rl,oiChg,liqLong,liqShort,wl){
  const alerts=[];
  if(chg>20&&fr*100>0.05&&rl>65)alerts.push({type:'overheat',msg:'市場過熱！漲幅+'+chg.toFixed(1)+'% FR異常 散戶追高，等回調再進場',level:'danger'});
  if(oiChg>15&&chg<2)alerts.push({type:'oi_anomaly',msg:'OI暴增但價格未漲，主力可能建空倉',level:'warning'});
  if(oiChg>20&&chg>5)alerts.push({type:'oi_surge',msg:'OI暴增+價格上漲，強勢突破信號',level:'success'});
  if(liqLong>1000000)alerts.push({type:'liq_long',msg:'多單大量清算 $'+( liqLong/1000000).toFixed(1)+'M，下跌可能加速',level:'danger'});
  if(liqShort>1000000)alerts.push({type:'liq_short',msg:'空單大量清算 $'+(liqShort/1000000).toFixed(1)+'M，上漲可能加速',level:'success'});
  if(wl<35&&rl>65)alerts.push({type:'diverge',msg:'大戶做空+散戶做多，主力可能誘多後做空',level:'warning'});
  return alerts;
}

export default async function handler(req){
  const h={'Access-Control-Allow-Origin':'*','Content-Type':'application/json','Cache-Control':'s-maxage=45'};
  if(req.method==='OPTIONS')return new Response(null,{status:200,headers:h});
  try{
    const now=new Date();
    const timeStr=now.toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});

    const[bnLS,bnGLS,bnOIRaw,tickers,fearGreed,btcSpot,btcFut,bnLiqData]=await Promise.allSettled([
      get(`${BN}/futures/data/topLongShortAccountRatio?period=1h&limit=1`),
      get(`${BN}/futures/data/globalLongShortAccountRatio?period=1h&limit=1`),
      get(`${BN}/fapi/v1/openInterest`),
      okx('/api/v5/market/tickers?instType=SWAP'),
      get('https://api.alternative.me/fng/?limit=1'),
      get(`${BNS}/api/v3/ticker/price?symbol=BTCUSDT`),
      get(`${BN}/fapi/v1/ticker/price?symbol=BTCUSDT`),
      get(`${BN}/futures/data/allForceOrders?period=1h`)
    ]);

    const bnLSMap={},bnGLSMap={},bnOIMap={},bnLiqMap={};
    (bnLS.value||[]).forEach(x=>{const s=x.symbol?.replace('USDT','');if(s)bnLSMap[s]={wl:Math.round(parseFloat(x.longAccount||0.5)*100)}});
    (bnGLS.value||[]).forEach(x=>{const s=x.symbol?.replace('USDT','');if(s)bnGLSMap[s]={rl:Math.round(parseFloat(x.longAccount||0.5)*100)}});
    (bnOIRaw.value||[]).forEach(x=>{const s=x.symbol?.replace('USDT','');if(s)bnOIMap[s]=parseFloat(x.openInterest||0)});
    (bnLiqData.value||[]).forEach(x=>{
      const s=x.symbol?.replace('USDT','');if(!s)return;
      if(!bnLiqMap[s])bnLiqMap[s]={long:0,short:0};
      const side=x.side;const val=parseFloat(x.origQty||0)*parseFloat(x.price||0);
      if(side==='BUY')bnLiqMap[s].short+=val;else bnLiqMap[s].long+=val;
    });

    const fg=fearGreed.value?.data?.[0]||{};
    const fgVal=parseInt(fg.value||50);
    const fgText=fg.value_classification||'中性';
    const btcSpotPrice=parseFloat(btcSpot.value?.price||0);
    const btcFutPrice=parseFloat(btcFut.value?.price||btcSpotPrice);
    const btcBasis=btcSpotPrice>0?((btcFutPrice-btcSpotPrice)/btcSpotPrice*100):0;

    const top=(tickers.value||[]).filter(t=>t.instId.endsWith('-USDT-SWAP')).sort((a,b)=>parseFloat(b.volCcy24h)-parseFloat(a.volCcy24h)).slice(0,80);

    const coins=await Promise.all(top.map(async t=>{
      const iid=t.instId,sym=iid.replace('-USDT-SWAP','');
      const price=parseFloat(t.last||0);
      const open24=parseFloat(t.open24h||price||1);
      const high24=parseFloat(t.high24h||price);
      const low24=parseFloat(t.low24h||price);
      const chg24h=open24?(price-open24)/open24*100:0;
      const vol24h=parseFloat(t.volCcy24h||0);

      // 現貨價格（期現價差）
      const spotD=await get(`${BNS}/api/v3/ticker/price?symbol=${sym}USDT`).catch(()=>({}));
      const spotPrice=parseFloat(spotD?.price||0);
      const basis=spotPrice>0?((price-spotPrice)/spotPrice*100):0;

      const[frD,frHD,c1hD,c4hD,c15mD,bnOIHistD,spotTicker1hD]=await Promise.allSettled([
        okx(`/api/v5/public/funding-rate?instId=${iid}`),
        okx(`/api/v5/public/funding-rate-history?instId=${iid}&limit=48`),
        okx(`/api/v5/market/candles?instId=${iid}&bar=1H&limit=200`),
        okx(`/api/v5/market/candles?instId=${iid}&bar=4H&limit=200`),
        okx(`/api/v5/market/candles?instId=${iid}&bar=15m&limit=200`),
        get(`${BN}/futures/data/openInterestHist?symbol=${sym}USDT&period=1h&limit=24`),
        okx(`/api/v5/market/candles?instId=${sym}-USDT&bar=1H&limit=2`)
      ]);

      const fr=frD.value?.[0]||{};
      const frVal=parseFloat(fr.fundingRate||0);
      const nextFundingTime=parseInt(fr.nextFundingTime||0);
      const nextF=nextFundingTime?new Date(nextFundingTime).toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',hour12:false}):'--';
      const countdown=nextFundingTime?Math.max(0,Math.round((nextFundingTime-Date.now())/60000)):-1;

      const frHist=frHD.value||[];
      const frRates=frHist.map(h=>Math.abs(parseFloat(h.fundingRate||0)));
      const frAvg=frRates.length?frRates.reduce((s,v)=>s+v,0)/frRates.length:0;
      const frAnom=frRates.some(r=>r>frAvg*2.5&&r>0.001);
      const frAnomalyCount=frRates.filter(r=>r>frAvg*2.5&&r>0.001).length;
      const frVals=frHist.slice(0,24).map(h=>parseFloat(h.fundingRate||0)*100).reverse();

      const wl=bnLSMap[sym]?.wl||50,ws=100-wl,hasLS=!!bnLSMap[sym];
      const rl=bnGLSMap[sym]?.rl||50,rs=100-rl;

      const oiHist=bnOIHistD.value||[];
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
        if(oiChg1h>5)oiTrend='🔥快速增倉';else if(oiChg1h>2)oiTrend='緩慢增倉';
        else if(oiChg1h<-5)oiTrend='💧快速減倉';else if(oiChg1h<-2)oiTrend='緩慢減倉';
      }

      // 1H前價格（觸發後漲跌）
      const spot1h=spotTicker1hD.value||[];
      const price1hAgo=spot1h.length>=2?parseFloat(spot1h[1]?.[4]||price):price;
      const chg1h=price1hAgo?(price-price1hAgo)/price1hAgo*100:0;

      // 相對強弱 vs BTC
      const relBTC=btcSpotPrice>0?(chg24h-(btcChg24h||0)):0;
      const btcOpen=btcSpotPrice;
      const btcChg24h=btcBasis;

      // 清算數據
      const liq=bnLiqMap[sym]||{long:0,short:0};

      // Vegas通道
      const vc=vegasChannel(c1hD.value||[],c4hD.value||[],c15mD.value||[],price);

      // CVD
      const priceRange=high24-low24,pricePos=priceRange>0?(price-low24)/priceRange:0.5;
      const cvdScore=Math.min(99,Math.max(1,Math.round(30+pricePos*40+(chg24h>0?10:0)+(frVal>0?10:0))));

      // 評分
      const sc=calcScore(frVal,chg24h,wl,rl,oiChg1h,frAnom,vc.signal1hStr,relBTC);
      const flowScore=calcScore(frVal,chg24h,wl,rl,oiChg1h,frAnom,'neutral',relBTC);

      let vegasScore=50;
      if(vc.trend4hStr==='bull')vegasScore+=20;else if(vc.trend4hStr==='bear')vegasScore-=20;
      if(vc.signal1hStr==='bull')vegasScore+=20;else if(vc.signal1hStr==='mild-bull')vegasScore+=10;
      else if(vc.signal1hStr==='bear')vegasScore-=20;else if(vc.signal1hStr==='mild-bear')vegasScore-=10;
      if(vc.confirm15mStr==='bull')vegasScore+=10;else if(vc.confirm15mStr==='bear')vegasScore-=10;
      vegasScore=Math.max(5,Math.min(99,Math.round(vegasScore)));

      const signal=sc>=65?'long':sc<=38?'short':'neutral';
      const resonance=(flowScore>=65&&vegasScore>=65)?'strong-long':(flowScore<=38&&vegasScore<=38)?'strong-short':signal==='long'&&vegasScore>=55?'long':signal==='short'&&vegasScore<=45?'short':'watch';

      // 警報
      const alerts=alertLevel(chg24h,frVal,rl,oiChg1h,liq.long,liq.short,wl);
      if(vc.isCallbackEntry)alerts.push({type:'entry',msg:'回調進場機會！4H多頭+1H回調到位+15M確認',level:'success'});

      return{
        sym,instId:iid,price,high24h:high24,low24h:low24,
        chg24h:Math.round(chg24h*100)/100,
        chg1h:Math.round(chg1h*100)/100,
        vol24h,basis:Math.round(basis*10000)/10000,
        frVal,frAvg7d:Math.round(frAvg*1e6)/10000,
        frAnomalyCount,frAnomaly:frAnom,frHistory:frVals,
        nextFunding:nextF,countdown,
        whaleLong:wl,whaleShort:ws,retailLong:rl,retailShort:rs,hasLSData:hasLS,
        oiChangePct1h:Math.round(oiChg1h*100)/100,
        oiChangePct24h:Math.round(oiChg24h*100)/100,
        oiAnomalyCount:oiAnom,oiTrend,
        liqLong:Math.round(liq.long),liqShort:Math.round(liq.short),
        cvdTrend:cvdScore>50?1:-1,cvdScore,
        relBTC:Math.round(relBTC*100)/100,
        trend4h:vc.trend4h,trend4hStr:vc.trend4hStr,
        signal1h:vc.signal1h,signal1hStr:vc.signal1hStr,
        confirm15m:vc.confirm15m,confirm15mStr:vc.confirm15mStr,
        isCallbackEntry:vc.isCallbackEntry,
        entry:vc.entry,stopLoss:vc.stopLoss,tp1:vc.tp1,tp2:vc.tp2,slType:vc.slType,
        ema144_1h:vc.ema144_1h,ema169_1h:vc.ema169_1h,
        score:sc,flowScore,vegasScore,signal,resonance,
        isHot:sc>=78,alerts,signalTime:timeStr
      };
    }));

    coins.sort((a,b)=>b.score-a.score);

    // BTC 相對強弱修正
    const btcCoin=coins.find(c=>c.sym==='BTC');
    const btcChg=btcCoin?.chg24h||0;
    coins.forEach(c=>{c.relBTC=Math.round((c.chg24h-btcChg)*100)/100;});

    const marketData={
      fearGreed:fgVal,fearGreedText:fgText,
      btcBasis:Math.round(btcBasis*10000)/10000,
      btcDominance:0,
      updateTime:timeStr
    };

    return new Response(JSON.stringify({ok:true,data:coins,market:marketData,ts:Date.now(),count:coins.length,updateTime:timeStr}),{status:200,headers:h});
  }catch(e){
    return new Response(JSON.stringify({ok:false,error:e.message}),{status:500,headers:h});
  }
}
