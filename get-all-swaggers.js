const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const r = await fetch('https://dev.mega.com.br/apis/lista.asp?c=11');
  const text = await r.text();
  const regex = /<a class="hvr-forward" href="([^"]+)"><i[^>]+><\/i>([^<]+)<\/a>/g;
  let m;
  console.log('--- ERP Financeiro APIs ---');
  while ((m = regex.exec(text)) !== null) {
    const link = 'https://dev.mega.com.br/apis/' + m[1];
    console.log(`Fetching details for ${m[2]}: ${link}`);
    try {
      const d = await fetch(link);
      const dt = await d.text();
      const swm = dt.match(/href="([^"]*swagger[^"]*)"/i);
      if (swm) {
        console.log(`  Swagger: ${swm[1]}`);
      } else {
        console.log(`  No swagger found`);
      }
    } catch(e) { console.log('  Error'); }
  }
})().catch(console.error);
