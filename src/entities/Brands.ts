import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__Brands__DAD4F3BEDEAD7BAC", ["brandId"], { unique: true })
@Entity("Brands", { schema: "dbo" })
export class Brands {
  @PrimaryGeneratedColumn({ type: "int", name: "BrandID" })
  brandId: number;

  @Column("nvarchar", { name: "Name", nullable: true, length: 100 })
  name: string | null;

  @Column("nvarchar", { name: "Description", nullable: true, length: 255 })
  description: string | null;

  @Column("nvarchar", { name: "Country", nullable: true, length: 100 })
  country: string | null;

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
