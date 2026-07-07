import type { FastifyInstance } from 'fastify';
import { prisma } from "../lib/prisma.ts";
import { z } from "zod";
import { hashPassword } from "../utils/hash.ts";

export async function createUser(app: FastifyInstance) {
    app.post('/user', async (req, reply) => {
        const createUserSchema = z.object({
            name: z.string(),
            email: z.string().email("E-mail inválido"),
            password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
        });
        
        const { name, email, password } = createUserSchema.parse(req.body);

        const existeUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existeUser) {
            return reply.status(409).send({ message: "Usuário já cadastrado" });
        }
    
        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return reply.status(201).send({
            id: user.id,
            name: user.name,
            email: user.email
        });
    }); 
}