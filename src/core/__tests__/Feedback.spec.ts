import { describe, it, expect } from 'vitest'
import { Feedback } from '../Feedback'

describe('Feedback', () => {
  describe('empty', () => {
    it('creates feedback with no errors', () => {
      const feedback = Feedback.empty()
      expect(feedback.hasFeedback).toBe(false)
      expect(feedback.fields).toHaveLength(0)
    })
  })

  describe('fromRecord', () => {
    it('creates feedback from error record', () => {
      const feedback = Feedback.fromRecord({
        name: ['Name is required'],
        email: ['Invalid email format'],
      })

      expect(feedback.hasFeedback).toBe(true)
      expect(feedback.get('name')).toEqual(['Name is required'])
      expect(feedback.get('email')).toEqual(['Invalid email format'])
    })

    it('filters out empty error arrays', () => {
      const feedback = Feedback.fromRecord({
        name: ['Name is required'],
        email: [],
      })

      expect(feedback.hasFeedback).toBe(true)
      expect(feedback.get('name')).toEqual(['Name is required'])
      expect(feedback.get('email')).toBeUndefined()
    })

    it('filters out empty strings', () => {
      const feedback = Feedback.fromRecord({
        name: ['', 'Name is required', ''],
      })

      expect(feedback.get('name')).toEqual(['Name is required'])
    })
  })

  describe('get', () => {
    it('returns undefined for unknown field', () => {
      const feedback = Feedback.empty()
      expect(feedback.get('unknown')).toBeUndefined()
    })
  })

  describe('merge', () => {
    it('combines errors from two feedback objects', () => {
      const feedback1 = Feedback.fromRecord({ name: ['Too short'] })
      const feedback2 = Feedback.fromRecord({ name: ['Contains invalid characters'] })

      const merged = feedback1.merge(feedback2)

      expect(merged.get('name')).toEqual(['Too short', 'Contains invalid characters'])
    })

    it('preserves fields from both objects', () => {
      const feedback1 = Feedback.fromRecord({ name: ['Required'] })
      const feedback2 = Feedback.fromRecord({ email: ['Invalid'] })

      const merged = feedback1.merge(feedback2)

      expect(merged.get('name')).toEqual(['Required'])
      expect(merged.get('email')).toEqual(['Invalid'])
    })
  })
})
