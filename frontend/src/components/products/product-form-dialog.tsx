"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "@/lib/products";

interface ProductFormValues {
  name: string;
  category: string;
  imageUrl: string;
  sellingPrice: string;
  costPrice: string;
  stock: string;
}

interface ProductFormDialogProps {
  open: boolean;
  product: Product | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateProductInput | UpdateProductInput) => Promise<void>;
}

const emptyValues: ProductFormValues = {
  name: "",
  category: "",
  imageUrl: "",
  sellingPrice: "",
  costPrice: "",
  stock: "0",
};

function getInitialValues(product: Product | null): ProductFormValues {
  if (!product) {
    return emptyValues;
  }

  return {
    name: product.name,
    category: product.category,
    imageUrl: product.imageUrl,
    sellingPrice: String(product.sellingPrice),
    costPrice: "",
    stock: "",
  };
}

function validateUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ProductFormDialog({
  open,
  product,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: ProductFormDialogProps) {
  const [values, setValues] = useState<ProductFormValues>(() =>
    getInitialValues(product),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const isEditing = product !== null;

  const title = isEditing ? "Edit product" : "Add product";
  const submitLabel = isEditing ? "Save changes" : "Create product";
  const description = useMemo(
    () =>
      isEditing
        ? "Update the details that should change. Cost price is optional and remains unchanged when blank."
        : "Add the product details needed for tonight's shop.",
    [isEditing],
  );

  function updateValue(field: keyof ProductFormValues, value: string) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
  }

  function updateInitialStock(value: string) {
    if (value === "" || /^\d+$/.test(value)) {
      updateValue("stock", value);
      return;
    }

    setFormError(
      "Initial stock must be a whole number that is zero or greater.",
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const name = values.name.trim();
    const category = values.category.trim();
    const imageUrl = values.imageUrl.trim();
    const sellingPriceInput = values.sellingPrice.trim();
    const sellingPrice = Number(values.sellingPrice);

    if (!name || !category || !imageUrl) {
      setFormError("Name, category, and image URL are required.");
      return;
    }

    if (!validateUrl(imageUrl)) {
      setFormError("Enter a valid HTTP or HTTPS image URL.");
      return;
    }

    if (
      !sellingPriceInput ||
      !Number.isFinite(sellingPrice) ||
      sellingPrice < 0
    ) {
      setFormError("Selling price must be zero or greater.");
      return;
    }

    if (!isEditing) {
      const costPrice = Number(values.costPrice);
      const stockInput = values.stock.trim();
      const stock = Number(values.stock);

      if (
        !values.costPrice.trim() ||
        !Number.isFinite(costPrice) ||
        costPrice < 0
      ) {
        setFormError("Cost price must be zero or greater.");
        return;
      }

      if (!stockInput || !Number.isSafeInteger(stock) || stock < 0) {
        setFormError(
          "Initial stock must be a whole number that is zero or greater.",
        );
        return;
      }

      await onSubmit({
        name,
        category,
        imageUrl,
        sellingPrice,
        costPrice,
        stock,
      });
      return;
    }

    const changes: UpdateProductInput = {
      ...(name !== product.name ? { name } : {}),
      ...(category !== product.category ? { category } : {}),
      ...(imageUrl !== product.imageUrl ? { imageUrl } : {}),
      ...(sellingPrice !== product.sellingPrice ? { sellingPrice } : {}),
    };

    if (values.costPrice.trim()) {
      const costPrice = Number(values.costPrice);

      if (!Number.isFinite(costPrice) || costPrice < 0) {
        setFormError("Cost price must be zero or greater.");
        return;
      }

      changes.costPrice = costPrice;
    }

    if (!Object.keys(changes).length) {
      setFormError("Make a change before saving.");
      return;
    }

    await onSubmit(changes);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose className="sr-only">Close dialog</DialogClose>
        <div className="flex items-start justify-between gap-4">
          <div>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </DialogDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close product form"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            <X aria-hidden="true" />
          </Button>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="product-name">Product name</Label>
            <Input
              id="product-name"
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              autoComplete="off"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-category">Category</Label>
            <Input
              id="product-category"
              value={values.category}
              onChange={(event) => updateValue("category", event.target.value)}
              autoComplete="off"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="product-image-url">Image URL</Label>
            <Input
              id="product-image-url"
              type="url"
              value={values.imageUrl}
              onChange={(event) => updateValue("imageUrl", event.target.value)}
              placeholder="https://example.com/product.jpg"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="product-selling-price">Selling price</Label>
              <Input
                id="product-selling-price"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={values.sellingPrice}
                onChange={(event) =>
                  updateValue("sellingPrice", event.target.value)
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-cost-price">
                Cost price {isEditing ? "(optional)" : ""}
              </Label>
              <Input
                id="product-cost-price"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={values.costPrice}
                onChange={(event) =>
                  updateValue("costPrice", event.target.value)
                }
                placeholder={isEditing ? "Leave unchanged" : ""}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {!isEditing ? (
            <div className="grid gap-2">
              <Label htmlFor="product-stock">Initial stock</Label>
              <Input
                id="product-stock"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={values.stock}
                onChange={(event) => updateInitialStock(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
          ) : null}

          {formError ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {formError}
            </p>
          ) : null}

          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
              {isSubmitting ? "Saving" : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
