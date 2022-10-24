import { query } from 'faunadb';
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { fauna } from '../../services/fauna';
import { stripe } from "../../services/stripe";

type User = {
    ref: {
        id: string
    },
    data: {
        customerId: string
    }
}


export default async (req: NextApiRequest, res: NextApiResponse) => {

    if (req.method === "POST") {

        const session = await getSession({ req })

        const user = await fauna.query<User>(
            query.Get(
              query.Match(
                query.Index('user_by_email'),
                query.Casefold(session.user.email)
              )
            )
          )

        const stripeCustumer = await stripe.customers.create({
            email: session.user.email,
            //metadata
        })

        await fauna.query(
            query.Update(
                query.Ref(query.Collection("users"), user.ref.id),
                {
                    data: {
                        stripe_customer_id: stripeCustumer.id
                    }
                }
            )
        )

        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: stripeCustumer.id,
            payment_method_types: ["card"],
            billing_address_collection: "required",
            line_items: [
                { price: "price_1LuygZGsqyl3M5hP3KKh2aSe", quantity: 1 }
            ],
            mode: "subscription",
            allow_promotion_codes: true,
            success_url: "http://localhost:3000/posts",
            cancel_url: "http://localhost:3000/"
        })

        return res.status(200).json({ sessionId: stripeCheckoutSession.id });
    }
    else {
        res.setHeader("Allow", "POST")
        res.status(405).json({
            message: "Method Not Allowed"
        })
    }
}
