const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const r = await fetch('https://dev.mega.com.br/apis/lista.asp?c=11');
  const text = await r.text();
  const regex = /<a class="hvr-forward" href="([^"]+)"><i[^>]+><\/i>([^<]+)<\/a>/g;
  let m;
  console.log('--- ERP Financeiro APIs ---');
  while ((m = regex.exec(text)) !== null) {
    console.log(m[2].trim(), '->', m[1]);
  }
})().catch(console.error);
