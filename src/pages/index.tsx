import Head from "next/head"
import { SubscribeButton } from "../Components/SubdcribeButton"
import { stripe } from "../services/stripe"
import styles from "./home.module.scss"
import { GetStaticProps } from "next";

interface HomeProps{
  product: {
    productId: string,
    amount: number
  }
}

export default function Home({product}: HomeProps) {
  return (
    <>

      <Head>
        <title>Home | ig.news</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>News about the <span>React</span> world</h1>
          <p>
            Get acess to all publications <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.productId}/>
        </section>

        <img src="/images/avatar.svg" alt="" />
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const response = await stripe.prices.retrieve("price_1LuygZGsqyl3M5hP3KKh2aSe" )
  const product = {
    productId: response.id,
    amount:  new Intl.NumberFormat("en-us", {
      style: "currency",
      currency: "USD",
    }).format(response.unit_amount / 100)
  }
  return {
    props: {
      product
    },
    revalidate: 60 * 60 * 24  //24 hours
  }

}