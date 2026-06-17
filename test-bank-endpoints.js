const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();

  const endpoints = [
    '/api/FinanceiroMovimentacao/MovimentoBancario?pageSize=1',
    '/api/FinanceiroMovimentacao/SaldoBancario?pageSize=1',
    '/api/FinanceiroMovimentacao/Extrato?pageSize=1',
    '/api/FinanceiroMovimentacao/ExtratoBancario?pageSize=1',
    '/api/FinanceiroMovimentacao/LancamentoBancario?pageSize=1',
    '/api/FinanceiroMovimentacao/MovimentacaoBancaria?pageSize=1',
    '/api/Financeiro/MovimentoBancario?pageSize=1',
    '/api/Financeiro/Extrato?pageSize=1',
    '/api/Financeiro/SaldoConta?pageSize=1'
  ];

  for (const ep of endpoints) {
    try {
      const r = await fetch('https://rest.megaerp.online' + ep, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(5000)
      });
      console.log(ep, '->', r.status);
      if (r.ok) {
        const d = await r.json();
        console.log('  Data:', JSON.stringify(d).substring(0, 100));
      }
    } catch(e) { console.log(ep, '-> ERR:', e.message); }
  }
})().catch(console.error);
