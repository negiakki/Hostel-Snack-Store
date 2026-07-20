import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { StoreStatusService } from '../store-status/store-status.service';
import { CreateOrderDto } from './dto/create-order.dto';

const orderProductSelect = {
  id: true,
  name: true,
  selling_price: true,
  cost_price: true,
  stock: true,
  is_archived: true,
} satisfies Prisma.ProductSelect;

const createdOrderSelect = {
  id: true,
  status: true,
  total_amount: true,
  created_at: true,
} satisfies Prisma.OrderSelect;

const orderListSelect = {
  id: true,
  customer_name: true,
  status: true,
  total_amount: true,
  created_at: true,
  _count: { select: { order_items: true } },
} satisfies Prisma.OrderSelect;

const orderDetailSelect = {
  id: true,
  customer_name: true,
  status: true,
  total_amount: true,
  created_at: true,
  order_items: {
    select: {
      product_name: true,
      quantity: true,
      selling_price: true,
      subtotal: true,
    },
    orderBy: { id: 'asc' },
  },
} satisfies Prisma.OrderSelect;

export type CreatedOrderRecord = Prisma.OrderGetPayload<{
  select: typeof createdOrderSelect;
}>;

export type OrderListRecord = Prisma.OrderGetPayload<{
  select: typeof orderListSelect;
}>;

export type OrderDetailRecord = Prisma.OrderGetPayload<{
  select: typeof orderDetailSelect;
}>;

export class OrderProductNotFoundError extends Error {
  constructor(readonly productId: string) {
    super('Product not found.');
  }
}

export class ArchivedOrderProductError extends Error {
  constructor(readonly productId: string) {
    super('Archived products cannot be ordered.');
  }
}

export class InsufficientOrderStockError extends Error {
  constructor(readonly productId: string) {
    super('Insufficient stock for one or more requested products.');
  }
}

export class StoreClosedOrderError extends Error {
  constructor() {
    super('The store is currently closed.');
  }
}

export class OrderNotFoundError extends Error {
  constructor(readonly orderId: string) {
    super('Order not found.');
  }
}

export class InvalidOrderStatusTransitionError extends Error {
  constructor() {
    super('Order status transition is invalid.');
  }
}

const allowedNextStatuses: Readonly<Record<OrderStatus, OrderStatus | null>> = {
  [OrderStatus.Placed]: OrderStatus.Ready,
  [OrderStatus.Ready]: OrderStatus.Completed,
  [OrderStatus.Completed]: null,
};

@Injectable()
export class OrdersRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storeStatusService: StoreStatusService,
  ) {}

  create(data: CreateOrderDto): Promise<CreatedOrderRecord> {
    return this.prisma.$transaction(async (transaction) => {
      const products = await transaction.product.findMany({
        where: { id: { in: data.items.map((item) => item.productId) } },
        select: orderProductSelect,
      });
      const productsById = new Map(
        products.map((product) => [product.id, product]),
      );

      for (const item of data.items) {
        const product = productsById.get(item.productId);

        if (!product) {
          throw new OrderProductNotFoundError(item.productId);
        }

        if (product.is_archived) {
          throw new ArchivedOrderProductError(item.productId);
        }

        if (product.stock < item.quantity) {
          throw new InsufficientOrderStockError(item.productId);
        }
      }

      if (!(await this.storeStatusService.isOpen(transaction))) {
        throw new StoreClosedOrderError();
      }

      for (const item of data.items) {
        const updateResult = await transaction.product.updateMany({
          where: {
            id: item.productId,
            is_archived: false,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (updateResult.count !== 1) {
          throw new InsufficientOrderStockError(item.productId);
        }
      }

      const snapshots = data.items.map((item) => {
        const product = productsById.get(item.productId);

        if (!product) {
          throw new OrderProductNotFoundError(item.productId);
        }

        const subtotal = product.selling_price.mul(item.quantity);

        return {
          productId: product.id,
          productName: product.name,
          sellingPrice: product.selling_price,
          costPrice: product.cost_price,
          quantity: item.quantity,
          subtotal,
          costSubtotal: product.cost_price.mul(item.quantity),
        };
      });
      const total = snapshots.reduce(
        (sum, snapshot) => sum.add(snapshot.subtotal),
        new Prisma.Decimal(0),
      );
      const totalCost = snapshots.reduce(
        (sum, snapshot) => sum.add(snapshot.costSubtotal),
        new Prisma.Decimal(0),
      );

      return transaction.order.create({
        data: {
          customer_name: data.customerName,
          total_amount: total,
          total_cost: totalCost,
          total_profit: total.sub(totalCost),
          order_items: {
            create: snapshots.map((snapshot) => ({
              product: { connect: { id: snapshot.productId } },
              product_name: snapshot.productName,
              selling_price: snapshot.sellingPrice,
              cost_price: snapshot.costPrice,
              quantity: snapshot.quantity,
              subtotal: snapshot.subtotal,
            })),
          },
        },
        select: createdOrderSelect,
      });
    });
  }

  list(): Promise<OrderListRecord[]> {
    return this.prisma.order.findMany({
      orderBy: { created_at: 'desc' },
      select: orderListSelect,
    });
  }

  async getById(orderId: string): Promise<OrderDetailRecord> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: orderDetailSelect,
    });

    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    return order;
  }

  updateStatus(
    orderId: string,
    nextStatus: OrderStatus,
  ): Promise<OrderDetailRecord> {
    return this.prisma.$transaction(async (transaction) => {
      const currentOrder = await transaction.order.findUnique({
        where: { id: orderId },
        select: { status: true },
      });

      if (!currentOrder) {
        throw new OrderNotFoundError(orderId);
      }

      if (allowedNextStatuses[currentOrder.status] !== nextStatus) {
        throw new InvalidOrderStatusTransitionError();
      }

      const update = await transaction.order.updateMany({
        where: { id: orderId, status: currentOrder.status },
        data: { status: nextStatus },
      });

      if (update.count !== 1) {
        throw new InvalidOrderStatusTransitionError();
      }

      const updatedOrder = await transaction.order.findUnique({
        where: { id: orderId },
        select: orderDetailSelect,
      });

      if (!updatedOrder) {
        throw new OrderNotFoundError(orderId);
      }

      return updatedOrder;
    });
  }
}
