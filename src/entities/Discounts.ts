import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__Discount__E43F6DF61B1DAEC6", ["discountId"], { unique: true })
@Entity("Discounts", { schema: "dbo" })
export class Discounts {
  @PrimaryGeneratedColumn({ type: "int", name: "DiscountID" })
  discountId: number;

  @Column("decimal", {
    name: "DiscountPercent",
    nullable: true,
    precision: 5,
    scale: 2,
  })
  discountPercent: number | null;

  @Column("nvarchar", { name: "Description", nullable: true, length: 255 })
  description: string | null;

  @Column("datetime", { name: "StartDate", nullable: true })
  startDate: Date | null;

  @Column("datetime", { name: "EndDate", nullable: true })
  endDate: Date | null;

  @Column("bit", { name: "IsActive", nullable: true, default: () => "(1)" })
  isActive: boolean | null;

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
