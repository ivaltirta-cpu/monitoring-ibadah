<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Studio AI Kreator Pro - Ready for Hosting</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; }
        .glass { background: white; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .loader { border: 3px solid #f3f3f3; border-top: 3px solid #4f46e5; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body class="p-4 md:p-8 min-h-screen">
    <div class="max-w-3xl mx-auto">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">STUDIO AI <span class="text-indigo-600">PRO</span></h1>
            <p class="text-slate-500 mt-2 text-sm">Produksi konten otomatis dengan teknologi Gemini AI.</p>
        </div>

        <!-- MAIN GENERATOR SECTION -->
        <div class="glass p-8 rounded-3xl">
            <div class="flex items-center justify-between mb-4">
                <label class="block text-sm font-bold text-slate-700">Topik Video (Shorts/Reels/TikTok)</label>
                <span class="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md uppercase tracking-wider">Status: API Connected</span>
            </div>
            <textarea id="topicInput" rows="3" placeholder="Contoh: 3 Tips produktivitas untuk mahasiswa..." 
                class="w-full p-4 rounded-2xl border border-slate-200 outline-none focus:border-indigo-500 transition mb-6 bg-slate-50/50 resize-none font-medium"></textarea>
            
            <button id="execBtn" onclick="runAI()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-100">
                <span id="btnText">Buat Naskah & Visual ✨</span>
                <div id="loader" class="hidden loader"></div>
            </button>
        </div>

        <!-- RESULT SECTION -->
        <div id="resultArea" class="hidden mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <!-- Script Output -->
            <div class="glass rounded-3xl overflow-hidden">
                <div class="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Naskah Video Konten</span>
                    <button onclick="copyToClipboard('scriptOut')" class="text-[10px] font-bold text-indigo-600 uppercase hover:underline">Salin</button>
                </div>
                <div class="p-6">
                    <div id="scriptOut" class="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed font-medium"></div>
                </div>
            </div>

            <!-- Visual Prompt Output -->
            <div class="glass rounded-3xl overflow-hidden border-indigo-100 bg-indigo-50/10">
                <div class="px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                    <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Prompt Visual (Inggris)</span>
                    <button onclick="copyToClipboard('promptOut')" class="text-[10px] font-bold text-indigo-600 uppercase hover:underline">Salin</button>
                </div>
                <div class="p-6">
                    <div id="promptOut" class="text-indigo-900 italic text-sm font-mono"></div>
                </div>
            </div>
            
            <p class="text-center text-[10px] text-slate-400 py-4 italic">Gunakan prompt visual di atas pada Leonardo.ai atau Midjourney.</p>
        </div>
    </div>

    <script>
        /** * KONFIGURASI API KEY
         * Masukkan API Key Anda di antara tanda kutip di bawah ini.
         */
        const INTERNAL_API_KEY = "AIzaSyDG3bEth2mNJjuiqhjlBcwZFv7B1drNhr0";

        async function runAI() {
            const topic = document.getElementById('topicInput').value.trim();
            
            if (!INTERNAL_API_KEY || INTERNAL_API_KEY === "MASUKKAN_API_KEY_ANDA_DI_SINI") {
                return alert("Mohon masukkan API Key ke dalam kode (baris 86) sebelum digunakan.");
            }
            
            if (!topic) return alert("Masukkan topik konten!");

            const btn = document.getElementById('execBtn');
            const loader = document.getElementById('loader');
            const resultArea = document.getElementById('resultArea');
            const btnText = document.getElementById('btnText');

            btn.disabled = true;
            btnText.innerText = "Sedang Memproses...";
            loader.classList.remove('hidden');

            const model = "gemini-2.5-flash-preview-09-2025";
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${INTERNAL_API_KEY}`;
            
            const systemPrompt = `Anda adalah Content Creator Viral. Buatlah naskah video pendek viral untuk topik yang diberikan. 
            Struktur naskah: Hook, Isi Utama, Call to Action. Gunakan Bahasa Indonesia.
            Setelah naskah, tambahkan pemisah '###' dan berikan satu prompt gambar AI sinematik dalam Bahasa Inggris.`;

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `Topik: ${topic}\n\n${systemPrompt}` }] }]
                    })
                });

                if (!response.ok) {
                    const errorJson = await response.json();
                    throw new Error(errorJson.error?.message || "Terjadi kesalahan pada API.");
                }

                const data = await response.json();
                const fullText = data.candidates[0].content.parts[0].text;
                
                let script = fullText;
                let prompt = "Cinematic high-quality, professional photography style related to " + topic;

                if (fullText.includes('###')) {
                    const parts = fullText.split('###');
                    script = parts[0].trim();
                    prompt = parts[1].trim();
                }

                document.getElementById('scriptOut').innerText = script;
                document.getElementById('promptOut').innerText = prompt;
                resultArea.classList.remove('hidden');
                
                resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

            } catch (err) {
                alert("Kesalahan: " + err.message);
            } finally {
                btn.disabled = false;
                btnText.innerText = "Buat Naskah & Visual ✨";
                loader.classList.add('hidden');
            }
        }

        function copyToClipboard(id) {
            const text = document.getElementById(id).innerText;
            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            
            const btn = event.target;
            const original = btn.innerText;
            btn.innerText = "TERSALIN!";
            setTimeout(() => { btn.innerText = original; }, 2000);
        }
    </script>
</body>
</html>
