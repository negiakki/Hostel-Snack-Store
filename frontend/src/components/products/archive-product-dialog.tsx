"use client";

import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/lib/products";

interface ArchiveProductDialogProps {
  product: Product | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function ArchiveProductDialog({
  product,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: ArchiveProductDialogProps) {
  return (
    <Dialog open={product !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogClose className="sr-only">Close dialog</DialogClose>
        <DialogTitle className="text-xl font-semibold tracking-tight">
          Archive product?
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">
          {product
            ? product.name +
              " will be removed from the active product list. Its order history remains available."
            : ""}
        </DialogDescription>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-red-700 text-white hover:bg-red-800"
            onClick={() => void onConfirm()}
            disabled={isSubmitting}
          >
            {isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
            {isSubmitting ? "Archiving" : "Archive product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
