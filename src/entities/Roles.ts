import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__Roles__8AFACE3AA8386173", ["roleId"], { unique: true })
@Entity("Roles", { schema: "dbo" })
export class Roles {
  @PrimaryGeneratedColumn({ type: "int", name: "RoleID" })
  roleId: number;

  @Column("nvarchar", { name: "RoleName", nullable: true, length: 100 })
  roleName: string | null;

  @Column("nvarchar", { name: "Description", nullable: true, length: 255 })
  description: string | null;

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
