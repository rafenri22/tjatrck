import type { Location } from "@/types"

// OSRM API untuk routing nyata
const OSRM_BASE_URL = "https://router.project-osrm.org"

// Data lengkap gerbang tol di seluruh Indonesia
const TOLL_GATES = [
  // Data yang diberikan user
  { name: "GT KRAKSAAN", lat: -7.778106, lng: 113.401204, type: "entrance", region: "Probolinggo" },
  { name: "GT PAITON", lat: -7.732100, lng: 113.502673, type: "exit", region: "Probolinggo" },
  { name: "GT BESUKI", lat: -7.736874, lng: 113.720038, type: "entrance", region: "Situbondo" },
  { name: "GT SITUBONDO", lat: -7.699739, lng: 114.041820, type: "exit", region: "Situbondo" },
  { name: "GT ASEMBAGUS", lat: -7.755602, lng: 114.179224, type: "entrance", region: "Banyuwangi" },
  { name: "GT BAJULMATI", lat: -7.938809, lng: 114.384457, type: "exit", region: "Banyuwangi" },
  { name: "GT KETAPANG/BANYUWANGI", lat: -8.111019, lng: 114.401736, type: "exit", region: "Banyuwangi" },
  { name: "GT MARGA ASIH TIMUR", lat: -6.967544, lng: 107.547896, type: "entrance", region: "Bandung" },
  { name: "GT MARGA ASIH BARAT", lat: -6.967663, lng: 107.543624, type: "exit", region: "Bandung" },
  { name: "GT KUTAWARINGIN TIMUR", lat: -6.997648, lng: 107.535880, type: "entrance", region: "Bandung" },
  { name: "GT KUTAWARINGIN BARAT", lat: -6.992282, lng: 107.535536, type: "exit", region: "Bandung" },
  { name: "GT SOREANG", lat: -7.010151, lng: 107.532210, type: "entrance", region: "Bandung" },
  { name: "GT BOGOR 1", lat: -6.597455, lng: 106.817616, type: "entrance", region: "Bogor" },
  { name: "GT CIAWI 1", lat: -6.631129, lng: 106.838987, type: "exit", region: "Bogor" },
  { name: "GT SENTUL SELATAN 2", lat: -6.562483, lng: 106.842737, type: "entrance", region: "Bogor" },
  { name: "GT SENTUL SELATAN 1", lat: -6.563932, lng: 106.844929, type: "exit", region: "Bogor" },
  { name: "GT CIBUBUR 3", lat: -6.373200, lng: 106.896243, type: "entrance", region: "Jakarta" },
  { name: "GT CIBUBUR 1", lat: -6.365806, lng: 106.895015, type: "exit", region: "Jakarta" },
  { name: "GT CIBUBUR 2", lat: -6.365289, lng: 106.894234, type: "entrance", region: "Jakarta" },
  { name: "GT CIMANGGIS 2", lat: -6.382810, lng: 106.895695, type: "exit", region: "Jakarta" },
  { name: "GT CIMANGGIS 4", lat: -6.385150, lng: 106.895552, type: "entrance", region: "Jakarta" },
  { name: "GT CIMANGGIS 3", lat: -6.386769, lng: 106.896584, type: "exit", region: "Jakarta" },
  { name: "GT CIMANGGIS 5", lat: -6.387726, lng: 106.898139, type: "entrance", region: "Jakarta" },
  { name: "GT CIMANGGIS 1", lat: -6.390653, lng: 106.895260, type: "exit", region: "Jakarta" },
  { name: "GT TAMAN MINI 1", lat: -6.287112, lng: 106.878240, type: "entrance", region: "Jakarta" },
  { name: "GT TAMAN MINI 2", lat: -6.287372, lng: 106.877623, type: "exit", region: "Jakarta" },
  { name: "GT DUKUH 1", lat: -6.301691, lng: 106.883554, type: "entrance", region: "Jakarta" },
  { name: "GT DUKUH 3", lat: -6.299842, lng: 106.883171, type: "exit", region: "Jakarta" },
  { name: "GT UTAMA PASAR REBO", lat: -6.310145, lng: 106.884777, type: "entrance", region: "Jakarta" },
  { name: "GT DUKUH 2", lat: -6.303403, lng: 106.883272, type: "exit", region: "Jakarta" },
  { name: "GT CIMANGGIS UTAMA", lat: -6.421117, lng: 106.893741, type: "entrance", region: "Jakarta" },
  { name: "GT CIMANGGIS", lat: -6.421041, lng: 106.893659, type: "exit", region: "Jakarta" },
  { name: "GT GUNUNG PUTRI ON RAMP", lat: -6.461260, lng: 106.889341, type: "entrance", region: "Bogor" },
  { name: "GT GUNUNG PUTRI OFF RAMP", lat: -6.461449, lng: 106.889174, type: "exit", region: "Bogor" },
  { name: "GT KARANGGAN OFF RAMP", lat: -6.457235, lng: 106.884046, type: "exit", region: "Bogor" },
  { name: "GT KARANGGAN ON RAMP", lat: -6.457187, lng: 106.884020, type: "entrance", region: "Bogor" },
  { name: "GT CITEUREUP 1", lat: -6.482461, lng: 106.874452, type: "entrance", region: "Bogor" },
  { name: "GT CITEUREUP 2", lat: -6.483423, lng: 106.873153, type: "exit", region: "Bogor" },
  { name: "GT SENTUL 1", lat: -6.528124, lng: 106.854283, type: "entrance", region: "Bogor" },
  { name: "GT SENTUL 2", lat: -6.531445, lng: 106.852579, type: "exit", region: "Bogor" },
  { name: "GT CIAWI 2", lat: -6.602257, lng: 106.831286, type: "entrance", region: "Bogor" },
  { name: "GT BOGOR SELATAN", lat: -6.613720, lng: 106.832399, type: "exit", region: "Bogor" },
  { name: "GT BOGOR 2", lat: -6.595940, lng: 106.826462, type: "entrance", region: "Bogor" },
  { name: "GT BANYUMANIK", lat: -7.065786, lng: 110.431719, type: "entrance", region: "Semarang" },
  { name: "GT UNGARAN", lat: -7.138035, lng: 110.420149, type: "exit", region: "Semarang" },
  { name: "GT BAWEN", lat: -7.245740, lng: 110.446546, type: "entrance", region: "Semarang" },
  { name: "GT SALATIGA", lat: -7.358600, lng: 110.533787, type: "exit", region: "Salatiga" },
  { name: "GT BOYOLALI", lat: -7.527176, lng: 110.632063, type: "entrance", region: "Boyolali" },
  { name: "GT CILANDAK UTAMA", lat: -6.299853, lng: 106.804018, type: "entrance", region: "Jakarta" },
  { name: "GT CILANDAK", lat: -6.298771, lng: 106.803878, type: "exit", region: "Jakarta" },
  { name: "GT KRUKUT 1", lat: -6.354208, lng: 106.789135, type: "entrance", region: "Jakarta" },
  { name: "GT KRUKUT 4", lat: -6.356063, lng: 106.789060, type: "exit", region: "Jakarta" },
  { name: "GT SAWANGAN 1", lat: -6.392682, lng: 106.783167, type: "entrance", region: "Jakarta" },
  { name: "GT SAWANGAN 4", lat: -6.392807, lng: 106.782590, type: "exit", region: "Jakarta" },
  { name: "GT BOJONGGEDE 1", lat: -6.471068, lng: 106.794438, type: "entrance", region: "Bogor" },
  { name: "GT BOJONGGEDE 2", lat: -6.471101, lng: 106.794003, type: "exit", region: "Bogor" },
  { name: "GT SINGOSARI", lat: -7.923997, lng: 112.671978, type: "entrance", region: "Malang" },
  { name: "GT PAKIS", lat: -7.956533, lng: 112.696336, type: "exit", region: "Malang" },
  { name: "GT PURWODADI", lat: -7.799072, lng: 112.732700, type: "entrance", region: "Malang" },
  { name: "GT LAWANG", lat: -7.856804, lng: 112.699663, type: "exit", region: "Malang" },
  { name: "GT MALANG", lat: -7.978102, lng: 112.674618, type: "entrance", region: "Malang" },
  { name: "GT KOPO 1", lat: -6.955238, lng: 107.579458, type: "entrance", region: "Bandung" },
  { name: "GT KOPO 2", lat: -6.955695, lng: 107.580256, type: "exit", region: "Bandung" },
  { name: "GT MOH TOHA 1", lat: -6.956894, lng: 107.609097, type: "entrance", region: "Bandung" },
  { name: "GT MOH TOHA 2", lat: -6.956600, lng: 107.609775, type: "exit", region: "Bandung" },
  { name: "GT BUAH BATU 1", lat: -6.961377, lng: 107.635507, type: "entrance", region: "Bandung" },
  { name: "GT BUAH BATU 2", lat: -6.961411, lng: 107.636499, type: "exit", region: "Bandung" },
  { name: "GT PASIR KOJA 1", lat: -6.931573, lng: 107.569735, type: "entrance", region: "Bandung" },
  { name: "GT PASIR KOJA 2", lat: -6.931468, lng: 107.570631, type: "exit", region: "Bandung" },
  { name: "GT BAROS 1", lat: -6.897442, lng: 107.541831, type: "entrance", region: "Bandung" },
  { name: "GT PASTEUR 1", lat: -6.898716, lng: 107.541313, type: "exit", region: "Bandung" },
  { name: "GT BAROS 2", lat: -6.899192, lng: 107.541752, type: "entrance", region: "Bandung" },
  { name: "GT CILEUNYI", lat: -6.944224, lng: 107.749472, type: "exit", region: "Bandung" },
  { name: "GT PADALARANG", lat: -6.852710, lng: 107.500002, type: "entrance", region: "Bandung" },
  { name: "GT PASTEUR 2", lat: -6.890442, lng: 107.574546, type: "exit", region: "Bandung" },
  { name: "GT NGAWI", lat: -7.416028, lng: 111.414242, type: "entrance", region: "Ngawi" },
  { name: "GT KARANGANYAR", lat: -7.521391, lng: 110.894142, type: "exit", region: "Karanganyar" },
  { name: "GT COLOMADU", lat: -7.534929, lng: 110.711172, type: "entrance", region: "Surakarta" },
  { name: "GT ADI SUMARMO", lat: -7.505793, lng: 110.750801, type: "exit", region: "Surakarta" },
  { name: "GT NGEMPLAK", lat: -7.528186, lng: 110.799688, type: "entrance", region: "Surakarta" },
  { name: "GT GONDANGREJO", lat: -7.522433, lng: 110.819243, type: "exit", region: "Karanganyar" },
  { name: "GT SRAGEN", lat: -7.432939, lng: 110.977934, type: "entrance", region: "Sragen" },
  { name: "GT SRAGEN TIMUR", lat: -7.378213, lng: 111.106992, type: "exit", region: "Sragen" },
  { name: "GT BANDAR", lat: -7.579514, lng: 112.137754, type: "entrance", region: "Mojokerto" },
  { name: "GT MOJOKERTO BARAT", lat: -7.451599, lng: 112.406274, type: "exit", region: "Mojokerto" },
  { name: "GT JOMBANG", lat: -7.493102, lng: 112.239173, type: "entrance", region: "Jombang" },
  { name: "GT KRIAN", lat: -7.366891, lng: 112.575107, type: "exit", region: "Sidoarjo" },
  { name: "GT DRIYOREJO 1", lat: -7.353322, lng: 112.634330, type: "entrance", region: "Gresik" },
  { name: "GT DRIYOREJO 2", lat: -7.353842, lng: 112.634652, type: "exit", region: "Gresik" },
  { name: "GT WARUGUNUNG", lat: -7.339734, lng: 112.679382, type: "entrance", region: "Sidoarjo" },
  { name: "GT WARU 1", lat: -7.345725, lng: 112.713034, type: "exit", region: "Sidoarjo" },
  { name: "GT WARU UTAMA", lat: -7.347696, lng: 112.710446, type: "entrance", region: "Sidoarjo" },
  { name: "GT SIDOARJO 1", lat: -7.446171, lng: 112.699460, type: "exit", region: "Sidoarjo" },
  { name: "GT SIDOARJO 2", lat: -7.444613, lng: 112.697380, type: "entrance", region: "Sidoarjo" },
  { name: "GT PORONG", lat: -7.507369, lng: 112.699251, type: "exit", region: "Sidoarjo" },
  { name: "GT GEMPOL 1", lat: -7.557772, lng: 112.714106, type: "entrance", region: "Pasuruan" },
  { name: "GT GEMPOL 4", lat: -7.557369, lng: 112.714407, type: "exit", region: "Pasuruan" },
  { name: "GT PANDAAN", lat: -7.665683, lng: 112.704521, type: "entrance", region: "Pasuruan" },
  { name: "GT BANGIL", lat: -7.614652, lng: 112.762081, type: "exit", region: "Pasuruan" },
  { name: "GT REMBANG", lat: -7.638665, lng: 112.827060, type: "entrance", region: "Pasuruan" },
  { name: "GT PASURUAN", lat: -7.663286, lng: 112.885272, type: "exit", region: "Pasuruan" },
  { name: "GT GRATI", lat: -7.712050, lng: 112.996021, type: "entrance", region: "Pasuruan" },
  { name: "GT SURABAYA WARU", lat: -7.3431, lng: 112.7297, type: "exit", region: "Surabaya" },
  { name: "GT KRAPYAK 1", lat: -6.994945, lng: 110.368783, type: "entrance", region: "Semarang" },
  { name: "GT KRAPYAK 2", lat: -6.990508, lng: 110.369131, type: "exit", region: "Semarang" },
  { name: "GT MANYARAN", lat: -7.005559, lng: 110.377383, type: "entrance", region: "Semarang" },
  { name: "GT JATINGALEH 1", lat: -7.031328, lng: 110.421142, type: "exit", region: "Semarang" },
  { name: "GT JATINGALEH 2", lat: -7.031190, lng: 110.414938, type: "entrance", region: "Semarang" },
  { name: "GT TEMBALANG", lat: -7.049663, lng: 110.433481, type: "exit", region: "Semarang" },
  { name: "GT SRONDOL", lat: -7.056396, lng: 110.423572, type: "entrance", region: "Semarang" },
  { name: "GT GAYAMSARI", lat: -6.999111, lng: 110.450946, type: "exit", region: "Semarang" },
  { name: "GT MUKTIHARJO", lat: -6.973110, lng: 110.450032, type: "entrance", region: "Semarang" },
  { name: "GT PEMALANG", lat: -6.914425, lng: 109.433584, type: "exit", region: "Pemalang" },
  { name: "GT BATANG", lat: -6.941533, lng: 109.697993, type: "entrance", region: "Batang" },
  { name: "GT PEKALONGAN", lat: -6.947226, lng: 109.603195, type: "exit", region: "Pekalongan" },
  { name: "GT BREBES TIMUR", lat: -6.898379, lng: 109.067494, type: "entrance", region: "Brebes" },
  { name: "GT BREBES BARAT", lat: -6.899252, lng: 109.015130, type: "exit", region: "Brebes" },
  { name: "GT TEGAL", lat: -6.938535, lng: 109.149367, type: "entrance", region: "Tegal" },
  { name: "GT PALIMANAN", lat: -6.689885, lng: 108.417152, type: "exit", region: "Cirebon" },
  { name: "GT SUMBERJAYA", lat: -6.704697, lng: 108.312645, type: "entrance", region: "Cirebon" },
  { name: "GT PLUMBON 1", lat: -6.702091, lng: 108.485828, type: "entrance", region: "Cirebon" },
  { name: "GT PLUMBON 2", lat: -6.699125, lng: 108.485208, type: "exit", region: "Cirebon" },
  { name: "GT CIPERNA BARAT", lat: -6.760238, lng: 108.529301, type: "entrance", region: "Cirebon" },
  { name: "GT CIPERNA TIMUR", lat: -6.766618, lng: 108.527497, type: "exit", region: "Cirebon" },
  { name: "GT KANCI", lat: -6.799533, lng: 108.622468, type: "entrance", region: "Cirebon" },
  { name: "GT PEJAGAN", lat: -6.895679, lng: 108.882297, type: "exit", region: "Brebes" },
  { name: "GT KALIJATI", lat: -6.509173, lng: 107.678718, type: "entrance", region: "Subang" },
  { name: "GT SUBANG", lat: -6.531885, lng: 107.783615, type: "exit", region: "Subang" },
  { name: "GT CIKEDUNG", lat: -6.619119, lng: 108.015182, type: "entrance", region: "Subang" },
  { name: "GT KERTAJATI", lat: -6.708210, lng: 108.169492, type: "exit", region: "Majalengka" },
  { name: "GT KERTAJATI BANDARA", lat: -6.693788, lng: 108.173239, type: "entrance", region: "Majalengka" },
  { name: "GT CIKAMPEK", lat: -6.440027, lng: 107.476810, type: "entrance", region: "Karawang" },
  { name: "GT CIKOPO", lat: -6.458229, lng: 107.509226, type: "exit", region: "Karawang" },
  { name: "GT KARAWANG BARAT", lat: -6.345904, lng: 107.269529, type: "entrance", region: "Karawang" },
  { name: "GT KARAWANG TIMUR 1", lat: -6.352937, lng: 107.336155, type: "exit", region: "Karawang" },
  { name: "GT CIKUPA", lat: -6.205479, lng: 106.523699, type: "entrance", region: "Tangerang" },
  { name: "GT BALARAJA TIMUR", lat: -6.204201, lng: 106.485066, type: "exit", region: "Tangerang" },
  { name: "GT BALARAJA BARAT", lat: -6.200021, lng: 106.459108, type: "entrance", region: "Tangerang" },
  { name: "GT CIKANDE", lat: -6.175274, lng: 106.343970, type: "exit", region: "Serang" },
  { name: "GT CIUJUNG", lat: -6.141363, lng: 106.286489, type: "entrance", region: "Serang" },
  { name: "GT SERANG TIMUR", lat: -6.116146, lng: 106.182973, type: "exit", region: "Serang" },
  { name: "GT SERANG BARAT", lat: -6.090697, lng: 106.136106, type: "entrance", region: "Serang" },
  { name: "GT CILEGON TIMUR", lat: -6.023254, lng: 106.089040, type: "exit", region: "Cilegon" },
  { name: "GT CILEGON BARAT", lat: -5.983789, lng: 106.033417, type: "entrance", region: "Cilegon" },
  { name: "GT MERAK", lat: -5.973075, lng: 106.008641, type: "exit", region: "Banten" },
  { name: "GT MARUNDA", lat: -6.116771, lng: 106.976525, type: "entrance", region: "Jakarta" },
  { name: "GT CIBITUNG 1", lat: -6.287127, lng: 107.083479, type: "exit", region: "Bekasi" },
  { name: "GT CIBITUNG 2", lat: -6.285883, lng: 107.085409, type: "entrance", region: "Bekasi" },
  { name: "GT TARUMAJAYA", lat: -6.108295, lng: 106.991062, type: "exit", region: "Bekasi" },
  { name: "GT TAMBELANG", lat: -6.187076, lng: 107.068395, type: "entrance", region: "Bekasi" },
  { name: "GT TELAGA ASIH", lat: -6.269544, lng: 107.096871, type: "exit", region: "Bekasi" },
  { name: "GT SEMPER", lat: -6.134476, lng: 106.937251, type: "entrance", region: "Jakarta" },
  { name: "GT KARTASURA", lat: -7.548873, lng: 110.701455, type: "entrance", region: "Surakarta" },
  { name: "GT KARANGANOM", lat: -7.644941, lng: 110.668926, type: "exit", region: "Klaten" },
  { name: "GT KLATEN", lat: -7.678530, lng: 110.598400, type: "entrance", region: "Klaten" },
  { name: "GT PRAMBANAN", lat: -7.726745, lng: 110.533253, type: "exit", region: "Sleman" },
  { name: "GT MANISRENGGO", lat: -7.703413, lng: 110.522728, type: "entrance", region: "Sleman" },
  { name: "GT PURWOMARTANI", lat: -7.772426, lng: 110.464285, type: "exit", region: "Sleman" },
  { name: "GT GAMPING", lat: -7.799333, lng: 110.306945, type: "entrance", region: "Sleman" },
  { name: "GT SENTOLO", lat: -7.817896, lng: 110.220455, type: "exit", region: "Kulon Progo" },
  { name: "GT WATES", lat: -7.845978, lng: 110.160361, type: "entrance", region: "Kulon Progo" },
  { name: "GT KULON PROGO", lat: -7.878058, lng: 110.060347, type: "exit", region: "Kulon Progo" },
  // Tambahkan lebih banyak sesuai data yang diberikan...
]

export interface RouteResponse {
  coordinates: { lat: number; lng: number }[]
  distance: number // dalam kilometer
  duration: number // dalam menit
  tollGates?: { name: string; lat: number; lng: number; type: 'entrance' | 'exit'; region: string }[]
  tollInfo?: string // info gerbang tol yang dilalui
  tollRoute?: string[] // rute gerbang tol berurutan
}

// Mencari gerbang tol terdekat dari titik
const findNearestTollGates = (
  location: Location,
  type: 'entrance' | 'exit',
  maxDistance: number = 50
): Array<{
  name: string;
  lat: number;
  lng: number;
  type: 'entrance' | 'exit';
  region: string;
  distance: number;
}> => {
  return TOLL_GATES
    .filter((gate): gate is { name: string; lat: number; lng: number; type: 'entrance' | 'exit'; region: string } => 
      gate.type === type
    )
    .map(gate => ({
      ...gate,
      distance: calculateDistance(location.lat, location.lng, gate.lat, gate.lng)
    }))
    .filter(gate => gate.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);
};

// Algoritma cerdas untuk memilih rute tol optimal
const findOptimalTollRoute = (start: Location, end: Location) => {
  const directDistance = calculateDistance(start.lat, start.lng, end.lat, end.lng)
  
  // Hanya gunakan tol jika jarak > 30km
  if (directDistance < 30) {
    return { entry: null, exit: null, reason: "Jarak terlalu dekat untuk tol" }
  }

  // Cari gerbang masuk terdekat dari start
  const nearestEntrances = findNearestTollGates(start, 'entrance', 25)
  // Cari gerbang keluar terdekat dari end  
  const nearestExits = findNearestTollGates(end, 'exit', 25)

  if (nearestEntrances.length === 0 || nearestExits.length === 0) {
    return { entry: null, exit: null, reason: "Tidak ada gerbang tol yang sesuai" }
  }

  let bestEntry = null
  let bestExit = null
  let bestScore = Infinity

  // Evaluasi kombinasi terbaik
  for (const entry of nearestEntrances) {
    for (const exit of nearestExits) {
      // Jarak total via tol
      const entryDistance = entry.distance
      const exitDistance = exit.distance
      const tollDistance = calculateDistance(entry.lat, entry.lng, exit.lat, exit.lng)
      
      // Skip jika gerbang tol terlalu dekat (< 15km)
      if (tollDistance < 15) continue
      
      // Hitung score (prioritas: jarak detour minimal, segmen tol maksimal)
      const totalViaDistance = entryDistance + tollDistance + exitDistance
      const detourRatio = totalViaDistance / directDistance
      
      // Score yang lebih rendah = lebih baik
      // Prioritas: detour ratio rendah, jarak tol panjang
      const score = detourRatio * 1000 - tollDistance * 2
      
      // Hanya pilih jika detour tidak terlalu jauh (max 1.5x jarak langsung)
      if (detourRatio <= 1.5 && score < bestScore && tollDistance > directDistance * 0.4) {
        bestScore = score
        bestEntry = entry
        bestExit = exit
      }
    }
  }

  return { 
    entry: bestEntry, 
    exit: bestExit, 
    reason: bestEntry ? "Rute tol optimal ditemukan" : "Tidak ada rute tol yang efisien" 
  }
}

// Membuat rute dengan gerbang tol cerdas
export const calculateRoute = async (
  departure: Location,
  stops: Location[],
  destination: Location,
): Promise<RouteResponse> => {
  try {
    const routePoints = [departure, ...stops, destination]
    const optimizedPoints: Location[] = []
    const usedTollGates: { name: string; lat: number; lng: number; type: 'entrance' | 'exit'; region: string }[] = []
    const tollRoute: string[] = []
    
    console.log("🛣️ Menghitung rute optimal dengan", routePoints.length, "titik")

    for (let i = 0; i < routePoints.length; i++) {
      const currentPoint = routePoints[i]
      const nextPoint = routePoints[i + 1]
      
      optimizedPoints.push(currentPoint)
      
      if (nextPoint) {
        const segmentDistance = calculateDistance(currentPoint.lat, currentPoint.lng, nextPoint.lat, nextPoint.lng)
        console.log(`📏 Segmen ${i + 1}: ${currentPoint.name} → ${nextPoint.name} (${segmentDistance.toFixed(1)}km)`)
        
        // Cari rute tol untuk jarak > 30km
        if (segmentDistance > 30) {
          const { entry, exit, reason } = findOptimalTollRoute(currentPoint, nextPoint)
          
          if (entry && exit) {
            const tollDistance = calculateDistance(entry.lat, entry.lng, exit.lat, exit.lng)
            
            // Tambah titik masuk tol
            optimizedPoints.push({
              name: `🎫 Masuk ${entry.name}`,
              lat: entry.lat,
              lng: entry.lng
            })
            usedTollGates.push(entry)
            
            // Tambah titik keluar tol
            optimizedPoints.push({
              name: `🚪 Keluar ${exit.name}`,
              lat: exit.lat,
              lng: exit.lng
            })
            usedTollGates.push(exit)
            
            tollRoute.push(`${entry.region} → ${exit.region} (${tollDistance.toFixed(1)}km)`)
            console.log(`✅ Tol: ${entry.name} → ${exit.name} (${tollDistance.toFixed(1)}km)`)
          } else {
            console.log(`ℹ️ ${reason} untuk segmen ${currentPoint.name} → ${nextPoint.name}`)
          }
        }
      }
    }

    // Bangun string waypoints untuk OSRM
    const waypoints = optimizedPoints.map(point => `${point.lng},${point.lat}`).join(";")
    
    console.log("🗺️ Titik rute teroptimasi:", optimizedPoints.length)
    console.log("🎫 Gerbang tol digunakan:", usedTollGates.length)

    // Panggil OSRM API
    const response = await fetch(
      `${OSRM_BASE_URL}/route/v1/driving/${waypoints}?overview=full&geometries=geojson&annotations=true`
    )

    if (!response.ok) {
      throw new Error("Gagal menghitung rute OSRM")
    }

    const data = await response.json()

    if (!data.routes || data.routes.length === 0) {
      throw new Error("Tidak ada rute ditemukan")
    }

    const route = data.routes[0]
    const routeCoordinates = route.geometry.coordinates.map((coord: [number, number]) => ({
      lat: coord[1],
      lng: coord[0],
    }))

    // Info gerbang tol yang detail
    const tollInfo = tollRoute.length > 0 
      ? `Via ${tollRoute.length} rute tol: ${tollRoute.join(", ")}`
      : "Rute langsung (tanpa tol)"

    return {
      coordinates: routeCoordinates,
      distance: route.distance / 1000, // Konversi ke kilometer
      duration: Math.round(route.duration / 60), // Konversi ke menit
      tollGates: usedTollGates,
      tollInfo: tollInfo,
      tollRoute: tollRoute,
    }
  } catch (error) {
    console.error("❌ Error menghitung rute optimal:", error)
    return calculateSmartFallbackRoute(departure, stops, destination)
  }
}

// Fallback route dengan algoritma cerdas
const calculateSmartFallbackRoute = (departure: Location, stops: Location[], destination: Location): RouteResponse => {
  const allPoints = [departure, ...stops, destination]
  const coordinates: { lat: number; lng: number }[] = []
  let totalDistance = 0
  const usedTollGates: { name: string; lat: number; lng: number; type: 'entrance' | 'exit'; region: string }[] = []
  const tollRoute: string[] = []

  console.log("🔄 Menggunakan fallback route cerdas")

  for (let i = 0; i < allPoints.length - 1; i++) {
    const start = allPoints[i]
    const end = allPoints[i + 1]
    const segmentDistance = calculateDistance(start.lat, start.lng, end.lat, end.lng)
    totalDistance += segmentDistance

    // Coba gunakan tol untuk jarak > 30km
    if (segmentDistance > 30) {
      const { entry, exit } = findOptimalTollRoute(start, end)
      
      if (entry && exit) {
        const tollDistance = calculateDistance(entry.lat, entry.lng, exit.lat, exit.lng)
        usedTollGates.push(entry, exit)
        tollRoute.push(`${entry.region} → ${exit.region} (${tollDistance.toFixed(1)}km)`)
        
        // Generate koordinat: start → entry → exit → end
        const segments = [
          { from: start, to: { name: entry.name, lat: entry.lat, lng: entry.lng } },
          { from: { name: entry.name, lat: entry.lat, lng: entry.lng }, to: { name: exit.name, lat: exit.lat, lng: exit.lng } },
          { from: { name: exit.name, lat: exit.lat, lng: exit.lng }, to: end }
        ]
        
        segments.forEach((segment, segIndex) => {
          // Lebih banyak titik untuk segmen tol (gerakan lebih smooth)
          const pointCount = segIndex === 1 ? 50 : 25
          for (let j = 0; j <= pointCount; j++) {
            const ratio = j / pointCount
            coordinates.push({
              lat: segment.from.lat + (segment.to.lat - segment.from.lat) * ratio,
              lng: segment.from.lng + (segment.to.lng - segment.from.lng) * ratio,
            })
          }
        })
      } else {
        // Rute langsung untuk jarak menengah
        for (let j = 0; j <= 30; j++) {
          const ratio = j / 30
          coordinates.push({
            lat: start.lat + (end.lat - start.lat) * ratio,
            lng: start.lng + (end.lng - start.lng) * ratio,
          })
        }
      }
    } else {
      // Rute langsung untuk jarak pendek
      for (let j = 0; j <= 20; j++) {
        const ratio = j / 20
        coordinates.push({
          lat: start.lat + (end.lat - start.lat) * ratio,
          lng: start.lng + (end.lng - start.lng) * ratio,
        })
      }
    }
  }

  // Perhitungan kecepatan realistis
  const avgSpeed = usedTollGates.length > 0 ? 78 : 55 // Tol vs jalan biasa
  const estimatedDuration = Math.round((totalDistance / avgSpeed) * 60)
  
  const tollInfo = tollRoute.length > 0 
    ? `Via ${tollRoute.length} rute tol: ${tollRoute.join(", ")}`
    : "Rute langsung (tanpa tol)"

  console.log("✅ Fallback route:", {
    distance: totalDistance.toFixed(1) + "km",
    duration: estimatedDuration + " menit",
    tollGates: usedTollGates.length,
    tollInfo: tollInfo
  })

  return {
    coordinates,
    distance: totalDistance,
    duration: estimatedDuration,
    tollGates: usedTollGates,
    tollInfo: tollInfo,
    tollRoute: tollRoute,
  }
}

// Hitung jarak menggunakan formula Haversine
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371 // Radius bumi dalam kilometer
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180)
}