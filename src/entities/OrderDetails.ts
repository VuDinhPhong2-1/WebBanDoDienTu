import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__OrderDet__D3B9D30C6B335C9D", ["orderDetailId"], { unique: true })
@Entity("OrderDetails", { schema: "dbo" })
export class OrderDetails {
  @PrimaryGeneratedColumn({ type: "int", name: "OrderDetailID" })
  orderDetailId: number;

  @Column("int", { name: "Quantity", nullable: true })
  quantity: number | null;

  @Column("decimal", {
    name: "UnitPrice",
    nullable: true,
    precision: 18,
    scale: 2,
  })
  unitPrice: number | null;

  @Column("decimal", {
    name: "DiscountPercent",
    nullable: true,
    precision: 5,
    scale: 2,
  })
  discountPercent: number | null;

  @Column("decimal", {
    name: "TotalPrice",
    nullable: true,
    precision: 18,
    scale: 2,
  })
  totalPrice: number | null;

  @Column("int", { name: "OrderID", nullable: true })
  orderId: number | null;

  @Column("int", { name: "ProductID", nullable: true })
  productId: number | null;

  @Column("nvarchar", { name: "createdBy", nullable: true, length: 100 })
  createdBy: string | null;

  @Column("nvarchar", { name: "updatedBy", nullable: true, length: 100 })
  updatedBy: string | null;

  @Column("datetime", {
    name: "createdAt",
    nullable: true,
    default: () => "getdate()",
  })
  createdAt: Date | null;

  @Column("datetime", {
    name: "updatedAt",
    nullable: true,
    default: () => "getdate()",
  })
  updatedAt: Date | null;
}
