import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__ProductC__3224ECEE4D928592", ["productCategoryId"], {
  unique: true,
})
@Entity("ProductCategories", { schema: "dbo" })
export class ProductCategories {
  @PrimaryGeneratedColumn({ type: "int", name: "ProductCategoryID" })
  productCategoryId: number;

  @Column("int", { name: "ProductID", nullable: true })
  productId: number | null;

  @Column("int", { name: "CategoryID", nullable: true })
  categoryId: number | null;

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
