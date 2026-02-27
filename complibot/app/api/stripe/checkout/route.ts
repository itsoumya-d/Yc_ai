import{NextRequest,NextResponse}from"next/server";
import{getStripe}from"@/lib/stripe/client";
import{createClient}from"@/lib/supabase/server";

const PRICES:Record<string,string>={
  starter:process.env.STRIPE_PRICE_STARTER??"",
  growth:process.env.STRIPE_PRICE_GROWTH??"",
};

export async function POST(req:NextRequest){
  const supabase=await createClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.redirect(new URL("/login",req.url));
  const body=await req.formData();
  const plan=body.get("plan") as string;
  const priceId=PRICES[plan];
  if(!priceId)return NextResponse.json({error:"Invalid plan"},{status:400});
  const{data:profile}=await supabase.from("user_profiles").select("org_id").eq("id",user.id).single();
  const stripe=getStripe();
  const session=await stripe.checkout.sessions.create({
    mode:"subscription",
    payment_method_types:["card"],
    line_items:[{price:priceId,quantity:1}],
    success_url:process.env.NEXT_PUBLIC_APP_URL+"/dashboard?upgraded=true",
    cancel_url:process.env.NEXT_PUBLIC_APP_URL+"/settings",
    metadata:{org_id:profile?.org_id??"",user_id:user.id},
  });
  return NextResponse.redirect(session.url!,{status:303});
}