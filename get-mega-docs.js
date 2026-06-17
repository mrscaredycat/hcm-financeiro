const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const r = await fetch('https://dev.mega.com.br/apis/lista.asp');
  const text = await r.text();
  console.log(text.substring(0, 1000));
})().catch(console.error);
