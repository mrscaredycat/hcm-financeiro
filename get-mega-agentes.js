const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const r = await fetch('https://dev.mega.com.br/apis/detalhe.asp?c=18');
  const text = await r.text();
  console.log(text.substring(0, 1000));
  // extract api docs link
  const m = text.match(/href="([^"]+)"[^>]*>Acessar a documentação/);
  if (m) console.log('Doc link:', m[1]);
  else console.log('Doc link not found');
})().catch(console.error);
