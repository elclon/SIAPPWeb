<script setup>
import { ref, computed } from 'vue';
import { DxForm, DxGroupItem, DxSimpleItem, DxRequiredRule } from 'devextreme-vue/form';
import { DxButton } from 'devextreme-vue/button';
import apiClient from '@/api/axiosConfig';
import { showSuccess, showError } from '@/services/notification';
import { getErrorMessage } from '@/services/errorHandler';

const emit = defineEmits(['login-exitoso']);

const dxFormRef = ref(null);
const isLoggingIn = ref(false);

const formLogin = ref({
  usuarioOCorreo: '',
  password: ''
});

// Regla 2.4: Editor options declarados en computed(...)
const usuarioOptions = computed(() => ({
  placeholder: 'Usuario o correo de SuperAdmin',
  mode: 'text',
  stylingMode: 'outlined'
}));

const passwordOptions = computed(() => ({
  placeholder: 'Contraseña maestra de administración',
  mode: 'password',
  stylingMode: 'outlined'
}));

// Regla 6.1: Validación con dxFormRef antes de llamar a la API
const handleSubmit = async () => {
  const validationResult = dxFormRef.value?.instance?.validate();
  if (!validationResult || !validationResult.isValid) {
    return;
  }

  isLoggingIn.value = true;
  try {
    const response = await apiClient.post('/portal-cliente/admin/auth/login', {
      usuarioOCorreo: formLogin.value.usuarioOCorreo.trim(),
      password: formLogin.value.password.trim()
    });

    if (response.data) {
      showSuccess(`¡Bienvenido, ${response.data.nombreCompleto}!`);
      emit('login-exitoso', response.data);
    }
  } catch (error) {
    showError(getErrorMessage(error, 'Credenciales administrativas incorrectas.'));
  } finally {
    isLoggingIn.value = false;
  }
};
</script>

<template>
  <div class="min-h-[75vh] flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
      <!-- Encabezado con Icono e Identidad SaaS -->
      <div class="text-center space-y-2">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 mb-2">
          <i class="fa-solid fa-shield-halved text-2xl"></i>
        </div>
        <h2 class="text-2xl font-black text-slate-900 dark:text-white font-heading">
          Administración SIAPP
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Panel de Control Centralizado SaaS • Licenciamiento MINEDU y Facturación
        </p>
      </div>

      <!-- Regla 2.1: Envoltura de Formulario Obligatoria -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Regla 2.2: Único DxForm con validation-group -->
        <DxForm
          ref="dxFormRef"
          :form-data="formLogin"
          validation-group="adminLoginGroup"
          :col-count="1"
          label-location="top"
        >
          <DxGroupItem :col-count="1">
            <DxSimpleItem
              data-field="usuarioOCorreo"
              :editor-options="usuarioOptions"
            >
              <DxRequiredRule message="El usuario o correo es obligatorio" />
            </DxSimpleItem>

            <DxSimpleItem
              data-field="password"
              :editor-options="passwordOptions"
            >
              <DxRequiredRule message="La contraseña es obligatoria" />
            </DxSimpleItem>
          </DxGroupItem>
        </DxForm>

        <!-- Regla 6.2: Botón de Submit con estado de espera -->
        <div class="pt-2">
          <DxButton
            :text="isLoggingIn ? 'Iniciando sesión...' : 'Acceder al Panel Administrativo'"
            :icon="isLoggingIn ? 'spin' : 'key'"
            type="default"
            styling-mode="contained"
            class="w-full"
            :disabled="isLoggingIn"
            use-submit-behavior="true"
          />
        </div>
      </form>

      <div class="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
        <span class="text-[11px] text-slate-400">
          Acceso restringido a personal técnico y directivo de SIAPP Software Perú.
        </span>
      </div>
    </div>
  </div>
</template>
