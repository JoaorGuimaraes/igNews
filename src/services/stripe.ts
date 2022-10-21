import Stripe from "stripe";

export const stripe = new Stripe(
    process.env.STRIPE_API_KEY,
    {
        apiVersion: "2022-08-01",
        appInfo: {
            name: "João Carlos Ribeiro Guimarães",
            version: "10.14.0"
        },
    }
)