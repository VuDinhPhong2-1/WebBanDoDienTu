import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__Products__B40CC6EDF04192CE", ["productId"], { unique: true })
@Entity("Products", { schema: "dbo" })
export class Products {
  @PrimaryGeneratedColumn({ type: "int", name: "ProductID" })
  productId: number;

  @Column("nvarchar", { name: "Name", nullable: true, length: 100 })
  name: string | null;

  @Column("nvarchar", { name: "Description", nullable: true })
  description: string | null;

  @Column("int", { name: "Quantity", nullable: true })
  quantity: number | null;

  @Column("int", { name: "BrandID", nullable: true })
  brandId: number | null;

  @Column("int", { name: "DiscountID", nullable: true })
  discountId: number | null;

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

  @Column("nvarchar", { name: "avatar_url", nullable: true, length: 255 })
  avatarUrl: string | null;
}
