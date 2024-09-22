import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__Categori__19093A2B9C017D95", ["categoryId"], { unique: true })
@Entity("Categories", { schema: "dbo" })
export class Categories {
  @PrimaryGeneratedColumn({ type: "int", name: "CategoryID" })
  categoryId: number;

  @Column("int", { name: "ParentCategoryID", nullable: true })
  parentCategoryId: number | null;

  @Column("nvarchar", { name: "Name", nullable: true, length: 100 })
  name: string | null;

  @Column("nvarchar", { name: "Description", nullable: true, length: 255 })
  description: string | null;

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
