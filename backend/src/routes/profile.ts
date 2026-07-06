import type { FastifyInstance } from 'fastify'
import { prisma } from "../lib/prisma.ts";

export default function profile(app: FastifyInstance) {
    app.addHook("onRequest", async (req,res)=> {
        try{
            
            await req.jwtVerify()

        } catch (error){
            return res.status(401).send({error});  
        }

        
    });

    app.get("/profile",async(req)=>{
        return req.user;
    });

}