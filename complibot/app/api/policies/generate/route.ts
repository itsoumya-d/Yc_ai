import{NextRequest,NextResponse}from"next/server";
import OpenAI from"openai";
import{createClient}from"@/lib/supabase/server";

const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});

export async function POST(req:NextRequest){
  const supabase=await createClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});
  const{data:profile}=await supabase.from("user_profiles").select("org_id,orgs(name,industry,tech_stack,frameworks)").eq("id",user.id).single();
  const org=profile?.orgs as{name:string;industry:string;tech_stack:string[];frameworks:string[]}|null;
  const body=await req.json();
  const{type}=body;
  if(!type)return NextResponse.json({error:"Policy type required"},{status:400});
  const prompt=`You are a compliance expert. Generate a comprehensive, production-ready ${type} for ${org?.name??"a technology company"} in the ${org?.industry??"technology"} industry.

The company uses: ${(org?.tech_stack??[]).join(", ")||"standard cloud infrastructure"}.
Active compliance frameworks: ${(org?.frameworks??[]).join(", ")||"SOC 2"}.

Generate a complete, professional policy document including:
1. Purpose and scope
2. Policy statements (detailed)
3. Roles and responsibilities
4. Procedures
5. Compliance requirements
6. Review and enforcement
7. Version history

Format as plain text with clear sections. Be specific and actionable.`;

  try{
    const completion=await openai.chat.completions.create({
      model:"gpt-4o",
      messages:[{role:"user",content:prompt}],
      max_tokens:3000,
      temperature:0.3,
    });
    const content=completion.choices[0]?.message?.content??"";
    // Save to database
    const{data:policy}=await supabase.from("policies").insert({
      org_id:profile?.org_id,
      title:type,category:type,content,status:"draft",version:1,
    }).select().single();
    return NextResponse.json({content,policyId:policy?.id});
  }catch(e){
    console.error("OpenAI error:",e);
    return NextResponse.json({error:"Policy generation failed"},{status:500});
  }
}