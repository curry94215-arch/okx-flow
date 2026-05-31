const OKX = 'https://www.okx.com/api/v5';
const BINANCE = 'https://fapi.binance.com';

async function get(url) {
  try {
    const r = await fetch(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0' }, 
      signal: AbortSignal.timeout(10000) 
    });
    const j = await r.json();
    return j;
  } catch (e) {
    console.error('Fetch error:', url, e);
    return {}; 
  }
}

// 信號判斷
function getSignal(priceUp, oiUp, frHigh, frLow) {
  if (priceUp && oiUp && frHigh) return { label: '強勢暴漲', color: 'strong-long', emoji: '🚀' };
  if (!priceUp && oiUp && frLow) return { label: '強勢暴跌', color: 'strong-short', emoji: '📉' };
  if (priceUp && !oiUp && frHigh) return { label: '可能見頂反轉', color: 'mild-short', emoji: '⚠️' };
  if (!priceUp && !oiUp && frLow) return { label: '可能見底反轉', color: 'mild-long', emoji: '💚' };
  return { label: '觀望', color: 'neutral', emoji: '➡️' };
}

// 評分
function calcScore(signal, oiChg, frAbs) {
  let s = 50;
  if (signal.label === '強勢暴漲') s = 85 + Math.min(Math.abs(oiChg) * 2, 10) + Math.min(frAbs * 1000, 5);
  else if (signal.label === '強勢暴跌') s = 15 - Math.min(Math.abs(oiChg) * 2, 10) - Math.min(frAbs * 1000, 5);
  else if (signal.label === '可能見頂反轉') s = 65 - Math.min(Math.abs(oiChg) * 1, 5);
  else if (signal.label === '可能見底反轉') s = 35 + Math.min(Math.abs(oiChg) * 1, 5);
  else s += (oiChg > 0 ? 3 : -3) + (frAbs > 0.0002 ? 3 : -3);
  return Math.max(5, Math.min(99, Math.round(s)));
}

export default async function handler(req, res) {
  try {
    const instResp = await get(`${OKX}/public/instruments?instType=SWAP`);
    const symbols = instResp.data
      .filter(i => i && i.instId && i.instId.endsWith('-SWAP'))
      .map(i => i.instId)
      .slice(0, 100);

    console.log(`Found ${symbols.length} symbols`);

    const coins = [];

    for (let i = 0; i < symbols.length; i += 10) {
      const batch = symbols.slice(i, i + 10);
      
      const results = await Promise.all(batch.map(async (sym) => {
        try {
          const binSym = sym.replace('-SWAP', '');
          
          const [frResp, tickerResp, binanceResp] = await Promise.all([
            get(`${OKX}/public/funding-rate?instId=${sym}`),
            get(`${OKX}/market/ticker?instId=${sym}`),
            get(`${BINANCE}/fapi/v1/openInterest?symbol=${binSym}USDT`)
          ]);

          const fr = frResp.data?.[0];
          const ticker = tickerResp.data?.[0];

          if (!fr || !ticker) return null;

          const oiVal = parseFloat(binanceResp.openInterest || 0);
          const frVal = parseFloat(fr.fundingRate || 0);
          const price = parseFloat(ticker.last || 0);
          const chg24h = parseFloat(ticker.change24h || 0);
          const priceUp = chg24h >= 0;

          if (oiVal <= 0 || !price) return null;

          const oiChg = 0;
          const oiUp = false;
          const frHigh = frVal > 0.0003;
          const frLow = frVal < -0.0003;

          const signal = getSignal(priceUp, oiUp, frHigh, frLow);
          const score = calcScore(signal, oiChg, Math.abs(frVal));

          return {
            symbol: binSym,
            price: parseFloat(price.toFixed(6)),
            change24h: parseFloat((chg24h * 100).toFixed(2)),
            oi: parseFloat(oiVal.toFixed(0)),
            oiChangePercent: 0,
            fr: parseFloat((frVal * 100).toFixed(4)),
            signal: signal.label,
            score: score,
            color: signal.color,
            emoji: signal.emoji
          };
        } catch (e) {
          console.error(`Error ${sym}:`, e.message);
          return null;
        }
      }));

      coins.push(...results.filter(c => c !== null));
      await new Promise(r => setTimeout(r, 100));
    }

    coins.sort((a, b) => b.score - a.score);

    console.log(`Returning ${coins.length} coins`);

    return res.status(200).json({
      ok: true,
      data: coins.slice(0, 100),
      count: coins.length,
      updateTime: new Date().toLocaleTimeString('zh-TW', { hour12: false })
    });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}
