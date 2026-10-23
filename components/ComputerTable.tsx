'use client'
import { Computer } from '@/types'
import { StatusBadge } from './Badges'
import { Pencil, Trash2, Eye } from 'lucide-react'

interface ComputerTableProps {
  computers: Computer[]
  onEdit?: (c: Computer) => void
  onDelete?: (c: Computer) => void
  onView?: (c: Computer) => void
  isAdmin?: boolean
}

export default function ComputerTable({ computers, onEdit, onDelete, onView, isAdmin }: ComputerTableProps) {
  if (computers.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Eye size={24} className="opacity-40" />
        </div>
        <p className="text-base font-semibold text-slate-500">No computers found</p>
        <p className="text-sm mt-1">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200">
            <th className="table-header">Code</th>
            <th className="table-header">Name</th>
            <th className="table-header hidden md:table-cell">Brand / Model</th>
            <th className="table-header hidden lg:table-cell">Location</th>
            <th className="table-header">Status</th>
            <th className="table-header">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {computers.map(c => (
            <tr key={c.id} className="table-row">
              <td className="table-cell">
                <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{c.computer_code}</span>
              </td>
              <td className="table-cell font-semibold text-slate-800">{c.computer_name}</td>
              <td className="table-cell hidden md:table-cell text-slate-500">{c.brand} {c.model}</td>
              <td className="table-cell hidden lg:table-cell text-slate-500">{c.location || '—'}</td>
              <td className="table-cell"><StatusBadge status={c.status} /></td>
              <td className="table-cell">
                <div className="flex items-center gap-1">
                  {onView && (
                    <button onClick={() => onView(c)} className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors" title="View">
                      <Eye size={15} />
                    </button>
                  )}
                  {isAdmin && onEdit && (
                    <button onClick={() => onEdit(c)} className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-xl transition-colors" title="Edit">
                      <Pencil size={15} />
                    </button>
                  )}
                  {isAdmin && onDelete && (
                    <button onClick={() => onDelete(c)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
