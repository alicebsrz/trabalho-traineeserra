import "dotenv/config";
import fastify from "fastify";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";

import { createUser } from "../routes/createuser.ts";
import { login } from "../routes/login.ts";
import profile from "../routes/profile.ts";
import livrosRoutes from '../routes/livros.ts';

const app = fastify();

app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET as string,
});

app.register(createUser);
app.register(login);
app.register(profile);
app.register(livrosRoutes);

app.get("/", async (req, reply) => {
  return reply.send({ message: "API Biblioteca Virtual Online" });
});

app.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
  console.log(" HTTP server running on http://localhost:3333");
});