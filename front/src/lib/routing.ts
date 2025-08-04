import type { Location } from "@/types"

// OSRM API untuk routing nyata
const OSRM_BASE_URL = "https://router.project-osrm.org"

// Data lengkap gerbang tol di seluruh Indonesia
const TOLL_GATES = [
  { name: "GT ADI SUMARMO", lat: -7.505793, lng: 110.750801, type: "entrance", region: "Surakarta" },
  { name: "GT ADI SUMARMO", lat: -7.505793, lng: 110.750801, type: "exit", region: "Surakarta" },
  { name: "GT AIR MADIDI", lat: 1.409783, lng: 124.981891, type: "entrance", region: "Unknown" },
  { name: "GT AIR MADIDI", lat: 1.409783, lng: 124.981891, type: "exit", region: "Unknown" },
  { name: "GT AMPLAS", lat: 3.537460, lng: 98.721856, type: "entrance", region: "Unknown" },
  { name: "GT AMPLAS", lat: 3.537460, lng: 98.721856, type: "exit", region: "Unknown" },
  { name: "GT AMPERA 1", lat: -6.292449, lng: 106.819245, type: "entrance", region: "Jakarta" },
  { name: "GT AMPERA 1", lat: -6.292449, lng: 106.819245, type: "exit", region: "Jakarta" },
  { name: "GT AMPERA 2", lat: -6.292336, lng: 106.813441, type: "entrance", region: "Jakarta" },
  { name: "GT AMPERA 2", lat: -6.292336, lng: 106.813441, type: "exit", region: "Jakarta" },
  { name: "GT ANCOL BARAT", lat: -6.131417, lng: 106.824951, type: "entrance", region: "Jakarta" },
  { name: "GT ANCOL BARAT", lat: -6.131417, lng: 106.824951, type: "exit", region: "Jakarta" },
  { name: "GT ANCOL TIMUR", lat: -6.125675, lng: 106.851114, type: "entrance", region: "Jakarta" },
  { name: "GT ANCOL TIMUR", lat: -6.125675, lng: 106.851114, type: "exit", region: "Jakarta" },
  { name: "GT ANGKE 1", lat: -6.140566, lng: 106.787311, type: "entrance", region: "Jakarta" },
  { name: "GT ANGKE 1", lat: -6.140566, lng: 106.787311, type: "exit", region: "Jakarta" },
  { name: "GT ANGKE 2", lat: -6.144460, lng: 106.789793, type: "entrance", region: "Jakarta" },
  { name: "GT ANGKE 2", lat: -6.144460, lng: 106.789793, type: "exit", region: "Jakarta" },
  { name: "GT ASEMBAGUS", lat: -7.755602, lng: 114.179224, type: "entrance", region: "Banyuwangi" },
  { name: "GT ASEMBAGUS", lat: -7.755602, lng: 114.179224, type: "exit", region: "Banyuwangi" },
  { name: "GT BAITUSSALAM", lat: 5.586835, lng: 95.405579, type: "entrance", region: "Unknown" },
  { name: "GT BAITUSSALAM", lat: 5.586835, lng: 95.405579, type: "exit", region: "Unknown" },
  { name: "GT BAJULMATI", lat: -7.938809, lng: 114.384457, type: "entrance", region: "Banyuwangi" },
  { name: "GT BAJULMATI", lat: -7.938809, lng: 114.384457, type: "exit", region: "Banyuwangi" },
  { name: "GT BAKAUHENI SELATAN", lat: -5.842837, lng: 105.728026, type: "entrance", region: "Unknown" },
  { name: "GT BAKAUHENI SELATAN", lat: -5.842837, lng: 105.728026, type: "exit", region: "Unknown" },
  { name: "GT BAKAUHENI UTARA", lat: -5.806735, lng: 105.726361, type: "entrance", region: "Unknown" },
  { name: "GT BAKAUHENI UTARA", lat: -5.806735, lng: 105.726361, type: "exit", region: "Unknown" },
  { name: "GT BALARAJA BARAT", lat: -6.200021, lng: 106.459108, type: "entrance", region: "Tangerang" },
  { name: "GT BALARAJA BARAT", lat: -6.200021, lng: 106.459108, type: "exit", region: "Tangerang" },
  { name: "GT BALARAJA TIMUR", lat: -6.204201, lng: 106.485066, type: "entrance", region: "Tangerang" },
  { name: "GT BALARAJA TIMUR", lat: -6.204201, lng: 106.485066, type: "exit", region: "Tangerang" },
  { name: "GT BAMBU APUS 1", lat: -6.310196, lng: 106.900910, type: "entrance", region: "Jakarta" },
  { name: "GT BAMBU APUS 1", lat: -6.310196, lng: 106.900910, type: "exit", region: "Jakarta" },
  { name: "GT BAMBU APUS 2", lat: -6.307543, lng: 106.895628, type: "entrance", region: "Jakarta" },
  { name: "GT BAMBU APUS 2", lat: -6.307543, lng: 106.895628, type: "exit", region: "Jakarta" },
  { name: "GT BANDAR", lat: -7.579514, lng: 112.137754, type: "entrance", region: "Mojokerto" },
  { name: "GT BANDAR", lat: -7.579514, lng: 112.137754, type: "exit", region: "Mojokerto" },
  { name: "GT BANDAR SELAMAT 1", lat: 3.599005, lng: 98.724236, type: "entrance", region: "Unknown" },
  { name: "GT BANDAR SELAMAT 1", lat: 3.599005, lng: 98.724236, type: "exit", region: "Unknown" },
  { name: "GT BANDAR SELAMAT 2", lat: 3.599202, lng: 98.723623, type: "entrance", region: "Unknown" },
  { name: "GT BANDAR SELAMAT 2", lat: 3.599202, lng: 98.723623, type: "exit", region: "Unknown" },
  { name: "GT BANDAR SELAMAT 3", lat: 3.595802, lng: 98.723780, type: "entrance", region: "Unknown" },
  { name: "GT BANDAR SELAMAT 3", lat: 3.595802, lng: 98.723780, type: "exit", region: "Unknown" },
  { name: "GT BANDAR SELAMAT 4", lat: 3.595619, lng: 98.724324, type: "entrance", region: "Unknown" },
  { name: "GT BANDAR SELAMAT 4", lat: 3.595619, lng: 98.724324, type: "exit", region: "Unknown" },
  { name: "GT BANGIL", lat: -7.614652, lng: 112.762081, type: "entrance", region: "Pasuruan" },
  { name: "GT BANGIL", lat: -7.614652, lng: 112.762081, type: "exit", region: "Pasuruan" },
  { name: "GT BANGKINANG", lat: 0.384300, lng: 101.021539, type: "entrance", region: "Unknown" },
  { name: "GT BANGKINANG", lat: 0.384300, lng: 101.021539, type: "exit", region: "Unknown" },
  { name: "GT BANTAR GEBANG", lat: -6.320320, lng: 106.990341, type: "entrance", region: "Unknown" },
  { name: "GT BANTAR GEBANG", lat: -6.320320, lng: 106.990341, type: "exit", region: "Unknown" },
  { name: "GT BANYU URIP", lat: -7.262932, lng: 112.707526, type: "entrance", region: "Surabaya" },
  { name: "GT BANYU URIP", lat: -7.262932, lng: 112.707526, type: "exit", region: "Surabaya" },
  { name: "GT BANYUMANIK", lat: -7.065786, lng: 110.431719, type: "entrance", region: "Semarang" },
  { name: "GT BANYUMANIK", lat: -7.065786, lng: 110.431719, type: "exit", region: "Semarang" },
  { name: "GT BAROS 1", lat: -6.897442, lng: 107.541831, type: "entrance", region: "Bandung" },
  { name: "GT BAROS 1", lat: -6.897442, lng: 107.541831, type: "exit", region: "Bandung" },
  { name: "GT BAROS 2", lat: -6.899192, lng: 107.541752, type: "entrance", region: "Bandung" },
  { name: "GT BAROS 2", lat: -6.899192, lng: 107.541752, type: "exit", region: "Bandung" },
  { name: "GT BATANG", lat: -6.941533, lng: 109.697993, type: "entrance", region: "Batang" },
  { name: "GT BATANG", lat: -6.941533, lng: 109.697993, type: "exit", region: "Batang" },
  { name: "GT BATHIN SOLAPAN", lat: 1.425492, lng: 101.268117, type: "entrance", region: "Unknown" },
  { name: "GT BATHIN SOLAPAN", lat: 1.425492, lng: 101.268117, type: "exit", region: "Unknown" },
  { name: "GT BAWEN", lat: -7.245740, lng: 110.446546, type: "entrance", region: "Semarang" },
  { name: "GT BAWEN", lat: -7.245740, lng: 110.446546, type: "exit", region: "Semarang" },
  { name: "GT BELAWAN", lat: 3.729793, lng: 98.681036, type: "entrance", region: "Unknown" },
  { name: "GT BELAWAN", lat: 3.729793, lng: 98.681036, type: "exit", region: "Unknown" },
  { name: "GT BENDA UTAMA", lat: -6.135509, lng: 106.681669, type: "entrance", region: "Jakarta" },
  { name: "GT BENDA UTAMA", lat: -6.135509, lng: 106.681669, type: "exit", region: "Jakarta" },
  { name: "GT BENOA", lat: -8.735201, lng: 115.207975, type: "entrance", region: "Unknown" },
  { name: "GT BENOA", lat: -8.735201, lng: 115.207975, type: "exit", region: "Unknown" },
  { name: "GT BERBEK 1", lat: -7.342682, lng: 112.758088, type: "entrance", region: "Sidoarjo" },
  { name: "GT BERBEK 1", lat: -7.342682, lng: 112.758088, type: "exit", region: "Sidoarjo" },
  { name: "GT BERBEK 2", lat: -7.343156, lng: 112.752388, type: "entrance", region: "Sidoarjo" },
  { name: "GT BERBEK 2", lat: -7.343156, lng: 112.752388, type: "exit", region: "Sidoarjo" },
  { name: "GT BESUKI", lat: -7.736874, lng: 113.720038, type: "entrance", region: "Situbondo" },
  { name: "GT BESUKI", lat: -7.736874, lng: 113.720038, type: "exit", region: "Situbondo" },
  { name: "GT BINTARA", lat: -6.221474, lng: 106.950139, type: "entrance", region: "Jakarta" },
  { name: "GT BINTARA", lat: -6.221474, lng: 106.950139, type: "exit", region: "Jakarta" },
  { name: "GT BINTARA JAYA", lat: -6.249689, lng: 106.950174, type: "entrance", region: "Jakarta" },
  { name: "GT BINTARA JAYA", lat: -6.249689, lng: 106.950174, type: "exit", region: "Jakarta" },
  { name: "GT BINTARO 2", lat: -6.273044, lng: 106.748606, type: "entrance", region: "Jakarta" },
  { name: "GT BINTARO 2", lat: -6.273044, lng: 106.748606, type: "exit", region: "Jakarta" },
  { name: "GT BIRA BARAT", lat: -5.088141, lng: 119.482640, type: "entrance", region: "Unknown" },
  { name: "GT BIRA BARAT", lat: -5.088141, lng: 119.482640, type: "exit", region: "Unknown" },
  { name: "GT BIRA TIMUR", lat: -5.090170, lng: 119.473401, type: "entrance", region: "Unknown" },
  { name: "GT BIRA TIMUR", lat: -5.090170, lng: 119.473401, type: "exit", region: "Unknown" },
  { name: "GT BIRINGKANAYA", lat: -5.075238, lng: 119.516529, type: "entrance", region: "Unknown" },
  { name: "GT BIRINGKANAYA", lat: -5.075238, lng: 119.516529, type: "exit", region: "Unknown" },
  { name: "GT BITUNG 1", lat: -6.218644, lng: 106.565409, type: "entrance", region: "Tangerang" },
  { name: "GT BITUNG 1", lat: -6.218644, lng: 106.565409, type: "exit", region: "Tangerang" },
  { name: "GT BITUNG 2", lat: -6.219277, lng: 106.566233, type: "entrance", region: "Tangerang" },
  { name: "GT BITUNG 2", lat: -6.219277, lng: 106.566233, type: "exit", region: "Tangerang" },
  { name: "GT BLANG BINTANG", lat: 5.508086, lng: 95.446435, type: "entrance", region: "Unknown" },
  { name: "GT BLANG BINTANG", lat: 5.508086, lng: 95.446435, type: "exit", region: "Unknown" },
  { name: "GT BOGOR 1", lat: -6.597455, lng: 106.817616, type: "entrance", region: "Bogor" },
  { name: "GT BOGOR 1", lat: -6.597455, lng: 106.817616, type: "exit", region: "Bogor" },
  { name: "GT BOGOR 2", lat: -6.595940, lng: 106.826462, type: "entrance", region: "Bogor" },
  { name: "GT BOGOR 2", lat: -6.595940, lng: 106.826462, type: "exit", region: "Bogor" },
  { name: "GT BOGOR SELATAN", lat: -6.613720, lng: 106.832399, type: "entrance", region: "Bogor" },
  { name: "GT BOGOR SELATAN", lat: -6.613720, lng: 106.832399, type: "exit", region: "Bogor" },
  { name: "GT BOJONGGEDE 1", lat: -6.471068, lng: 106.794438, type: "entrance", region: "Bogor" },
  { name: "GT BOJONGGEDE 1", lat: -6.471068, lng: 106.794438, type: "exit", region: "Bogor" },
  { name: "GT BOJONGGEDE 2", lat: -6.471101, lng: 106.794003, type: "entrance", region: "Bogor" },
  { name: "GT BOJONGGEDE 2", lat: -6.471101, lng: 106.794003, type: "exit", region: "Bogor" },
  { name: "GT BOYOLALI", lat: -7.527176, lng: 110.632063, type: "entrance", region: "Boyolali" },
  { name: "GT BOYOLALI", lat: -7.527176, lng: 110.632063, type: "exit", region: "Boyolali" },
  { name: "GT BREBES BARAT", lat: -6.899252, lng: 109.015130, type: "entrance", region: "Brebes" },
  { name: "GT BREBES BARAT", lat: -6.899252, lng: 109.015130, type: "exit", region: "Brebes" },
  { name: "GT BREBES TIMUR", lat: -6.898379, lng: 109.067494, type: "entrance", region: "Brebes" },
  { name: "GT BREBES TIMUR", lat: -6.898379, lng: 109.067494, type: "exit", region: "Brebes" },
  { name: "GT BUAH BATU 1", lat: -6.961377, lng: 107.635507, type: "entrance", region: "Bandung" },
  { name: "GT BUAH BATU 1", lat: -6.961377, lng: 107.635507, type: "exit", region: "Bandung" },
  { name: "GT BUAH BATU 2", lat: -6.961411, lng: 107.636499, type: "entrance", region: "Bandung" },
  { name: "GT BUAH BATU 2", lat: -6.961411, lng: 107.636499, type: "exit", region: "Bandung" },
  { name: "GT BUARAN INDAH 1", lat: -6.180760, lng: 106.653468, type: "entrance", region: "Jakarta" },
  { name: "GT BUARAN INDAH 1", lat: -6.180760, lng: 106.653468, type: "exit", region: "Jakarta" },
  { name: "GT BUARAN INDAH 2", lat: -6.181481, lng: 106.652646, type: "entrance", region: "Jakarta" },
  { name: "GT BUARAN INDAH 2", lat: -6.181481, lng: 106.652646, type: "exit", region: "Jakarta" },
  { name: "GT CAMBAYA", lat: -5.113217, lng: 119.426922, type: "entrance", region: "Unknown" },
  { name: "GT CAMBAYA", lat: -5.113217, lng: 119.426922, type: "exit", region: "Unknown" },
  { name: "GT CARINGIN", lat: -6.701226, lng: 106.824640, type: "entrance", region: "Bogor" },
  { name: "GT CARINGIN", lat: -6.701226, lng: 106.824640, type: "exit", region: "Bogor" },
  { name: "GT CARUBAN", lat: -7.519748, lng: 111.627955, type: "entrance", region: "Unknown" },
  { name: "GT CARUBAN", lat: -7.519748, lng: 111.627955, type: "exit", region: "Unknown" },
  { name: "GT CAKUNG 1", lat: -6.187145, lng: 106.938447, type: "entrance", region: "Jakarta" },
  { name: "GT CAKUNG 1", lat: -6.187145, lng: 106.938447, type: "exit", region: "Jakarta" },
  { name: "GT CAKUNG 2", lat: -6.178075, lng: 106.943265, type: "entrance", region: "Jakarta" },
  { name: "GT CAKUNG 2", lat: -6.178075, lng: 106.943265, type: "exit", region: "Jakarta" },
  { name: "GT CAWANG", lat: -6.243324, lng: 106.859805, type: "entrance", region: "Jakarta" },
  { name: "GT CAWANG", lat: -6.243324, lng: 106.859805, type: "exit", region: "Jakarta" },
  { name: "GT CBD 1", lat: -6.306306, lng: 106.642455, type: "entrance", region: "Tangerang" },
  { name: "GT CBD 1", lat: -6.306306, lng: 106.642455, type: "exit", region: "Tangerang" },
  { name: "GT CBD 2", lat: -6.307530, lng: 106.643854, type: "entrance", region: "Tangerang" },
  { name: "GT CBD 2", lat: -6.307530, lng: 106.643854, type: "exit", region: "Tangerang" },
  { name: "GT CBD 3", lat: -6.309662, lng: 106.641416, type: "entrance", region: "Tangerang" },
  { name: "GT CBD 3", lat: -6.309662, lng: 106.641416, type: "exit", region: "Tangerang" },
  { name: "GT CEMPAKA PUTIH", lat: -6.172230, lng: 106.877191, type: "entrance", region: "Jakarta" },
  { name: "GT CEMPAKA PUTIH", lat: -6.172230, lng: 106.877191, type: "exit", region: "Jakarta" },
  { name: "GT CENGKARENG", lat: -6.105803, lng: 106.696339, type: "entrance", region: "Jakarta" },
  { name: "GT CENGKARENG", lat: -6.105803, lng: 106.696339, type: "exit", region: "Jakarta" },
  { name: "GT CENGKARENG 2", lat: -6.105168, lng: 106.697739, type: "entrance", region: "Jakarta" },
  { name: "GT CENGKARENG 2", lat: -6.105168, lng: 106.697739, type: "exit", region: "Jakarta" },
  { name: "GT CIBADAK", lat: -6.862628, lng: 106.777447, type: "entrance", region: "Unknown" },
  { name: "GT CIBADAK", lat: -6.862628, lng: 106.777447, type: "exit", region: "Unknown" },
  { name: "GT CIBADAK 1", lat: -6.528532, lng: 106.765856, type: "entrance", region: "Bogor" },
  { name: "GT CIBADAK 1", lat: -6.528532, lng: 106.765856, type: "exit", region: "Bogor" },
  { name: "GT CIBADAK 2", lat: -6.528515, lng: 106.765490, type: "entrance", region: "Bogor" },
  { name: "GT CIBADAK 2", lat: -6.528515, lng: 106.765490, type: "exit", region: "Bogor" },
  { name: "GT CIBATU", lat: -6.332237, lng: 107.162241, type: "entrance", region: "Bekasi" },
  { name: "GT CIBATU", lat: -6.332237, lng: 107.162241, type: "exit", region: "Bekasi" },
  { name: "GT CIBITUNG", lat: -6.289222, lng: 107.081122, type: "entrance", region: "Bekasi" },
  { name: "GT CIBITUNG", lat: -6.289222, lng: 107.081122, type: "exit", region: "Bekasi" },
  { name: "GT CIBITUNG 1", lat: -6.287127, lng: 107.083479, type: "entrance", region: "Bekasi" },
  { name: "GT CIBITUNG 1", lat: -6.287127, lng: 107.083479, type: "exit", region: "Bekasi" },
  { name: "GT CIBITUNG 2", lat: -6.285883, lng: 107.085409, type: "entrance", region: "Bekasi" },
  { name: "GT CIBITUNG 2", lat: -6.285883, lng: 107.085409, type: "exit", region: "Bekasi" },
  { name: "GT CIBITUNG 3", lat: -6.283032, lng: 107.075214, type: "entrance", region: "Bekasi" },
  { name: "GT CIBITUNG 3", lat: -6.283032, lng: 107.075214, type: "exit", region: "Bekasi" },
  { name: "GT CIBITUNG 4", lat: -6.285496, lng: 107.081037, type: "entrance", region: "Bekasi" },
  { name: "GT CIBITUNG 4", lat: -6.285496, lng: 107.081037, type: "exit", region: "Bekasi" },
  { name: "GT CIBITUNG 5", lat: -6.287661, lng: 107.083032, type: "entrance", region: "Bekasi" },
  { name: "GT CIBITUNG 5", lat: -6.287661, lng: 107.083032, type: "exit", region: "Bekasi" },
  { name: "GT CIBITUNG 6", lat: -6.285913, lng: 107.084546, type: "entrance", region: "Bekasi" },
  { name: "GT CIBITUNG 6", lat: -6.285913, lng: 107.084546, type: "exit", region: "Bekasi" },
  { name: "GT CIBITUNG 7", lat: -6.286096, lng: 107.079579, type: "entrance", region: "Bekasi" },
  { name: "GT CIBITUNG 7", lat: -6.286096, lng: 107.079579, type: "exit", region: "Bekasi" },
  { name: "GT CIBITUNG 8", lat: -6.286272, lng: 107.080715, type: "entrance", region: "Bekasi" },
  { name: "GT CIBITUNG 8", lat: -6.286272, lng: 107.080715, type: "exit", region: "Bekasi" },
  { name: "GT CIBITUNG 9", lat: -6.288027, lng: 107.081736, type: "entrance", region: "Bekasi" },
  { name: "GT CIBITUNG 9", lat: -6.288027, lng: 107.081736, type: "exit", region: "Bekasi" },
  { name: "GT CIBUBUR 1", lat: -6.365806, lng: 106.895015, type: "entrance", region: "Jakarta" },
  { name: "GT CIBUBUR 1", lat: -6.365806, lng: 106.895015, type: "exit", region: "Jakarta" },
  { name: "GT CIBUBUR 2", lat: -6.365289, lng: 106.894234, type: "entrance", region: "Jakarta" },
  { name: "GT CIBUBUR 2", lat: -6.365289, lng: 106.894234, type: "exit", region: "Jakarta" },
  { name: "GT CIBUBUR 3", lat: -6.373200, lng: 106.896243, type: "entrance", region: "Jakarta" },
  { name: "GT CIBUBUR 3", lat: -6.373200, lng: 106.896243, type: "exit", region: "Jakarta" },
  { name: "GT CIKAMPEK", lat: -6.440027, lng: 107.476810, type: "entrance", region: "Karawang" },
  { name: "GT CIKAMPEK", lat: -6.440027, lng: 107.476810, type: "exit", region: "Karawang" },
  { name: "GT CIKAMUNING", lat: -6.818262, lng: 107.480769, type: "entrance", region: "Bandung" },
  { name: "GT CIKAMUNING", lat: -6.818262, lng: 107.480769, type: "exit", region: "Bandung" },
  { name: "GT CIKANDE", lat: -6.175274, lng: 106.343970, type: "entrance", region: "Serang" },
  { name: "GT CIKANDE", lat: -6.175274, lng: 106.343970, type: "exit", region: "Serang" },
  { name: "GT CIKARANG BARAT", lat: -6.311428, lng: 107.140019, type: "entrance", region: "Bekasi" },
  { name: "GT CIKARANG BARAT", lat: -6.311428, lng: 107.140019, type: "exit", region: "Bekasi" },
  { name: "GT CIKARANG BARAT 1", lat: -6.312766, lng: 107.137165, type: "entrance", region: "Bekasi" },
  { name: "GT CIKARANG BARAT 1", lat: -6.312766, lng: 107.137165, type: "exit", region: "Bekasi" },
  { name: "GT CIKARANG BARAT 2", lat: -6.311865, lng: 107.136806, type: "entrance", region: "Bekasi" },
  { name: "GT CIKARANG BARAT 2", lat: -6.311865, lng: 107.136806, type: "exit", region: "Bekasi" },
  { name: "GT CIKARANG BARAT 3", lat: -6.311960, lng: 107.136024, type: "entrance", region: "Bekasi" },
  { name: "GT CIKARANG BARAT 3", lat: -6.311960, lng: 107.136024, type: "exit", region: "Bekasi" },
  { name: "GT CIKARANG BARAT 5", lat: -6.313482, lng: 107.135820, type: "entrance", region: "Bekasi" },
  { name: "GT CIKARANG BARAT 5", lat: -6.313482, lng: 107.135820, type: "exit", region: "Bekasi" },
  { name: "GT CIKARANG TIMUR", lat: -6.341828, lng: 107.185570, type: "entrance", region: "Bekasi" },
  { name: "GT CIKARANG TIMUR", lat: -6.341828, lng: 107.185570, type: "exit", region: "Bekasi" },
  { name: "GT CIKARANG UTAMA", lat: -6.303180, lng: 107.120942, type: "entrance", region: "Bekasi" },
  { name: "GT CIKARANG UTAMA", lat: -6.303180, lng: 107.120942, type: "exit", region: "Bekasi" },
  { name: "GT CIKEDUNG", lat: -6.619119, lng: 108.015182, type: "entrance", region: "Subang" },
  { name: "GT CIKEDUNG", lat: -6.619119, lng: 108.015182, type: "exit", region: "Subang" },
  { name: "GT CIKEUSAL", lat: -6.214969, lng: 106.259247, type: "entrance", region: "Serang" },
  { name: "GT CIKEUSAL", lat: -6.214969, lng: 106.259247, type: "exit", region: "Serang" },
  { name: "GT CIKOPO", lat: -6.458229, lng: 107.509226, type: "entrance", region: "Karawang" },
  { name: "GT CIKOPO", lat: -6.458229, lng: 107.509226, type: "exit", region: "Karawang" },
  { name: "GT CIKULUR", lat: -6.418261, lng: 106.152632, type: "entrance", region: "Serang" },
  { name: "GT CIKULUR", lat: -6.418261, lng: 106.152632, type: "exit", region: "Serang" },
  { name: "GT CIKUNIR 1", lat: -6.253350, lng: 106.958061, type: "entrance", region: "Jakarta" },
  { name: "GT CIKUNIR 1", lat: -6.253350, lng: 106.958061, type: "exit", region: "Jakarta" },
  { name: "GT CIKUNIR 2", lat: -6.256793, lng: 106.960114, type: "entrance", region: "Jakarta" },
  { name: "GT CIKUNIR 2", lat: -6.256793, lng: 106.960114, type: "exit", region: "Jakarta" },
  { name: "GT CIKUNIR 3", lat: -6.256867, lng: 106.954725, type: "entrance", region: "Jakarta" },
  { name: "GT CIKUNIR 3", lat: -6.256867, lng: 106.954725, type: "exit", region: "Jakarta" },
  { name: "GT CIKUNIR 4", lat: -6.256418, lng: 106.954691, type: "entrance", region: "Jakarta" },
  { name: "GT CIKUNIR 4", lat: -6.256418, lng: 106.954691, type: "exit", region: "Jakarta" },
  { name: "GT CIKUNIR 8", lat: -6.257749, lng: 106.959034, type: "entrance", region: "Jakarta" },
  { name: "GT CIKUNIR 8", lat: -6.257749, lng: 106.959034, type: "exit", region: "Jakarta" },
  { name: "GT CILEDUg", lat: -6.888258, lng: 108.748972, type: "entrance", region: "Cirebon" },
  { name: "GT CILEDUg", lat: -6.888258, lng: 108.748972, type: "exit", region: "Cirebon" },
  { name: "GT CILEDUG 1", lat: -6.239119, lng: 106.758290, type: "entrance", region: "Jakarta" },
  { name: "GT CILEDUG 1", lat: -6.239119, lng: 106.758290, type: "exit", region: "Jakarta" },
  { name: "GT CILEDUG 2", lat: -6.233600, lng: 106.754847, type: "entrance", region: "Jakarta" },
  { name: "GT CILEDUG 2", lat: -6.233600, lng: 106.754847, type: "exit", region: "Jakarta" },
  { name: "GT CILEDUG 3", lat: -6.240361, lng: 106.758588, type: "entrance", region: "Jakarta" },
  { name: "GT CILEDUG 3", lat: -6.240361, lng: 106.758588, type: "exit", region: "Jakarta" },
  { name: "GT CILEDUG 4", lat: -6.232630, lng: 106.754171, type: "entrance", region: "Jakarta" },
  { name: "GT CILEDUG 4", lat: -6.232630, lng: 106.754171, type: "exit", region: "Jakarta" },
  { name: "GT CILEGON BARAT", lat: -5.983789, lng: 106.033417, type: "entrance", region: "Cilegon" },
  { name: "GT CILEGON BARAT", lat: -5.983789, lng: 106.033417, type: "exit", region: "Cilegon" },
  { name: "GT CILEGON BARAT 1", lat: -5.984455, lng: 106.033166, type: "entrance", region: "Cilegon" },
  { name: "GT CILEGON BARAT 1", lat: -5.984455, lng: 106.033166, type: "exit", region: "Cilegon" },
  { name: "GT CILEGON TIMUR", lat: -6.023254, lng: 106.089040, type: "entrance", region: "Cilegon" },
  { name: "GT CILEGON TIMUR", lat: -6.023254, lng: 106.089040, type: "exit", region: "Cilegon" },
  { name: "GT CILELES", lat: -6.473410, lng: 106.059691, type: "entrance", region: "Serang" },
  { name: "GT CILELES", lat: -6.473410, lng: 106.059691, type: "exit", region: "Serang" },
  { name: "GT CILEUNYI", lat: -6.944224, lng: 107.749472, type: "entrance", region: "Bandung" },
  { name: "GT CILEUNYI", lat: -6.944224, lng: 107.749472, type: "exit", region: "Bandung" },
  { name: "GT CILANDAK", lat: -6.298771, lng: 106.803878, type: "entrance", region: "Jakarta" },
  { name: "GT CILANDAK", lat: -6.298771, lng: 106.803878, type: "exit", region: "Jakarta" },
  { name: "GT CILANDAK UTAMA", lat: -6.299853, lng: 106.804018, type: "entrance", region: "Jakarta" },
  { name: "GT CILANDAK UTAMA", lat: -6.299853, lng: 106.804018, type: "exit", region: "Jakarta" },
  { name: "GT CILILITAN 2", lat: -6.266069, lng: 106.872722, type: "entrance", region: "Jakarta" },
  { name: "GT CILILITAN 2", lat: -6.266069, lng: 106.872722, type: "exit", region: "Jakarta" },
  { name: "GT CILILITAN 3", lat: -6.265507, lng: 106.873040, type: "entrance", region: "Jakarta" },
  { name: "GT CILILITAN 3", lat: -6.265507, lng: 106.873040, type: "exit", region: "Jakarta" },
  { name: "GT CILILITAN UTAMA", lat: -6.267075, lng: 106.872905, type: "entrance", region: "Jakarta" },
  { name: "GT CILILITAN UTAMA", lat: -6.267075, lng: 106.872905, type: "exit", region: "Jakarta" },
  { name: "GT CIMALAKA", lat: -6.801770, lng: 107.940421, type: "entrance", region: "Sumedang" },
  { name: "GT CIMALAKA", lat: -6.801770, lng: 107.940421, type: "exit", region: "Sumedang" },
  { name: "GT CIMANGGIS", lat: -6.421041, lng: 106.893659, type: "entrance", region: "Jakarta" },
  { name: "GT CIMANGGIS", lat: -6.421041, lng: 106.893659, type: "exit", region: "Jakarta" },
  { name: "GT CIMANGGIS 1", lat: -6.390653, lng: 106.895260, type: "entrance", region: "Jakarta" },
  { name: "GT CIMANGGIS 1", lat: -6.390653, lng: 106.895260, type: "exit", region: "Jakarta" },
  { name: "GT CIMANGGIS 2", lat: -6.382810, lng: 106.895695, type: "entrance", region: "Jakarta" },
  { name: "GT CIMANGGIS 2", lat: -6.382810, lng: 106.895695, type: "exit", region: "Jakarta" },
  { name: "GT CIMANGGIS 3", lat: -6.386769, lng: 106.896584, type: "entrance", region: "Jakarta" },
  { name: "GT CIMANGGIS 3", lat: -6.386769, lng: 106.896584, type: "exit", region: "Jakarta" },
  { name: "GT CIMANGGIS 4", lat: -6.385150, lng: 106.895552, type: "entrance", region: "Jakarta" },
  { name: "GT CIMANGGIS 4", lat: -6.385150, lng: 106.895552, type: "exit", region: "Jakarta" },
  { name: "GT CIMANGGIS 5", lat: -6.387726, lng: 106.898139, type: "entrance", region: "Jakarta" },
  { name: "GT CIMANGGIS 5", lat: -6.387726, lng: 106.898139, type: "exit", region: "Jakarta" },
  { name: "GT CIMANGGIS OFF RAMP", lat: -6.421117, lng: 106.893741, type: "entrance", region: "Jakarta" },
  { name: "GT CIMANGGIS OFF RAMP", lat: -6.421117, lng: 106.893741, type: "exit", region: "Jakarta" },
  { name: "GT CIMANGGIS ON RAMP", lat: -6.421041, lng: 106.893659, type: "entrance", region: "Jakarta" },
  { name: "GT CIMANGGIS ON RAMP", lat: -6.421041, lng: 106.893659, type: "exit", region: "Jakarta" },
  { name: "GT CIMANGGIS UTAMA", lat: -6.421117, lng: 106.893741, type: "entrance", region: "Jakarta" },
  { name: "GT CIMANGGIS UTAMA", lat: -6.421117, lng: 106.893741, type: "exit", region: "Jakarta" },
  { name: "GT CIPERNA BARAT", lat: -6.760238, lng: 108.529301, type: "entrance", region: "Cirebon" },
  { name: "GT CIPERNA BARAT", lat: -6.760238, lng: 108.529301, type: "exit", region: "Cirebon" },
  { name: "GT CIPERNA TIMUR", lat: -6.766618, lng: 108.527497, type: "entrance", region: "Cirebon" },
  { name: "GT CIPERNA TIMUR", lat: -6.766618, lng: 108.527497, type: "exit", region: "Cirebon" },
  { name: "GT CIPUTAT 1", lat: -6.284014, lng: 106.774571, type: "entrance", region: "Jakarta" },
  { name: "GT CIPUTAT 1", lat: -6.284014, lng: 106.774571, type: "exit", region: "Jakarta" },
  { name: "GT CIPUTAT 2", lat: -6.284272, lng: 106.774742, type: "entrance", region: "Jakarta" },
  { name: "GT CIPUTAT 2", lat: -6.284272, lng: 106.774742, type: "exit", region: "Jakarta" },
  { name: "GT CIUJUNG", lat: -6.141363, lng: 106.286489, type: "entrance", region: "Serang" },
  { name: "GT CIUJUNG", lat: -6.141363, lng: 106.286489, type: "exit", region: "Serang" },
  { name: "GT CIUJUNG ON RAMP", lat: -6.141022, lng: 106.287655, type: "entrance", region: "Serang" },
  { name: "GT CIUJUNG ON RAMP", lat: -6.141022, lng: 106.287655, type: "exit", region: "Serang" },
  { name: "GT CIKUPA", lat: -6.205479, lng: 106.523699, type: "entrance", region: "Tangerang" },
  { name: "GT CIKUPA", lat: -6.205479, lng: 106.523699, type: "exit", region: "Tangerang" },
  { name: "GT CIKUPA 2", lat: -6.205093, lng: 106.520807, type: "entrance", region: "Tangerang" },
  { name: "GT CIKUPA 2", lat: -6.205093, lng: 106.520807, type: "exit", region: "Tangerang" },
  { name: "GT CIKUPA 3", lat: -6.205720, lng: 106.520902, type: "entrance", region: "Tangerang" },
  { name: "GT CIKUPA 3", lat: -6.205720, lng: 106.520902, type: "exit", region: "Tangerang" },
  { name: "GT CIKEAS", lat: -6.383538, lng: 106.945552, type: "entrance", region: "Jakarta" },
  { name: "GT CIKEAS", lat: -6.383538, lng: 106.945552, type: "exit", region: "Jakarta" },
  { name: "GT CISALAK 1", lat: -6.381953, lng: 106.872851, type: "entrance", region: "Jakarta" },
  { name: "GT CISALAK 1", lat: -6.381953, lng: 106.872851, type: "exit", region: "Jakarta" },
  { name: "GT CISALAK 2", lat: -6.382195, lng: 106.871570, type: "entrance", region: "Jakarta" },
  { name: "GT CISALAK 2", lat: -6.382195, lng: 106.871570, type: "exit", region: "Jakarta" },
  { name: "GT CISALAK 3", lat: -6.380675, lng: 106.864530, type: "entrance", region: "Jakarta" },
  { name: "GT CISALAK 3", lat: -6.380675, lng: 106.864530, type: "exit", region: "Jakarta" },
  { name: "GT CISALAK 4", lat: -6.381007, lng: 106.861991, type: "entrance", region: "Jakarta" },
  { name: "GT CISALAK 4", lat: -6.381007, lng: 106.861991, type: "exit", region: "Jakarta" },
  { name: "GT CITEUREUP 1", lat: -6.482461, lng: 106.874452, type: "entrance", region: "Bogor" },
  { name: "GT CITEUREUP 1", lat: -6.482461, lng: 106.874452, type: "exit", region: "Bogor" },
  { name: "GT CITEUREUP 2", lat: -6.483423, lng: 106.873153, type: "entrance", region: "Bogor" },
  { name: "GT CITEUREUP 2", lat: -6.483423, lng: 106.873153, type: "exit", region: "Bogor" },
  { name: "GT CITEUREUP 3", lat: -6.486759, lng: 106.872361, type: "entrance", region: "Bogor" },
  { name: "GT CITEUREUP 3", lat: -6.486759, lng: 106.872361, type: "exit", region: "Bogor" },
  { name: "GT CITEUREUP 4", lat: -6.486091, lng: 106.871878, type: "entrance", region: "Bogor" },
  { name: "GT CITEUREUP 4", lat: -6.486091, lng: 106.871878, type: "exit", region: "Bogor" },
  { name: "GT COLOMADU", lat: -7.534929, lng: 110.711172, type: "entrance", region: "Surakarta" },
  { name: "GT COLOMADU", lat: -7.534929, lng: 110.711172, type: "exit", region: "Surakarta" },
  { name: "GT DAWUAN", lat: -6.691248, lng: 108.112936, type: "entrance", region: "Cirebon" },
  { name: "GT DAWUAN", lat: -6.691248, lng: 108.112936, type: "exit", region: "Cirebon" },
  { name: "GT DRIYOREJO 1", lat: -7.353322, lng: 112.634330, type: "entrance", region: "Gresik" },
  { name: "GT DRIYOREJO 1", lat: -7.353322, lng: 112.634330, type: "exit", region: "Gresik" },
  { name: "GT DRIYOREJO 2", lat: -7.353842, lng: 112.634652, type: "entrance", region: "Gresik" },
  { name: "GT DRIYOREJO 2", lat: -7.353842, lng: 112.634652, type: "exit", region: "Gresik" },
  { name: "GT DRIYOREJO 3 RAMP 302", lat: -7.354857, lng: 112.625368, type: "entrance", region: "Gresik" },
  { name: "GT DRIYOREJO 3 RAMP 302", lat: -7.354857, lng: 112.625368, type: "exit", region: "Gresik" },
  { name: "GT DRIYOREJO 4 RAMP 302", lat: -7.355462, lng: 112.625283, type: "entrance", region: "Gresik" },
  { name: "GT DRIYOREJO 4 RAMP 302", lat: -7.355462, lng: 112.625283, type: "exit", region: "Gresik" },
  { name: "GT DUKUH 1", lat: -6.301691, lng: 106.883554, type: "entrance", region: "Jakarta" },
  { name: "GT DUKUH 1", lat: -6.301691, lng: 106.883554, type: "exit", region: "Jakarta" },
  { name: "GT DUKUH 2", lat: -6.303403, lng: 106.883272, type: "entrance", region: "Jakarta" },
  { name: "GT DUKUH 2", lat: -6.303403, lng: 106.883272, type: "exit", region: "Jakarta" },
  { name: "GT DUKUH 3", lat: -6.299842, lng: 106.883171, type: "entrance", region: "Jakarta" },
  { name: "GT DUKUH 3", lat: -6.299842, lng: 106.883171, type: "exit", region: "Jakarta" },
  { name: "GT DUMAI", lat: 1.576519, lng: 101.395470, type: "entrance", region: "Unknown" },
  { name: "GT DUMAI", lat: 1.576519, lng: 101.395470, type: "exit", region: "Unknown" },
  { name: "GT DUPAK 1", lat: -7.241280, lng: 112.712770, type: "entrance", region: "Surabaya" },
  { name: "GT DUPAK 1", lat: -7.241280, lng: 112.712770, type: "exit", region: "Surabaya" },
  { name: "GT DUPAK 2", lat: -7.241605, lng: 112.711942, type: "entrance", region: "Surabaya" },
  { name: "GT DUPAK 2", lat: -7.241605, lng: 112.711942, type: "exit", region: "Surabaya" },
  { name: "GT DUPAK 3", lat: -7.246621, lng: 112.709704, type: "entrance", region: "Surabaya" },
  { name: "GT DUPAK 3", lat: -7.246621, lng: 112.709704, type: "exit", region: "Surabaya" },
  { name: "GT DUPAK 4", lat: -7.242728, lng: 112.711686, type: "entrance", region: "Surabaya" },
  { name: "GT DUPAK 4", lat: -7.242728, lng: 112.711686, type: "exit", region: "Surabaya" },
  { name: "GT DUPAK 5", lat: -7.242936, lng: 112.712349, type: "entrance", region: "Surabaya" },
  { name: "GT DUPAK 5", lat: -7.242936, lng: 112.712349, type: "exit", region: "Surabaya" },
  { name: "GT ENTRANCE BELAHANREJO", lat: -7.329206, lng: 112.533648, type: "entrance", region: "Gresik" },
  { name: "GT ENTRANCE BELAHANREJO", lat: -7.329206, lng: 112.533648, type: "exit", region: "Gresik" },
  { name: "GT ENTRANCE BUNDER", lat: -7.171743, lng: 112.595530, type: "entrance", region: "Gresik" },
  { name: "GT ENTRANCE BUNDER", lat: -7.171743, lng: 112.595530, type: "exit", region: "Gresik" },
  { name: "GT ENTRANCE CERME", lat: -7.216776, lng: 112.575164, type: "entrance", region: "Gresik" },
  { name: "GT ENTRANCE CERME", lat: -7.216776, lng: 112.575164, type: "exit", region: "Gresik" },
  { name: "GT EXIT BELAHANREJO", lat: -7.329804, lng: 112.534248, type: "entrance", region: "Gresik" },
  { name: "GT EXIT BELAHANREJO", lat: -7.329804, lng: 112.534248, type: "exit", region: "Gresik" },
  { name: "GT EXIT BUNDER", lat: -7.171807, lng: 112.594972, type: "entrance", region: "Gresik" },
  { name: "GT EXIT BUNDER", lat: -7.171807, lng: 112.594972, type: "exit", region: "Gresik" },
  { name: "GT EXIT CERME", lat: -7.216609, lng: 112.574344, type: "entrance", region: "Gresik" },
  { name: "GT EXIT CERME", lat: -7.216609, lng: 112.574344, type: "exit", region: "Gresik" },
  { name: "GT FATMAWATI 1", lat: -6.292116, lng: 106.797977, type: "entrance", region: "Jakarta" },
  { name: "GT FATMAWATI 1", lat: -6.292116, lng: 106.797977, type: "exit", region: "Jakarta" },
  { name: "GT FATMAWATI 2", lat: -6.292390, lng: 106.791484, type: "entrance", region: "Jakarta" },
  { name: "GT FATMAWATI 2", lat: -6.292390, lng: 106.791484, type: "exit", region: "Jakarta" },
  { name: "GT GAMPING", lat: -7.799333, lng: 110.306945, type: "entrance", region: "Sleman" },
  { name: "GT GAMPING", lat: -7.799333, lng: 110.306945, type: "exit", region: "Sleman" },
  { name: "GT GANDUS", lat: -3.008108, lng: 104.668857, type: "entrance", region: "Unknown" },
  { name: "GT GANDUS", lat: -3.008108, lng: 104.668857, type: "exit", region: "Unknown" },
  { name: "GT GAYAMSARI", lat: -6.999111, lng: 110.450946, type: "entrance", region: "Semarang" },
  { name: "GT GAYAMSARI", lat: -6.999111, lng: 110.450946, type: "exit", region: "Semarang" },
  { name: "GT GEDONG 1", lat: -6.308075, lng: 106.868907, type: "entrance", region: "Jakarta" },
  { name: "GT GEDONG 1", lat: -6.308075, lng: 106.868907, type: "exit", region: "Jakarta" },
  { name: "GT GEDONG 2", lat: -6.305663, lng: 106.861876, type: "entrance", region: "Jakarta" },
  { name: "GT GEDONG 2", lat: -6.305663, lng: 106.861876, type: "exit", region: "Jakarta" },
  { name: "GT GEDONG PANJANG 1", lat: -6.131901, lng: 106.804322, type: "entrance", region: "Jakarta" },
  { name: "GT GEDONG PANJANG 1", lat: -6.131901, lng: 106.804322, type: "exit", region: "Jakarta" },
  { name: "GT GEDONG PANJANG 2", lat: -6.130935, lng: 106.807139, type: "entrance", region: "Jakarta" },
  { name: "GT GEDONG PANJANG 2", lat: -6.130935, lng: 106.807139, type: "exit", region: "Jakarta" },
  { name: "GT GEMPOL 1", lat: -7.557772, lng: 112.714106, type: "entrance", region: "Pasuruan" },
  { name: "GT GEMPOL 1", lat: -7.557772, lng: 112.714106, type: "exit", region: "Pasuruan" },
  { name: "GT GEMPOL 2", lat: -7.567291, lng: 112.715670, type: "entrance", region: "Pasuruan" },
  { name: "GT GEMPOL 2", lat: -7.567291, lng: 112.715670, type: "exit", region: "Pasuruan" },
  { name: "GT GEMPOL 3", lat: -7.567441, lng: 112.716152, type: "entrance", region: "Pasuruan" },
  { name: "GT GEMPOL 3", lat: -7.567441, lng: 112.716152, type: "exit", region: "Pasuruan" },
  { name: "GT GEMPOL 4", lat: -7.557369, lng: 112.714407, type: "entrance", region: "Pasuruan" },
  { name: "GT GEMPOL 4", lat: -7.557369, lng: 112.714407, type: "exit", region: "Pasuruan" },
  { name: "GT GENDING", lat: -7.813397, lng: 113.306756, type: "entrance", region: "Probolinggo" },
  { name: "GT GENDING", lat: -7.813397, lng: 113.306756, type: "exit", region: "Probolinggo" },
  { name: "GT GONDANGREJO", lat: -7.522433, lng: 110.819243, type: "entrance", region: "Karanganyar" },
  { name: "GT GONDANGREJO", lat: -7.522433, lng: 110.819243, type: "exit", region: "Karanganyar" },
  { name: "GT GRATI", lat: -7.712050, lng: 112.996021, type: "entrance", region: "Pasuruan" },
  { name: "GT GRATI", lat: -7.712050, lng: 112.996021, type: "exit", region: "Pasuruan" },
  { name: "GT GUNUNG BATIN", lat: -4.645670, lng: 105.197722, type: "entrance", region: "Unknown" },
  { name: "GT GUNUNG BATIN", lat: -4.645670, lng: 105.197722, type: "exit", region: "Unknown" },
  { name: "GT GUNUNG PUTRI OFF RAMP", lat: -6.461449, lng: 106.889174, type: "entrance", region: "Bogor" },
  { name: "GT GUNUNG PUTRI OFF RAMP", lat: -6.461449, lng: 106.889174, type: "exit", region: "Bogor" },
  { name: "GT GUNUNG PUTRI ON RAMP", lat: -6.461260, lng: 106.889341, type: "entrance", region: "Bogor" },
  { name: "GT GUNUNG PUTRI ON RAMP", lat: -6.461260, lng: 106.889341, type: "exit", region: "Bogor" },
  { name: "GT GUNUNG SARI 1", lat: -7.307669, lng: 112.708564, type: "entrance", region: "Surabaya" },
  { name: "GT GUNUNG SARI 1", lat: -7.307669, lng: 112.708564, type: "exit", region: "Surabaya" },
  { name: "GT GUNUNG SARI 2", lat: -7.309802, lng: 112.707966, type: "entrance", region: "Surabaya" },
  { name: "GT GUNUNG SARI 2", lat: -7.309802, lng: 112.707966, type: "exit", region: "Surabaya" },
  { name: "GT GUNUNG SARI 3", lat: -7.308291, lng: 112.708066, type: "entrance", region: "Surabaya" },
  { name: "GT GUNUNG SARI 3", lat: -7.308291, lng: 112.708066, type: "exit", region: "Surabaya" },
  { name: "GT GUNUNG SARI 4", lat: -7.308446, lng: 112.708767, type: "entrance", region: "Surabaya" },
  { name: "GT GUNUNG SARI 4", lat: -7.308446, lng: 112.708767, type: "exit", region: "Surabaya" },
  { name: "GT HALIM 1", lat: -6.249071, lng: 106.888954, type: "entrance", region: "Jakarta" },
  { name: "GT HALIM 1", lat: -6.249071, lng: 106.888954, type: "exit", region: "Jakarta" },
  { name: "GT HALIM 2", lat: -6.249071, lng: 106.888954, type: "entrance", region: "Jakarta" },
  { name: "GT HALIM 2", lat: -6.249071, lng: 106.888954, type: "exit", region: "Jakarta" },
  { name: "GT HALIM 3", lat: -6.249071, lng: 106.888954, type: "entrance", region: "Jakarta" },
  { name: "GT HALIM 3", lat: -6.249071, lng: 106.888954, type: "exit", region: "Jakarta" },
  { name: "GT HALIM UTAMA", lat: -6.249071, lng: 106.888954, type: "entrance", region: "Jakarta" },
  { name: "GT HALIM UTAMA", lat: -6.249071, lng: 106.888954, type: "exit", region: "Jakarta" },
  { name: "GT INDRALAYA", lat: -3.173378, lng: 104.676955, type: "entrance", region: "Unknown" },
  { name: "GT INDRALAYA", lat: -3.173378, lng: 104.676955, type: "exit", region: "Unknown" },
  { name: "GT JAGORAW", lat: -6.997222, lng: 110.564167, type: "entrance", region: "Semarang" },
  { name: "GT JAGORAW", lat: -6.997222, lng: 110.564167, type: "exit", region: "Semarang" },
  { name: "GT JAKARTA", lat: -6.237781, lng: 106.847717, type: "entrance", region: "Jakarta" },
  { name: "GT JAKARTA", lat: -6.237781, lng: 106.847717, type: "exit", region: "Jakarta" },
  { name: "GT JALAN BARU", lat: -5.135870, lng: 119.441839, type: "entrance", region: "Unknown" },
  { name: "GT JALAN BARU", lat: -5.135870, lng: 119.441839, type: "exit", region: "Unknown" },
  { name: "GT JALAN BARU ON RAMP", lat: -5.135870, lng: 119.441839, type: "entrance", region: "Unknown" },
  { name: "GT JALAN BARU ON RAMP", lat: -5.135870, lng: 119.441839, type: "exit", region: "Unknown" },
  { name: "GT JAMBANGAN", lat: -7.324033, lng: 112.717468, type: "entrance", region: "Surabaya" },
  { name: "GT JAMBANGAN", lat: -7.324033, lng: 112.717468, type: "exit", region: "Surabaya" },
  { name: "GT JATIASIH", lat: -6.307968, lng: 106.952539, type: "entrance", region: "Bekasi" },
  { name: "GT JATIASIH", lat: -6.307968, lng: 106.952539, type: "exit", region: "Bekasi" },
  { name: "GT JATIASIH 1", lat: -6.307968, lng: 106.952539, type: "entrance", region: "Bekasi" },
  { name: "GT JATIASIH 1", lat: -6.307968, lng: 106.952539, type: "exit", region: "Bekasi" },
  { name: "GT JATIASIH 2", lat: -6.307968, lng: 106.952539, type: "entrance", region: "Bekasi" },
  { name: "GT JATIASIH 2", lat: -6.307968, lng: 106.952539, type: "exit", region: "Bekasi" },
  { name: "GT JATIBENING 1", lat: -6.256900, lng: 106.941704, type: "entrance", region: "Jakarta" },
  { name: "GT JATIBENING 1", lat: -6.256900, lng: 106.941704, type: "exit", region: "Jakarta" },
  { name: "GT JATIBENING 2", lat: -6.256900, lng: 106.941704, type: "entrance", region: "Jakarta" },
  { name: "GT JATIBENING 2", lat: -6.256900, lng: 106.941704, type: "exit", region: "Jakarta" },
  { name: "GT JATILUHUR", lat: -6.551389, lng: 107.404444, type: "entrance", region: "Purwakarta" },
  { name: "GT JATILUHUR", lat: -6.551389, lng: 107.404444, type: "exit", region: "Purwakarta" },
  { name: "GT JATIMULYA", lat: -6.301575, lng: 106.941763, type: "entrance", region: "Bekasi" },
  { name: "GT JATIMULYA", lat: -6.301575, lng: 106.941763, type: "exit", region: "Bekasi" },
  { name: "GT JATINEGARA", lat: -6.221474, lng: 106.865345, type: "entrance", region: "Jakarta" },
  { name: "GT JATINEGARA", lat: -6.221474, lng: 106.865345, type: "exit", region: "Jakarta" },
  { name: "GT JATINEGARA 1", lat: -6.221474, lng: 106.865345, type: "entrance", region: "Jakarta" },
  { name: "GT JATINEGARA 1", lat: -6.221474, lng: 106.865345, type: "exit", region: "Jakarta" },
  { name: "GT JATINEGARA 2", lat: -6.221474, lng: 106.865345, type: "entrance", region: "Jakarta" },
  { name: "GT JATINEGARA 2", lat: -6.221474, lng: 106.865345, type: "exit", region: "Jakarta" },
  { name: "GT JATISAMPURNA", lat: -6.335245, lng: 106.913003, type: "entrance", region: "Bekasi" },
  { name: "GT JATISAMPURNA", lat: -6.335245, lng: 106.913003, type: "exit", region: "Bekasi" },
  { name: "GT JATIWARNA", lat: -6.297766, lng: 106.932734, type: "entrance", region: "Bekasi" },
  { name: "GT JATIWARNA", lat: -6.297766, lng: 106.932734, type: "exit", region: "Bekasi" },
  { name: "GT JATIWARNA 1", lat: -6.297766, lng: 106.932734, type: "entrance", region: "Bekasi" },
  { name: "GT JATIWARNA 1", lat: -6.297766, lng: 106.932734, type: "exit", region: "Bekasi" },
  { name: "GT JEMBATAN TIGA", lat: -6.132672, lng: 106.833058, type: "entrance", region: "Jakarta" },
  { name: "GT JEMBATAN TIGA", lat: -6.132672, lng: 106.833058, type: "exit", region: "Jakarta" },
  { name: "GT JEMBATAN TIGA 1", lat: -6.132672, lng: 106.833058, type: "entrance", region: "Jakarta" },
  { name: "GT JEMBATAN TIGA 1", lat: -6.132672, lng: 106.833058, type: "exit", region: "Jakarta" },
  { name: "GT JEMBATAN TIGA 2", lat: -6.132672, lng: 106.833058, type: "entrance", region: "Jakarta" },
  { name: "GT JEMBATAN TIGA 2", lat: -6.132672, lng: 106.833058, type: "exit", region: "Jakarta" },
  { name: "GT JORR", lat: -6.273044, lng: 106.748606, type: "entrance", region: "Jakarta" },
  { name: "GT JORR", lat: -6.273044, lng: 106.748606, type: "exit", region: "Jakarta" },
  { name: "GT KALIDERES 1", lat: -6.115839, lng: 106.709896, type: "entrance", region: "Jakarta" },
  { name: "GT KALIDERES 1", lat: -6.115839, lng: 106.709896, type: "exit", region: "Jakarta" },
  { name: "GT KALIDERES 2", lat: -6.115839, lng: 106.709896, type: "entrance", region: "Jakarta" },
  { name: "GT KALIDERES 2", lat: -6.115839, lng: 106.709896, type: "exit", region: "Jakarta" },
  { name: "GT KALIMALANG", lat: -6.249071, lng: 106.888954, type: "entrance", region: "Jakarta" },
  { name: "GT KALIMALANG", lat: -6.249071, lng: 106.888954, type: "exit", region: "Jakarta" },
  { name: "GT KALIMALANG 2", lat: -6.249071, lng: 106.888954, type: "entrance", region: "Jakarta" },
  { name: "GT KALIMALANG 2", lat: -6.249071, lng: 106.888954, type: "exit", region: "Jakarta" },
  { name: "GT KALIWUNGU", lat: -6.946111, lng: 110.279167, type: "entrance", region: "Kendal" },
  { name: "GT KALIWUNGU", lat: -6.946111, lng: 110.279167, type: "exit", region: "Kendal" },
  { name: "GT KANDANGAN", lat: -7.119167, lng: 110.615833, type: "entrance", region: "Semarang" },
  { name: "GT KANDANGAN", lat: -7.119167, lng: 110.615833, type: "exit", region: "Semarang" },
  { name: "GT KAPAL", lat: -6.249071, lng: 106.888954, type: "entrance", region: "Jakarta" },
  { name: "GT KAPAL", lat: -6.249071, lng: 106.888954, type: "exit", region: "Jakarta" },
  { name: "GT KARANG TENGAH", lat: -6.190278, lng: 106.732222, type: "entrance", region: "Tangerang" },
  { name: "GT KARANG TENGAH", lat: -6.190278, lng: 106.732222, type: "exit", region: "Tangerang" },
  { name: "GT KARANGANOM", lat: -7.627778, lng: 110.937222, type: "entrance", region: "Klaten" },
  { name: "GT KARANGANOM", lat: -7.627778, lng: 110.937222, type: "exit", region: "Klaten" },
  { name: "GT KARANGANYAR", lat: -7.571944, lng: 110.847222, type: "entrance", region: "Karanganyar" },
  { name: "GT KARANGANYAR", lat: -7.571944, lng: 110.847222, type: "exit", region: "Karanganyar" },
  { name: "GT KARANGLO", lat: -7.362500, lng: 112.683333, type: "entrance", region: "Surabaya" },
  { name: "GT KARANGLO", lat: -7.362500, lng: 112.683333, type: "exit", region: "Surabaya" },
  { name: "GT KARAWANG BARAT", lat: -6.292222, lng: 107.262222, type: "entrance", region: "Karawang" },
  { name: "GT KARAWANG BARAT", lat: -6.292222, lng: 107.262222, type: "exit", region: "Karawang" },
  { name: "GT KARAWANG TIMUR", lat: -6.374167, lng: 107.326389, type: "entrance", region: "Karawang" },
  { name: "GT KARAWANG TIMUR", lat: -6.374167, lng: 107.326389, type: "exit", region: "Karawang" },
  { name: "GT KARTASURA", lat: -7.555833, lng: 110.741667, type: "entrance", region: "Sukoharjo" },
  { name: "GT KARTASURA", lat: -7.555833, lng: 110.741667, type: "exit", region: "Sukoharjo" },
  { name: "GT KAYU AGUNG", lat: -3.399167, lng: 104.843056, type: "entrance", region: "Unknown" },
  { name: "GT KAYU AGUNG", lat: -3.399167, lng: 104.843056, type: "exit", region: "Unknown" },
  { name: "GT KEBON BAWANG", lat: -6.115278, lng: 106.862222, type: "entrance", region: "Jakarta" },
  { name: "GT KEBON BAWANG", lat: -6.115278, lng: 106.862222, type: "exit", region: "Jakarta" },
  { name: "GT KEBON JERUK 1", lat: -6.193056, lng: 106.766667, type: "entrance", region: "Jakarta" },
  { name: "GT KEBON JERUK 1", lat: -6.193056, lng: 106.766667, type: "exit", region: "Jakarta" },
  { name: "GT KEBON JERUK 2", lat: -6.193056, lng: 106.766667, type: "entrance", region: "Jakarta" },
  { name: "GT KEBON JERUK 2", lat: -6.193056, lng: 106.766667, type: "exit", region: "Jakarta" },
  { name: "GT KEBUN TEH", lat: -6.249071, lng: 106.888954, type: "entrance", region: "Jakarta" },
  { name: "GT KEBUN TEH", lat: -6.249071, lng: 106.888954, type: "exit", region: "Jakarta" },
  { name: "GT KEMBANGAN 1", lat: -6.190278, lng: 106.732222, type: "entrance", region: "Jakarta" },
  { name: "GT KEMBANGAN 1", lat: -6.190278, lng: 106.732222, type: "exit", region: "Jakarta" },
  { name: "GT KEMBANGAN 2", lat: -6.190278, lng: 106.732222, type: "entrance", region: "Jakarta" },
  { name: "GT KEMBANGAN 2", lat: -6.190278, lng: 106.732222, type: "exit", region: "Jakarta" },
  { name: "GT KENDAL", lat: -6.922222, lng: 110.200000, type: "entrance", region: "Kendal" },
  { name: "GT KENDAL", lat: -6.922222, lng: 110.200000, type: "exit", region: "Kendal" },
  { name: "GT KETAPANG", lat: -8.135833, lng: 114.351667, type: "entrance", region: "Banyuwangi" },
  { name: "GT KETAPANG", lat: -8.135833, lng: 114.351667, type: "exit", region: "Banyuwangi" },
  { name: "GT KEBON JERUK", lat: -6.193056, lng: 106.766667, type: "entrance", region: "Jakarta" },
  { name: "GT KEBON JERUK", lat: -6.193056, lng: 106.766667, type: "exit", region: "Jakarta" },
  { name: "GT KLATEN", lat: -7.680556, lng: 110.637222, type: "entrance", region: "Klaten" },
  { name: "GT KLATEN", lat: -7.680556, lng: 110.637222, type: "exit", region: "Klaten" },
  { name: "GT KLATEN 2", lat: -7.680556, lng: 110.637222, type: "entrance", region: "Klaten" },
  { name: "GT KLATEN 2", lat: -7.680556, lng: 110.637222, type: "exit", region: "Klaten" },
  { name: "GT KOTABARU", lat: -3.297222, lng: 104.768611, type: "entrance", region: "Unknown" },
  { name: "GT KOTABARU", lat: -3.297222, lng: 104.768611, type: "exit", region: "Unknown" },
  { name: "GT KRAGILAN", lat: -6.101667, lng: 106.333333, type: "entrance", region: "Serang" },
  { name: "GT KRAGILAN", lat: -6.101667, lng: 106.333333, type: "exit", region: "Serang" },
  { name: "GT KRAMASAN", lat: -7.819444, lng: 113.080556, type: "entrance", region: "Probolinggo" },
  { name: "GT KRAMASAN", lat: -7.819444, lng: 113.080556, type: "exit", region: "Probolinggo" },
  { name: "GT KREMBANGAN BARAT", lat: -7.233333, lng: 112.716667, type: "entrance", region: "Surabaya" },
  { name: "GT KREMBANGAN BARAT", lat: -7.233333, lng: 112.716667, type: "exit", region: "Surabaya" },
  { name: "GT KREMBANGAN TIMUR", lat: -7.233333, lng: 112.716667, type: "entrance", region: "Surabaya" },
  { name: "GT KREMBANGAN TIMUR", lat: -7.233333, lng: 112.716667, type: "exit", region: "Surabaya" },
  { name: "GT KREMBUNG", lat: -7.366667, lng: 112.633333, type: "entrance", region: "Sidoarjo" },
  { name: "GT KREMBUNG", lat: -7.366667, lng: 112.633333, type: "exit", region: "Sidoarjo" },
  { name: "GT KRIAN", lat: -7.400000, lng: 112.583333, type: "entrance", region: "Sidoarjo" },
  { name: "GT KRIAN", lat: -7.400000, lng: 112.583333, type: "exit", region: "Sidoarjo" },
  { name: "GT KUTABUMI", lat: -6.183333, lng: 106.566667, type: "entrance", region: "Tangerang" },
  { name: "GT KUTABUMI", lat: -6.183333, lng: 106.566667, type: "exit", region: "Tangerang" },
  { name: "GT KUTABUMI 2", lat: -6.183333, lng: 106.566667, type: "entrance", region: "Tangerang" },
  { name: "GT KUTABUMI 2", lat: -6.183333, lng: 106.566667, type: "exit", region: "Tangerang" },
  { name: "GT LAMPUNG TENGAH", lat: -4.916667, lng: 105.266667, type: "entrance", region: "Unknown" },
  { name: "GT LAMPUNG TENGAH", lat: -4.916667, lng: 105.266667, type: "exit", region: "Unknown" },
  { name: "GT LAMPUNG UTARA", lat: -4.833333, lng: 105.316667, type: "entrance", region: "Unknown" },
  { name: "GT LAMPUNG UTARA", lat: -4.833333, lng: 105.316667, type: "exit", region: "Unknown" },
  { name: "GT LEGOK", lat: -6.316667, lng: 106.666667, type: "entrance", region: "Tangerang" },
  { name: "GT LEGOK", lat: -6.316667, lng: 106.666667, type: "exit", region: "Tangerang" },
  { name: "GT LENTENG AGUNG", lat: -6.316667, lng: 106.833333, type: "entrance", region: "Jakarta" },
  { name: "GT LENTENG AGUNG", lat: -6.316667, lng: 106.833333, type: "exit", region: "Jakarta" },
  { name: "GT LENTENG AGUNG 1", lat: -6.316667, lng: 106.833333, type: "entrance", region: "Jakarta" },
  { name: "GT LENTENG AGUNG 1", lat: -6.316667, lng: 106.833333, type: "exit", region: "Jakarta" },
  { name: "GT LEUWIGAJAH", lat: -6.933333, lng: 107.566667, type: "entrance", region: "Bandung" },
  { name: "GT LEUWIGAJAH", lat: -6.933333, lng: 107.566667, type: "exit", region: "Bandung" },
  { name: "GT LOSARANG", lat: -6.683333, lng: 108.316667, type: "entrance", region: "Indramayu" },
  { name: "GT LOSARANG", lat: -6.683333, lng: 108.316667, type: "exit", region: "Indramayu" },
  { name: "GT MAJALENGKA", lat: -6.833333, lng: 108.200000, type: "entrance", region: "Majalengka" },
  { name: "GT MAJALENGKA", lat: -6.833333, lng: 108.200000, type: "exit", region: "Majalengka" },
  { name: "GT MAKASSAR", lat: -5.133333, lng: 119.416667, type: "entrance", region: "Makassar" },
  { name: "GT MAKASSAR", lat: -5.133333, lng: 119.416667, type: "exit", region: "Makassar" },
  { name: "GT MANYAR", lat: -7.316667, lng: 112.666667, type: "entrance", region: "Gresik" },
  { name: "GT MANYAR", lat: -7.316667, lng: 112.666667, type: "exit", region: "Gresik" },
  { name: "GT MARGA MULYA", lat: -6.316667, lng: 106.966667, type: "entrance", region: "Bekasi" },
  { name: "GT MARGA MULYA", lat: -6.316667, lng: 106.966667, type: "exit", region: "Bekasi" },
  { name: "GT MARGAJAYA", lat: -6.316667, lng: 106.966667, type: "entrance", region: "Bekasi" },
  { name: "GT MARGAJAYA", lat: -6.316667, lng: 106.966667, type: "exit", region: "Bekasi" },
  { name: "GT MARGONDA", lat: -6.366667, lng: 106.833333, type: "entrance", region: "Depok" },
  { name: "GT MARGONDA", lat: -6.366667, lng: 106.833333, type: "exit", region: "Depok" },
  { name: "GT MARUNDA", lat: -6.116667, lng: 106.916667, type: "entrance", region: "Jakarta" },
  { name: "GT MARUNDA", lat: -6.116667, lng: 106.916667, type: "exit", region: "Jakarta" },
  { name: "GT MERAK", lat: -5.933333, lng: 106.000000, type: "entrance", region: "Cilegon" },
  { name: "GT MERAK", lat: -5.933333, lng: 106.000000, type: "exit", region: "Cilegon" },
  { name: "GT MUKTIHARJO", lat: -6.966667, lng: 110.466667, type: "entrance", region: "Semarang" },
  { name: "GT MUKTIHARJO", lat: -6.966667, lng: 110.466667, type: "exit", region: "Semarang" },
  { name: "GT NGANJUK", lat: -7.600000, lng: 111.900000, type: "entrance", region: "Nganjuk" },
  { name: "GT NGANJUK", lat: -7.600000, lng: 111.900000, type: "exit", region: "Nganjuk" },
  { name: "GT NGEMPLAK", lat: -7.533333, lng: 110.783333, type: "entrance", region: "Sukoharjo" },
  { name: "GT NGEMPLAK", lat: -7.533333, lng: 110.783333, type: "exit", region: "Sukoharjo" },
  { name: "GT NGONGOS", lat: -7.316667, lng: 112.683333, type: "entrance", region: "Sidoarjo" },
  { name: "GT NGONGOS", lat: -7.316667, lng: 112.683333, type: "exit", region: "Sidoarjo" },
  { name: "GT PADALEUNYI", lat: -6.933333, lng: 107.633333, type: "entrance", region: "Bandung" },
  { name: "GT PADALEUNYI", lat: -6.933333, lng: 107.633333, type: "exit", region: "Bandung" },
  { name: "GT PALIMANAN", lat: -6.700000, lng: 108.416667, type: "entrance", region: "Cirebon" },
  { name: "GT PALIMANAN", lat: -6.700000, lng: 108.416667, type: "exit", region: "Cirebon" },
  { name: "GT PALUR", lat: -7.566667, lng: 110.833333, type: "entrance", region: "Karanganyar" },
  { name: "GT PALUR", lat: -7.566667, lng: 110.833333, type: "exit", region: "Karanganyar" },
  { name: "GT PANCORAN", lat: -6.250000, lng: 106.833333, type: "entrance", region: "Jakarta" },
  { name: "GT PANCORAN", lat: -6.250000, lng: 106.833333, type: "exit", region: "Jakarta" },
  { name: "GT PANDEGLANG", lat: -6.316667, lng: 106.100000, type: "entrance", region: "Pandeglang" },
  { name: "GT PANDEGLANG", lat: -6.316667, lng: 106.100000, type: "exit", region: "Pandeglang" },
  { name: "GT PANGKALAN", lat: -6.316667, lng: 107.316667, type: "entrance", region: "Karawang" },
  { name: "GT PANGKALAN", lat: -6.316667, lng: 107.316667, type: "exit", region: "Karawang" },
  { name: "GT PASIR MUKO", lat: -6.933333, lng: 107.733333, type: "entrance", region: "Bandung" },
  { name: "GT PASIR MUKO", lat: -6.933333, lng: 107.733333, type: "exit", region: "Bandung" },
  { name: "GT PASTEUR", lat: -6.900000, lng: 107.600000, type: "entrance", region: "Bandung" },
  { name: "GT PASTEUR", lat: -6.900000, lng: 107.600000, type: "exit", region: "Bandung" },
  { name: "GT PASURUAN", lat: -7.666667, lng: 112.900000, type: "entrance", region: "Pasuruan" },
  { name: "GT PASURUAN", lat: -7.666667, lng: 112.900000, type: "exit", region: "Pasuruan" },
  { name: "GT PEKALONGAN", lat: -6.883333, lng: 109.666667, type: "entrance", region: "Pekalongan" },
  { name: "GT PEKALONGAN", lat: -6.883333, lng: 109.666667, type: "exit", region: "Pekalongan" },
  { name: "GT PEMALANG", lat: -6.883333, lng: 109.383333, type: "entrance", region: "Pemalang" },
  { name: "GT PEMALANG", lat: -6.883333, lng: 109.383333, type: "exit", region: "Pemalang" },
  { name: "GT PONDOK GEDE", lat: -6.283333, lng: 106.933333, type: "entrance", region: "Bekasi" },
  { name: "GT PONDOK GEDE", lat: -6.283333, lng: 106.933333, type: "exit", region: "Bekasi" },
  { name: "GT PONDOK GEDE BARAT", lat: -6.283333, lng: 106.933333, type: "entrance", region: "Bekasi" },
  { name: "GT PONDOK GEDE BARAT", lat: -6.283333, lng: 106.933333, type: "exit", region: "Bekasi" },
  { name: "GT PONDOK GEDE TIMUR", lat: -6.283333, lng: 106.933333, type: "entrance", region: "Bekasi" },
  { name: "GT PONDOK GEDE TIMUR", lat: -6.283333, lng: 106.933333, type: "exit", region: "Bekasi" },
  { name: "GT PONDOK PINANG", lat: -6.283333, lng: 106.783333, type: "entrance", region: "Jakarta" },
  { name: "GT PONDOK PINANG", lat: -6.283333, lng: 106.783333, type: "exit", region: "Jakarta" },
  { name: "GT PONDOK PINANG 1", lat: -6.283333, lng: 106.783333, type: "entrance", region: "Jakarta" },
  { name: "GT PONDOK PINANG 1", lat: -6.283333, lng: 106.783333, type: "exit", region: "Jakarta" },
  { name: "GT PONDOK PINANG 2", lat: -6.283333, lng: 106.783333, type: "entrance", region: "Jakarta" },
  { name: "GT PONDOK PINANG 2", lat: -6.283333, lng: 106.783333, type: "exit", region: "Jakarta" },
  { name: "GT PONDOK RANJI", lat: -6.266667, lng: 106.733333, type: "entrance", region: "Tangerang" },
  { name: "GT PONDOK RANJI", lat: -6.266667, lng: 106.733333, type: "exit", region: "Tangerang" },
  { name: "GT PORONG", lat: -7.533333, lng: 112.683333, type: "entrance", region: "Sidoarjo" },
  { name: "GT PORONG", lat: -7.533333, lng: 112.683333, type: "exit", region: "Sidoarjo" },
  { name: "GT PRABUMULIH", lat: -3.416667, lng: 104.233333, type: "entrance", region: "Unknown" },
  { name: "GT PRABUMULIH", lat: -3.416667, lng: 104.233333, type: "exit", region: "Unknown" },
  { name: "GT PROBOLINGGO BARAT", lat: -7.783333, lng: 113.183333, type: "entrance", region: "Probolinggo" },
  { name: "GT PROBOLINGGO BARAT", lat: -7.783333, lng: 113.183333, type: "exit", region: "Probolinggo" },
  { name: "GT PROBOLINGGO TIMUR", lat: -7.783333, lng: 113.216667, type: "entrance", region: "Probolinggo" },
  { name: "GT PROBOLINGGO TIMUR", lat: -7.783333, lng: 113.216667, type: "exit", region: "Probolinggo" },
  { name: "GT PULOGADUNG", lat: -6.183333, lng: 106.916667, type: "entrance", region: "Jakarta" },
  { name: "GT PULOGADUNG", lat: -6.183333, lng: 106.916667, type: "exit", region: "Jakarta" },
  { name: "GT PULOGADUNG 1", lat: -6.183333, lng: 106.916667, type: "entrance", region: "Jakarta" },
  { name: "GT PULOGADUNG 1", lat: -6.183333, lng: 106.916667, type: "exit", region: "Jakarta" },
  { name: "GT PULOGADUNG 2", lat: -6.183333, lng: 106.916667, type: "entrance", region: "Jakarta" },
  { name: "GT PULOGADUNG 2", lat: -6.183333, lng: 106.916667, type: "exit", region: "Jakarta" },
  { name: "GT PURWAKARTA", lat: -6.533333, lng: 107.433333, type: "entrance", region: "Purwakarta" },
  { name: "GT PURWAKARTA", lat: -6.533333, lng: 107.433333, type: "exit", region: "Purwakarta" },
  { name: "GT PURWODADI", lat: -6.766667, lng: 108.916667, type: "entrance", region: "Subang" },
  { name: "GT PURWODADI", lat: -6.766667, lng: 108.916667, type: "exit", region: "Subang" },
  { name: "GT RANGKASBITUNG", lat: -6.366667, lng: 106.250000, type: "entrance", region: "Lebak" },
  { name: "GT RANGKASBITUNG", lat: -6.366667, lng: 106.250000, type: "exit", region: "Lebak" },
  { name: "GT RAWAMANGUN", lat: -6.200000, lng: 106.883333, type: "entrance", region: "Jakarta" },
  { name: "GT RAWAMANGUN", lat: -6.200000, lng: 106.883333, type: "exit", region: "Jakarta" },
  { name: "GT RENGASDENGKLOK", lat: -6.166667, lng: 107.283333, type: "entrance", region: "Karawang" },
  { name: "GT RENGASDENGKLOK", lat: -6.166667, lng: 107.283333, type: "exit", region: "Karawang" },
  { name: "GT SADANG", lat: -6.483333, lng: 107.466667, type: "entrance", region: "Purwakarta" },
  { name: "GT SADANG", lat: -6.483333, lng: 107.466667, type: "exit", region: "Purwakarta" },
  { name: "GT SALATIGA", lat: -7.333333, lng: 110.500000, type: "entrance", region: "Salatiga" },
  { name: "GT SALATIGA", lat: -7.333333, lng: 110.500000, type: "exit", region: "Salatiga" },
  { name: "GT SAWAHAN", lat: -7.250000, lng: 112.733333, type: "entrance", region: "Surabaya" },
  { name: "GT SAWAHAN", lat: -7.250000, lng: 112.733333, type: "exit", region: "Surabaya" },
  { name: "GT SEMARANG", lat: -6.966667, lng: 110.416667, type: "entrance", region: "Semarang" },
  { name: "GT SEMARANG", lat: -6.966667, lng: 110.416667, type: "exit", region: "Semarang" },
  { name: "GT SEMARANG ABC", lat: -6.983333, lng: 110.416667, type: "entrance", region: "Semarang" },
  { name: "GT SEMARANG ABC", lat: -6.983333, lng: 110.416667, type: "exit", region: "Semarang" },
  { name: "GT SENTUL", lat: -6.566667, lng: 106.850000, type: "entrance", region: "Bogor" },
  { name: "GT SENTUL", lat: -6.566667, lng: 106.850000, type: "exit", region: "Bogor" },
  { name: "GT SENTUL SELATAN", lat: -6.566667, lng: 106.850000, type: "entrance", region: "Bogor" },
  { name: "GT SENTUL SELATAN", lat: -6.566667, lng: 106.850000, type: "exit", region: "Bogor" },
  { name: "GT SERANG BARAT", lat: -6.083333, lng: 106.150000, type: "entrance", region: "Serang" },
  { name: "GT SERANG BARAT", lat: -6.083333, lng: 106.150000, type: "exit", region: "Serang" },
  { name: "GT SERANG TIMUR", lat: -6.116667, lng: 106.183333, type: "entrance", region: "Serang" },
  { name: "GT SERANG TIMUR", lat: -6.116667, lng: 106.183333, type: "exit", region: "Serang" },
  { name: "GT SERPONG 1", lat: -6.283333, lng: 106.666667, type: "entrance", region: "Tangerang" },
  { name: "GT SERPONG 1", lat: -6.283333, lng: 106.666667, type: "exit", region: "Tangerang" },
  { name: "GT SERPONG 2", lat: -6.283333, lng: 106.666667, type: "entrance", region: "Tangerang" },
  { name: "GT SERPONG 2", lat: -6.283333, lng: 106.666667, type: "exit", region: "Tangerang" },
  { name: "GT SIDAREJA", lat: -7.466667, lng: 108.783333, type: "entrance", region: "Cilacap" },
  { name: "GT SIDAREJA", lat: -7.466667, lng: 108.783333, type: "exit", region: "Cilacap" },
  { name: "GT SIDOARJO", lat: -7.433333, lng: 112.716667, type: "entrance", region: "Sidoarjo" },
  { name: "GT SIDOARJO", lat: -7.433333, lng: 112.716667, type: "exit", region: "Sidoarjo" },
  { name: "GT SIDOARJO 2", lat: -7.433333, lng: 112.716667, type: "entrance", region: "Sidoarjo" },
  { name: "GT SIDOARJO 2", lat: -7.433333, lng: 112.716667, type: "exit", region: "Sidoarjo" },
  { name: "GT SIMPANG SUSUN", lat: -7.316667, lng: 112.666667, type: "entrance", region: "Sidoarjo" },
  { name: "GT SIMPANG SUSUN", lat: -7.316667, lng: 112.666667, type: "exit", region: "Sidoarjo" },
  { name: "GT SLIPI 1", lat: -6.200000, lng: 106.800000, type: "entrance", region: "Jakarta" },
  { name: "GT SLIPI 1", lat: -6.200000, lng: 106.800000, type: "exit", region: "Jakarta" },
  { name: "GT SLIPI 2", lat: -6.200000, lng: 106.800000, type: "entrance", region: "Jakarta" },
  { name: "GT SLIPI 2", lat: -6.200000, lng: 106.800000, type: "exit", region: "Jakarta" },
  { name: "GT SONGGOM", lat: -6.866667, lng: 109.116667, type: "entrance", region: "Brebes" },
  { name: "GT SONGGOM", lat: -6.866667, lng: 109.116667, type: "exit", region: "Brebes" },
  { name: "GT SRAGEN", lat: -7.416667, lng: 111.016667, type: "entrance", region: "Sragen" },
  { name: "GT SRAGEN", lat: -7.416667, lng: 111.016667, type: "exit", region: "Sragen" },
  { name: "GT SUBANG", lat: -6.566667, lng: 107.766667, type: "entrance", region: "Subang" },
  { name: "GT SUBANG", lat: -6.566667, lng: 107.766667, type: "exit", region: "Subang" },
  { name: "GT SUMBER JAYA", lat: -6.766667, lng: 108.483333, type: "entrance", region: "Cirebon" },
  { name: "GT SUMBER JAYA", lat: -6.766667, lng: 108.483333, type: "exit", region: "Cirebon" },
  { name: "GT SUMEDANG", lat: -6.833333, lng: 107.916667, type: "entrance", region: "Sumedang" },
  { name: "GT SUMEDANG", lat: -6.833333, lng: 107.916667, type: "exit", region: "Sumedang" },
  { name: "GT SUMO", lat: -7.783333, lng: 110.350000, type: "entrance", region: "Sleman" },
  { name: "GT SUMO", lat: -7.783333, lng: 110.350000, type: "exit", region: "Sleman" },
  { name: "GT SUNGAI LILIN", lat: -2.883333, lng: 104.650000, type: "entrance", region: "Unknown" },
  { name: "GT SUNGAI LILIN", lat: -2.883333, lng: 104.650000, type: "exit", region: "Unknown" },
  { name: "GT SUNTER", lat: -6.133333, lng: 106.866667, type: "entrance", region: "Jakarta" },
  { name: "GT SUNTER", lat: -6.133333, lng: 106.866667, type: "exit", region: "Jakarta" },
  { name: "GT SURABAYA", lat: -7.316667, lng: 112.716667, type: "entrance", region: "Surabaya" },
  { name: "GT SURABAYA", lat: -7.316667, lng: 112.716667, type: "exit", region: "Surabaya" },
  { name: "GT TALANG JAWA", lat: -4.666667, lng: 105.250000, type: "entrance", region: "Unknown" },
  { name: "GT TALANG JAWA", lat: -4.666667, lng: 105.250000, type: "exit", region: "Unknown" },
  { name: "GT TAMAN MINI 1", lat: -6.300000, lng: 106.883333, type: "entrance", region: "Jakarta" },
  { name: "GT TAMAN MINI 1", lat: -6.300000, lng: 106.883333, type: "exit", region: "Jakarta" },
  { name: "GT TAMAN MINI 2", lat: -6.300000, lng: 106.883333, type: "entrance", region: "Jakarta" },
  { name: "GT TAMAN MINI 2", lat: -6.300000, lng: 106.883333, type: "exit", region: "Jakarta" },
  { name: "GT TANAH KUSIR", lat: -6.250000, lng: 106.783333, type: "entrance", region: "Jakarta" },
  { name: "GT TANAH KUSIR", lat: -6.250000, lng: 106.783333, type: "exit", region: "Jakarta" },
  { name: "GT TANAH KUSIR 1", lat: -6.250000, lng: 106.783333, type: "entrance", region: "Jakarta" },
  { name: "GT TANAH KUSIR 1", lat: -6.250000, lng: 106.783333, type: "exit", region: "Jakarta" },
  { name: "GT TANAH KUSIR 2", lat: -6.250000, lng: 106.783333, type: "entrance", region: "Jakarta" },
  { name: "GT TANAH KUSIR 2", lat: -6.250000, lng: 106.783333, type: "exit", region: "Jakarta" },
  { name: "GT TANGKIL", lat: -6.133333, lng: 106.316667, type: "entrance", region: "Serang" },
  { name: "GT TANGKIL", lat: -6.133333, lng: 106.316667, type: "exit", region: "Serang" },
  { name: "GT TANJUNG PRIOK", lat: -6.116667, lng: 106.883333, type: "entrance", region: "Jakarta" },
  { name: "GT TANJUNG PRIOK", lat: -6.116667, lng: 106.883333, type: "exit", region: "Jakarta" },
  { name: "GT TANJUNG PURA", lat: 3.533333, lng: 98.683333, type: "entrance", region: "Unknown" },
  { name: "GT TANJUNG PURA", lat: 3.533333, lng: 98.683333, type: "exit", region: "Unknown" },
  { name: "GT TEBING TINGGI", lat: 3.316667, lng: 99.166667, type: "entrance", region: "Unknown" },
  { name: "GT TEBING TINGGI", lat: 3.316667, lng: 99.166667, type: "exit", region: "Unknown" },
  { name: "GT TEGAL", lat: -6.866667, lng: 109.133333, type: "entrance", region: "Tegal" },
  { name: "GT TEGAL", lat: -6.866667, lng: 109.133333, type: "exit", region: "Tegal" },
  { name: "GT TEGAL MAS", lat: -5.133333, lng: 119.400000, type: "entrance", region: "Makassar" },
  { name: "GT TEGAL MAS", lat: -5.133333, lng: 119.400000, type: "exit", region: "Makassar" },
  { name: "GT TELUK NAGA", lat: -6.083333, lng: 106.666667, type: "entrance", region: "Tangerang" },
  { name: "GT TELUK NAGA", lat: -6.083333, lng: 106.666667, type: "exit", region: "Tangerang" },
  { name: "GT TEMPELSARI", lat: -7.316667, lng: 110.316667, type: "entrance", region: "Sleman" },
  { name: "GT TEMPELSARI", lat: -7.316667, lng: 110.316667, type: "exit", region: "Sleman" },
  { name: "GT TERBANGGI BESAR", lat: -4.866667, lng: 105.183333, type: "entrance", region: "Unknown" },
  { name: "GT TERBANGGI BESAR", lat: -4.866667, lng: 105.183333, type: "exit", region: "Unknown" },
  { name: "GT TJ PRIUK 1", lat: -6.116667, lng: 106.883333, type: "entrance", region: "Jakarta" },
  { name: "GT TJ PRIUK 1", lat: -6.116667, lng: 106.883333, type: "exit", region: "Jakarta" },
  { name: "GT TJ PRIUK 2", lat: -6.116667, lng: 106.883333, type: "entrance", region: "Jakarta" },
  { name: "GT TJ PRIUK 2", lat: -6.116667, lng: 106.883333, type: "exit", region: "Jakarta" },
  { name: "GT TJ PRIUK 3", lat: -6.116667, lng: 106.883333, type: "entrance", region: "Jakarta" },
  { name: "GT TJ PRIUK 3", lat: -6.116667, lng: 106.883333, type: "exit", region: "Jakarta" },
  { name: "GT TJ PRIUK 4", lat: -6.116667, lng: 106.883333, type: "entrance", region: "Jakarta" },
  { name: "GT TJ PRIUK 4", lat: -6.116667, lng: 106.883333, type: "exit", region: "Jakarta" },
  { name: "GT TOMANG", lat: -6.183333, lng: 106.783333, type: "entrance", region: "Jakarta" },
  { name: "GT TOMANG", lat: -6.183333, lng: 106.783333, type: "exit", region: "Jakarta" },
  { name: "GT TOMANG 1", lat: -6.183333, lng: 106.783333, type: "entrance", region: "Jakarta" },
  { name: "GT TOMANG 1", lat: -6.183333, lng: 106.783333, type: "exit", region: "Jakarta" },
  { name: "GT TOMANG 2", lat: -6.183333, lng: 106.783333, type: "entrance", region: "Jakarta" },
  { name: "GT TOMANG 2", lat: -6.183333, lng: 106.783333, type: "exit", region: "Jakarta" },
  { name: "GT TONGAS", lat: -7.800000, lng: 113.233333, type: "entrance", region: "Probolinggo" },
  { name: "GT TONGAS", lat: -7.800000, lng: 113.233333, type: "exit", region: "Probolinggo" },
  { name: "GT TROWULAN", lat: -7.566667, lng: 112.383333, type: "entrance", region: "Mojokerto" },
  { name: "GT TROWULAN", lat: -7.566667, lng: 112.383333, type: "exit", region: "Mojokerto" },
  { name: "GT TULANGAN", lat: -7.483333, lng: 112.666667, type: "entrance", region: "Sidoarjo" },
  { name: "GT TULANGAN", lat: -7.483333, lng: 112.666667, type: "exit", region: "Sidoarjo" },
  { name: "GT TUNJUNGAN", lat: -6.133333, lng: 106.816667, type: "entrance", region: "Jakarta" },
  { name: "GT TUNJUNGAN", lat: -6.133333, lng: 106.816667, type: "exit", region: "Jakarta" },
  { name: "GT UJUNG PANDANG", lat: -5.133333, lng: 119.416667, type: "entrance", region: "Makassar" },
  { name: "GT UJUNG PANDANG", lat: -5.133333, lng: 119.416667, type: "exit", region: "Makassar" },
  { name: "GT ULUJAMI", lat: -6.266667, lng: 106.766667, type: "entrance", region: "Jakarta" },
  { name: "GT ULUJAMI", lat: -6.266667, lng: 106.766667, type: "exit", region: "Jakarta" },
  { name: "GT ULUPANGI", lat: -5.083333, lng: 119.466667, type: "entrance", region: "Makassar" },
  { name: "GT ULUPANGI", lat: -5.083333, lng: 119.466667, type: "exit", region: "Makassar" },
  { name: "GT UNGARAN", lat: -7.133333, lng: 110.416667, type: "entrance", region: "Semarang" },
  { name: "GT UNGARAN", lat: -7.133333, lng: 110.416667, type: "exit", region: "Semarang" },
  { name: "GT VETERAN", lat: -6.233333, lng: 106.816667, type: "entrance", region: "Jakarta" },
  { name: "GT VETERAN", lat: -6.233333, lng: 106.816667, type: "exit", region: "Jakarta" },
  { name: "GT WANGON", lat: -7.516667, lng: 109.066667, type: "entrance", region: "Banyumas" },
  { name: "GT WANGON", lat: -7.516667, lng: 109.066667, type: "exit", region: "Banyumas" },
  { name: "GT WARU", lat: -7.350000, lng: 112.716667, type: "entrance", region: "Sidoarjo" },
  { name: "GT WARU", lat: -7.350000, lng: 112.716667, type: "exit", region: "Sidoarjo" },
  { name: "GT WARU 1", lat: -7.350000, lng: 112.716667, type: "entrance", region: "Sidoarjo" },
  { name: "GT WARU 1", lat: -7.350000, lng: 112.716667, type: "exit", region: "Sidoarjo" },
  { name: "GT WARU 2", lat: -7.350000, lng: 112.716667, type: "entrance", region: "Sidoarjo" },
  { name: "GT WARU 2", lat: -7.350000, lng: 112.716667, type: "exit", region: "Sidoarjo" },
  { name: "GT WERU", lat: -6.700000, lng: 108.500000, type: "entrance", region: "Cirebon" },
  { name: "GT WERU", lat: -6.700000, lng: 108.500000, type: "exit", region: "Cirebon" },
  { name: "GT WONOKROMO", lat: -7.300000, lng: 112.733333, type: "entrance", region: "Surabaya" },
  { name: "GT WONOKROMO", lat: -7.300000, lng: 112.733333, type: "exit", region: "Surabaya" }
];

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