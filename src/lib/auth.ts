import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./db"

import { resend, emailTemplate } from "./resend"

import { apiKey } from "@better-auth/api-key"
import { nextCookies } from "better-auth/next-js"
import { admin } from "better-auth/plugins"

export const auth = betterAuth({
    baseURL: {
        allowedHosts: [
        "localhost:3000",
        "cen-smart-bin.vercel.app",
        ],
        protocol: process.env.NODE_ENV === "production" ? "https" : "http",
    },
    
    trustedOrigins: ["https://cen-smart-bin.vercel.app"],

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
            diploma: {
                type: "string",
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
        sendResetPassword: async ({ user, url }) => {
            await resend.emails.send({
                from: `TP Smart Bin <no-reply@${process.env.RESEND_DOMAIN}>`, 
                to: user.email,
                subject: "[Smart Bin System] Reset Your Password",
                html: emailTemplate(url, "RESET"), 
            })
        },
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
      // The admin plugin reserves `role` as an admin-only field: any
      // signUpEmail caller that includes a `role` key in its body gets
      // rejected outright ("role is not allowed to be set"), even
      // server-side (api/signup/student no longer passes it). defaultRole
      // is what the plugin substitutes for role instead - it defaults to
      // "user", which isn't a valid value in our Role enum, so it has to be
      // set explicitly here. Admin-initiated account creation
      // (auth.api.createUser, used for stores/bin managers) goes through a
      // different, admin-only endpoint that sets role explicitly and isn't
      // affected by this default.
      admin({ defaultRole: "STUDENT" }),
      nextCookies()]
})