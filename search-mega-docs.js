const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

(async () => {
  const r = await fetch('https://dev.mega.com.br/apis/lista.asp');
  const text = await r.text();
  const catRegex = /lista\.asp\?c=(\d+)">([^<]+)<\/a>/g;
  let m;
  const cats = [];
  while ((m = catRegex.exec(text)) !== null) {
    cats.push({ id: m[1], name: m[2].trim() });
  }
  console.log('Categories found:', cats.length);
  
  for (const cat of cats) {
    const rc = await fetch(`https://dev.mega.com.br/apis/lista.asp?c=${cat.id}`);
    const tc = await rc.text();
    const apiRegex = /href="detalhe\.asp\?c=(\d+)">.*?<\/i>\s*([^<]+)<\/a>/g;
    let m2;
    while ((m2 = apiRegex.exec(tc)) !== null) {
      if (m2[2].toLowerCase().includes('financeir') || m2[2].toLowerCase().includes('banco') || m2[2].toLowerCase().includes('movimento') || m2[2].toLowerCase().includes('extrato')) {
         console.log(`[${cat.name}] ${m2[2].trim()} -> c=${m2[1]}`);
      }
    }
  }
})().catch(console.error);
