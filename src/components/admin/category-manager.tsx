"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/actions/categories";
import type { Category } from "@/lib/types";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Category | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", slug: "", description: "", sort_order: 0 },
  });

  const nameReg = register("name");

  function startEdit(c: Category) {
    setEditing(c);
    reset({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      sort_order: c.sort_order,
    });
  }

  function cancelEdit() {
    setEditing(null);
    reset({ name: "", slug: "", description: "", sort_order: 0 });
  }

  function onSubmit(values: CategoryInput) {
    startTransition(async () => {
      const res = editing
        ? await updateCategory(editing.id, values)
        : await createCategory(values);
      if (res.ok) {
        toast.success(editing ? "Category updated" : "Category added");
        cancelEdit();
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  function onDelete(id: string) {
    if (
      !window.confirm(
        "Delete this category? Products keep existing but lose this category.",
      )
    )
      return;
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (res.ok) {
        toast.success("Category deleted");
        if (editing?.id === id) cancelEdit();
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-2xl border bg-card p-5 lg:col-span-1"
      >
        <h2 className="font-medium">
          {editing ? "Edit category" : "Add category"}
        </h2>
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            {...nameReg}
            onChange={(e) => {
              nameReg.onChange(e);
              if (!editing) setValue("slug", slugify(e.target.value));
            }}
            placeholder="e.g. Waxes"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input {...register("slug")} placeholder="waxes" />
          {errors.slug && (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea rows={2} {...register("description")} placeholder="Optional" />
        </div>
        <div className="space-y-2">
          <Label>Sort order</Label>
          <Input
            type="number"
            step="1"
            {...register("sort_order", { valueAsNumber: true })}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending} className="flex-1">
            {editing ? "Save" : "Add category"}
          </Button>
          {editing && (
            <Button type="button" variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="lg:col-span-2">
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
            No categories yet. Add your first one.
          </div>
        ) : (
          <ul className="divide-y rounded-2xl border bg-card">
            {categories.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0">
                  <div className="font-medium">{c.name}</div>
                  <div className="truncate text-sm text-muted-foreground">
                    /{c.slug}
                    {c.description ? ` · ${c.description}` : ""}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => startEdit(c)}
                    aria-label="Edit category"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(c.id)}
                    disabled={pending}
                    aria-label="Delete category"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
