export async function onRequestGet(context) {
    const { env } = context;

    if (!env.UPLOAD_BUCKET) {
        return new Response("<h3>❌ R2 Binding Error</h3><p>UPLOAD_BUCKET binding is missing in Pages Settings!</p>", { 
            status: 500,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
    }

    // Account B – kpweb Public Dev URL
    const PUBLIC_BASE_URL = "https://pub-8f2cb3081b62492980aaa456e245c182.r2.dev";

    try {
        const listing = await env.UPLOAD_BUCKET.list();
        const sortedObjects = listing.objects.sort((a, b) => 
            new Date(b.uploaded).getTime() - new Date(a.uploaded).getTime()
        );

        const headers = {
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
        };
        
        let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>R2 File List</title>
    <style>
        body { font-family: Arial, sans-serif; background: #fff; margin: 0; padding: 0; }
        .file-container { width: 100%; margin: 0; padding: 10px; box-sizing: border-box; }
        h3 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; margin-top: 0; font-size: 1.1em; }
        .file-list { list-style: none; padding: 0; }
        .file-item { 
            display: flex; 
            flex-direction: column; 
            padding: 10px 0; 
            border-bottom: 1px dashed #e0e0e0; 
        }
        .file-name-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
            width: 100%;
        }
        .file-name { flex-grow: 1; margin-right: 10px; }
        .file-name a { color: #007bff; text-decoration: none; font-weight: bold; font-size: 1.05em; word-break: break-all; }
        .file-name a:hover { text-decoration: underline; }

        .file-metadata { 
            display: flex; 
            justify-content: flex-start; 
            align-items: center; 
            font-size: 0.85em; 
            color: #666; 
            white-space: nowrap; 
            width: 100%; 
        }
        .file-size { margin-right: 15px; }
        .file-date { margin-right: 25px; }

        .download-btn {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 5px 12px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 0.85em;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
            font-weight: normal; 
            margin-left: auto;
        }
        .download-btn:hover { background-color: #0056b3; }
        
        .error-message { color: red; font-weight: bold; text-align: center; padding: 20px; }
    </style>
</head>
<body>
    <div class="file-container">
        <h3>📂 R2 File List (${sortedObjects.length} files) - Newest First</h3>
        <ul class="file-list">
        `;

        if (sortedObjects.length === 0) {
            htmlContent += `<p class="error-message">ဖိုင်များမရှိသေးပါ။</p>`;
        } else {
            sortedObjects.forEach(obj => {
                const downloadUrl = PUBLIC_BASE_URL + "/" + encodeURIComponent(obj.key);
                const sizeMB = (obj.size / (1024 * 1024)).toFixed(2); 

                htmlContent += `
                    <li class="file-item" data-key="${obj.key}">
                        <div class="file-name-row">
                            <div class="file-name">
                                <a href="${downloadUrl}" title="${obj.key}" target="_blank">${obj.key}</a>
                            </div>
                            <a href="${downloadUrl}" target="_blank" class="download-btn">Download</a>
                        </div>
                        
                        <div class="file-metadata">
                            <span class="file-size">Size: ${sizeMB} MB</span>
                            <span class="file-date">Date: ${new Date(obj.uploaded).toLocaleDateString()}</span>
                        </div>
                    </li>
                `;
            });
        }

        htmlContent += `
        </ul>
    </div>
</body>
</html>`;

        return new Response(htmlContent, { headers });

    } catch (error) {
        return new Response(`<h3>❌ R2 Listing Error</h3><p>Server Error: ${error.message}</p>`, { 
            status: 500,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
    }
}
