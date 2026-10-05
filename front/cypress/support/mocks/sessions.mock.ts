import { Session } from "../../../src/app/core/models/session.interface";

export const mockSessions: Session[] = [
    {
        id: 1,
        name: 'Session Yoga Débutant',
        description: 'Session pour débutants',
        date: new Date('2026-10-05'),
        teacher_id: 1,
        users: [2, 3],
        createdAt: new Date('2026-09-13T14:57:13'),
        updatedAt: new Date('2026-09-13T14:57:13')
    },
    {
        id: 2,
        name: 'Session Yoga Avancé',
        description: 'Session pour experts',
        date: new Date('2026-10-10'),
        teacher_id: 2,
        users: [1, 3],
        createdAt: new Date('2026-09-13T14:57:13'),
        updatedAt: new Date('2026-09-13T14:57:13')
    }
]