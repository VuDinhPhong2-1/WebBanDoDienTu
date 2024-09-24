import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__ProductC__3224ECCE3C3F0586", ["productCategoryId"], {
  unique: true,
})
@Entity("ProductCategories", { schema: "dbo" })
export class ProductCategories {
  @PrimaryGeneratedColumn({ type: "int", name: "ProductCategoryId" })
  productCategoryId: number;

  @Column("int", { name: "CategoryID", nullable: true })
  categoryId: number | null;

  @Column("int", { name: "ProductID", nullable: true })
  productId: number | null;

  @Column("int", { name: "createdBy", nullable: true })
  createdBy: number | null;

  @Column("datetime", { name: "createdDate", nullable: true })
  createdDate: Date | null;

  @Column("int", { name: "updatedBy", nullable: true })
  updatedBy: number | null;

  @Column("datetime", { name: "updatedDate", nullable: true })
  updatedDate: Date | null;
}
