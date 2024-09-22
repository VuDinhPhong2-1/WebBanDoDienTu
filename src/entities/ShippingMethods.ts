import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__Shipping__0C78338443F24DAD", ["shippingMethodId"], { unique: true })
@Entity("ShippingMethods", { schema: "dbo" })
export class ShippingMethods {
  @PrimaryGeneratedColumn({ type: "int", name: "ShippingMethodID" })
  shippingMethodId: number;

  @Column("nvarchar", { name: "MethodName", nullable: true, length: 100 })
  methodName: string | null;

  @Column("decimal", { name: "Cost", nullable: true, precision: 18, scale: 2 })
  cost: number | null;

  @Column("int", { name: "OrderID", nullable: true })
  orderId: number | null;

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
