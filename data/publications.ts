import type { LocalizedText } from './profile'

export interface PublicationAuthor {
  name: string
  isSelf?: boolean
  url?: string
}

export interface Publication {
  id: string
  title: string
  authors: PublicationAuthor[]
  venue: string
  year: number
  /** Submission is never treated as acceptance or publication. */
  status: 'preprint' | 'submitted' | 'accepted' | 'published'
  /** Date the public bibliographic information / status was checked. */
  verifiedOn: string
  tags: string[]
  selected?: boolean
  summary?: LocalizedText
  thumbnail?: { src: string; alt: LocalizedText }
  links?: {
    paper?: string
    pdf?: string
    code?: string
    project?: string
    dataset?: string
  }
  bibtex?: string
}

/**
 * Add only verified publications. The UI handles an empty list deliberately.
 * Available tags, years and Selected filters are derived from this data.
 * Put optional thumbnails/PDFs in public/ and use root-relative asset paths.
 */
export const publications: Publication[] = []

export const publicationStatusLabels: Record<Publication['status'], LocalizedText> = {
  preprint: { zh: '预印本', en: 'Preprint' },
  submitted: { zh: '投稿中', en: 'Submitted' },
  accepted: { zh: '已接收', en: 'Accepted' },
  published: { zh: '已发表', en: 'Published' },
}
