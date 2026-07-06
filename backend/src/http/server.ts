import fastify from "fastify";
import livrosRoutes from '../routes/livros.ts';
import {createUser} from "../routes/createuser.ts";
import {login} from "../routes/login.ts";
import profile from "../routes/profile.ts";
import fastifyJwt from "@fastify/jwt";


const app = fastify();

app.register(fastifyJwt, {
  secret:"secret",
})

app.register(createUser);
app.register(login);
app.register(profile);
app.register(livrosRoutes)



app.get("/", async (req, reply) => {
  return reply.send("Hello NLW");
});

app.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
  console.log("HTTP server running!");
});

