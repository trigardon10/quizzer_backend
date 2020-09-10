import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    hashedpw: Buffer;

    @Column()
    role: USERROLE

    constructor(name: string, hashedpw: Buffer, role: USERROLE) {
        this.name = name;
        this.hashedpw = hashedpw;
        this.role = role;
    }
}

export enum USERROLE {
    ADMIN = 0,
    STUDENT = 1,
    TEACHER = 2
}
