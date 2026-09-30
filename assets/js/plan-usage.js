// ==== PLAN_USAGE_V1 ====
window.PlanUsage = (function () {
  const CFG = {
    enrollStatus: 'active',
    enrollAnchor: ['created_at','enrolled_at','start_date'],
    countStatuses: ['cancelled','rejected'],
    cycleMode: 'rolling30',
  };

  function pickAnchor(row) {
    for (const k of CFG.enrollAnchor) if (row?.[k]) return row[k];
    return row?.created_at || new Date().toISOString();
  }

  function cycleRange(anchorIso) {
    const start = new Date(anchorIso);
    if (CFG.cycleMode === 'calendar') {
      const s = new Date(start.getFullYear(), start.getMonth(), 1);
      const e = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      return [s, e];
    }
    const e = new Date(start); e.setDate(e.getDate() + 30);
    return [start, e];
  }

  async function get(userId, dbRef) {
    const db = dbRef || window.db || window.supabase;
    if (!db) return { hasPlan:false, canBook:false, reason:'DB not ready' };

    const { data: enr, error: e1 } = await db
      .from('enrollments')
      .select('id, plan_id, status, created_at, enrolled_at, start_date')
      .eq('student_id', userId)
      .eq('status', CFG.enrollStatus)
      .not('plan_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (e1) console.warn('[PlanUsage] enroll query:', e1);
    if (!enr || !enr.plan_id) {
      return { hasPlan:false, canBook:false, reason:'No active plan. Please purchase a plan to book classes.' };
    }

    const { data: plan } = await db
      .from('pricing_plans').select('*').eq('id', enr.plan_id).single();

    if (!plan) {
      return { hasPlan:true, planId:enr.plan_id, unlimited:true, canBook:true, planName:'Custom' };
    }
    const limit = Number(plan.classes_per_month || 0);
    if (!limit || limit <= 0) {
      return { hasPlan:true, planId:plan.id, planName:plan.name,
               unlimited:true, canBook:true, limit:0, used:0, remaining:Infinity };
    }

    const anchorIso = pickAnchor(enr);
    const [cycleStart, cycleEnd] = cycleRange(anchorIso);

    const { count, error: e2 } = await db
      .from('classes')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', userId)
      .gte('scheduled_at', cycleStart.toISOString())
      .lt('scheduled_at', cycleEnd.toISOString())
      .not('status', 'in', `(${CFG.countStatuses.join(',')})`);

    if (e2) console.warn('[PlanUsage] count query:', e2);

    const used = count || 0;
    const remaining = Math.max(0, limit - used);

    const result = {
      hasPlan:true, planId:plan.id, planName:plan.name,
      limit, used, remaining,
      cycleStart, cycleEnd,
      canBook: remaining > 0,
      reason: remaining > 0 ? '' :
        `Monthly limit reached (${used}/${limit}). Renew or upgrade to book more classes.`
    };
    console.log('[PlanUsage]', result);
    return result;
  }

  return { get, _CFG: CFG };
})();
// ==== END PLAN_USAGE_V1 ====
