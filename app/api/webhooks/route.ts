import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '../../../lib/stripe';
import Stripe from 'stripe';

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    // Construct the event using Stripe's webhook signing secret
    event = stripe.webhooks.constructEvent(
      await req.text(), // Raw body as text
      (await headers()).get('stripe-signature')!, // Stripe signature from headers
      process.env.STRIPE_WEBHOOK_SECRET! // Webhook secret from environment variables
    );
  } catch (err: any) {
    const errorMessage = err.message;
    // On error, log and return the error message.
    console.error(err);
    console.error(`Error message: ${errorMessage}`);
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  const permittedEvents = ['payment_intent.succeeded'];

  if (permittedEvents.includes(event.type)) {
    let data: Stripe.PaymentIntent;

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          data = event.data.object as Stripe.PaymentIntent;
          console.log(`Payment status: ${data.status}`);
          break;
        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: 'Webhook handler failed' },
        { status: 500 }
      );
    }
  }

  // Return a response to acknowledge receipt of the event.
  return NextResponse.json({ message: 'Received' }, { status: 200 });
}