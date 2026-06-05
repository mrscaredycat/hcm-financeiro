<template>
  <UContainer class="py-8 max-w-7xl">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-1">Consulta de Saldos Financeiros</h1>
      <p class="text-gray-500 text-sm">
        Visualize saldos de Contas a Pagar e Contas a Receber por filial e período
      </p>
    </div>

    <!-- Filtros -->
    <UCard class="mb-6">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-filter" class="text-orange-500" />
            <span class="font-semibold text-gray-700">Filtros de Consulta</span>
          </div>
          <div class="flex gap-2">
            <UButton
              variant="outline"
              icon="i-lucide-x"
              label="Limpar"
              size="sm"
              @click="limparFiltros"
            />
            <UButton
              :loading="isLoading"
              color="warning"
              icon="i-lucide-search"
              label="Consultar"
              size="sm"
              @click="consultar"
            />
          </div>
        </div>
      </template>

      <!-- Linha 1: Tipo + Datas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <UFormField label="Tipo de Saldo" name="tipo" required>
          <USelect
            v-model="filtros.tipo"
            :items="tipoOptions"
            option-attribute="label"
            value-attribute="value"
            placeholder="Selecione o tipo"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Vencimento Inicial" name="venctoInicial" required>
          <UInput
            v-model="filtros.venctoInicial"
            type="date"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Vencimento Final" name="venctoFinal" required>
          <UInput
            v-model="filtros.venctoFinal"
            type="date"
            class="w-full"
          />
        </UFormField>
      </div>

      <!-- Linha 2: Filiais + opção em aberto -->
      <div class="flex flex-wrap items-start gap-6 pt-4 border-t border-gray-100">
        <div class="flex-1 min-w-64">
          <UFormField label="Filiais (vazio = todas as filiais)" name="filiais">
            <select
              v-model="filtros.filiais"
              multiple
              size="4"
              class="w-full px-2 py-1 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option v-for="f in filiais" :key="f.value" :value="f.value">{{ f.label }}</option>
            </select>
            <p class="text-xs text-gray-400 mt-1">Ctrl+clique para selecionar múltiplas</p>
          </UFormField>
        </div>
        <div class="flex items-center pt-6">
          <UCheckbox
            v-model="filtros.saldoEmAberto"
            label="Apenas saldos em aberto"
          />
        </div>
      </div>
    </UCard>

    <!-- Estado de loading -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 gap-4">
      <UIcon name="i-lucide-loader-circle" class="text-orange-500 animate-spin h-10 w-10" />
      <p class="text-gray-500 text-sm">
        Consultando {{ resultados.length > 0 ? `filial ${currentLoadingFilial}` : 'dados' }}...
      </p>
      <div v-if="totalFiliais > 1" class="w-64">
        <UProgress :value="progressoConsulta" :max="100" color="warning" />
        <p class="text-xs text-gray-400 text-center mt-1">
          {{ filialAtual }} / {{ totalFiliais }} filiais consultadas
        </p>
      </div>
    </div>

    <!-- Erro -->
    <UAlert
      v-if="erro && !isLoading"
      color="error"
      icon="i-lucide-triangle-alert"
      title="Erro na consulta"
      :description="erro"
      class="mb-6"
    />

    <!-- Resultados -->
    <template v-if="!isLoading && resultados.length > 0">
      <!-- Resumo por filial -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <UCard
          v-for="resumo in resumoPorFilial"
          :key="resumo.filial"
          class="cursor-pointer transition-all duration-200 hover:shadow-md"
          :class="{ 'ring-2 ring-orange-400': filialSelecionada === resumo.filial }"
          @click="filialSelecionada = filialSelecionada === resumo.filial ? null : resumo.filial"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">
                {{ resumo.nomeFilial }}
              </p>
              <p class="text-xl font-bold mt-1" :class="resumo.total >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(resumo.total) }}
              </p>
            </div>
            <UBadge
              :label="String(resumo.quantidade)"
              color="warning"
              variant="soft"
              size="sm"
            />
          </div>
          <div class="mt-2 pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-500">
            <span>Parcelas: {{ resumo.quantidade }}</span>
            <span>Filial {{ resumo.filial }}</span>
          </div>
        </UCard>
      </div>

      <!-- Totalizador geral -->
      <UCard class="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-sm text-gray-600 font-medium">Total Geral</p>
            <p class="text-3xl font-bold" :class="totalGeral >= 0 ? 'text-green-700' : 'text-red-700'">
              {{ formatCurrency(totalGeral) }}
            </p>
          </div>
          <div class="flex gap-6 text-sm text-gray-600">
            <div>
              <p class="font-medium">Total de Parcelas</p>
              <p class="text-2xl font-bold text-gray-800">{{ resultadosFiltrados.length }}</p>
            </div>
            <div>
              <p class="font-medium">Filiais Consultadas</p>
              <p class="text-2xl font-bold text-gray-800">{{ resumoPorFilial.length }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <UButton
              variant="outline"
              icon="i-lucide-download"
              label="Exportar CSV"
              size="sm"
              @click="exportarCSV"
            />
            <UButton
              v-if="filialSelecionada"
              variant="soft"
              icon="i-lucide-x"
              label="Limpar filtro"
              size="sm"
              @click="filialSelecionada = null"
            />
          </div>
        </div>
      </UCard>

      <!-- Tabela de resultados -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-table" class="text-orange-500" />
              <span class="font-semibold text-gray-700">
                {{ filialSelecionada ? `Filial ${filialSelecionada} — ${nomeFilial(filialSelecionada)}` : 'Todas as Filiais' }}
              </span>
              <UBadge :label="String(resultadosFiltrados.length)" color="warning" variant="soft" size="sm" />
            </div>
            <UInput
              v-model="termoBusca"
              icon="i-lucide-search"
              placeholder="Buscar..."
              size="sm"
              class="w-48"
            />
          </div>
        </template>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 bg-gray-50">
                <th
                  v-for="col in colunas"
                  :key="col.key"
                  class="text-left px-3 py-2 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap cursor-pointer hover:text-orange-600 select-none"
                  @click="ordenarPor(col.key)"
                >
                  <div class="flex items-center gap-1">
                    {{ col.label }}
                    <UIcon
                      v-if="ordemColuna === col.key"
                      :name="ordemDirecao === 'asc' ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                      class="text-orange-500 h-3 w-3"
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, idx) in resultadosPaginados"
                :key="idx"
                class="border-b border-gray-100 hover:bg-orange-50 transition-colors duration-100"
              >
                <td class="px-3 py-2 text-gray-500 text-xs">{{ nomeFilial(String(item.filial ?? item.codFilial ?? '—')) }}</td>
                <td class="px-3 py-2 font-mono text-xs text-gray-600">{{ item.numeroDocumento ?? item.documento ?? item.numDocumento ?? '—' }}</td>
                <td class="px-3 py-2 text-gray-700">{{ item.nomeAgente ?? item.agente ?? '—' }}</td>
                <td class="px-3 py-2 text-xs text-gray-500">{{ formatDate(item.dataVencimento ?? item.vencimento ?? item.dtVencto) }}</td>
                <td class="px-3 py-2 text-xs text-gray-500">{{ formatDate(item.dataEmissao ?? item.emissao ?? item.dtEmissao) }}</td>
                <td class="px-3 py-2 text-right font-mono font-semibold" :class="(item.saldo ?? item.valorSaldo ?? 0) >= 0 ? 'text-green-700' : 'text-red-600'">
                  {{ formatCurrency(item.saldo ?? item.valorSaldo ?? item.valor ?? 0) }}
                </td>
                <td class="px-3 py-2 text-center">
                  <UBadge
                    :label="item.situacao ?? item.status ?? '—'"
                    :color="getSituacaoColor(item.situacao ?? item.status)"
                    variant="soft"
                    size="xs"
                  />
                </td>
              </tr>

              <tr v-if="resultadosPaginados.length === 0">
                <td colspan="7" class="px-3 py-8 text-center text-gray-400">
                  Nenhum resultado encontrado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginação -->
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p class="text-xs text-gray-500">
            Mostrando {{ Math.min((paginaAtual - 1) * itensPorPagina + 1, resultadosFiltrados.length) }}–{{ Math.min(paginaAtual * itensPorPagina, resultadosFiltrados.length) }} de {{ resultadosFiltrados.length }} registros
          </p>
          <UPagination
            v-model:page="paginaAtual"
            :total="resultadosFiltrados.length"
            :items-per-page="itensPorPagina"
            size="sm"
          />
        </div>
      </UCard>
    </template>

    <!-- Empty state -->
    <div
      v-if="!isLoading && !erro && resultados.length === 0"
      class="flex flex-col items-center justify-center py-20 text-center"
    >
      <UIcon name="i-lucide-bar-chart-2" class="h-16 w-16 text-orange-200 mb-4" />
      <p class="text-gray-500 font-medium">Nenhuma consulta realizada ainda</p>
      <p class="text-gray-400 text-sm mt-1">
        Configure os filtros acima e clique em <strong>Consultar</strong>
      </p>
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
useHead({
  title: 'Consulta de Saldos — HCM Financeiro',
  meta: [{ name: 'description', content: 'Consulta de saldos de Contas a Pagar e Receber do Mega ERP por filial' }]
})

// =====================
// Filiais
// =====================
const filiais = [
  { label: '95 - HCM 2 ENGENHARIA', value: '95' },
  { label: '96 - HCM 2 CONSTRUÇÕES', value: '96' },
  { label: '100 - HCM ENGENHARIA', value: '100' },
  { label: '200 - CONSTRUTORA HCM', value: '200' },
  { label: '300 - HCM MANUTENÇÃO INDUSTRIAL', value: '300' },
  { label: '400 - HCM HOLDING S/A', value: '400' },
  { label: '500 - INCORPORAÇÃO 01', value: '500' },
  { label: '600 - HCM INCORPORAÇÃO 02', value: '600' },
  { label: '700 - HCM INCORPORAÇÃO 03', value: '700' }
]

const nomeFilial = (cod: string) => filiais.find(f => f.value === cod)?.label?.split(' - ')[1] || cod

// =====================
// Tipos
// =====================
const tipoOptions = [
  { label: 'Contas a Pagar', value: 'pagar' },
  { label: 'Contas a Receber', value: 'receber' }
]

// =====================
// Estado dos filtros
// =====================
const hoje = new Date()
const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
const ultimoDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]

const filtros = reactive({
  tipo: 'pagar' as 'pagar' | 'receber',
  filiais: [] as string[],
  venctoInicial: primeiroDiaDoMes,
  venctoFinal: ultimoDiaDoMes,
  saldoEmAberto: false
})

// =====================
// Estado da consulta
// =====================
const isLoading = ref(false)
const erro = ref('')
const resultados = ref<any[]>([])
const filialAtual = ref(0)
const totalFiliais = ref(0)
const currentLoadingFilial = ref('')

const progressoConsulta = computed(() => {
  if (totalFiliais.value === 0) return 0
  return Math.round((filialAtual.value / totalFiliais.value) * 100)
})

// =====================
// Filtros de tabela
// =====================
const termoBusca = ref('')
const filialSelecionada = ref<string | null>(null)
const ordemColuna = ref('dataVencimento')
const ordemDirecao = ref<'asc' | 'desc'>('asc')
const paginaAtual = ref(1)
const itensPorPagina = 50

const colunas = [
  { key: 'filial', label: 'Filial' },
  { key: 'numeroDocumento', label: 'Documento' },
  { key: 'nomeAgente', label: 'Agente' },
  { key: 'dataVencimento', label: 'Vencimento' },
  { key: 'dataEmissao', label: 'Emissão' },
  { key: 'saldo', label: 'Saldo' },
  { key: 'situacao', label: 'Situação' }
]

// =====================
// Resultados computados
// =====================
const resultadosFiltrados = computed(() => {
  let items = [...resultados.value]

  // filtro por filial clicada
  if (filialSelecionada.value) {
    items = items.filter(i => String(i.filial ?? i.codFilial) === filialSelecionada.value)
  }

  // busca de texto
  if (termoBusca.value) {
    const termo = termoBusca.value.toLowerCase()
    items = items.filter(i => JSON.stringify(i).toLowerCase().includes(termo))
  }

  // ordenação
  items.sort((a, b) => {
    const valA = a[ordemColuna.value] ?? ''
    const valB = b[ordemColuna.value] ?? ''
    if (valA < valB) return ordemDirecao.value === 'asc' ? -1 : 1
    if (valA > valB) return ordemDirecao.value === 'asc' ? 1 : -1
    return 0
  })

  return items
})

const resultadosPaginados = computed(() => {
  const start = (paginaAtual.value - 1) * itensPorPagina
  return resultadosFiltrados.value.slice(start, start + itensPorPagina)
})

const totalGeral = computed(() =>
  resultadosFiltrados.value.reduce((sum, i) => sum + Number(i.saldo ?? i.valorSaldo ?? i.valor ?? 0), 0)
)

const resumoPorFilial = computed(() => {
  const mapa: Record<string, { filial: string; nomeFilial: string; total: number; quantidade: number }> = {}

  for (const item of resultados.value) {
    const cod = String(item.filial ?? item.codFilial ?? '?')
    if (!mapa[cod]) {
      mapa[cod] = { filial: cod, nomeFilial: nomeFilial(cod), total: 0, quantidade: 0 }
    }
    mapa[cod].total += Number(item.saldo ?? item.valorSaldo ?? item.valor ?? 0)
    mapa[cod].quantidade++
  }

  return Object.values(mapa).sort((a, b) => a.filial.localeCompare(b.filial))
})

// =====================
// Ações
// =====================
function ordenarPor(col: string) {
  if (ordemColuna.value === col) {
    ordemDirecao.value = ordemDirecao.value === 'asc' ? 'desc' : 'asc'
  } else {
    ordemColuna.value = col
    ordemDirecao.value = 'asc'
  }
  paginaAtual.value = 1
}

function limparFiltros() {
  filtros.tipo = 'pagar'
  filtros.filiais = []
  filtros.venctoInicial = primeiroDiaDoMes
  filtros.venctoFinal = ultimoDiaDoMes
  filtros.saldoEmAberto = false
  resultados.value = []
  erro.value = ''
  termoBusca.value = ''
  filialSelecionada.value = null
}

async function consultar() {
  if (!filtros.venctoInicial || !filtros.venctoFinal) {
    erro.value = 'Selecione o período de vencimento.'
    return
  }

  isLoading.value = true
  erro.value = ''
  resultados.value = []
  paginaAtual.value = 1
  filialSelecionada.value = null

  // Formatar datas para ISO datetime esperado pela API
  const dtInicial = `${filtros.venctoInicial}T00:00:00`
  const dtFinal = `${filtros.venctoFinal}T23:59:59`

  // Determinar filiais a consultar
  const filiaisConsultar = filtros.filiais.length > 0
    ? filtros.filiais
    : filiais.map(f => f.value)

  totalFiliais.value = filiaisConsultar.length
  filialAtual.value = 0

  const toastErros: string[] = []

  for (const filial of filiaisConsultar) {
    currentLoadingFilial.value = filial

    try {
      const params = new URLSearchParams({
        type: filtros.tipo,
        filial,
        venctoInicial: dtInicial,
        venctoFinal: dtFinal,
        saldoEmAberto: String(filtros.saldoEmAberto)
      })

      const data = await $fetch<any>(`/api/financeiro/saldos?${params}`)

      if (data?.error) {
        toastErros.push(`Filial ${filial}: ${data.error}`)
      } else {
        // API pode retornar array diretamente ou objeto com propriedade items/data
        const items = Array.isArray(data) ? data : (data?.items ?? data?.data ?? [])

        // Injetar filial em cada item se não vier na resposta
        const itemsComFilial = items.map((i: any) => ({
          ...i,
          filial: i.filial ?? i.codFilial ?? filial
        }))

        resultados.value.push(...itemsComFilial)
      }
    } catch (e: any) {
      console.error(`Erro na filial ${filial}:`, e)
      toastErros.push(`Filial ${filial}: ${e.message ?? 'Erro desconhecido'}`)
    }

    filialAtual.value++
  }

  if (toastErros.length > 0 && resultados.value.length === 0) {
    erro.value = toastErros.join('\n')
  } else if (toastErros.length > 0) {
    console.warn('Erros parciais:', toastErros)
  }

  isLoading.value = false
}

// =====================
// Utilitários
// =====================
function formatCurrency(val: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

function formatDate(val: string | undefined): string {
  if (!val) return '—'
  try {
    return new Date(val).toLocaleDateString('pt-BR')
  } catch {
    return val
  }
}

function getSituacaoColor(situacao: string | undefined): string {
  if (!situacao) return 'neutral'
  const s = situacao.toLowerCase()
  if (s.includes('pago') || s.includes('liquidado') || s.includes('baixado')) return 'success'
  if (s.includes('aberto') || s.includes('pendente')) return 'warning'
  if (s.includes('vencido') || s.includes('atrasado')) return 'error'
  return 'neutral'
}

function exportarCSV() {
  const headers = ['Filial', 'Documento', 'Agente', 'Vencimento', 'Emissão', 'Saldo', 'Situação']
  const rows = resultadosFiltrados.value.map(i => [
    nomeFilial(String(i.filial ?? i.codFilial ?? '')),
    i.numeroDocumento ?? i.documento ?? '',
    i.nomeAgente ?? i.agente ?? '',
    formatDate(i.dataVencimento ?? i.vencimento ?? i.dtVencto),
    formatDate(i.dataEmissao ?? i.emissao ?? i.dtEmissao),
    (i.saldo ?? i.valorSaldo ?? i.valor ?? 0),
    i.situacao ?? i.status ?? ''
  ])

  const csvContent = [headers, ...rows].map(r => r.join(';')).join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `saldos_${filtros.tipo}_${filtros.venctoInicial}_${filtros.venctoFinal}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>
