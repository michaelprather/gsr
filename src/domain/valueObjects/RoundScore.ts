import type { Score } from './Score'

export type RoundScore =
  | { readonly type: 'pending' }
  | { readonly type: 'entered'; readonly value: Score }
  | { readonly type: 'skipped' }

export const RoundScore = {
  pending(): RoundScore {
    return { type: 'pending' }
  },

  entered(value: Score): RoundScore {
    return { type: 'entered', value }
  },

  skipped(): RoundScore {
    return { type: 'skipped' }
  },

  isPending(score: RoundScore): score is { type: 'pending' } {
    return score.type === 'pending'
  },

  isEntered(score: RoundScore): score is { type: 'entered'; value: Score } {
    return score.type === 'entered'
  },

  isSkipped(score: RoundScore): score is { type: 'skipped' } {
    return score.type === 'skipped'
  },
}
