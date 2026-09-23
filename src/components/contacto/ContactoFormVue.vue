<script setup>
import { ref } from 'vue';
import apiClient from '@/api/axiosConfig';

const form = ref({
  nombreCompleto: '',
  telefono: '',
  nombreInstitucion: '',
  correo: '',
  tipoInstitucion: 'Instituto Superior Tecnológico / Pedagógico',
  mensaje: ''
});

const isSubmitting = ref(false);
const isSuccess = ref(false);
const errorMessage = ref('');

const tiposInstitucion = [
  'Instituto Superior Tecnológico / Pedagógico',
  'Centro de Educación Técnico-Productiva (CETPRO)',
  'Colegio Primaria / Secundaria',
  'Universidad / Escuela de Posgrado',
  'Centro de Idiomas / Academia',
  'Otra Institución Educativa'
];

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    const payload = {
      nombreCompleto: form.value.nombreCompleto.trim(),
      telefono: form.value.telefono.trim(),
      nombreInstitucion: form.value.nombreInstitucion.trim(),
      correo: form.value.correo.trim(),
      tipoInstitucion: form.value.tipoInstitucion,
      mensaje: form.value.mensaje ? form.value.mensaje.trim() : ''
    };

    const res = await apiClient.post('/contacto/enviar-mensaje', payload);
    if (res.data) {
      isSuccess.value = true;
    }
  } catch (err) {
    if (err.response?.data?.errors) {
      const errList = Object.values(err.response.data.errors).flat();
      errorMessage.value = errList.join(' ');
    } else if (err.response?.data?.title) {
      errorMessage.value = err.response.data.title;
    } else if (err.message === 'Network Error') {
      errorMessage.value = 'No se pudo conectar con el servidor de contacto. Por favor escríbenos directamente por WhatsApp.';
    } else {
      errorMessage.value = 'Ocurrió un inconveniente al enviar tu mensaje. Por favor intenta nuevamente o contáctanos por WhatsApp.';
    }
  } finally {
    isSubmitting.value = false;
  }
};

const resetForm = () => {
  form.value = {
    nombreCompleto: '',
    telefono: '',
    nombreInstitucion: '',
    correo: '',
    tipoInstitucion: 'Instituto Superior Tecnológico / Pedagógico',
    mensaje: ''
  };
  isSuccess.value = false;
  errorMessage.value = '';
};
</script>

<template>
  <div class="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none transition-colors duration-200">
    
    <!-- Mensaje de Éxito al Enviar -->
    <div v-if="isSuccess" class="text-center py-8 space-y-5">
      <div class="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center text-3xl shadow-md animate-bounce">
        <i class="fa-solid fa-check"></i>
      </div>

      <div class="space-y-2 max-w-md mx-auto">
        <h3 class="text-2xl font-black text-slate-900 dark:text-white font-heading">
          ¡Solicitud Enviada con Éxito!
        </h3>
        <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          Gracias <strong>{{ form.nombreCompleto }}</strong>. Hemos recibido tu solicitud para <strong>{{ form.nombreInstitucion }}</strong>. Te hemos enviado un correo de confirmación a <em>{{ form.correo }}</em> y un asesor especializado te contactará en breve.
        </p>
      </div>

      <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href="https://wa.me/51958344877?text=Hola,%20acabo%20de%20enviar%20mi%20solicitud%20de%20informaci%C3%B3n"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          <i class="fa-brands fa-whatsapp text-lg"></i>
          <span>Atención Inmediata por WhatsApp</span>
        </a>

        <button
          type="button"
          @click="resetForm"
          class="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all"
        >
          Enviar otra consulta
        </button>
      </div>
    </div>

    <!-- Formulario de Contacto -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-5">
      
      <!-- Mensaje de Error si ocurre -->
      <div v-if="errorMessage" class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
        <i class="fa-solid fa-triangle-exclamation text-base shrink-0"></i>
        <span>{{ errorMessage }}</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Nombre Completo *</label>
          <input
            v-model="form.nombreCompleto"
            type="text"
            required
            placeholder="Ej. Juan Pérez"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Teléfono / WhatsApp *</label>
          <input
            v-model="form.telefono"
            type="tel"
            required
            placeholder="Ej. 987654321"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Nombre de la Institución *</label>
          <input
            v-model="form.nombreInstitucion"
            type="text"
            required
            placeholder="Ej. Instituto Superior Tecnológico..."
            class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Correo Institucional / Personal *</label>
          <input
            v-model="form.correo"
            type="email"
            required
            placeholder="director@institucion.edu.pe"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">Tipo de Institución</label>
        <select
          v-model="form.tipoInstitucion"
          class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
        >
          <option v-for="tipo in tiposInstitucion" :key="tipo" :value="tipo" class="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
            {{ tipo }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">¿En qué podemos ayudarte?</label>
        <textarea
          v-model="form.mensaje"
          rows="4"
          placeholder="Cuéntanos cuántos estudiantes tienen y qué módulos te interesan más..."
          class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 transition-all"
        ></textarea>
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full py-4 rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <template v-if="isSubmitting">
          <i class="fa-solid fa-spinner fa-spin"></i>
          <span>Enviando Solicitud...</span>
        </template>
        <template v-else>
          <span>Enviar Solicitud de Información</span>
          <i class="fa-light fa-paper-plane"></i>
        </template>
      </button>
    </form>
  </div>
</template>
