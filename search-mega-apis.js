const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const r = await fetch('https://dev.mega.com.br/apis/lista.asp?q=Conta');
  const text = await r.text();
  const regex = /<a class="hvr-forward" href="([^"]+)"><i[^>]+><\/i>([^<]+)<\/a>/g;
  let m;
  console.log('--- Search Results for Conta ---');
  while ((m = regex.exec(text)) !== null) {
    console.log(m[2].trim(), '->', m[1]);
  }
  
  const r2 = await fetch('https://dev.mega.com.br/apis/lista.asp?q=Banco');
  const text2 = await r2.text();
  console.log('--- Search Results for Banco ---');
  while ((m = regex.exec(text2)) !== null) {
    console.log(m[2].trim(), '->', m[1]);
  }
  
  const r3 = await fetch('https://dev.mega.com.br/apis/lista.asp?q=Agente');
  const text3 = await r3.text();
  console.log('--- Search Results for Agente ---');
  while ((m = regex.exec(text3)) !== null) {
    console.log(m[2].trim(), '->', m[1]);
  }
})().catch(console.error);
