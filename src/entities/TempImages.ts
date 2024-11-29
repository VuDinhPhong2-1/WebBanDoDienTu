import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__temp_ima__3213E83F1713F8D1", ["id"], { unique: true })
@Entity("temp_images", { schema: "dbo" })
export class TempImages {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("nvarchar", { name: "public_id", length: 255 })
  publicId: string;

  @Column("nvarchar", { name: "url" })
  url: string;

  @Column("datetime", {
    name: "created_at",
    nullable: true,
    default: () => "getdate()",
  })
  createdAt: Date | null;
}
