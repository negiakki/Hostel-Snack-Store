interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Product categories">
      <button
        type="button"
        className={
          selectedCategory === null
            ? "h-11 shrink-0 rounded-full bg-aloe-10 px-5 text-sm font-medium text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            : "h-11 shrink-0 rounded-full border border-white/35 px-5 text-sm font-medium text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        }
        aria-pressed={selectedCategory === null}
        onClick={() => onSelect(null)}
      >
        All products
      </button>
      {categories.map((category) => {
        const isSelected = selectedCategory === category;

        return (
          <button
            key={category}
            type="button"
            className={
              isSelected
                ? "h-11 shrink-0 rounded-full bg-aloe-10 px-5 text-sm font-medium text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                : "h-11 shrink-0 rounded-full border border-white/35 px-5 text-sm font-medium text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            }
            aria-pressed={isSelected}
            onClick={() => onSelect(category)}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
