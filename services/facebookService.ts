// Helper function to convert base64 to a Blob, which is required for FormData uploads.
const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};

export interface FacebookPostContent {
    message: string;
    imageBase64: string;
}

/**
 * Posts content (text and an image) to a specified Facebook Page.
 * @param accessToken A valid Page Access Token with necessary permissions (pages_read_engagement, pages_manage_posts).
 * @param pageId The ID of the Facebook Page to post to.
 * @param content An object containing the message text and the base64-encoded image.
 * @returns A promise that resolves with the ID of the newly created post.
 * @throws An error if any step of the API interaction fails.
 */
export const postToFacebookPage = async (
    accessToken: string,
    pageId: string,
    content: FacebookPostContent
): Promise<{ post_id: string }> => {
    // Step 1: Upload the photo to get a photo ID. We upload it as unpublished.
    const photoBlob = base64ToBlob(content.imageBase64, 'image/png');
    const formData = new FormData();
    formData.append('access_token', accessToken);
    formData.append('source', photoBlob);
    formData.append('published', 'false');

    const photoUploadResponse = await fetch(`https://graph.facebook.com/v20.0/${pageId}/photos`, {
        method: 'POST',
        body: formData,
    });

    const photoUploadData = await photoUploadResponse.json();

    if (!photoUploadResponse.ok || !photoUploadData.id) {
        throw new Error(photoUploadData.error?.message || 'Failed to upload photo to Facebook. Check Page permissions.');
    }

    const photoId = photoUploadData.id;

    // Step 2: Create the post on the page's feed using the photo ID.
    // We use URLSearchParams to correctly format the body for a POST request.
    const postBody = new URLSearchParams();
    postBody.append('access_token', accessToken);
    postBody.append('message', content.message);
    postBody.append('attached_media', `[{"media_fbid": "${photoId}"}]`);


    const postResponse = await fetch(`https://graph.facebook.com/v20.0/${pageId}/feed`, {
        method: 'POST',
        body: postBody,
    });

    const postResponseData = await postResponse.json();

    if (!postResponse.ok || !postResponseData.id) {
        throw new Error(postResponseData.error?.message || 'Failed to create post on Facebook. Check token permissions.');
    }

    return { post_id: postResponseData.id };
};
