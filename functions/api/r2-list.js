// functions/api/r2-list.js  ← ဒီ code ကို အဟောင်းနဲ့ အစားထိုးတင်လိုက်ရုံ!!!

// *** Helper function: ဖိုင်အရွယ်အစားကို Bytes မှ KB/MB/GB သို့ ပြောင်းလဲပေးသည် ***
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export async function onRequestGet(context) {
    const { env } = context;

    if (!env.UPLOAD_BUCKET) {
        return new Response("<h3>UPLOAD_BUCKET မတွေ့ပါ</h3>", {
            status: 500,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
    }

    try {
        const listing = await env.UPLOAD_BUCKET.list();
        const sortedObjects = listing.objects.sort((a, b) =>
            new Date(b.uploaded) - new Date(a.uploaded)
        );

        let html = `
<!DOCTYPE html>
<html lang="my">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KP Cloud Drive</title>
    <style>
        :root { --bg:#0a0a1a; --card:#151528; --text:#e0e0ff; --accent:#00ff9d; --red:#ff4757; }
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Pyidaungsu',sans-serif; background:var(--bg); color:var(--text); min-height:100vh; padding:15px; }
        .container { max-width:1000px; margin:auto; }
        header { background:linear-gradient(135deg,#00ff9d,#00cc7a); color:#000; padding:20px; text-align:center; font-size:2em; font-weight:bold; border-radius:20px; margin-bottom:25px; box-shadow:0 10px 30px rgba(0,255,157,0.4); }
        .passbox { background:var(--card); padding:20px; border-radius:20px; text-align:center; margin-bottom:25px; border:2px solid #333; box-shadow:0 0 30px rgba(0,255,157,0.2); }
        .passbox input { width:70%; padding:15px; background:#222; border:none; border-radius:50px; color:white; font-size:1.2em; text-align:center; }
        h3 { color:var(--accent); font-size:1.6em; margin-bottom:15px; text-align:center; text-shadow:0 0 15px var(--accent); }
        .files { display:grid; gap:18px; }
        .file { background:var(--card); border:2px solid var(--accent); border-radius:20px; padding:18px; transition:0.4s; box-shadow:0 8px 25px rgba(0,255,157,0.15); }
        .file:hover { transform:translateY(-8px); box-shadow:0 15px 40px rgba(0,255,157,0.4); }
        .fname { font-size:1.3em; color:var(--accent); word-break:break-all; margin-bottom:8px; font-weight:bold; }
        .fname a { color:var(--accent); text-decoration:none; }
        .fname a:hover { text-decoration:underline; }
        .meta { font-size:0.95em; color:#aaa; margin-bottom:12px; }
        .actions { display:flex; gap:12px; flex-wrap:wrap; justify-content:center; }
        .btn { padding:10px 20px; border:none; border-radius:50px; font-weight:bold; cursor:pointer; transition:0.3s; flex:1; min-width:120px; }
        .dl { background:#0066ff; color:white; }
        .dl:hover { background:#0052cc; transform:scale(1.05); }
        .del { background:var(--red); color:white; }
        .del:hover { background:#cc0000; transform:scale(1.05); }
        .empty { text-align:center; padding:50px; color:#666; font-size:1.3em; }
        footer { text-align:center; padding:20px; color:#666; margin-top:40px; font-size:0.9em; }
        @media(max-width:600px){
            .actions{flex-direction:column;}
            .btn{min-width:100%;}
            .passbox input{width:90%;}
        }
    </style>
</head>
<body>
    <div class="container">
        <header>KP Cloud Drive</header>

        <div class="passbox">
            <input type="password" id="pass" placeholder="Admin Passcode ထည့်ပါ (Delete လုပ်ချင်ရင်)">
        </div>

        <h3>ဖိုင်စာရင်း (${sortedObjects.length} ခု) — အသစ်ဆုံး အပေါ်ဆုံး</h3>

        <div class="files">
            ${sortedObjects.length === 0 ? `
                <div class="empty">ဖိုင်တစ်ခုမှ မရှိသေးပါ ကိုဂျီ</div>
            ` : sortedObjects.map(obj => {
                const url = `/api/r2-download/${obj.key}`;
                // *** ပြင်ဆင်လိုက်သော ဖိုင် Size တွက်ချက်ပုံ ***
                const size = formatBytes(obj.size); 
                
                const date = new Date(obj.uploaded).toLocaleString('my-MM');
                return `
                <div class="file">
                    <div class="fname"><a href="${url}" target="_blank">${obj.key}</a></div>
                    <div class="meta">Size: ${size} • ${date}</div>
                    <div class="actions">
                        <a href="${url}" target="_blank" class="btn dl">Download</a>
                        <button class="btn del" onclick="del('${obj.key}')">Delete</button>
                    </div>
                </div>`;
            }).join('')}
        </div>

        <footer>© 2025 kponly.ggff.net • လူတိုင်းမြင်ရ • ငါတစ်ယောက်ပဲ ဖျက်ရ</footer>
    </div>

    <script>
        const PASS_KEY = "r2AdminPass2025";
        const input = document.getElementById("pass");
        
        // အရင်တစ်ခါ ထည့်ထားတဲ့ passcode ကို ပြန်ထည့်ပေးမယ်
        if(localStorage.getItem(PASS_KEY)) {
            input.value = localStorage.getItem(PASS_KEY);
        }

        async function del(key) {
            const p = input.value.trim();
            if(!p) return alert("Passcode မထည့်ရသေးဘူး ကိုဂျီ");

            if(!confirm(\`တကယ် ဖျက်မှာလား?\n\${key}\`)) return;

            // passcode သိမ်းထား
            localStorage.setItem(PASS_KEY, p);

            const f = new FormData();
            f.append("key", key);
            f.append("passcode", p);

            const r = await fetch("/api/r2-delete", {method:"POST", body:f});
            if(r.ok) {
                alert("ဖျက်ပြီးပါပြီ!!!");
                location.reload();
            } else {
                const msg = await r.text();
                alert("မအောင်မြင်ပါ: " + msg);
                if(r.status===401) {
                    localStorage.removeItem(PASS_KEY);
                    input.value = "";
                }
            }
        }
    </script>
</body>
</html>`;

        return new Response(html, {
            headers: { 
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store'
            }
        });

    } catch (e) {
        return new Response(`<h3 style="color:red">Error: ${e.message}</h3>`, {status:500});
    }
}
