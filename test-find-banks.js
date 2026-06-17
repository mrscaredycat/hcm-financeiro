const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();

  // Agentes que sabemos ser bancos (da tela): 1001, 1099, 2534, 2535, 2548
  // Precisamos descobrir o ID deles no formato "X-YYYY" pra chamar o globalagente
  // Vamos tentar prefixos de 1 a 9 no ID
  const codigosBanco = [1001, 1099, 2534, 2535, 2548, 6084];

  console.log('=== TENTATIVA 1: Buscar por globalagente com prefixo 1-CODIGO ===');
  for (const cod of codigosBanco) {
    for (const prefix of ['1', '100', '200']) {
      const id = `${prefix}-${cod}`;
      try {
        const r = await fetch(`https://rest.megaerp.online/api/globalagente/Agente/${id}?expand=tipos`, {
          headers: { 'Authorization': 'Bearer ' + accessToken },
          signal: AbortSignal.timeout(5000)
        });
        if (r.ok) {
          const d = await r.json();
          const tipos = (d.tipos || []).map(t => t.tipo).join(', ');
          console.log(`  ✅ ID ${id} -> Cod ${d.codigo} | Nome: ${d.nome} | Tipos: [${tipos}]`);
          break;
        }
      } catch(e) {}
    }
  }

  console.log('\n=== TENTATIVA 2: Endpoint de Baixas (pagamentos liquidados) ===');
  const baixaEndpoints = [
    `/api/FinanceiroMovimentacao/BaixaPagar?pageSize=5`,
    `/api/FinanceiroMovimentacao/BaixaReceber?pageSize=5`,
    `/api/FinanceiroMovimentacao/Baixa?pageSize=5`,
    `/api/FinanceiroMovimentacao/Liquidacao?pageSize=5`,
  ];
  for (const ep of baixaEndpoints) {
    try {
      const r = await fetch('https://rest.megaerp.online' + ep, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(8000)
      });
      const text = await r.text();
      console.log(ep.split('?')[0].split('/').pop(), '->', r.status, text.substring(0, 120));
    } catch(e) { console.log(ep.split('/').pop(), '-> ERR'); }
  }

  console.log('\n=== TENTATIVA 3: ContaFinanceira endpoints diretos ===');
  const contaEndpoints = [
    `/api/FinanceiroCadastros/ContaFinanceira?pageSize=5`,
    `/api/financeirocadastros/ContaFinanceira?pageSize=5`,
    `/api/Financeiro/ContaFinanceira?pageSize=5`,
    `/api/globalagente/ContaFinanceira?pageSize=5`,
  ];
  for (const ep of contaEndpoints) {
    try {
      const r = await fetch('https://rest.megaerp.online' + ep, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(8000)
      });
      const text = await r.text();
      console.log(ep.split('/')[3], '->', r.status, text.substring(0, 120));
    } catch(e) { console.log(ep, '-> ERR'); }
  }
})().catch(console.error);
