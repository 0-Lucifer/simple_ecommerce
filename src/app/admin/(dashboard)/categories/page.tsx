import { getAdminCategories } from "@/lib/data/admin";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Categories</h1>
        <p className="text-muted-foreground">
          Organize products into collections.
        </p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
