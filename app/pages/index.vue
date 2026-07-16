<template>
  <UContainer class="max-w-7xl animate-in fade-in duration-500">
    
    <!-- Hero / Title Section -->
    <div class="mb-10 relative bg-white border border-slate-200/60 shadow-sm rounded-2xl p-8 overflow-hidden">
      <!-- Subtle background decoration -->
      <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-50 to-transparent pointer-events-none opacity-50"></div>
      
      <div class="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-100 text-orange-700 text-xs font-bold mb-3 uppercase tracking-wider">
            <UIcon name="i-lucide-pie-chart" class="w-3.5 h-3.5" />
            Módulo Financeiro
          </div>
          <h1 class="text-3xl md:text-4xl font-extrabold mb-2 text-slate-900 tracking-tight">
            Ficha Financeira de Agentes
          </h1>
          <p class="text-slate-500 text-base md:text-lg max-w-2xl font-medium">
            Gerencie e consulte saldos, entradas e saídas de agentes integrados ao Mega ERP de forma rápida e segura.
          </p>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <UButton
            :loading="loadingAgentes"
            color="orange"
            :icon="agentes.length > 0 ? 'i-lucide-refresh-cw' : 'i-lucide-search'"
            :label="agentes.length > 0 ? 'Atualizar Dados' : 'Buscar Agentes'"
            size="lg"
            class="w-full sm:w-auto font-semibold shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all rounded-lg"
            @click="buscarAgentes"
          />
          <UButton
            v-if="agentes.length > 0"
            variant="soft"
            color="gray"
            icon="i-lucide-x"
            label="Limpar"
            size="lg"
            class="w-full sm:w-auto font-semibold rounded-lg"
            @click="limparTudo"
          />
        </div>
      </div>
    </div>

    <!-- ===== ERRO ===== -->
    <UAlert
      v-if="erroAgentes && !loadingAgentes"
      color="error"
      icon="i-lucide-triangle-alert"
      title="Erro ao buscar agentes"
      :description="erroAgentes"
      class="mb-6"
    />

    <!-- ===== LOADING AGENTES ===== -->
    <div v-if="loadingAgentes" class="flex flex-col items-center justify-center py-16 gap-4">
      <UIcon name="i-lucide-loader-circle" class="text-orange-500 animate-spin h-10 w-10" />
      <p class="text-gray-500 text-sm">Buscando bancos e contas financeiras...</p>
    </div>

    <!-- ===== CONTEÚDO PRINCIPAL (tabs) ===== -->
    <template v-if="!loadingAgentes && agentes.length > 0">
      <!-- Tabs -->
      <div class="flex items-center gap-1 mb-4 border-b border-gray-200">
        <button
          class="tab-btn"
          :class="abaAtiva === 'agentes' ? 'tab-btn--ativa' : ''"
          @click="abaAtiva = 'agentes'"
        >
          <UIcon name="i-lucide-users" class="h-4 w-4" />
          Agentes
          <UBadge :label="String(agentesFiltrados.length)" color="warning" variant="soft" size="xs" />
        </button>
        <button
          class="tab-btn"
          :class="abaAtiva === 'ficha' ? 'tab-btn--ativa' : ''"
          :disabled="!agenteSelecionado"
          @click="abaAtiva = 'ficha'"
        >
          <UIcon name="i-lucide-bar-chart-horizontal" class="h-4 w-4" />
          Ficha Financeira
          <span v-if="!agenteSelecionado" class="text-xs text-gray-400 font-normal ml-1">(selecione um agente)</span>
        </button>
      </div>

      <!-- ===== ABA: AGENTES ===== -->
      <template v-if="abaAtiva === 'agentes'">
        <!-- Barra de busca + info -->
        <div class="flex items-center gap-3 mb-4">
          <UInput
            v-model="buscaAgente"
            icon="i-lucide-search"
            placeholder="Buscar por nome, código, cidade..."
            size="sm"
            class="flex-1 max-w-sm"
          />
          <span class="text-xs text-gray-400 ml-auto">
            {{ agentesFiltrados.length }} agentes encontrados
          </span>
        </div>

        <UCard class="shadow-sm border-slate-200/60 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50/80">
                  <th
                    v-for="col in colunasAgentes"
                    :key="col.key"
                    class="text-left px-4 py-3.5 font-bold text-slate-700 text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-orange-600 transition-colors select-none"
                    @click="ordenarAgentes(col.key)"
                  >
                    <div class="flex items-center gap-1.5">
                      {{ col.label }}
                      <UIcon
                        v-if="ordemAgenteCol === col.key"
                        :name="ordemAgenteDir === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'"
                        class="text-orange-500 h-3.5 w-3.5"
                      />
                    </div>
                  </th>
                  <th class="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 text-center">Ação</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="ag in agentesPaginados"
                  :key="ag._uid"
                  class="hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                  :class="{ 'bg-orange-50/50 ring-1 ring-inset ring-orange-200': agenteSelecionado?._uid === ag._uid }"
                  @click="selecionarAgente(ag)"
                >
                  <td class="px-4 py-3 font-mono text-xs text-slate-500 font-medium">{{ ag.Codigo ?? ag.codigo ?? '—' }}</td>
                  <td class="px-4 py-3 text-slate-900 font-semibold max-w-[200px] truncate" :title="ag.NomeFantasia ?? ag.nomeFantasia">
                    {{ ag.NomeFantasia ?? ag.nomeFantasia ?? ag.RazaoSocial ?? ag.razaoSocial ?? '—' }}
                  </td>
                  <td class="px-4 py-3 text-slate-600 max-w-[200px] truncate" :title="ag.RazaoSocial ?? ag.razaoSocial">
                    {{ ag.RazaoSocial ?? ag.razaoSocial ?? '—' }}
                  </td>
                  <td class="px-4 py-3">
                    <UBadge
                      :label="ag.TipoAgente ?? ag.tipoAgente ?? ag.Tipo ?? '—'"
                      color="gray"
                      variant="subtle"
                      size="xs"
                      class="font-medium"
                    />
                  </td>
                  <td class="px-4 py-3 text-center">
                    <UBadge
                      :label="ag.FJ ?? ag.fj ?? ag.PessoaFisicaJuridica ?? '—'"
                      :color="(ag.FJ ?? ag.fj ?? ag.PessoaFisicaJuridica) === 'J' ? 'blue' : 'emerald'"
                      variant="soft"
                      size="xs"
                      class="font-bold"
                    />
                  </td>
                  <td class="px-4 py-3 text-slate-500 text-xs font-medium">{{ ag.UF ?? ag.uf ?? '—' }}</td>
                  <td class="px-4 py-3 text-slate-600 max-w-[140px] truncate" :title="getMunicipio(ag)">
                    {{ getMunicipio(ag) }}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <UButton
                      size="xs"
                      variant="ghost"
                      color="orange"
                      icon="i-lucide-bar-chart-horizontal"
                      label="Ver Ficha"
                      class="font-semibold hover:bg-orange-100"
                      @click.stop="verFichaAgente(ag)"
                    />
                  </td>
                </tr>
                <tr v-if="agentesPaginados.length === 0">
                  <td colspan="9" class="px-3 py-10 text-center text-gray-400">
                    Nenhum agente encontrado.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginação -->
          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p class="text-xs text-gray-500">
              Mostrando {{ Math.min((paginaAgentes - 1) * itensPorPagina + 1, agentesFiltrados.length) }}–{{ Math.min(paginaAgentes * itensPorPagina, agentesFiltrados.length) }} de {{ agentesFiltrados.length }} agentes
            </p>
            <UPagination
              v-model:page="paginaAgentes"
              :total="agentesFiltrados.length"
              :items-per-page="itensPorPagina"
              size="sm"
            />
          </div>
        </UCard>
      </template>

      <!-- ===== ABA: FICHA FINANCEIRA ===== -->
      <template v-if="abaAtiva === 'ficha'">
        <template v-if="agenteSelecionado">
          <!-- Cabeçalho do agente -->
          <UCard class="mb-6 border-slate-200/60 shadow-sm rounded-xl overflow-hidden bg-slate-50/50">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="p-3 bg-white border border-slate-200 rounded-lg shadow-sm hidden sm:block">
                  <UIcon name="i-lucide-building-2" class="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Agente Selecionado</p>
                  <h2 class="text-xl font-extrabold text-slate-900 leading-none mb-1">
                    {{ agenteSelecionado.NomeFantasia ?? agenteSelecionado.nomeFantasia ?? agenteSelecionado.RazaoSocial ?? '—' }}
                  </h2>
                  <p class="text-sm text-slate-500 font-medium">
                    Código: <strong class="text-slate-700 font-mono">{{ agenteSelecionado.Codigo ?? agenteSelecionado.codigo }}</strong>
                    <span class="mx-1.5 text-slate-300">•</span>
                    {{ agenteSelecionado.UF ?? agenteSelecionado.uf }} – {{ getMunicipio(agenteSelecionado) }}
                  </p>
                </div>
              </div>
              
              <div class="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm w-full md:w-auto">
                <div class="flex items-center gap-2">
                  <label class="text-xs text-slate-500 font-bold uppercase tracking-wider ml-2">Ano</label>
                  <UInput
                    v-model="anoFicha"
                    type="number"
                    min="2000"
                    max="2099"
                    class="w-24"
                    size="sm"
                    color="gray"
                  />
                </div>
                <div class="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
                <UButton
                  :loading="loadingFicha"
                  color="orange"
                  icon="i-lucide-refresh-cw"
                  label="Carregar"
                  size="sm"
                  class="font-semibold"
                  @click="buscarFicha"
                />
                <UButton
                  variant="ghost"
                  color="gray"
                  icon="i-lucide-arrow-left"
                  label="Voltar"
                  size="sm"
                  class="font-semibold"
                  @click="abaAtiva = 'agentes'"
                />
              </div>
            </div>
          </UCard>

          <!-- Loading ficha -->
          <div v-if="loadingFicha" class="flex flex-col items-center justify-center py-12 gap-3">
            <UIcon name="i-lucide-loader-circle" class="text-orange-500 animate-spin h-8 w-8" />
            <p class="text-gray-500 text-sm">Carregando ficha financeira...</p>
          </div>

          <!-- Erro ficha -->
          <UAlert
            v-if="erroFicha && !loadingFicha"
            color="error"
            icon="i-lucide-triangle-alert"
            title="Erro ao carregar ficha financeira"
            :description="erroFicha"
            class="mb-4"
          />

          <!-- Resumo Financeiro (Cards) -->
          <div v-if="!loadingFicha && fichaFinanceira.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Entradas do Mês -->
            <UCard class="bg-emerald-50/50 border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2 text-emerald-600 mb-2">
                  <UIcon name="i-lucide-arrow-down-to-line" class="w-5 h-5" />
                  <span class="text-sm font-semibold uppercase tracking-wider">Entradas do Mês</span>
                </div>
                <div class="text-2xl font-bold text-slate-800">
                  {{ formatCurrency(Number(fichaFinanceira[0].ENTRADAS_MES ?? 0)) }}
                </div>
              </div>
            </UCard>

            <!-- Saídas do Mês -->
            <UCard class="bg-rose-50/50 border-rose-100 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2 text-rose-600 mb-2">
                  <UIcon name="i-lucide-arrow-up-from-line" class="w-5 h-5" />
                  <span class="text-sm font-semibold uppercase tracking-wider">Saídas do Mês</span>
                </div>
                <div class="text-2xl font-bold text-slate-800">
                  {{ formatCurrency(Number(fichaFinanceira[0].SAIDAS_MES ?? 0)) }}
                </div>
              </div>
            </UCard>

            <!-- Saldo do Mês -->
            <UCard class="bg-blue-50/50 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2 text-blue-600 mb-2">
                  <UIcon name="i-lucide-calculator" class="w-5 h-5" />
                  <span class="text-sm font-semibold uppercase tracking-wider">Saldo do Mês</span>
                </div>
                <div class="text-2xl font-bold" :class="Number(fichaFinanceira[0].SALDO_MES) >= 0 ? 'text-blue-700' : 'text-rose-600'">
                  {{ formatCurrency(Number(fichaFinanceira[0].SALDO_MES ?? 0)) }}
                </div>
              </div>
            </UCard>

            <!-- Saldo Atual (Histórico) -->
            <UCard class="bg-slate-50 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2 text-slate-600 mb-2">
                  <UIcon name="i-lucide-landmark" class="w-5 h-5" />
                  <span class="text-sm font-semibold uppercase tracking-wider">Saldo Atual (Geral)</span>
                </div>
                <div class="text-2xl font-extrabold" :class="Number(fichaFinanceira[0].SALDO_ATUAL) >= 0 ? 'text-slate-900' : 'text-rose-700'">
                  {{ formatCurrency(Number(fichaFinanceira[0].SALDO_ATUAL ?? 0)) }}
                </div>
              </div>
            </UCard>
          </div>

          <!-- Empty state ficha -->
          <div
            v-if="!loadingFicha && !erroFicha && fichaFinanceira.length === 0 && fichaCarregada"
            class="flex flex-col items-center justify-center py-16 text-center"
          >
            <UIcon name="i-lucide-inbox" class="h-12 w-12 text-gray-200 mb-3" />
            <p class="text-gray-500 font-medium">Nenhum dado encontrado para este agente no período</p>
            <p class="text-gray-400 text-sm mt-1">Tente outro ano ou verifique se o agente possui movimentação.</p>
          </div>

          <!-- Prompt inicial ficha -->
          <div
            v-if="!loadingFicha && !fichaCarregada"
            class="flex flex-col items-center justify-center py-16 text-center"
          >
            <UIcon name="i-lucide-bar-chart-horizontal" class="h-12 w-12 text-orange-200 mb-3" />
            <p class="text-gray-500 font-medium">Clique em <strong>Carregar</strong> para buscar a ficha financeira</p>
            <p class="text-gray-400 text-sm mt-1">Selecione o ano desejado e clique no botão acima.</p>
          </div>
        </template>

        <!-- Nenhum agente selecionado -->
        <div v-else class="flex flex-col items-center justify-center py-20 text-center">
          <UIcon name="i-lucide-user-search" class="h-14 w-14 text-orange-200 mb-4" />
          <p class="text-gray-500 font-medium">Nenhum agente selecionado</p>
          <p class="text-gray-400 text-sm mt-1">Vá para a aba <strong>Agentes</strong> e clique em <strong>Ficha</strong> em um agente.</p>
          <UButton class="mt-4" variant="soft" color="warning" icon="i-lucide-users" label="Ver Agentes" @click="abaAtiva = 'agentes'" />
        </div>
      </template>
    </template>

    <div
      v-if="!loadingAgentes && !erroAgentes && agentes.length === 0"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <UIcon name="i-lucide-users" class="h-16 w-16 text-orange-200 mb-4" />
      <p class="text-gray-500 font-medium">Nenhuma consulta realizada ainda</p>
      <p class="text-gray-400 text-sm mt-1">Clique em <strong>Buscar Bancos</strong> para iniciar</p>
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
useHead({
  title: 'Ficha Financeira de Agentes — HCM Financeiro',
  meta: [{ name: 'description', content: 'Consulta de agentes e ficha financeira mensal do Mega ERP por filial' }]
})

// =====================
// Agentes
// =====================
const agentes = ref<any[]>([])
const loadingAgentes = ref(false)
const erroAgentes = ref('')

onMounted(() => {
  try {
    const cached = localStorage.getItem('hcm_agentes_cache')
    if (cached) {
      agentes.value = JSON.parse(cached)
    } else {
      // Se não tiver cache, busca automaticamente
      buscarAgentes()
    }
  } catch (e) {
    console.error('Erro ao ler cache', e)
  }
})

const buscaAgente = ref('')
const ordemAgenteCol = ref('Codigo')
const ordemAgenteDir = ref<'asc' | 'desc'>('asc')
const paginaAgentes = ref(1)
const itensPorPagina = 50

const colunasAgentes = [
  { key: 'Codigo', label: 'Código' },
  { key: 'NomeFantasia', label: 'Nome Fantasia' },
  { key: 'RazaoSocial', label: 'Razão Social' },
  { key: 'TipoAgente', label: 'Tipo' },
  { key: 'FJ', label: 'F/J' },
  { key: 'UF', label: 'UF' },
  { key: 'municipio', label: 'Município' }
]

function getMunicipio(ag: any): string {
  return ag.municipio?.Descricao ?? ag.municipio?.descricao ?? ag.Municipio ?? ag.municipio ?? ag.NomeMunicipio ?? '—'
}

const agentesFiltrados = computed(() => {
  let items = [...agentes.value]
  if (buscaAgente.value) {
    const t = buscaAgente.value.toLowerCase()
    items = items.filter(ag =>
      JSON.stringify(ag).toLowerCase().includes(t)
    )
  }
  items.sort((a, b) => {
    const col = ordemAgenteCol.value
    let va = a[col] ?? ''
    let vb = b[col] ?? ''
    if (typeof va === 'string') va = va.toLowerCase()
    if (typeof vb === 'string') vb = vb.toLowerCase()
    if (va < vb) return ordemAgenteDir.value === 'asc' ? -1 : 1
    if (va > vb) return ordemAgenteDir.value === 'asc' ? 1 : -1
    return 0
  })
  return items
})

const agentesPaginados = computed(() => {
  const start = (paginaAgentes.value - 1) * itensPorPagina
  return agentesFiltrados.value.slice(start, start + itensPorPagina)
})

function ordenarAgentes(col: string) {
  if (ordemAgenteCol.value === col) {
    ordemAgenteDir.value = ordemAgenteDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    ordemAgenteCol.value = col
    ordemAgenteDir.value = 'asc'
  }
  paginaAgentes.value = 1
}

async function buscarAgentes() {
  loadingAgentes.value = true
  erroAgentes.value = ''
  agentes.value = []
  paginaAgentes.value = 1
  agenteSelecionado.value = null
  fichaFinanceira.value = []
  fichaCarregada.value = false

  try {
    const data = await $fetch<any>(`/api/financeiro/agentes`)

    if (data?.error) {
      erroAgentes.value = data.error
    } else {
      const items: any[] = Array.isArray(data)
        ? data
        : (data?.value ?? data?.items ?? data?.data ?? data?.result ?? [])

      agentes.value = items.map((ag: any) => ({
        ...ag,
        _uid: ag.Codigo ?? ag.codigo ?? Math.random()
      }))
      
      // Salva no cache!
      try {
        localStorage.setItem('hcm_agentes_cache', JSON.stringify(agentes.value))
      } catch (e) {
        console.error('Erro ao salvar cache', e)
      }
    }
  } catch (e: any) {
    console.error(`Erro ao buscar agentes:`, e)
    erroAgentes.value = e.message ?? 'Erro desconhecido'
  }

  loadingAgentes.value = false
}

function limparTudo() {
  agentes.value = []
  erroAgentes.value = ''
  agenteSelecionado.value = null
  fichaFinanceira.value = []
  fichaCarregada.value = false
  buscaAgente.value = ''
  abaAtiva.value = 'agentes'
  try {
    localStorage.removeItem('hcm_agentes_cache')
  } catch(e) {}
}

// =====================
// Tabs
// =====================
const abaAtiva = ref<'agentes' | 'ficha'>('agentes')

// =====================
// Ficha Financeira
// =====================
const agenteSelecionado = ref<any>(null)
const fichaFinanceira = ref<any[]>([])
const loadingFicha = ref(false)
const erroFicha = ref('')
const fichaCarregada = ref(false)
const anoFicha = ref(new Date().getFullYear().toString())

const MESES = [
  'Anterior',
  'janeiro', 'fevereiro', 'março', 'abril',
  'maio', 'junho', 'julho', 'agosto',
  'setembro', 'outubro', 'novembro', 'dezembro'
]

function selecionarAgente(ag: any) {
  agenteSelecionado.value = ag
}

async function verFichaAgente(ag: any) {
  agenteSelecionado.value = ag
  abaAtiva.value = 'ficha'
  fichaCarregada.value = false
  fichaFinanceira.value = []
  erroFicha.value = ''
  await buscarFicha()
}

async function buscarFicha() {
  if (!agenteSelecionado.value) return

  loadingFicha.value = true
  erroFicha.value = ''
  fichaFinanceira.value = []
  fichaCarregada.value = false

  const cod = agenteSelecionado.value.Codigo ?? agenteSelecionado.value.codigo

  try {
    const data = await $fetch<any>(
      `/api/financeiro/saldo?agenteId=${cod}`
    )

    if (data?.error || data?.success === false) {
      erroFicha.value = data.error ?? 'Erro ao carregar saldos.'
      loadingFicha.value = false
      fichaCarregada.value = true
      return
    }

    // A nova API retorna um array em data.data
    const rows = data?.data || []
    if (rows.length > 0) {
       fichaFinanceira.value = [rows[0]]
    } else {
       fichaFinanceira.value = []
    }
    
    fichaCarregada.value = true
  } catch (e: any) {
    console.error('Erro saldos financeiros:', e)
    erroFicha.value = e.message ?? 'Erro desconhecido ao carregar saldos.'
    fichaCarregada.value = true
  }

  loadingFicha.value = false
}

// =====================
// Exportar CSV
// =====================
function exportarFichaCSV() {
  const ag = agenteSelecionado.value
  const headers = ['Período', 'Entradas', 'Saídas', 'Saldo do Mês', 'Saldo Atual']
  const rows = fichaFinanceira.value.map(r => [
    r.periodoLabel ?? r.periodo,
    r.entradas,
    r.saidas,
    r.saldoMes,
    r.saldoAtual
  ])
  const csvContent = [headers, ...rows].map(r => r.join(';')).join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `ficha_${ag?.Codigo ?? ag?.codigo}_${anoFicha.value}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// =====================
// Utilitários
// =====================
function formatCurrency(val: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>

<style scoped>
/* ====== Chips de filial ====== */
.filial-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9999px;
  border: 1.5px solid transparent;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  white-space: nowrap;
  outline: none;
}

.filial-chip:focus-visible {
  box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.4);
}

.filial-chip--inativa {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #64748b;
}

.filial-chip--inativa:hover {
  background: #fff7ed;
  border-color: #fdba74;
  color: #ea580c;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(251, 146, 60, 0.2);
}

.filial-chip--ativa {
  background: linear-gradient(135deg, #f97316, #ef4444);
  border-color: transparent;
  color: white;
  box-shadow: 0 3px 10px rgba(249, 115, 22, 0.4);
  transform: translateY(-1px);
}

.filial-chip--ativa:hover {
  background: linear-gradient(135deg, #ea580c, #dc2626);
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.5);
}

.filial-chip__codigo {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.7rem;
  opacity: 0.85;
  letter-spacing: 0.03em;
}

.filial-chip--ativa .filial-chip__codigo {
  opacity: 0.9;
}

.filial-chip__nome {
  font-weight: 700;
  letter-spacing: 0.01em;
}

.filial-chip__check {
  width: 0.875rem;
  height: 0.875rem;
  opacity: 0.9;
}

/* ====== Tabs ====== */
.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  background: transparent;
  border-top: none;
  border-left: none;
  border-right: none;
  transition: all 0.16s ease;
  outline: none;
}

.tab-btn:hover:not(:disabled) {
  color: #ea580c;
  border-bottom-color: #fdba74;
}

.tab-btn--ativa {
  color: #ea580c;
  border-bottom-color: #f97316;
}

.tab-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
