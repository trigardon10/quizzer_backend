import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('entry')
export class Entry {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'creator_id'})
    creatorId: number;

    @Column({name: 'category_id'})
    categoryId: number;

    @Column()
    question: string;

    @Column()
    hint: string;

    @Column()
    answer: string;
}
