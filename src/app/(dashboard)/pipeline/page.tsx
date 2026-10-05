import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PipelineBoard from '@/components/PipelineBoard'
import { orLikeValue } from '@/lib/filters'
import type { Candidate, PipelineStage } from '@/lib/supabase/types'

export const revalidate = 0

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = createClient()
  const q = searchParams.q?.trim() || ''

  let candidatesQuery = supabase
    .from('candidates')
    .select('*, stage:pipeline_stages(*), assignee:hr_users(id,full_name,email)')
    .order('last_activity_at', { ascending: false })

  if (q) {
    const v = orLikeValue(q)
    // One box covers name, email, and role (partial match either way)
    candidatesQuery = candidatesQuery.or(
      `first_name.ilike.${v},last_name.ilike.${v},email.ilike.${v},preferred_role.ilike.${v}`
    )
  }

  const [{ data: stages }, { data: candidates }] = await Promise.all([
    supabase
      .from('pipeline_stages')
      .select('*')
      .order('order_index'),
    candidatesQuery,
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {candidates?.length ?? 0} {q ? 'matching candidates' : 'candidates'} across {stages?.length ?? 0} stages
          </p>
        </div>
        <form className="flex gap-3 flex-wrap">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name, email, or role"
            aria-label="Search by name, email, or role"
            className="input max-w-xs"
            autoComplete="off"
          />
          <button type="submit" className="btn-primary">Search</button>
          {q && <Link href="/pipeline" className="btn-ghost">Clear</Link>}
        </form>
      </div>
      <PipelineBoard
        stages={(stages ?? []) as PipelineStage[]}
        candidates={(candidates ?? []) as Candidate[]}
      />
    </div>
  )
}
