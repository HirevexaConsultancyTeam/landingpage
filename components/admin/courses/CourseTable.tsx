"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  BookOpen,
} from "lucide-react";

export interface CourseRow {
  id: string;
  title: string;
  slug: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  price: number;
  discount: number;
  published: boolean;
  featured: boolean;
  instructor: string | null;
  language: string;
  createdAt: string;
  category: { id: string; name: string } | null;
  _count: { enrollments: number; modules: number; reviews: number };
}

interface CourseTableProps {
  data: CourseRow[];
  loading: boolean;
  onEdit: (course: CourseRow) => void;
  onDelete: (course: CourseRow) => void;
  onTogglePublish: (course: CourseRow) => void;
}

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-700",
  INTERMEDIATE: "bg-yellow-100 text-yellow-700",
  ADVANCED: "bg-red-100 text-red-700",
};

const PAGE_SIZES = [10, 20, 50];

export default function CourseTable({
  data,
  loading,
  onEdit,
  onDelete,
  onTogglePublish,
}: CourseTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<CourseRow>[]>(
    () => [
      {
        id: "title",
        accessorKey: "title",
        header: "Course",
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="min-w-[200px] max-w-[280px]">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-medium text-gray-900">
                  {course.title}
                </span>
                {course.featured && (
                  <Star className="h-3.5 w-3.5 flex-shrink-0 fill-yellow-400 text-yellow-400" />
                )}
              </div>
              {course.instructor && (
                <p className="mt-0.5 truncate text-xs text-gray-400">
                  {course.instructor}
                </p>
              )}
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: "category",
        accessorFn: (row) => row.category?.name ?? "",
        header: "Category",
        cell: ({ getValue }) => {
          const val = getValue<string>();
          return val ? (
            <span className="text-sm text-gray-600">{val}</span>
          ) : (
            <span className="text-sm text-gray-300">—</span>
          );
        },
        enableSorting: true,
      },
      {
        id: "level",
        accessorKey: "level",
        header: "Level",
        cell: ({ getValue }) => {
          const level = getValue<string>();
          return (
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_COLORS[level]}`}
            >
              {LEVEL_LABELS[level]}
            </span>
          );
        },
        enableSorting: true,
      },
      {
        id: "price",
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
          const { price, discount } = row.original;
          const effective = price - (price * discount) / 100;
          return (
            <div>
              <p className="text-sm font-medium text-gray-900">
                ₹{effective.toFixed(0)}
              </p>
              {discount > 0 && (
                <p className="text-xs text-gray-400 line-through">₹{price}</p>
              )}
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: "enrollments",
        accessorFn: (row) => row._count.enrollments,
        header: "Students",
        cell: ({ getValue }) => (
          <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
            {getValue<number>()}
          </span>
        ),
        enableSorting: true,
      },
      {
        id: "modules",
        accessorFn: (row) => row._count.modules,
        header: "Modules",
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-500">{getValue<number>()}</span>
        ),
        enableSorting: true,
      },
      {
        id: "published",
        accessorKey: "published",
        header: "Status",
        cell: ({ row }) => {
          const course = row.original;
          return (
            <button
              onClick={() => onTogglePublish(course)}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                course.published
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {course.published ? (
                <>
                  <Eye className="h-3 w-3" /> Live
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3" /> Draft
                </>
              )}
            </button>
          );
        },
        enableSorting: true,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
  
   <a href={`/admin/courses/${course.id}/curriculum`}
    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-orange-50 hover:text-[#FF9900]"
    title="Curriculum"
  >
    <BookOpen className="h-4 w-4" />
  </a>
  <button
    onClick={() => onEdit(course)}
    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
    title="Edit"
  >
    <Pencil className="h-4 w-4" />
  </button>
  <button
    onClick={() => onDelete(course)}
    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
    title="Delete"
  >
    <Trash2 className="h-4 w-4" />
  </button>
</div>
          );
        },
        enableSorting: false,
      },
    ],
    [onEdit, onDelete, onTogglePublish]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="space-y-4">
      {/* Search + Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Global search */}
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search by title, instructor, category..."
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-black sm:max-w-sm"
        />

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Status:</span>
          {(
            [
              { label: "All", value: undefined },
              { label: "Live", value: true },
              { label: "Draft", value: false },
            ] as const
          ).map(({ label, value }) => {
            const current = table
              .getColumn("published")
              ?.getFilterValue() as boolean | undefined;
            const isActive = current === value;
            return (
              <button
                key={label}
                onClick={() =>
                  table.getColumn("published")?.setFilterValue(value)
                }
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
          </div>
        ) : table.getRowModel().rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookOpen className="mb-3 h-10 w-10 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">
              {globalFilter || table.getColumn("published")?.getFilterValue() !== undefined
                ? "No courses match your filters."
                : "No courses yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-gray-100 bg-gray-50"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <button
                            onClick={header.column.getToggleSortingHandler()}
                            className="inline-flex items-center gap-1 hover:text-gray-800"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronsUpDown className="h-3.5 w-3.5 text-gray-300" />
                            )}
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="transition hover:bg-gray-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalRows > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          {/* Count */}
          <p className="text-xs text-gray-500">
            Showing {from}–{to} of {totalRows} course{totalRows !== 1 ? "s" : ""}
          </p>

          <div className="flex items-center gap-3">
            {/* Page size */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:border-black"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Prev / Next */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[80px] text-center text-xs text-gray-500">
                Page {pageIndex + 1} of {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}