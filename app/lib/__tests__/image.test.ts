import { normalizeImageUrl } from '../image'

describe('normalizeImageUrl', () => {
  it('returns empty string for empty input', () => {
    expect(normalizeImageUrl('')).toBe('')
  })

  it('returns empty string for whitespace-only input', () => {
    expect(normalizeImageUrl('   ')).toBe('')
  })

  it('returns plain URL unchanged', () => {
    expect(normalizeImageUrl('https://example.com/photo.jpg')).toBe('https://example.com/photo.jpg')
  })

  it('returns relative path unchanged', () => {
    expect(normalizeImageUrl('/uploads/photo.jpg')).toBe('/uploads/photo.jpg')
  })

  it('extracts src from an <img> HTML tag', () => {
    expect(normalizeImageUrl('<img src="https://example.com/img.jpg" />')).toBe('https://example.com/img.jpg')
  })

  it('extracts src from <img> tag with single quotes', () => {
    expect(normalizeImageUrl("<img src='https://example.com/img.png'>")).toBe('https://example.com/img.png')
  })

  it('extracts URL from markdown image syntax', () => {
    expect(normalizeImageUrl('![alt text](https://example.com/img.jpg)')).toBe('https://example.com/img.jpg')
  })

  it('extracts URL from markdown image with empty alt text', () => {
    expect(normalizeImageUrl('![](https://example.com/img.jpg)')).toBe('https://example.com/img.jpg')
  })

  it('trims whitespace from input before processing', () => {
    expect(normalizeImageUrl('  https://example.com/photo.jpg  ')).toBe('https://example.com/photo.jpg')
  })
})
