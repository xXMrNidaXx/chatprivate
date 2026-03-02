import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);
    const supabase = getSupabase();

    console.log('Stripe webhook received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_email || session.customer_details?.email;
        const customerId = session.customer;

        if (customerEmail) {
          const { error } = await supabase
            .from('chatprivate.profiles')
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

        const { error } = await supabase
          .from('chatprivate.profiles')
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
        const plan = status === 'active' ? 'pro' : 'free';
        
        const { error } = await supabase
          .from('chatprivate.profiles')
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
