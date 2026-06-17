const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();

  const codes = ['1001', '1-1001', '2534', '1-2534'];
  const baseRoutes = [
    '/api/FinanceiroMovimentacao/Extrato',
    '/api/FinanceiroMovimentacao/ExtratoBancario',
    '/api/FinanceiroMovimentacao/MovimentoBancario',
    '/api/FinanceiroMovimentacao/Movimentacao',
    '/api/FinanceiroMovimentacao/FichaFinanceira',
    '/api/FinanceiroMovimentacao/Ficha',
    '/api/Financeiro/Extrato',
    '/api/Financeiro/Movimento',
    '/api/Financeiro/FichaFinanceira',
    '/api/ControleBancario/Extrato',
    '/api/ControleBancario/ExtratoBancario',
    '/api/ControleBancario/Movimento',
    '/api/ControleBancario/FichaFinanceira'
  ];

  for (const cod of codes) {
    for (const base of baseRoutes) {
      const urls = [
        `${base}/Agente/${cod}`,
        `${base}/Agente/${cod}/2026-01-01/2026-12-31`,
        `${base}/Conta/${cod}`,
        `${base}/ContaFinanceira/${cod}`,
        `${base}?agente=${cod}&pageSize=10`
      ];
      for (const ep of urls) {
        try {
          const r = await fetch('https://rest.megaerp.online' + ep, {
            headers: { 'Authorization': 'Bearer ' + accessToken },
            signal: AbortSignal.timeout(4000)
          });
          if (r.ok) {
            const d = await r.json();
            const items = Array.isArray(d) ? d : (d.items || d.value || []);
            console.log(`✅ ACHEI DADOS NO ENDPOINT: ${ep} (${items.length} itens)`);
          }
        } catch(e) {}
      }
    }
  }
})().catch(console.error);
