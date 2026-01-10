<script setup lang="ts">
import { computed, ref, useId } from 'vue'

export interface UiInputProps {
  modelValue?: string
  label: string
  hideLabel?: boolean
  type?: 'text' | 'number' | 'email' | 'tel'
  inputmode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email'
  placeholder?: string
  error?: string | null
  disabled?: boolean
  maxlength?: number
  min?: number
  max?: number
  step?: number
  center?: boolean
}

export interface UiInputEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'blur'): void
}

const {
  modelValue = '',
  label,
  hideLabel = false,
  type = 'text',
  inputmode,
  placeholder,
  error = null,
  disabled = false,
  maxlength,
  min,
  max,
  step,
  center = false,
} = defineProps<UiInputProps>()

const emit = defineEmits<UiInputEmits>()

const inputId = useId()
const errorId = useId()

const fieldClasses = computed(() => [
  'ui-input__field',
  {
    'ui-input__field--error': !!error,
    'ui-input__field--center': center,
  },
])

const labelClasses = computed(() => [
  'ui-input__label',
  {
    'ui-input__label--sr-only': hideLabel,
  },
])

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleBlur() {
  emit('blur')
}

const inputRef = ref<HTMLInputElement | null>(null)

function focus() {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<template>
  <div class="ui-input">
    <label :for="inputId" :class="labelClasses">
      {{ label }}
    </label>
    <input
      ref="inputRef"
      :id="inputId"
      :type="type"
      :inputmode="inputmode"
      :class="fieldClasses"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxlength"
      :min="min"
      :max="max"
      :step="step"
      :aria-invalid="!!error"
      :aria-describedby="error ? errorId : undefined"
      @input="handleInput"
      @blur="handleBlur"
    />
    <p v-if="error" :id="errorId" class="ui-input__error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<style src="./UiInput.css"></style>
