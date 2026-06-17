const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();

  const urls = [
    'https://rest.megaerp.online/swagger/v1/swagger.json',
    'https://rest.megaerp.online/swagger/docs/v1',
    'https://rest.megaerp.online/api/FinanceiroMovimentacao/swagger/v1/swagger.json',
    'https://rest.megaerp.online/api/Financeiro/swagger/v1/swagger.json'
  ];

  for (const url of urls) {
    try {
      const r = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + accessToken }
      });
      console.log(url, '->', r.status);
      if (r.ok) {
        const text = await r.text();
        console.log('Got swagger from', url, 'length:', text.length);
        import('fs').then(fs => fs.writeFileSync('swagger.json', text));
        return;
      }
    } catch(e) {
      console.log(url, '->', e.message);
    }
  }
})().catch(console.error);
