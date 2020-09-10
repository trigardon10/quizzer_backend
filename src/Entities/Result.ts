import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('result')
export class Result {
    @PrimaryColumn({name: 'users_id'})
    userId: number;

    @PrimaryColumn({name: 'entry_id'})
    entryId: number;

    @Column()
    value: number;
}
