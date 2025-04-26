"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { priorities, statuses } from "../data/data"
import { useState } from "react"
import { Task } from "../data/schema" // Import the Task type

interface DataTableToolbarProps {
  table: Table<Task> // Use Task type directly
  data: Task[] // Pass the data to calculate averages
}

export function DataTableToolbar({
  table,
  data,
}: DataTableToolbarProps) {
  const [costFilter, setCostFilter] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<string>("");
  const isFiltered = table.getState().columnFilters.length > 0;

  // Calculate average cost and duration
  const filteredData = data.filter((item) => {
    const matchesCost = costFilter ? item.cost <= costFilter : true; // Now 'cost' exists
    const matchesDate = dateFilter ? item.date === dateFilter : true; // Now 'date' exists
    return matchesCost && matchesDate;
  });

  const avgCost = filteredData.length > 0 ? (filteredData.reduce((sum, item) => sum + item.cost, 0) / filteredData.length).toFixed(2) : 0;
  const avgDuration = filteredData.length > 0 ? (filteredData.reduce((sum, item) => sum + item.duration, 0) / filteredData.length).toFixed(2) : 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter tasks..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Input
          placeholder="Max Cost"
          type="number"
          value={costFilter ?? ""}
          onChange={(event) => setCostFilter(event.target.value ? Number(event.target.value) : null)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <Input
          placeholder="Date (YYYY-MM-DD)"
          type="date"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {table.getColumn("priority") && (
          <DataTableFacetedFilter
            column={table.getColumn("priority")}
            title="Priority"
            options={priorities}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X />
          </Button>
        )}
      </div>
      <div className="flex flex-col">
        <span>Average Cost: ${avgCost}</span>
        <span>Average Duration: {avgDuration} hours</span>
      </div>
    </div>
  )
}
