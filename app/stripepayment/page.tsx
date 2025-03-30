import CheckoutForm from '../../components/Checkout';
import { stripe } from '../../lib/stripe';
import styles from '../../styles/indexpage.module.css'; // Import your CSS module

interface Item {
  id: string;
}

export default async function IndexPage() {
  const calculateOrderAmount = (items: Item[]): number => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 1400;
  };

  // Create PaymentIntent as soon as the page loads
  const { client_secret: clientSecret } = await stripe.paymentIntents.create({
    amount: calculateOrderAmount([{ id: 'xl-tshirt' }]),
    currency: 'eur',
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Checkout</h1>
        <p>Complete your purchase securely with Stripe</p>
      </div>
      <div className={styles.paymentSection}>
        {clientSecret && <CheckoutForm clientSecret={clientSecret} />}
      </div>
      <div className={styles.footer}>
        <p>Your payment is safe and secure. Powered by Stripe.</p>
      </div>
    </div>
  );
}