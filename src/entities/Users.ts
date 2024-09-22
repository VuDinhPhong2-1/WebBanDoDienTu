import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("PK__Users__1788CCACD22D4D52", ["userId"], { unique: true })
@Index("UQ_Email", ["email"], { unique: true })
@Index("UQ_Phone", ["phone"], { unique: true })
@Index("UQ_Username", ["username"], { unique: true })
@Entity("Users", { schema: "dbo" })
export class Users {
  @PrimaryGeneratedColumn({ type: "int", name: "UserID" })
  userId: number;

  @Column("nvarchar", {
    name: "Username",
    nullable: true,
    unique: true,
    length: 100,
  })
  username: string | null;

  @Column("nvarchar", { name: "PasswordHash", nullable: true, length: 255 })
  passwordHash: string | null;

  @Column("nvarchar", {
    name: "Email",
    nullable: true,
    unique: true,
    length: 100,
  })
  email: string | null;

  @Column("nvarchar", {
    name: "Phone",
    nullable: true,
    unique: true,
    length: 50,
  })
  phone: string | null;

  @Column("nvarchar", { name: "FullName", nullable: true, length: 100 })
  fullName: string | null;

  @Column("bit", { name: "IsActive", nullable: true, default: () => "(1)" })
  isActive: boolean | null;

  @Column("date", { name: "DateOfBirth", nullable: true })
  dateOfBirth: Date | null;

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

  @Column("nvarchar", { name: "refreshToken", nullable: true, length: 1000 })
  refreshToken: string | null;
}
