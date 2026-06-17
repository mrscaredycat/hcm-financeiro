const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();

  console.log('=== Testando listagem do globalagente/Agente ===');
  const listEndpoints = [
    '/api/globalagente/Agente?pageSize=5',
    '/api/globalagente/Agente?$top=5',
    '/api/globalagente/Agente?pageSize=5&expand=tipos',
    '/api/globalagente/Agente?pageSize=5&tipo=ContaFinanceira',
    "/api/globalagente/Agente?pageSize=5&$filter=tipos/any(t:t/tipo eq 'ContaFinanceira')",
  ];
  for (const ep of listEndpoints) {
    try {
      const r = await fetch('https://rest.megaerp.online' + ep, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(8000)
      });
      const text = await r.text();
      console.log(ep.substring(0,70), '->', r.status, text.substring(0, 80));
    } catch(e) { console.log(ep.substring(0,40), '-> ERR:', e.message); }
  }

  console.log('\n=== Testando se o Swagger da Mega tem endpoints de ContaFinanceira ===');
  // Tenta endpoint de swagger da API do globalagente
  const swaggerEndpoints = [
    '/api/globalagente/swagger.json',
    '/api/globalagente/swagger/v1/swagger.json',
    '/swagger/v1/swagger.json',
  ];
  for (const ep of swaggerEndpoints) {
    try {
      const r = await fetch('https://rest.megaerp.online' + ep, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(5000)
      });
      console.log(ep, '->', r.status, (await r.text()).substring(0, 60));
    } catch(e) { console.log(ep, '-> ERR'); }
  }

  console.log('\n=== Pegando TODOS os agents da Filial via FaturaPagar HISTORICO ===');
  // Já sabemos que SaldoEmAberto retorna agentes com Filial.Id
  // Mas esses são clientes. Os bancos aparecem em transações passadas?
  // Vamos tentar Saldo (não SaldoEmAberto) com data bem ampla para a filial 100
  const ep = '/api/FinanceiroMovimentacao/FaturaPagar/Saldo/Filial/100/2024-01-01T00:00:00/2024-01-31T23:59:59?expand=agente&pageSize=5';
  try {
    const r = await fetch('https://rest.megaerp.online' + ep, {
      headers: { 'Authorization': 'Bearer ' + accessToken },
      signal: AbortSignal.timeout(15000)
    });
    const text = await r.text();
    console.log('FaturaPagar/Saldo/Filial (jan 2024, pageSize=5):', r.status, text.substring(0, 200));
  } catch(e) { console.log('ERR:', e.message); }
})().catch(console.error);
