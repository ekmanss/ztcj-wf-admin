import { describe, expect, it } from 'vitest'
import { normalizeLegacyListText } from './rootdata.service'

describe('normalizeLegacyListText', () => {
  it('keeps plain legacy text unchanged', () => {
    expect(normalizeLegacyListText('加密原生基金')).toBe('加密原生基金')
  })

  it('renders JSON encoded legacy lists as readable text', () => {
    expect(normalizeLegacyListText('["加密原生基金"]')).toBe('加密原生基金')
    expect(normalizeLegacyListText('["基金","孵化器"]')).toBe('基金, 孵化器')
  })

  it('returns an empty string for empty legacy lists and missing values', () => {
    expect(normalizeLegacyListText('[]')).toBe('')
    expect(normalizeLegacyListText(null)).toBe('')
    expect(normalizeLegacyListText(undefined)).toBe('')
  })
})
