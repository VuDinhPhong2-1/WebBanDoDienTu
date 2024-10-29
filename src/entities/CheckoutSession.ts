import { Column, Entity, Index } from "typeorm";

@Index("PK__Checkout__23DB122B39834D42", ["sessionId"], { unique: true })
@Entity("CheckoutSession", { schema: "dbo" })
export class CheckoutSession {
  @Column("int", { primary: true, name: "sessionId" })
  sessionId: number;

  @Column("text", { name: "orderData" })
  orderData: string;

  @Column("varchar", { name: "status", length: 20 })
  status: string;

  @Column("datetime", {
    name: "createdAt",
    nullable: true,
    default: () => "getdate()",
  })
  createdAt: Date | null;
}
