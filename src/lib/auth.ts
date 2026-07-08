import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./db"

import { resend, emailTemplate } from "./resend"

import { apiKey } from "@better-auth/api-key"
import { nextCookies } from "better-auth/next-js"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),

     user: {
        additionalFields: {
            faculty: {
                type: "string", 
                required: false,
            },

            role: {
                type: "string",
                required: false,
            },

            location: {
                type: "string",
                required: false,
            },

            lat: {
                type: "number",
                required: false,
            },

            long: {
                type: "number",
                required: false,
            },
            
        },
        deleteUser: { 
            enabled: true
        } 
     },

    emailAndPassword: { 
        enabled: true, 
        requireEmailVerification: true,
    },

    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            await resend.emails.send({
                from: `TP Smart Bin <no-reply@${process.env.RESEND_DOMAIN}>`, 
                to: user.email,
                subject: "[Smart Bin System] Account Verification",
                html: emailTemplate(url, "VERIFY"),
            })
        }
    },
    
    plugins:[
      apiKey(),
      nextCookies()]
})