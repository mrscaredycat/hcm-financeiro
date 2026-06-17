const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  // Pega a lista de TODAS as categorias de API do Mega
  const cats = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  for (const c of cats) {
    const r = await fetch(`https://dev.mega.com.br/apis/lista.asp?c=${c}`);
    const text = await r.text();
    const regex = /href="(detalhe\.asp\?c=\d+)"[^>]*>\s*<i[^>]+><\/i>\s*([^<]+)/g;
    let m;
    while ((m = regex.exec(text)) !== null) {
      console.log(`CAT${c}:`, m[2].trim(), '->', m[1]);
    }
  }
})().catch(console.error);
