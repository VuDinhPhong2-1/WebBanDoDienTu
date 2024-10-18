import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__ProductI__7516F4EC38234E60", ["imageId"], { unique: true })
@Entity("ProductImages", { schema: "dbo" })
export class ProductImages {
  @PrimaryGeneratedColumn({ type: "int", name: "ImageID" })
  imageId: number;

  @Column("int", { name: "ProductID", nullable: true })
  productId: number | null;

  @Column("varchar", { name: "ImageUrl", nullable: true, length: 255 })
  imageUrl: string | null;

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
}
