import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__Orders__C3905BAFD13E4107", ["orderId"], { unique: true })
@Entity("Orders", { schema: "dbo" })
export class Orders {
  @PrimaryGeneratedColumn({ type: "int", name: "OrderID" })
  orderId: number;

  @Column("datetime", { name: "OrderDate", nullable: true })
  orderDate: Date | null;

  @Column("decimal", {
    name: "TotalAmount",
    nullable: true,
    precision: 18,
    scale: 2,
  })
  totalAmount: number | null;

  @Column("nvarchar", { name: "Status", nullable: true, length: 50 })
  status: string | null;

  @Column("nvarchar", { name: "TrackingNumber", nullable: true, length: 100 })
  trackingNumber: string | null;

  @Column("nvarchar", { name: "ShippingAddress", nullable: true, length: 255 })
  shippingAddress: string | null;

  @Column("nvarchar", { name: "BillingAddress", nullable: true, length: 255 })
  billingAddress: string | null;

  @Column("int", { name: "UserID", nullable: true })
  userId: number | null;

  @Column("int", { name: "PaymentMethodID", nullable: true })
  paymentMethodId: number | null;

  @Column("decimal", {
    name: "DiscountPercent",
    nullable: true,
    precision: 5,
    scale: 2,
  })
  discountPercent: number | null;

  @Column("int", { name: "createdBy", nullable: true })
  createdBy: number | null;

  @Column("int", { name: "updatedBy", nullable: true })
  updatedBy: number | null;

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

  @Column("int", { name: "ShippingMethodID", nullable: true })
  shippingMethodId: number | null;
}
