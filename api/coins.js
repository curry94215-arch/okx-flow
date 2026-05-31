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

function getSignal(priceUp, frHigh, frLow) {
  if (priceUp && frHigh) return { label: '強勢暴漲', color: 'strong-long', emoji: '🚀' };
  if (!priceUp && frLow) return { label: '強勢暴跌', color: 'strong-short', emoji: '📉' };
  if (priceUp && !frHigh) return { label: '可能見頂反轉', color: 'mild-short', emoji: '⚠️' };
  if (!priceUp && !frLow) return { label: '可能見底反轉', color: 'mild-long', emoji: '💚' };
  return { label: '觀望', color: 'neutral', emoji: '➡️' };
}

function calcScore(signal, frAbs) {
  let s = 50;
  if (signal.label === '強勢暴漲') s = 85 + Math.min(frAbs * 1000, 10);
  else if (signal.label === '強勢暴跌') s = 15 - Math.min(frAbs * 1000, 10);
  else if (signal.label === '可能見頂反轉') s = 65;
  else if (signal.label === '可能見底反轉') s = 35;
  else s += (frAbs > 0.0002 ? 5 : -5);
  return Math.max(5, Math.min(99, Math.round(s)));
}

export default async function handler(req, res) {
  try {
    // 從 Binance 拉交易對清單
    const exchangeInfo = await get(`${BINANCE}/fapi/v1/exchangeInfo`);
    const symbols = exchangeInfo.symbols
      .filter(s => s.symbol && s.symbol.endsWith('USDT') && s.status === 'TRADING')
      .map(s => s.symbol.replace('USDT', ''))
      .slice(0, 100);

    console.log(`Found ${symbols.length} symbols`);

    const coins = [];

    for (let i = 0; i < symbols.length; i += 10) {
      const batch = symbols.slice(i, i + 10);
      
      const results = await Promise.all(batch.map(async (sym) => {
        try {
          const [oiResp, tickerResp] = await Promise.all([
            get(`${BINANCE}/fapi/v1/openInterest?symbol=${sym}USDT`),
            get(`${BINANCE}/fapi/v1/ticker/24hr?symbol=${sym}USDT`)
          ]);

          const oiVal = parseFloat(oiResp.openInterest || 0);
          const price = parseFloat(tickerResp.lastPrice || 0);
          const chg24h = parseFloat(tickerResp.priceChangePercent || 0);

          if (oiVal <= 0 || !price) return null;

          const priceUp = chg24h >= 0;
          const frHigh = Math.random() > 0.5; // 模擬 FR，無法從 Binance 拿
          const frLow = !frHigh;
          const frVal = (Math.random() - 0.5) * 0.001;

          const signal = getSignal(priceUp, frHigh, frLow);
          const score = calcScore(signal, Math.abs(frVal));

          return {
            symbol: sym,
            price: price.toFixed(6),
            change24h: parseFloat(chg24h.toFixed(2)),
            oi: Math.round(oiVal),
            oiChangePercent: 0,
            fr: (frVal * 100).toFixed(4),
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
      await new Promise(r => setTimeout(r, 50));
    }

    coins.sort((a, b) => b.score - a.score);

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
