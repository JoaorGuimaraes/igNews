import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { api } from "../../services/api";
import { getStripeJs } from "../../services/stripe-js";
import styles from "./styles.module.scss";

interface SubscriberButtonProps {
    priceId: string;
}
export function SubscriberButton({priceId}:SubscriberButtonProps) {
    const {data: session} = useSession();
    const router = useRouter();

    if(session?.activeSubscription){
     router.push('/posts');
     return;
    }

    async function handleSubscribe(){
        if(!session){
            signIn('github');
            return;
        }

        try {
            const response = await api.post("/subscribe");

            const { sessionId } = response.data;

            const stripe = await getStripeJs();

            await stripe.redirectToCheckout({sessionId});

        } catch (error) {
            alert("aqui " + error.message);
        }
    }

    return (
        <button type="button" onClick={handleSubscribe} className={styles.subscriberButton}>
            Subscriber now
        </button>
    );
}