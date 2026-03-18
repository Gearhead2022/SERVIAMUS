import { Request, Response } from "express";
import { sampleServices } from "./lab.services";


export const sampleController = async () => {
    const sampleRes = await sampleServices(); 
    return "ok";
}