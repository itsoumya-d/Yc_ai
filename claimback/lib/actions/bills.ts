import { supabase } from '../supabase';
import { analyzeBillImage, generateDisputeLetter } from './ai';
import type { Bill, BillType, BillAnalysis } from '../../types';

async function uriToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function uploadAndAnalyzeBill(
  imageUri: string,
  billType: BillType
): Promise<BillAnalysis> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const base64 = await uriToBase64(imageUri);
  const fileName = `${user.id}/${Date.now()}.jpg`;

  await supabase.storage.from('bill-images').upload(
    fileName,
    Uint8Array.from(atob(base64), c => c.charCodeAt(0)),
    { contentType: 'image/jpeg' }
  );

  const { data: { publicUrl } } = supabase.storage.from('bill-images').getPublicUrl(fileName);

  const analysis = await analyzeBillImage(base64, billType);
  const fairTotal = analysis.total_amount - analysis.total_overcharge;
  const disputeLetter = analysis.total_overcharge > 0
    ? await generateDisputeLetter(analysis)
    : undefined;

  const { data: bill, error } = await supabase
    .from('bills')
    .insert({
      user_id: user.id,
      bill_type: billType,
      provider_name: analysis.provider_name,
      bill_date: analysis.bill_date || null,
      total_amount: analysis.total_amount,
      fair_total: fairTotal,
      image_url: publicUrl,
      storage_path: fileName,
      status: 'analyzed',
      analysis_raw: JSON.stringify(analysis),
      total_overcharge: analysis.total_overcharge,
      ai_dispute_letter: disputeLetter,
    })
    .select()
    .single();

  if (error) throw error;

  if (analysis.line_items?.length > 0) {
    await supabase.from('line_items').insert(
      analysis.line_items.map((item: any) => ({
        bill_id: bill.id,
        description: item.description,
        amount: item.billed_amount,
        billed_amount: item.billed_amount,
        fair_amount: item.fair_amount || null,
        is_overcharge: item.is_overcharge,
        overcharge_reason: item.overcharge_reason || null,
      }))
    );
  }

  return {
    bill_id: bill.id,
    provider_name: analysis.provider_name,
    total_billed: analysis.total_amount,
    fair_total: fairTotal,
    overcharges: analysis.line_items
      .filter((item: any) => item.is_overcharge)
      .map((item: any) => ({
        description: item.description,
        billed: item.billed_amount,
        fair: item.fair_amount || 0,
        reason: item.overcharge_reason || 'Potential overcharge',
        amount: item.billed_amount - (item.fair_amount || 0),
      })),
  };
}

export async function getBillById(id: string): Promise<Bill> {
  const { data, error } = await supabase
    .from('bills')
    .select('*, line_items(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getUserBills(): Promise<Bill[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
