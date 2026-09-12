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
      <div className="text-center py-12 text-slate-400">
        <p className="text-lg font-medium">No computers found</p>
        <p className="text-sm mt-1">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
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
            <tr key={c.id} className="hover:bg-slate-50 transition-colors">
              <td className="table-cell font-mono text-xs font-semibold text-blue-600">{c.computer_code}</td>
              <td className="table-cell font-medium">{c.computer_name}</td>
              <td className="table-cell hidden md:table-cell text-slate-500">{c.brand} {c.model}</td>
              <td className="table-cell hidden lg:table-cell text-slate-500">{c.location || '—'}</td>
              <td className="table-cell"><StatusBadge status={c.status} /></td>
              <td className="table-cell">
                <div className="flex items-center gap-1">
                  {onView && (
                    <button onClick={() => onView(c)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="View">
                      <Eye size={15} />
                    </button>
                  )}
                  {isAdmin && onEdit && (
                    <button onClick={() => onEdit(c)} className="p-1.5 hover:bg-yellow-50 text-yellow-600 rounded-lg transition-colors" title="Edit">
                      <Pencil size={15} />
                    </button>
                  )}
                  {isAdmin && onDelete && (
                    <button onClick={() => onDelete(c)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete">
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
