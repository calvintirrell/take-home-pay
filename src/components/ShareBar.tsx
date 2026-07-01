import { useState } from 'react'
import type { Inputs } from '../engine/types'
import { buildShareUrl } from '../lib/shareUrl'

interface Props {
  inputs: Inputs
}

type CopyState = 'idle' | 'copied' | 'error'

export function ShareBar({ inputs }: Props) {
  const [state, setState] = useState<CopyState>('idle')

  const onCopy = async () => {
    const url = buildShareUrl(inputs)
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        // Fallback for browsers/contexts without the async clipboard API.
        const el = document.createElement('textarea')
        el.value = url
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      }
      setState('copied')
    } catch {
      setState('error')
    }
    window.setTimeout(() => setState('idle'), 2000)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
      <p className="text-sm text-slate-600">
        Share this scenario — your inputs are encoded in the link.
      </p>
      <button
        type="button"
        onClick={onCopy}
        className="rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
      >
        {state === 'copied' ? 'Link copied ✓' : state === 'error' ? 'Copy failed' : 'Copy shareable link'}
      </button>
    </div>
  )
}
