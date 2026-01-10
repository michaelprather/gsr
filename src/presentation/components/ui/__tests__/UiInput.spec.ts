import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiInput from '../UiInput.vue'

describe('UiInput', () => {
  it('renders with label', () => {
    const wrapper = mount(UiInput, {
      props: {
        label: 'Email',
        modelValue: '',
      },
    })

    expect(wrapper.find('label').text()).toBe('Email')
  })

  it('hides label visually when hideLabel is true', () => {
    const wrapper = mount(UiInput, {
      props: {
        label: 'Email',
        modelValue: '',
        hideLabel: true,
      },
    })

    expect(wrapper.find('label').classes()).toContain('ui-input__label--sr-only')
  })

  it('associates label with input via for/id', () => {
    const wrapper = mount(UiInput, {
      props: {
        label: 'Email',
        modelValue: '',
      },
    })

    const label = wrapper.find('label')
    const input = wrapper.find('input')

    expect(label.attributes('for')).toBe(input.attributes('id'))
  })

  it('displays current value', () => {
    const wrapper = mount(UiInput, {
      props: {
        label: 'Name',
        modelValue: 'John',
      },
    })

    expect(wrapper.find('input').element.value).toBe('John')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(UiInput, {
      props: {
        label: 'Name',
        modelValue: '',
      },
    })

    await wrapper.find('input').setValue('Jane')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['Jane'])
  })

  it('emits blur event on blur', async () => {
    const wrapper = mount(UiInput, {
      props: {
        label: 'Name',
        modelValue: '',
      },
    })

    await wrapper.find('input').trigger('blur')

    expect(wrapper.emitted('blur')).toHaveLength(1)
  })

  it('shows error message when error prop is set', () => {
    const wrapper = mount(UiInput, {
      props: {
        label: 'Email',
        modelValue: '',
        error: 'Invalid email',
      },
    })

    expect(wrapper.find('.ui-input__error').text()).toBe('Invalid email')
  })

  it('applies error class to input when error is present', () => {
    const wrapper = mount(UiInput, {
      props: {
        label: 'Email',
        modelValue: '',
        error: 'Invalid email',
      },
    })

    expect(wrapper.find('input').classes()).toContain('ui-input__field--error')
  })

  it('sets aria-invalid when error is present', () => {
    const wrapper = mount(UiInput, {
      props: {
        label: 'Email',
        modelValue: '',
        error: 'Invalid email',
      },
    })

    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
  })

  it('associates error message with input via aria-describedby', () => {
    const wrapper = mount(UiInput, {
      props: {
        label: 'Email',
        modelValue: '',
        error: 'Invalid email',
      },
    })

    const input = wrapper.find('input')
    const error = wrapper.find('.ui-input__error')

    expect(input.attributes('aria-describedby')).toBe(error.attributes('id'))
  })

  it('can be disabled', () => {
    const wrapper = mount(UiInput, {
      props: {
        label: 'Name',
        modelValue: '',
        disabled: true,
      },
    })

    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('applies placeholder', () => {
    const wrapper = mount(UiInput, {
      props: {
        label: 'Name',
        modelValue: '',
        placeholder: 'Enter your name',
      },
    })

    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter your name')
  })

  it('applies maxlength', () => {
    const wrapper = mount(UiInput, {
      props: {
        label: 'Name',
        modelValue: '',
        maxlength: 20,
      },
    })

    expect(wrapper.find('input').attributes('maxlength')).toBe('20')
  })

  it('sets input type', () => {
    const wrapper = mount(UiInput, {
      props: {
        label: 'Age',
        modelValue: '',
        type: 'number',
      },
    })

    expect(wrapper.find('input').attributes('type')).toBe('number')
  })

  it('sets inputmode', () => {
    const wrapper = mount(UiInput, {
      props: {
        label: 'Age',
        modelValue: '',
        inputmode: 'numeric',
      },
    })

    expect(wrapper.find('input').attributes('inputmode')).toBe('numeric')
  })

  it('applies center class when center prop is true', () => {
    const wrapper = mount(UiInput, {
      props: {
        label: 'Score',
        modelValue: '',
        center: true,
      },
    })

    expect(wrapper.find('input').classes()).toContain('ui-input__field--center')
  })

  it('handles undefined modelValue', () => {
    const wrapper = mount(UiInput, {
      props: {
        label: 'Name',
      },
    })

    expect(wrapper.find('input').element.value).toBe('')
  })
})
