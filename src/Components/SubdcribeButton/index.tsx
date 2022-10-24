import { useSession, signIn } from "next-auth/react";
import { api } from "../../services/api";
import styles from "./styles.module.scss"
import { getStripeJs } from "../../services/getStripe"

interface SubscribeButtonProps {
    priceId: string;
}

export function SubscribeButton({ priceId }: SubscribeButtonProps){

    const {data: session} = useSession();

    async function hadleSubscribe(){
        if(!session){
            signIn("github")
            return;
        }

        //criação da checkout session
        try{
            const response = await api.post("/subscribe")
            const { sessionId } = response.data

            const stripe = await getStripeJs();
            await stripe.redirectToCheckout({ sessionId })
        }catch(err){
            alert(err);
        }
    }

    return(
        <button
            type="button"
            className={styles.subscribeButton}
            onClick={ hadleSubscribe }
        >
            Subscrive now
        </button>
    )
}