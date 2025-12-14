// Walrus Publisher endpoint - uses proxy in dev, direct in production
const PROXY_ENDPOINT = "/walrus-publisher"; 
// Fallback direct endpoint if proxy doesn't work
const DIRECT_ENDPOINT = "https://publisher.walrus-testnet.walrus.space";

export async function uploadToWalrus(file: File): Promise<string> {
    console.log("🦭 Initiating Walrus Upload...");

    // Try proxy first (for dev), fallback to direct endpoint
    let response: Response;
    let lastError: Error | null = null;

    // Try proxy endpoint first
    try {
        console.log("Attempting upload via proxy:", `${PROXY_ENDPOINT}/v1/blobs?epochs=5`);
        response = await fetch(`${PROXY_ENDPOINT}/v1/blobs?epochs=5`, {
            method: "PUT",
            headers: {
                "Content-Type": file.type || "application/octet-stream",
            },
            body: file,
        });

        if (response.ok) {
            const data = await response.json();
            let blobId = "";

            if (data.newlyCreated?.blobObject?.blobId) {
                blobId = data.newlyCreated.blobObject.blobId;
                console.log("✅ New file uploaded to Walrus! Blob ID:", blobId);
            } else if (data.alreadyCertified?.blobId) {
                blobId = data.alreadyCertified.blobId;
                console.log("ℹ️ File already exists on Walrus. Blob ID:", blobId);
            } else if (data.blobId) {
                // Sometimes the response might have blobId directly
                blobId = data.blobId;
                console.log("✅ Upload Successful! Blob ID:", blobId);
            } else {
                console.error("Invalid response format from Walrus:", data);
                throw new Error("Invalid response format from Walrus");
            }

            return blobId;
        } else {
            throw new Error(`Proxy failed: ${response.status} ${response.statusText}`);
        }
    } catch (proxyError) {
        console.warn("Proxy upload failed, trying direct endpoint...", proxyError);
        lastError = proxyError as Error;

        // Fallback to direct endpoint
        try {
            console.log("Attempting upload via direct endpoint:", `${DIRECT_ENDPOINT}/v1/blobs?epochs=5`);
            response = await fetch(`${DIRECT_ENDPOINT}/v1/blobs?epochs=5`, {
        method: "PUT",
        headers: {
            "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
    });

    if (!response.ok) {
        throw new Error(`Walrus Network Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let blobId = "";

    if (data.newlyCreated?.blobObject?.blobId) {
        blobId = data.newlyCreated.blobObject.blobId;
        console.log("✅ New file uploaded to Walrus via direct endpoint! Blob ID:", blobId);
    } else if (data.alreadyCertified?.blobId) {
        blobId = data.alreadyCertified.blobId;
        console.log("ℹ️ File already exists on Walrus (direct endpoint). Blob ID:", blobId);
    } else if (data.blobId) {
        // Sometimes the response might have blobId directly
        blobId = data.blobId;
        console.log("✅ Upload Successful via direct endpoint! Blob ID:", blobId);
    } else {
        console.error("Invalid response format from Walrus (direct):", data);
        throw new Error("Invalid response format from Walrus");
    }

    return blobId;
        } catch (directError) {
            console.error("Both proxy and direct upload failed");
            throw new Error(
                `Walrus upload failed. Proxy error: ${lastError?.message}. Direct error: ${(directError as Error).message}`
            );
        }
    }
}