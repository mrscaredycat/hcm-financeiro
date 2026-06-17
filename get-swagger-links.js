const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const r = await fetch('https://dev.mega.com.br/apis/detalhe.asp?c=18');
  const text = await r.text();
  const linkMatches = text.match(/href="([^"]+)"/g);
  let hasSwagger = false;
  if (linkMatches) {
    for (const match of linkMatches) {
      if (match.toLowerCase().includes('swagger')) {
        console.log('Swagger link in 18:', match);
        hasSwagger = true;
      }
    }
  }
  if (!hasSwagger) {
    console.log('No swagger link found in Agentes (18), looking at all links:');
    const links = Array.from(new Set(linkMatches || []));
    for (let i=0; i<Math.min(links.length, 30); i++) console.log(links[i]);
  }
})().catch(console.error);
