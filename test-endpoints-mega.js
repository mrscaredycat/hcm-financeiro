const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();

  const paths = [
    '/api/FinanceiroMovimentacao/FaturaPagar/Fatura?pageSize=1',
    '/api/FinanceiroMovimentacao/FaturaReceber/Fatura?pageSize=1',
    '/api/FinanceiroMovimentacao/Financeiro/Extrato?pageSize=1',
    '/api/Financeiro/Extrato?pageSize=1',
    '/api/ControleBancario/Extrato?pageSize=1',
    '/api/ControleBancario/Movimento?pageSize=1',
    '/api/FinanceiroMovimentacao/BaixaPagar/Baixa?pageSize=1',
    '/api/FinanceiroMovimentacao/BaixaReceber/Baixa?pageSize=1',
    '/api/Financeiro/Baixa?pageSize=1',
    '/api/Bancos/Extrato?pageSize=1'
  ];

  for (const path of paths) {
    try {
      const r = await fetch('https://rest.megaerp.online' + path, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(4000)
      });
      console.log(path, '->', r.status);
      if (r.ok) {
        const d = await r.json();
        console.log('  Found data!', Array.isArray(d) ? d.length : (d.items ? d.items.length : 'Obj'));
      }
    } catch(e) {
      console.log(path, '->', e.message);
    }
  }
})().catch(console.error);
