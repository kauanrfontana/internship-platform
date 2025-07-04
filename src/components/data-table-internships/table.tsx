import { useState, useMemo } from 'react'
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Internship } from '@/types/internship'

interface Props {
  columns: ColumnDef<Internship, any>[]
  data: Internship[]
}

export function DataTableInternships({ columns, data }: Props) {
  const [filterStudent, setFilterStudent] = useState('')
  const [filterAdvisor, setFilterAdvisor] = useState('')

  const advisors = useMemo(() => {
    const unique = new Set<string>()
    data.forEach(d => {
      const o = (d as any).orientadorAtual
      if (o) unique.add(o)
    })
    return Array.from(unique).sort()
  }, [data])

  const filteredData = useMemo(() => {
    return data.filter(d => {
      const matchStudent = d.studentName?.toLowerCase().includes(filterStudent.toLowerCase())
      const matchAdvisor = filterAdvisor === '' || (d as any).orientadorAtual === filterAdvisor
      return matchStudent && matchAdvisor
    })
  }, [data, filterStudent, filterAdvisor])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="space-y-4">
      {/* FILTROS */}
<div className="flex flex-wrap items-center gap-4 mb-4">
  <input
    type="text"
    placeholder="Pesquisar estagiário"
    value={filterStudent}
    onChange={e => setFilterStudent(e.target.value)}
    className="input input-bordered input-sm w-64 max-w-full"
  />
  <select
    value={filterAdvisor}
    onChange={e => setFilterAdvisor(e.target.value)}
    className="select select-bordered select-sm w-64 max-w-full"
  >
    <option value="">Todos os orientadores</option>
    {advisors.map(advisor => (
      <option key={advisor} value={advisor}>
        {advisor}
      </option>
    ))}
  </select>
</div>

      {/* TABELA */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-4">
                  Nenhum estágio encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próximo
        </Button>
      </div>
    </div>
  )
}
