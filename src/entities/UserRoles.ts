import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__UserRole__3D978A559AA205D5", ["userRoleId"], { unique: true })
@Entity("UserRoles", { schema: "dbo" })
export class UserRoles {
  @PrimaryGeneratedColumn({ type: "int", name: "UserRoleID" })
  userRoleId: number;

  @Column("int", { name: "UserID", nullable: true })
  userId: number | null;

  @Column("int", { name: "RoleID", nullable: true })
  roleId: number | null;

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
