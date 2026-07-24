import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./db"

import { resend, emailTemplate } from "./resend"

import { apiKey } from "@better-auth/api-key"
import { nextCookies } from "better-auth/next-js"
import { bearer } from "better-auth/plugins"

export const auth = betterAuth({
    baseURL: {
        allowedHosts: [
        "localhost:3000",
        "cen-smart-bin.vercel.app",
        ],
        protocol: process.env.NODE_ENV === "production" ? "https" : "http",
    },
    
    // The RecycleTP mobile app needs to be here too, not just for CORS
    // (next.config.ts) - better-auth separately validates any callbackURL
    // (including the one on the email-verification link) against this list
    // on every request, GET included, regardless of CORS.
    trustedOrigins: ["https://cen-smart-bin.vercel.app", "https://tp-cen-srb.github.io"],

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
        },
        // Clicking the link verifies AND creates a session in one step, so
        // the user lands already signed in at the callbackURL instead of
        // being dropped on a login page to sign in a second time.
        autoSignInAfterVerification: true,
    },

    plugins:[
      apiKey(),
      // Lets the mobile app (a static, cross-domain site with no cookie
      // access to this API) authenticate with `Authorization: Bearer
      // <sessionToken>` instead - used by the /api/mobile-handoff exchange.
      bearer(),
      nextCookies()]
})