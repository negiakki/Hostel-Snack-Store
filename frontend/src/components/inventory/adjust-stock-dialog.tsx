"use client";

import { useRef, useState } from "react";
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
import type { InventoryProduct, StockOperation } from "@/lib/inventory";

interface AdjustStockDialogProps {
  product: InventoryProduct | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    productId: string,
    operation: StockOperation,
    value: number,
  ) => Promise<void>;
  onError: (message: string) => void;
}

const operations: Array<{
  id: StockOperation;
  label: string;
  description: string;
}> = [
  { id: "add", label: "Add stock", description: "Increase current stock." },
  {
    id: "remove",
    label: "Remove stock",
    description: "Decrease stock for damaged or missing items.",
  },
  {
    id: "set",
    label: "Set stock",
    description: "Replace stock after a manual count.",
  },
];

export function AdjustStockDialog({
  product,
  isSubmitting,
  onOpenChange,
  onSubmit,
  onError,
}: AdjustStockDialogProps) {
  const [operation, setOperation] = useState<StockOperation>("add");
  const [value, setValue] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const submissionInProgress = useRef(false);
  const selectedOperation = operations.find((item) => item.id === operation)!;
  const fieldLabel = operation === "set" ? "New stock" : "Quantity";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const numericValue = Number(value);
    const isValid =
      value.trim() !== "" &&
      Number.isSafeInteger(numericValue) &&
      numericValue >= 0 &&
      (operation === "set" || numericValue > 0);

    if (!isValid) {
      const message =
        operation === "set"
          ? "New stock must be a whole number that is zero or greater."
          : "Quantity must be a whole number greater than zero.";
      setFormError(message);
      return;
    }

    if (!product || isSubmitting || submissionInProgress.current) {
      return;
    }

    submissionInProgress.current = true;

    try {
      await onSubmit(product.id, operation, numericValue);
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to adjust stock.";
      setFormError(message);
      onError(message);
    } finally {
      submissionInProgress.current = false;
    }
  }

  return (
    <Dialog open={product !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogClose className="sr-only">Close dialog</DialogClose>
        <div className="flex items-start justify-between gap-4">
          <div>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Adjust stock
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-6 text-muted-foreground">
              {product?.name ?? "Selected product"} currently has{" "}
              <span className="font-mono font-medium text-foreground">
                {product?.stock ?? 0}
              </span>{" "}
              units available.
            </DialogDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close stock adjustment"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            <X aria-hidden="true" />
          </Button>
        </div>

        <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">Operation</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {operations.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant={operation === item.id ? "default" : "outline"}
                  className="justify-start px-4"
                  aria-pressed={operation === item.id}
                  disabled={isSubmitting}
                  onClick={() => {
                    setOperation(item.id);
                    setValue("");
                    setFormError(null);
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedOperation.description}
            </p>
          </fieldset>

          <div className="grid gap-2">
            <Label htmlFor="inventory-adjustment-value">{fieldLabel}</Label>
            <Input
              id="inventory-adjustment-value"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {formError ? (
            <p
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {formError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
              {isSubmitting ? "Saving" : selectedOperation.label}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
