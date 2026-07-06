import type { FastifyInstance } from 'fastify'
import { prisma } from "../lib/prisma.ts";
import { z } from "zod";
import { comparePassword } from "../utils/hash.ts";
import { hashPassword } from "../utils/hash.ts";


export function login(app: FastifyInstance) {

    const loginSchema = z.object({
        email: z.string(),
        password: z.string(),
    })

    app.post("/login", async (req, res) => {

        const{email,password} = loginSchema.parse(req.body)

        const user = await prisma.user.findUnique({
            where: {email},
        });

        if(!user) {
            return res.status(400).send({message:"User not found"});
        }

        const isPassword = await comparePassword(password,user.password);

        if (!isPassword) {
            return res.status(400).send({ message: "Invalid Password" });
        }

        const token = app.jwt.sign({id:user.id,email:user.email});

        return res.status(200).send({token});
    });   
}