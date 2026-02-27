import{NextRequest,NextResponse}from"next/server";
import{getStripe}from"@/lib/stripe/client";
import{createClient}from"@/lib/supabase/server";

export async function POST(req:NextRequest){
  const supabase=await createClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.redirect(new URL("/login",req.url));
  const{data:profile}=await supabase.from("user_profiles").select("org_id").eq("id",user.id).single();
  const{data:sub}=await supabase.from("subscriptions").select("stripe_customer_id").eq("org_id",profile?.org_id??"").single();
  if(!sub?.stripe_customer_id)return NextResponse.json({error:"No subscription found"},{status:404});
  const stripe=getStripe();
  const session=await stripe.billingPortal.sessions.create({
    customer:sub.stripe_customer_id,
    return_url:process.env.NEXT_PUBLIC_APP_URL+"/settings",
  });
  return NextResponse.redirect(session.url,{status:303});
}