export async function onRequestPost(context) {
  try {
    if (context.request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }
    
    const formData = await context.request.formData();
    const file = formData.get('file'); 

    if (!file || file.size === 0) {
      return new Response(JSON.stringify({ status: 'ERROR', message: 'No file uploaded.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { env } = context;
    const arrayBuffer = await file.arrayBuffer(); 
    const key = file.name; 

    await env.UPLOAD_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream'
      }
    });

    return new Response(JSON.stringify({
      status: 'SUCCESS',
      filename: key,
      message: `${key} uploaded successfully!`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      status: 'SERVER_ERROR', 
      message: `File upload failed due to server error: ${error.message}` 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
