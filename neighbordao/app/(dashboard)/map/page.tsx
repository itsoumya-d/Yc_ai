export default function MapPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Neighborhood Map</h1>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden" style={{ height: 480 }}>
        <div className="flex items-center justify-center h-full text-slate-500">
          <div className="text-center">
            <p className="text-4xl mb-3">🗺️</p>
            <p className="font-medium text-slate-700">Interactive map</p>
            <p className="text-sm text-slate-500 mt-1">Configure NEXT_PUBLIC_MAPBOX_TOKEN to enable</p>
          </div>
        </div>
      </div>
    </div>
  );
}
