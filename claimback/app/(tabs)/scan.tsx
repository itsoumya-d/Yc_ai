import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { analyzeBill, BillType, BillAnalysis } from '@/lib/openai';

const BILL_TYPES: Array<{ value: BillType; label: string; icon: string }> = [
  { value: 'medical', label: 'Medical', icon: 'medkit-outline' },
  { value: 'utility', label: 'Utility', icon: 'flash-outline' },
  { value: 'telecom', label: 'Telecom', icon: 'phone-portrait-outline' },
  { value: 'insurance', label: 'Insurance', icon: 'shield-outline' },
  { value: 'subscription', label: 'Subscription', icon: 'repeat-outline' },
  { value: 'other', label: 'Other', icon: 'document-text-outline' },
];

export default function ScanScreen() {
  const { user } = useAuthStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [billType, setBillType] = useState<BillType>('medical');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  async function capturePhoto() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 });
    if (photo?.base64) {
      setCapturedImage(photo.base64);
    }
  }

  async function pickFromGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0].base64) {
      setCapturedImage(result.assets[0].base64);
    }
  }

  async function analyzeImage() {
    if (!capturedImage || !user) return;
    setAnalyzing(true);
    try {
      const analysis: BillAnalysis = await analyzeBill(capturedImage, billType);

      const { data: bill, error } = await supabase
        .from('bills')
        .insert({
          user_id: user.id,
          provider: analysis.provider,
          bill_type: billType,
          bill_date: analysis.billDate,
          total_amount: analysis.totalAmount,
          line_items: analysis.lineItems,
          overcharges: analysis.overcharges,
          potential_savings: analysis.totalPotentialSavings,
          summary: analysis.summary,
          status: 'analyzed',
        })
        .select('id')
        .single();

      if (error) throw error;
      router.push(`/bill/${bill.id}`);
    } catch (err) {
      Alert.alert('Analysis Failed', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setAnalyzing(false);
    }
  }

  if (!permission) {
    return <View className="flex-1 bg-gray-50" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-8">
        <Ionicons name="camera-outline" size={64} color="#d1d5db" />
        <Text className="mt-4 text-center text-xl font-semibold text-gray-800">Camera Access Needed</Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          Claimback needs camera access to scan your bills
        </Text>
        <TouchableOpacity
          className="mt-6 rounded-xl bg-brand-600 px-6 py-3.5"
          onPress={requestPermission}
        >
          <Text className="font-semibold text-white">Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      {capturedImage ? (
        // Review screen
        <ScrollView className="flex-1">
          <View className="relative">
            <Image
              source={{ uri: `data:image/jpeg;base64,${capturedImage}` }}
              className="h-72 w-full"
              resizeMode="cover"
            />
            <TouchableOpacity
              className="absolute left-4 top-14 rounded-full bg-black/40 p-2"
              onPress={() => setCapturedImage(null)}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
          </View>

          <View className="bg-white p-5">
            <Text className="mb-4 text-lg font-semibold text-gray-900">Bill Type</Text>
            <View className="mb-6 flex-row flex-wrap gap-2">
              {BILL_TYPES.map((bt) => (
                <TouchableOpacity
                  key={bt.value}
                  className={`flex-row items-center gap-1.5 rounded-full px-4 py-2 ${
                    billType === bt.value ? 'bg-brand-600' : 'bg-gray-100'
                  }`}
                  onPress={() => setBillType(bt.value)}
                >
                  <Ionicons
                    name={bt.icon as any}
                    size={14}
                    color={billType === bt.value ? 'white' : '#374151'}
                  />
                  <Text className={`text-sm font-medium ${billType === bt.value ? 'text-white' : 'text-gray-700'}`}>
                    {bt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className={`items-center rounded-xl py-4 ${analyzing ? 'bg-brand-500 opacity-70' : 'bg-brand-600'}`}
              onPress={analyzeImage}
              disabled={analyzing}
            >
              {analyzing ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-base font-semibold text-white">Analyzing for Overcharges...</Text>
                </View>
              ) : (
                <Text className="text-base font-semibold text-white">Analyze Bill</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        // Camera view
        <View className="flex-1">
          <CameraView ref={cameraRef} className="flex-1" facing="back">
            {/* Overlay frame */}
            <View className="flex-1 items-center justify-center">
              <View className="h-72 w-80 border-2 border-white/60 rounded-xl" />
              <Text className="mt-4 text-center text-sm text-white/80">
                Position your bill within the frame
              </Text>
            </View>
          </CameraView>

          {/* Bottom controls */}
          <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-around bg-black/60 pb-8 pt-4">
            <TouchableOpacity
              className="h-14 w-14 items-center justify-center rounded-full bg-white/20"
              onPress={pickFromGallery}
            >
              <Ionicons name="image-outline" size={26} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              className="h-18 w-18 items-center justify-center rounded-full border-4 border-white bg-white/20"
              onPress={capturePhoto}
              style={{ height: 72, width: 72, borderRadius: 36 }}
            >
              <View className="h-14 w-14 rounded-full bg-white" />
            </TouchableOpacity>

            <View className="h-14 w-14" />
          </View>
        </View>
      )}
    </View>
  );
}
