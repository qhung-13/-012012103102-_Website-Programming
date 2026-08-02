"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

const initialTasks = [
  { id: 1, label: "Approve new product listings for Spring drop", done: true },
  { id: 2, label: "Reply to pending customer support tickets", done: true },
  { id: 3, label: "Review flagged reviews on 3 products", done: false },
  { id: 4, label: "Restock low-inventory sizes for best sellers", done: false },
  { id: 5, label: "Confirm shipping rates with new courier", done: false },
  { id: 6, label: "Update homepage banner for the weekend sale", done: false },
  { id: 7, label: "Process refund requests older than 48h", done: false },
  { id: 8, label: "Sync product categories with the storefront", done: false },
  { id: 9, label: "Follow up with 2 pending vendor invoices", done: true },
  { id: 10, label: "Archive discontinued product SKUs", done: true },
];

const TodoList = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  };

  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">Todo List</h1>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button className="w-full" variant="outline">
            <CalendarIcon />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => {
              setDate(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {/* LIST */}
      <ScrollArea className="max-h-[400px] mt-4 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <Card key={task.id} className="p-3.5">
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.done}
                  onCheckedChange={() => toggleTask(task.id)}
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className={`text-sm cursor-pointer ${
                    task.done
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {task.label}
                </label>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TodoList;
