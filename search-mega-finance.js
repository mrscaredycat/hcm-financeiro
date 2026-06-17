const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();
  
  const endpoints = [
    '/api/FinanceiroMovimentacao/MovimentoBancario?pageSize=5',
    '/api/FinanceiroMovimentacao/MovimentoFinanceiro?pageSize=5',
    '/api/FinanceiroMovimentacao/CaixaEFinanceiro?pageSize=5',
    '/api/FinanceiroMovimentacao/Extrato?pageSize=5',
    '/api/FinanceiroMovimentacao/ExtratoBancario?pageSize=5',
    '/api/FinanceiroMovimentacao/ExtratoConta?pageSize=5',
    '/api/FinanceiroMovimentacao/SaldosBancarios?pageSize=5',
    '/api/financeirocadastros/ContaFinanceira?pageSize=5',
    '/api/financeirocadastros/ContasFinanceiras?pageSize=5',
    '/api/Financeiro/Agente?pageSize=5',
  ];
  
  for (const ep of endpoints) {
    try {
      const r = await fetch('https://rest.megaerp.online' + ep, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(8000)
      });
      const text = await r.text();
      console.log(ep.substring(0, 50), '->', r.status, '|', text.substring(0, 150));
    } catch(e) { console.log(ep.substring(0, 50), '-> ERR:', e.message.substring(0, 60)); }
  }
})().catch(console.error);
