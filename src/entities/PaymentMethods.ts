import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__PaymentM__46612FB803595EB7", ["paymentMethodId"], { unique: true })
@Entity("PaymentMethods", { schema: "dbo" })
export class PaymentMethods {
  @PrimaryGeneratedColumn({ type: "int", name: "paymentMethodId" })
  paymentMethodId: number;

  @Column("varchar", { name: "name", length: 100 })
  name: string;

  @Column("nvarchar", { name: "description", nullable: true, length: 255 })
  description: string | null;

  @Column("bit", { name: "isActive", nullable: true, default: () => "(1)" })
  isActive: boolean | null;

  @Column("int", { name: "createdBy" })
  createdBy: number;

  @Column("int", { name: "updatedBy", nullable: true })
  updatedBy: number | null;

  @Column("datetime", { name: "createdAt", default: () => "getdate()" })
  createdAt: Date;

  @Column("datetime", { name: "updatedAt", default: () => "getdate()" })
  updatedAt: Date;
}
