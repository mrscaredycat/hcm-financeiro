const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();

  const paths = [
    '/api/FinanceiroMovimentacao/FaturaPagar?$top=1',
    '/api/FinanceiroMovimentacao/FaturaReceber?$top=1',
    '/api/FinanceiroMovimentacao/BaixaPagar?$top=1',
    '/api/FinanceiroMovimentacao/BaixaReceber?$top=1',
    '/api/FinanceiroMovimentacao/MovimentoBancario?$top=1',
    '/api/FinanceiroMovimentacao/ChequePagar?$top=1'
  ];

  for (const path of paths) {
    try {
      const r = await fetch('https://rest.megaerp.online' + path, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(5000)
      });
      console.log(path, '->', r.status);
      if (r.ok) {
        const d = await r.json();
        console.log('  Keys:', Object.keys(d));
      }
    } catch(e) {
      console.log(path, '-> Error');
    }
  }
})().catch(console.error);
