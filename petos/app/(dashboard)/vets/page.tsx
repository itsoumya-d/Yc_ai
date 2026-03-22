'use client';

export default function VetDirectoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Vet Directory</h1>
        <p className="text-sm text-text-secondary mt-1">Find veterinarians near you.</p>
      </div>
      <div className="space-y-4">
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg"><div className="w-5 h-5 text-blue-600" /></div>
            <h3 className="font-semibold text-text-primary">Dr. Sarah Chen, DVM</h3>
          </div>
          <p className="text-sm text-text-secondary">Happy Tails Vet Clinic · 0.8 mi · 4.9 stars</p>
          <p className="text-xs text-text-tertiary mt-1">Specialties: General, Dental</p>
        </div>
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg"><div className="w-5 h-5 text-green-600" /></div>
            <h3 className="font-semibold text-text-primary">Dr. Mike Rodriguez</h3>
          </div>
          <p className="text-sm text-text-secondary">PetCare Central · 1.2 mi · 4.7 stars</p>
          <p className="text-xs text-text-tertiary mt-1">Specialties: Surgery, Orthopedics</p>
        </div>
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg"><div className="w-5 h-5 text-purple-600" /></div>
            <h3 className="font-semibold text-text-primary">Dr. Emily Park</h3>
          </div>
          <p className="text-sm text-text-secondary">Animal Wellness · 2.1 mi · 4.8 stars</p>
          <p className="text-xs text-text-tertiary mt-1">Specialties: Dermatology, Internal Medicine</p>
        </div>
      </div>
    </div>
  );
}
