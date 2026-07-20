<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <!-- Decorative blobs -->
    <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-400/20 rounded-full blur-3xl" />
    <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-400/20 rounded-full blur-3xl" />

    <UCard class="w-full max-w-md relative z-10 shadow-xl border-slate-200/60 rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm">
      <div class="flex flex-col items-center justify-center mb-8 pt-4">
        <AppLogo class="h-12 mb-4" />
        <h2 class="text-2xl font-bold text-slate-900 tracking-tight text-center">
          Acesso ao Sistema
        </h2>
        <p class="text-sm text-slate-500 mt-1 text-center">
          Módulo Financeiro Mega ERP
        </p>
      </div>

      <div class="flex flex-col items-center justify-center space-y-4 pt-4">
        <UAlert
          v-if="erroLogin"
          color="error"
          variant="soft"
          icon="i-lucide-triangle-alert"
          :title="erroLogin"
          class="w-full mb-2"
        />

        <UButton
          :loading="carregando"
          color="white"
          variant="solid"
          block
          size="xl"
          class="font-bold tracking-wide shadow-md border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-3 text-slate-700"
          @click="fazerLoginGoogle"
        >
          <UIcon
            name="i-simple-icons-google"
            class="w-5 h-5 text-red-500"
          />
          Entrar com o Google
        </UButton>

        <p class="text-xs text-slate-400 text-center mt-4">
          O acesso é restrito apenas a contas autorizadas.
        </p>
      </div>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useFirebaseAuth, useFirestore } from 'vuefire'

definePageMeta({
  layout: false // Não usa o layout default (header/footer)
})

const carregando = ref(false)
const erroLogin = ref('')

const auth = useFirebaseAuth()
const db = useFirestore()
const router = useRouter()
const route = useRoute()

async function fazerLoginGoogle() {
  erroLogin.value = ''
  carregando.value = true

  try {
    if (!auth) throw new Error('Firebase Auth não inicializado.')

    const provider = new GoogleAuthProvider()
    // Força a seleção de conta do Google
    provider.setCustomParameters({
      prompt: 'select_account'
    })

    const result = await signInWithPopup(auth, provider)
    const user = result.user
    const email = user.email?.toLowerCase() || ''

    // Se for o master hardcoded, passa direto
    if (email !== 'freitascaroline49@gmail.com') {
      try {
        // Verifica na whitelist do Firestore usando o ID do documento (que é o próprio e-mail)
        const docRef = doc(db, 'authorized_users', email)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          // Se não encontrou o documento, desloga e barra
          await auth.signOut()
          erroLogin.value = `Acesso negado: O e-mail (${email}) não foi encontrado na lista de autorizados no banco de dados.`
          return
        }
      } catch (err: any) {
        console.error('Erro ao verificar Firestore:', err)
        await auth.signOut()
        erroLogin.value = `Erro de permissão no Firestore para o e-mail (${email}). Verifique as regras de segurança.`
        return
      }
    }

    // Sucesso no login, redireciona
    const redirectTo = route.query.redirect || '/'
    router.push(redirectTo)
  } catch (error) {
    console.error('Erro de login com Google:', error)
    if (error.code === 'auth/popup-closed-by-user') {
      erroLogin.value = 'O login foi cancelado.'
    } else {
      erroLogin.value = 'Ocorreu um erro ao tentar fazer login com o Google.'
    }
  } finally {
    carregando.value = false
  }
}
</script>
