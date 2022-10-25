import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../services/stripe";
import {getSession} from 'next-auth/react'
import { fauna } from "../../services/fauna";
import { query } from "faunadb";

type User = {
    ref: {
        id: string;
    }
    data: {
        stripe_costumer_id: string;
    }
}
export default async (req:NextApiRequest, res: NextApiResponse) =>{
    if(req.method === 'POST'){
        const session = await getSession({ req })

        const user = await fauna.query<User>(
            query.Get(
                query.Match(
                    query.Index('user_by_email'),
                    query.Casefold(session.user.email)
                )
            )
        )

        let costumerId = user.data.stripe_costumer_id;

        if(!costumerId){
            
            const stripeCustomer = await stripe.customers.create({
                email: session.user.email,
            })
        
            await fauna.query(
                query.Update(
                    query.Ref(query.Collection('users'), user.ref.id),
                    {
                        data: {
                            stripe_costumer_id: stripeCustomer.id,
                        }
                    }
                )
            )

            costumerId = stripeCustomer.id;
        }

        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: costumerId,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            line_items:[
                {price: 'price_1LuygZGsqyl3M5hP3KKh2aSe', quantity:1}
            ],
            mode: 'subscription',
            allow_promotion_codes:true,
            success_url: "http://localhost:3000/posts",
            cancel_url: "http://localhost:3000/"
        })

        return res.status(200).json({sessionId: stripeCheckoutSession.id})
    }else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method not allowed')
    }
}