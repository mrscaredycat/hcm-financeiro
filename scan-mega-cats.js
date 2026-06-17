const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

(async () => {
  for (let c = 1; c <= 25; c++) {
    try {
      const rc = await fetch(`https://dev.mega.com.br/apis/lista.asp?c=${c}`);
      const tc = await rc.text();
      const apiRegex = /href="detalhe\.asp\?c=(\d+)">.*?<\/i>\s*([^<]+)<\/a>/g;
      let m2;
      while ((m2 = apiRegex.exec(tc)) !== null) {
        if (m2[2].toLowerCase().includes('financeir') || m2[2].toLowerCase().includes('banco') || m2[2].toLowerCase().includes('movimento') || m2[2].toLowerCase().includes('extrato') || m2[2].toLowerCase().includes('conta') || m2[2].toLowerCase().includes('fatura') || m2[2].toLowerCase().includes('saldo')) {
           console.log(`[Category ${c}] ${m2[2].trim()} -> detalhe.asp?c=${m2[1]}`);
        }
      }
    } catch(e) {}
  }
})().catch(console.error);
