import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__Shipping__0C7833845D48119A", ["shippingMethodId"], { unique: true })
@Entity("ShippingMethods", { schema: "dbo" })
export class ShippingMethods {
  @PrimaryGeneratedColumn({ type: "int", name: "ShippingMethodID" })
  shippingMethodId: number;

  @Column("varchar", { name: "MethodName", length: 255 })
  methodName: string;

  @Column("decimal", { name: "Cost", precision: 10, scale: 2 })
  cost: number;

  @Column("varchar", {
    name: "EstimatedDeliveryTime",
    nullable: true,
    length: 100,
  })
  estimatedDeliveryTime: string | null;

  @Column("varchar", { name: "Carrier", nullable: true, length: 255 })
  carrier: string | null;

  @Column("varchar", { name: "TrackingURL", nullable: true, length: 500 })
  trackingUrl: string | null;

  @Column("decimal", {
    name: "MaxWeightLimit",
    nullable: true,
    precision: 10,
    scale: 2,
  })
  maxWeightLimit: number | null;

  @Column("bit", { name: "IsDefault", nullable: true, default: () => "(0)" })
  isDefault: boolean | null;

  @Column("bit", { name: "ActiveStatus", nullable: true, default: () => "(1)" })
  activeStatus: boolean | null;

  @Column("varchar", { name: "createdBy", nullable: true, length: 255 })
  createdBy: string | null;

  @Column("datetime", {
    name: "createdAt",
    nullable: true,
    default: () => "getdate()",
  })
  createdAt: Date | null;

  @Column("varchar", { name: "updatedBy", nullable: true, length: 255 })
  updatedBy: string | null;

  @Column("datetime", { name: "updatedAt", nullable: true })
  updatedAt: Date | null;
}
