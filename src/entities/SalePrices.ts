import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__SalePric__62CA5BA562A22F8D", ["salePriceId"], { unique: true })
@Entity("SalePrices", { schema: "dbo" })
export class SalePrices {
  @PrimaryGeneratedColumn({ type: "int", name: "SalePriceID" })
  salePriceId: number;

  @Column("decimal", { name: "Price", nullable: true, precision: 18, scale: 2 })
  price: number | null;

  @Column("datetime", { name: "StartDate", nullable: true })
  startDate: Date | null;

  @Column("datetime", { name: "EndDate", nullable: true })
  endDate: Date | null;

  @Column("datetime", { name: "ApplyDate", nullable: true })
  applyDate: Date | null;

  @Column("int", { name: "ProductID", nullable: true })
  productId: number | null;

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
