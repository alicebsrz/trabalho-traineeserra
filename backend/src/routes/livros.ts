import type { FastifyInstance } from 'fastify'
import { prisma } from "../lib/prisma.ts";
import { z } from "zod";

const statusEnum = z.enum(["TO_READ", "READING", "FINISHED"]);

const livrosSchema = z.object({
  title: z.string().min(1, "Título obrigatório"),
  author: z.string().min(1, "Autor obrigatório"),
  coverUrl: z.string().url("URL inválida").optional(),
  status: statusEnum.optional(),
});

const statusUpdateSchema = z.object({
  status: statusEnum,
});

export default async function livrosRoutes(app: FastifyInstance) {
    // Middleware para garantir que o usuário está logado
    app.addHook("onRequest", async (req, reply) => {
        try {
            await req.jwtVerify();
        } catch (error) {
            return reply.status(401).send({ error: "Não autorizado. Faça login novamente." });
        }
    });

    // Função auxiliar para extrair o ID numérico do JWT de forma segura
    const getUserId = (userPayload: any) => parseInt(userPayload.sub, 10);

    // 1. SALVAR LIVRO
    app.post("/livros", async (request, reply) => {
        const result = livrosSchema.safeParse(request.body);
        if (!result.success) {
            return reply.status(400).send({ errors: result.error.flatten().fieldErrors });
        }

        const userId = getUserId(request.user);

        const livro = await prisma.book.create({
            data: { ...result.data, userId },
        });
        return reply.status(201).send(livro);
    });

    // 2. BUSCAR TODOS OS LIVROS DO USUÁRIO
    app.get("/livros", async (request, reply) => {
        const userId = getUserId(request.user);
        const { status } = request.query as { status?: string };

        const livros = await prisma.book.findMany({
            where: {
                userId,
                ...(status ? { status: status as any } : {}),
            },
            orderBy: { createdAt: 'desc' } // Mostra os mais recentes primeiro
        });
        return reply.status(200).send(livros);
    });

    // 3. ATUALIZAR STATUS (Mudar de prateleira)
    app.patch("/livros/:id/status", async (request, reply) => {
        const { id } = request.params as { id: string };
        const userId = getUserId(request.user);

        const livro = await prisma.book.findUnique({ where: { id } });
        if (!livro) return reply.status(404).send({ error: "O livro não foi encontrado!" });
        if (livro.userId !== userId) return reply.status(403).send({ error: "Esse livro não é seu" });

        const result = statusUpdateSchema.safeParse(request.body);
        if (!result.success) {
            return reply.status(400).send({ errors: result.error.flatten().fieldErrors });
        }

        const updated = await prisma.book.update({ 
            where: { id }, 
            data: { status: result.data.status } 
        });
        return reply.status(200).send(updated);
    });

    // 4. DELETAR LIVRO
    app.delete("/livros/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        const userId = getUserId(request.user);

        const livro = await prisma.book.findUnique({ where: { id } });
        if (!livro) return reply.status(404).send({ error: "O livro não foi encontrado!" });
        if (livro.userId !== userId) return reply.status(403).send({ error: "Esse livro não é seu" });

        await prisma.book.delete({ where: { id } });
        return reply.status(200).send({ message: "Livro removido com sucesso!" });
    });
}