<template>
  <section class="max-w-4xl mx-auto py-10 px-5 animate-in fade-in duration-500">
    <div class="mb-8">
      <div class="flex items-center gap-2 mb-2">
        <UButton variant="ghost" icon="i-lucide-arrow-left" color="gray" to="/" size="sm" class="-ml-2" />
        <h1 class="text-2xl font-bold text-slate-900">Configurar Usuários Autorizados</h1>
      </div>
      <p class="text-slate-500">Cadastre os e-mails que terão permissão para acessar o módulo financeiro.</p>
    </div>

    <!-- Novo Usuário -->
    <UCard class="mb-8 border-slate-200/60 shadow-sm">
      <h2 class="text-lg font-bold text-slate-800 mb-4">Autorizar Novo E-mail</h2>
      
      <form @submit.prevent="adicionarUsuario(false)" class="flex flex-col sm:flex-row gap-3">
        <UInput
          v-model="novoEmail"
          type="email"
          required
          placeholder="email@gmail.com"
          icon="i-lucide-mail"
          size="lg"
          class="flex-1"
        />
        <div class="flex gap-3">
          <UButton
            type="submit"
            :loading="salvando"
            color="orange"
            size="lg"
            class="px-6 font-semibold shadow-md shadow-orange-500/20"
          >
            Autorizar Acesso
          </UButton>
          <UButton
            type="button"
            :loading="salvandoAdmin"
            color="gray"
            variant="outline"
            size="lg"
            class="px-6 font-semibold"
            @click="adicionarUsuario(true)"
          >
            Salvar como Master
          </UButton>
        </div>
      </form>

      <UAlert
        v-if="mensagem"
        :color="mensagemTipo"
        variant="soft"
        :title="mensagem"
        class="mt-4 text-xs py-2"
      />
    </UCard>

    <!-- Lista -->
    <UCard class="border-slate-200/60 shadow-sm bg-white">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-slate-800">E-mails Autorizados</h2>
        <UButton icon="i-lucide-refresh-cw" color="gray" variant="ghost" size="xs" @click="carregarUsuarios" :loading="carregandoLista" />
      </div>

      <div v-if="carregandoLista" class="text-slate-500 text-center py-6">Carregando lista...</div>
      
      <div v-else-if="erroLista" class="text-red-500 text-center py-6 font-medium">
        {{ erroLista }}
      </div>

      <table v-else-if="usuariosAutorizados.length > 0" class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-200">
            <th class="py-3 px-2 text-slate-600 font-semibold text-sm">E-mail</th>
            <th class="py-3 px-2 text-slate-600 font-semibold text-sm w-24 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in usuariosAutorizados" :key="u.id" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td class="py-3 px-2 font-medium text-slate-800 text-sm flex items-center gap-2">
              {{ u.email }}
              <UBadge v-if="u.isMaster" color="indigo" variant="subtle" size="xs">Master</UBadge>
              <UBadge v-if="u.isAbsoluteMaster" color="orange" variant="solid" size="xs">Master Absoluto</UBadge>
            </td>
            <td class="py-3 px-2 text-right">
              <UButton
                v-if="!u.isAbsoluteMaster"
                color="red"
                variant="ghost"
                size="xs"
                class="font-semibold hover:bg-red-50"
                @click="removerUsuario(u.id, u.email)"
              >
                Remover
              </UButton>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="text-slate-500 text-center py-6">Nenhum e-mail autorizado ainda.</div>
    </UCard>
  </section>
</template>

<script setup>
import { collection, setDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { useFirestore } from 'vuefire'

// Proteção da rota
definePageMeta({
  middleware: [
    function (to, from) {
      const { isAdmin } = useAdmin()
      if (!isAdmin.value) return navigateTo('/')
    }
  ]
})

const db = useFirestore()
const { isAdmin } = useAdmin()

const novoEmail = ref('')
const salvando = ref(false)
const salvandoAdmin = ref(false)
const mensagem = ref('')
const mensagemTipo = ref('success')

const carregandoLista = ref(true)
const erroLista = ref('')
const usuariosAutorizados = ref([])

const absoluteMaster = 'freitascaroline49@gmail.com'
let unsubscribe = null

onMounted(() => {
  carregarUsuarios()
})

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe()
})

function carregarUsuarios() {
  carregandoLista.value = true
  erroLista.value = ''
  try {
    unsubscribe = onSnapshot(
      collection(db, 'authorized_users'),
      (snapshot) => {
        const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        
        // Garantir que a master absoluta apareça sempre no topo, mesmo se não estiver no Firestore
        const hasAbsolute = users.some(u => u.email === absoluteMaster)
        if (!hasAbsolute) {
          users.unshift({ id: 'absolute_master', email: absoluteMaster, isMaster: true, isAbsoluteMaster: true })
        } else {
          const absIndex = users.findIndex(u => u.email === absoluteMaster)
          if (absIndex > -1) {
            users[absIndex].isAbsoluteMaster = true
            users[absIndex].isMaster = true
          }
        }
        
        usuariosAutorizados.value = users
        carregandoLista.value = false
      },
      (error) => {
        console.error('Erro ao escutar usuários:', error)
        erroLista.value = 'Erro ao carregar lista. Verifique se o Firestore está ativado.'
        carregandoLista.value = false
      }
    )
  } catch (error) {
    console.error('Erro ao iniciar listener:', error)
    carregandoLista.value = false
  }
}

async function adicionarUsuario(isMasterUser = false) {
  mensagem.value = ''
  const emailLower = novoEmail.value.toLowerCase().trim()
  
  if (!emailLower) return
  if (!emailLower.endsWith('@gmail.com')) {
    mensagem.value = 'Apenas e-mails do Google (@gmail.com) são permitidos.'
    mensagemTipo.value = 'error'
    return
  }

  if (emailLower === absoluteMaster) {
    mensagem.value = 'Esse e-mail já é o administrador Master absoluto.'
    mensagemTipo.value = 'warning'
    return
  }

  if (isMasterUser) salvandoAdmin.value = true
  else salvando.value = true

  try {
    // Salva o documento usando o próprio e-mail como ID para evitar duplicatas facilmente
    await setDoc(doc(db, 'authorized_users', emailLower), {
      email: emailLower,
      isMaster: isMasterUser,
      created_at: new Date()
    })
    
    mensagem.value = isMasterUser ? `Master ${emailLower} salvo com sucesso!` : `Acesso liberado para ${emailLower}!`
    mensagemTipo.value = 'success'
    novoEmail.value = ''
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error)
    mensagemTipo.value = 'error'
    mensagem.value = 'Erro ao salvar. O banco de dados Firestore está ativo?'
  } finally {
    salvando.value = false
    salvandoAdmin.value = false
  }
}

async function removerUsuario(docId, userEmail) {
  if (userEmail === absoluteMaster) {
    alert('Este e-mail é um administrador Master e não pode ser removido.')
    return
  }

  if (!confirm(`Tem certeza que deseja revogar o acesso de ${userEmail}?`)) return
  
  try {
    await deleteDoc(doc(db, 'authorized_users', docId))
  } catch (error) {
    console.error('Erro ao remover:', error)
    alert('Erro ao remover o usuário. Verifique as permissões do Firestore.')
  }
}
</script>
