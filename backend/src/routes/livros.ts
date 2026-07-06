import type { FastifyInstance } from 'fastify'
import { prisma } from "../lib/prisma.ts";
import { z } from "zod";

const livrosSchema = z.object({
  titulo: z.string().min(1, "Título obrigatório"),
  autor: z.string().min(1, "Autor obrigatório"),
  paginas: z.number().int("O número de páginas deve ser inteiro").positive("O número de páginas deve ser positivas"),
  genero: z.string().min(1, "Gênero é obrigatório"),
  sinopse: z.string().min(1, "Sinopse obrigatória"),
});

export default async function livrosRoutes(app: FastifyInstance) {
    app.post("/livros", async (request, reply) => {
        const result = livrosSchema.safeParse(request.body);
        if (!result.success) {
            return reply.status(400).send({ errors: result.error.flatten().fieldErrors });
        }

        await prisma.book.create({ data: result.data });
        return reply.status(201).send({ message: "Livro adicionado com sucesso!" });
    });

    app.get("/livros", async (request, reply) => {
        const livros = await prisma.book.findMany();
        return reply.status(200).send(livros);
    });

    app.put("/livros/:id", async (request, reply) => {
        const { id } = request.params as { id: string };

        const livro = await prisma.book.findUnique({ where: { id } });
        if (!livro) return reply.status(404).send({ error: "O livro não foi encontrado!" });

        const result = livrosSchema.safeParse(request.body);
        if (!result.success) {
            return reply.status(400).send({ errors: result.error.flatten().fieldErrors });
        }

        await prisma.book.update({ where: { id }, data: result.data });
        return reply.status(200).send({ message: "Livro atualizado com sucesso!" });
    });

    app.delete("/livros/:id", async (request, reply) => {
        const { id } = request.params as { id: string };

        const livro = await prisma.book.findUnique({ where: { id } });
        if (!livro) return reply.status(404).send({ error: "O livro não foi encontrado!" });

        await prisma.book.delete({ where: { id } });
        return reply.status(200).send({ message: "Livro removido com sucesso!" });
    });
}