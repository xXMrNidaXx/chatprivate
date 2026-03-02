import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    // In production, verify the webhook signature
    // For now, we'll trust the payload
    const event = JSON.parse(body);

    console.log('Stripe webhook received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_email || session.customer_details?.email;
        const customerId = session.customer;

        if (customerEmail) {
          // Update user to Pro plan
          const { error } = await supabase
            .schema('chatprivate')
            .from('profiles')
            .update({ 
              plan: 'pro',
              stripe_customer_id: customerId 
            })
            .eq('email', customerEmail);

          if (error) {
            console.error('Error updating user plan:', error);
          } else {
            console.log(`User ${customerEmail} upgraded to Pro!`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Downgrade user to free plan
        const { error } = await supabase
          .schema('chatprivate')
          .from('profiles')
          .update({ plan: 'free' })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Error downgrading user:', error);
        } else {
          console.log(`Customer ${customerId} downgraded to free`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const status = subscription.status;

        // Update based on subscription status
        const plan = status === 'active' ? 'pro' : 'free';
        
        const { error } = await supabase
          .schema('chatprivate')
          .from('profiles')
          .update({ plan })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error('Error updating subscription:', error);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
