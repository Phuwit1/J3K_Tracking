import bcrypt from 'bcrypt'
// import { PrismaClient } from '@prisma/client'
import { error } from 'console'
import { prisma } from '@/prisma/prisma'
// const prisma = new PrismaClient()

export async function POST(request: Request){
    try {
        const {email, password, confirmpassword, phoneNumber, firstName, lastName, idCard } = await request.json()
        console.log(password, confirmpassword)
        if (password != confirmpassword) {
            return Response.json({
                error,
                message: "password and confrimpassword must be same"
            }, {status: 400})
        }

        const hashedPassword = bcrypt.hashSync(password, 10)
        const newUser = await prisma.user.create({
            data : {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phoneNumber,
                idCard
            }
        })
        return Response.json({
            message: 'create user',
            data: {
                newUser
            }
        })
    } catch (error) {
        return Response.json({
            error
        }, {status: 500})
    }
    
}
