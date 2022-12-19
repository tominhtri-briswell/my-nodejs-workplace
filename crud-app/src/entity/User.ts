import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne, OneToMany } from "typeorm";
import bcrypt from 'bcrypt';

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "nvarchar", length: 100 })
    name!: string;

    @Column({ type: "nvarchar", length: 255 })
    username!: string;

    @Column({ type: "nvarchar", length: 255 })
    password!: string;

    @Column({ type: "nvarchar", length: 255 })
    email!: string;

    @Column({ type: "tinyint" })
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
