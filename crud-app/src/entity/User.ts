import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsEmail, IsNotEmpty, MaxLength, MinLength, IsOptional, IsIn } from "class-validator";
import { errMsg } from "../validator/user/UserValidator";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "nvarchar", length: 100 })
    @IsNotEmpty({
        message: errMsg.ERR001('name')
    })
    @MaxLength(100, {
        message: errMsg.ERR006('name', 100)
    })
    name!: string;

    @Column({ type: "nvarchar", length: 255 })
    @IsNotEmpty({
        message: errMsg.ERR001('username')
    })
    @MaxLength(255, {
        message: errMsg.ERR006('username', 255)
    })
    username!: string;

    @Column({ type: "nvarchar", length: 255 })
    @IsOptional()
    @MinLength(6, { message: errMsg.ERR005('password', 6) })
    @MaxLength(20, { message: errMsg.ERR006('password', 20) })
    password!: string;

    @Column({ type: "nvarchar", length: 255 })
    @IsEmail({}, { message: errMsg.ERR003('email') })
    email!: string;

    @Column({ type: "tinyint" })
    @IsIn(['1', '2', '3', 1, 2, 3],
        { message: errMsg.ERR003('role') }
    )
    role!: number;

    @Column({ name: "created_at", nullable: true })
    created_at!: Date;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    created_by!: string;

    @Column({ name: "updated_at", nullable: true })
    updated_at!: Date;

    @Column({ type: "nvarchar", length: 255, nullable: true })
    updated_by!: string;

    @Column({ name: "deleted_at", nullable: true })
    deleted_at!: Date;
}
