import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__PaymentM__DC31C1F30D720B95", ["paymentMethodId"], { unique: true })
@Entity("PaymentMethods", { schema: "dbo" })
export class PaymentMethods {
  @PrimaryGeneratedColumn({ type: "int", name: "PaymentMethodID" })
  paymentMethodId: number;

  @Column("nvarchar", { name: "MethodName", nullable: true, length: 100 })
  methodName: string | null;

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
