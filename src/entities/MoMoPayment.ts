import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__MomoPaym__3214EC07C0A02149", ["id"], { unique: true })
@Index("UX_MomoPayment_IsActive", ["isActive"], { unique: true })
@Entity("MomoPayment", { schema: "dbo" })
export class MomoPayment {
  @PrimaryGeneratedColumn({ type: "int", name: "Id" })
  id: number;

  @Column("nvarchar", { name: "AccessKey", length: 50 })
  accessKey: string;

  @Column("nvarchar", { name: "SecretKey", length: 50 })
  secretKey: string;

  @Column("nvarchar", {
    name: "PartnerCode",
    length: 20,
    default: () => "'MOMO'",
  })
  partnerCode: string;

  @Column("nvarchar", { name: "OrderInfo", length: 255 })
  orderInfo: string;

  @Column("nvarchar", { name: "RedirectUrl", length: 255 })
  redirectUrl: string;

  @Column("nvarchar", { name: "IpnUrl", length: 255 })
  ipnUrl: string;

  @Column("nvarchar", {
    name: "RequestType",
    length: 50,
    default: () => "'payWithMethod'",
  })
  requestType: string;

  @Column("nvarchar", { name: "ExtraData", nullable: true })
  extraData: string | null;

  @Column("bit", { name: "AutoCapture", default: () => "(1)" })
  autoCapture: boolean;

  @Column("nvarchar", { name: "Lang", length: 10, default: () => "'vi'" })
  lang: string;

  @Column("bit", { name: "IsActive", default: () => "(0)" })
  isActive: boolean;

  @Column("datetime", { name: "CreatedAt", default: () => "getdate()" })
  createdAt: Date;
}
