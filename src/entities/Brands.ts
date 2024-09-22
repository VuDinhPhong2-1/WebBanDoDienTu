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
