import fastify from "fastify";


const app = fastify();

import livrosRoutes from '../routes/livros'

app.register(livrosRoutes)

app.get("/", async (req, reply) => {
  return reply.send("Hello NLW");
});

app.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
  console.log("HTTP server running!");
});