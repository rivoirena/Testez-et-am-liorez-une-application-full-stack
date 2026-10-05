import { User } from "../../../src/app/core/models/user.interface";

export const regularUser: User = {
    id: 1,
    email: 'user@studio.com',
    lastName: 'user',
    firstName: 'regular',
    admin: false,
    password: 'test!1234',
    createdAt: new Date('2026-09-13T14:57:13'),
    updatedAt: new Date('2026-09-13T14:57:13')
};

export const adminUser: User = {
    id: 1,
    email: 'admin@studio.com',
    lastName: 'user',
    firstName: 'admin',
    admin: true,
    password: 'test!1234',
    createdAt: new Date('2026-09-13T14:57:13'),
    updatedAt: new Date('2026-09-13T14:57:13')
};