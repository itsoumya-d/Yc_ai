import{NextRequest,NextResponse}from"next/server";
import{getStripe}from"@/lib/stripe/client";
import{createServiceClient}from"@/lib/supabase/server";
import Stripe from"stripe";

export async function POST(req:NextRequest){
  const body=await req.text();
  const sig=req.headers.get("stripe-signature");
  if(!sig)return NextResponse.json({error:"No signature"},{status:400});
  const stripe=getStripe();
  let event:Stripe.Event;
  try{event=stripe.webhooks.constructEvent(body,sig,process.env.STRIPE_WEBHOOK_SECRET!);}
  catch(e){return NextResponse.json({error:"Invalid signature"},{status:400});}
  const supabase=createServiceClient();
  switch(event.type){
    case"checkout.session.completed":{
      const session=event.data.object as Stripe.Checkout.Session;
      const orgId=session.metadata?.org_id;
      if(orgId&&session.subscription){
        const sub=await stripe.subscriptions.retrieve(session.subscription as string);
        const subObj=(sub as unknown as{current_period_end?:number});
        await supabase.from("subscriptions").upsert({
          org_id:orgId,
          stripe_customer_id:session.customer as string,
          stripe_subscription_id:session.subscription as string,
          plan:"growth",status:"active",
          current_period_end:subObj.current_period_end?new Date(subObj.current_period_end*1000).toISOString():null,
        },{onConflict:"org_id"});
      }
      break;
    }
    case"customer.subscription.updated":
    case"customer.subscription.deleted":{
      const sub=event.data.object as Stripe.Subscription;
      const subObj=(sub as unknown as{current_period_end?:number});
      const{data:existing}=await supabase.from("subscriptions").select("org_id").eq("stripe_subscription_id",sub.id).single();
      if(existing){
        await supabase.from("subscriptions").update({
          status:sub.status as"active"|"past_due"|"cancelled"|"trialing",
          current_period_end:subObj.current_period_end?new Date(subObj.current_period_end*1000).toISOString():null,
        }).eq("stripe_subscription_id",sub.id);
      }
      break;
    }
    case"invoice.payment_failed":{
      const invoice=event.data.object as Stripe.Invoice;
      if(invoice.subscription){
        await supabase.from("subscriptions").update({status:"past_due"}).eq("stripe_subscription_id",invoice.subscription as string);
      }
      break;
    }
  }
  return NextResponse.json({received:true});
}