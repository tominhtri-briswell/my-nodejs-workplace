import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    username!: string;

    @Column()
    password!: string;

    @Column()
    email!: string;

    @Column()
    role!: number;

    @Column()
    created_at!: Date;

    @Column()
    created_by!: string;

    @Column()
    updated_at!: Date;

    @Column()
    updated_by!: string;

    @Column()
    deleted_at!: Date;
}
