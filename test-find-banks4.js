const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();

  const hoje = new Date().toISOString().slice(0, 10);

  // O Mega Agentes swagger (categoria 18) lista endpoints de Agente
  // Vamos pegar o swagger direto da API REST
  console.log('=== Tentando swagger da API principal ===');
  try {
    const r = await fetch('https://rest.megaerp.online/swagger/index.html', {
      headers: { 'Authorization': 'Bearer ' + accessToken },
      signal: AbortSignal.timeout(8000)
    });
    console.log('swagger index:', r.status, (await r.text()).substring(0, 100));
  } catch(e) { console.log('ERR swagger index'); }

  // Tentar o endpoint de agente com diferentes módulos
  console.log('\n=== Modulos possiveis para ContaFinanceira ===');
  const mods = [
    'financeirocadastros', 'FinanceiroCadastros', 'financeiro', 'Financeiro',
    'FinanceiroMovimentacao', 'caixa', 'Caixa', 'tesouraria', 'Tesouraria',
    'contabilidade', 'Contabilidade'
  ];
  const paths = ['ContaFinanceira', 'ContasCorrentes', 'CaixaBanco', 'ContaBancaria', 'Caixa'];
  
  for (const mod of mods) {
    for (const path of paths) {
      const ep = `/api/${mod}/${path}?pageSize=3`;
      try {
        const r = await fetch('https://rest.megaerp.online' + ep, {
          headers: { 'Authorization': 'Bearer ' + accessToken },
          signal: AbortSignal.timeout(5000)
        });
        if (r.status !== 404) {
          const text = await r.text();
          console.log(`✅ /api/${mod}/${path} -> ${r.status}: ${text.substring(0, 100)}`);
        }
      } catch(e) {}
    }
  }
  console.log('Done scanning modules.');

  // Também tentar FaturaPagar com codAgente dos bancos conhecidos para anos recentes
  console.log('\n=== FaturaPagar Saldo para banco 1001 em 2026 ===');
  const ep2 = `/api/FinanceiroMovimentacao/FaturaPagar/Saldo/Agente/1001/2026-01-01T00:00:00/${hoje}T23:59:59?expand=agente&pageSize=5`;
  try {
    const r = await fetch('https://rest.megaerp.online' + ep2, {
      headers: { 'Authorization': 'Bearer ' + accessToken },
      signal: AbortSignal.timeout(8000)
    });
    const text = await r.text();
    console.log('Status:', r.status, text.substring(0, 150));
  } catch(e) { console.log('ERR:', e.message); }
})().catch(console.error);
