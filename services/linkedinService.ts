// Helper function to convert base64 to a Blob.
const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

export interface LinkedInPostContent {
    message: string;
    imageBase64: string;
}

/**
 * Posts content (text and an image) to a LinkedIn user's feed.
 * @param accessToken A valid User Access Token with w_member_social permission.
 * @param personId The URN of the LinkedIn member (e.g., 'urn:li:person:xxxxxx') or just the ID part.
 * @param content An object containing the message text and the base64-encoded image.
 * @returns A promise that resolves with the ID of the newly created post.
 * @throws An error if any step of the API interaction fails.
 */
export const postToLinkedIn = async (
    accessToken: string,
    personId: string,
    content: LinkedInPostContent
): Promise<{ post_id: string }> => {
    const authorUrn = personId.startsWith('urn:li:person:') ? personId : `urn:li:person:${personId}`;

    // Step 1: Register the image for upload
    const registerUploadResponse = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
            "registerUploadRequest": {
                "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                "owner": authorUrn,
                "serviceRelationships": [{
                    "relationshipType": "OWNER",
                    "identifier": "urn:li:userGeneratedContent"
                }]
            }
        })
    });

    const registerUploadData = await registerUploadResponse.json();
    if (!registerUploadResponse.ok || !registerUploadData.value?.uploadUrl) {
        throw new Error(registerUploadData.message || 'Failed to register image upload with LinkedIn.');
    }

    const { uploadUrl, asset } = registerUploadData.value;
    const assetUrn = asset;

    // Step 2: Upload the image binary to the provided URL
    const imageBlob = base64ToBlob(content.imageBase64, 'image/png');
    const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'image/png'
        },
        body: imageBlob
    });

    if (!uploadResponse.ok) {
        throw new Error('Failed to upload image binary to LinkedIn.');
    }
    
    // Step 3: Create the UGC (User Generated Content) post
    const postBody = {
        "author": authorUrn,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": content.message
                },
                "shareMediaCategory": "IMAGE",
                "media": [{
                    "status": "READY",
                    "description": {
                        "text": "Image shared from DreamPixel"
                    },
                    "media": assetUrn,
                    "title": {
                        "text": "User Generated Image"
                    }
                }]
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "CONNECTIONS"
        }
    };
    
    const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(postBody)
    });

    const postResponseData = await postResponse.json();

    if (!postResponse.ok || !postResponseData.id) {
         throw new Error(postResponseData.message || 'Failed to create post on LinkedIn.');
    }
    
    return { post_id: postResponseData.id };
};