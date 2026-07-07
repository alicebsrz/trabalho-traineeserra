import type { FastifyInstance } from 'fastify';
import { prisma } from "../lib/prisma.ts";
import { z } from "zod";
import { comparePassword } from "../utils/hash.ts";

export async function login(app: FastifyInstance) {

    app.post("/login", async (req, reply) => {
       
        const loginSchema = z.object({
            email: z.string().email("Formato de e-mail inválido"),
            password: z.string().min(1, "A senha é obrigatória"),
        });

        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { email },
        });

       
        if (!user) {
            return reply.status(401).send({ message: "Credenciais inválidas" });
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return reply.status(401).send({ message: "Credenciais inválidas" });
        }

      
        const token = app.jwt.sign(
            { 
                email: user.email,
                name: user.name 
            },
            {
                sub: user.id.toString(),
                expiresIn: '7d' 
            }
        );


        return reply.status(200).send({ 
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    });   
}