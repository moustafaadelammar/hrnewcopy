import type { } from 'react'

type ScopeLevel='الكل'|'الشركة'|'القطاع'|'الهندسة'|'القسم'|'القسم الفرعي'|'الوظيفة'
type ScopedUser={role?:string;scopeLevel?:ScopeLevel;scopeValue?:string}
type ScopedEmployee={company?:string;sector?:string;engineering?:string;department?:string;subDepartment?:string;job?:string}

const roleDefaults:Record<string,ScopeLevel>={
  'مدير النظام':'الكل',
  'موارد بشرية':'الشركة',
  'حضور وانصراف':'الهندسة',
  'طبي':'الهندسة',
  'مشاهد':'الهندسة'
}

export function normalizeUserScope(user:ScopedUser|null|undefined):ScopeLevel{
  if(!user)return 'الكل'
  if(user.role==='مدير النظام')return 'الكل'
  return user.scopeLevel&&['الشركة','القطاع','الهندسة','القسم','القسم الفرعي','الوظيفة','الكل'].includes(user.scopeLevel)
    ? user.scopeLevel
    : roleDefaults[user.role||'']||'الهندسة'
}

export function filterEmployeesByScope<T extends ScopedEmployee>(user:ScopedUser|null|undefined,employees:T[]):T[]{
  if(!user)return []
  const level=normalizeUserScope(user)
  if(level==='الكل'||user.role==='مدير النظام')return employees
  const value=String(user.scopeValue||'').trim()
  if(!value)return []
  const field:Record<Exclude<ScopeLevel,'الكل'>,keyof ScopedEmployee>={
    'الشركة':'company',
    'القطاع':'sector',
    'الهندسة':'engineering',
    'القسم':'department',
    'القسم الفرعي':'subDepartment',
    'الوظيفة':'job'
  }
  const key=field[level]
  return employees.filter(employee=>String(employee[key]||'')===value)
}
