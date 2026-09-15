// ======================================================
// CONNECTO BACKEND API CONFIGURATION
// ======================================================
//
// When your backend starts running, keep it on:
// http://localhost:8000
//
// Your backend routes should start with:
// /api/v1
//
// Example:
// POST http://localhost:8000/api/v1/auth/login
//
// IMPORTANT:
// credentials: "include" is used because your JWT can be
// stored safely in an httpOnly cookie.
// ======================================================

const API_BASE_URL = "http://localhost:8000/api/v1";


// Connecto is now configured for your real backend.
// MongoDB can be connected later on the backend side.
const USE_BACKEND = true;


// ------------------------------------------------------
// COMMON REQUEST FUNCTION
// ------------------------------------------------------
//
// All frontend API calls go through this one function.
// So later, if your backend URL changes, you only need
// to change API_BASE_URL above.

async function apiRequest(endpoint, options = {}) {

    const {
        method = "GET",
        body = null,
        headers = {}
    } = options;


    const requestOptions = {
        method: method,

        // Sends login cookies with every request.
        credentials: "include",

        headers: {
            ...headers
        }
    };


    // FormData is used for image/video uploads.
    // Never manually set Content-Type for FormData.
    if (body instanceof FormData) {

        requestOptions.body = body;

    } else if (body !== null) {

        requestOptions.headers["Content-Type"] =
            "application/json";

        requestOptions.body =
            JSON.stringify(body);
    }


    let response;

    try {

        response = await fetch(
            API_BASE_URL + endpoint,
            requestOptions
        );

    } catch (error) {

        throw new Error(
            "Cannot connect to Connecto backend. Make sure the backend server is running on port 8000."
        );
    }


    let data = {};

    const contentType =
        response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        data = await response.json();
    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Something went wrong. Please try again."
        );
    }


    return data;
}



// ======================================================
// AUTH APIs
// ======================================================

const AuthAPI = {

    login: function(identifier, password, rememberMe) {

        return apiRequest(
            "/auth/login",
            {
                method: "POST",
                body: {
                    identifier,
                    password,
                    rememberMe
                }
            }
        );
    },


    register: function(data) {

        return apiRequest(
            "/auth/register",
            {
                method: "POST",
                body: data
            }
        );
    },


    logout: function() {

        return apiRequest(
            "/auth/logout",
            {
                method: "POST"
            }
        );
    },


    forgotPassword: function(email) {

        return apiRequest(
            "/auth/forgot-password",
            {
                method: "POST",
                body: {
                    email
                }
            }
        );
    }
};



// ======================================================
// USER / PROFILE APIs
// ======================================================

const UserAPI = {

    getMyProfile: function() {
        return apiRequest("/users/me");
    },


    // First-time Connecto profile setup after the user has logged in.
    // The backend should update the CURRENT logged-in user, not create a second user.
    createMyProfile: function(name, username, bio) {

        return apiRequest(
            "/users/me",
            {
                method: "PATCH",
                body: {
                    name,
                    username,
                    bio
                }
            }
        );
    },


    updateMyProfile: function(name, bio) {

        return apiRequest(
            "/users/me",
            {
                method: "PATCH",
                body: {
                    name,
                    bio
                }
            }
        );
    },


    updateProfileImage: function(file) {

        const formData =
            new FormData();

        formData.append(
            "profileImage",
            file
        );

        return apiRequest(
            "/users/me/profile-image",
            {
                method: "PATCH",
                body: formData
            }
        );
    },


    searchUsers: function(query) {

        return apiRequest(
            "/users/search?query=" +
            encodeURIComponent(query)
        );
    },


    getUserProfile: function(userId) {

        return apiRequest(
            "/users/" + userId
        );
    },


    followUser: function(userId) {

        return apiRequest(
            "/users/" + userId + "/follow",
            {
                method: "POST"
            }
        );
    },


    unfollowUser: function(userId) {

        return apiRequest(
            "/users/" + userId + "/follow",
            {
                method: "DELETE"
            }
        );
    },


    getSavedPosts: function() {

        return apiRequest(
            "/users/me/saved"
        );
    }
};



// ======================================================
// POST / REELS APIs
// ======================================================
//
// IMPORTANT BACKEND DESIGN:
//
// Store image AND video in the same Post collection.
//
// mediaType = "image"
//      -> Home
//
// mediaType = "video"
//      -> Home + Reels
//
// Reels can simply request:
// GET /posts?mediaType=video
// ======================================================

const PostAPI = {

    getHomePosts: function() {

        return apiRequest(
            "/posts"
        );
    },


    getReels: function() {

        return apiRequest(
            "/posts?mediaType=video"
        );
    },


    createPost: function(file, caption) {

        const formData =
            new FormData();

        // Your Multer middleware should use:
        // upload.single("media")
        formData.append(
            "media",
            file
        );

        formData.append(
            "caption",
            caption
        );


        return apiRequest(
            "/posts",
            {
                method: "POST",
                body: formData
            }
        );
    },


    toggleLike: function(postId) {

        return apiRequest(
            "/posts/" + postId + "/like",
            {
                method: "POST"
            }
        );
    },


    addComment: function(postId, text) {

        return apiRequest(
            "/posts/" + postId + "/comments",
            {
                method: "POST",
                body: {
                    text
                }
            }
        );
    },


    getComments: function(postId) {

        return apiRequest(
            "/posts/" + postId + "/comments"
        );
    },


    toggleSave: function(postId) {

        return apiRequest(
            "/posts/" + postId + "/save",
            {
                method: "POST"
            }
        );
    }
};



// ======================================================
// STORY APIs
// ======================================================

const StoryAPI = {

    getStories: function() {

        return apiRequest(
            "/stories"
        );
    },


    createStory: function(file, overlayText, caption) {

        const formData =
            new FormData();

        // Backend Multer:
        // upload.single("story")
        formData.append(
            "story",
            file
        );

        formData.append(
            "overlayText",
            overlayText
        );

        formData.append(
            "caption",
            caption
        );


        return apiRequest(
            "/stories",
            {
                method: "POST",
                body: formData
            }
        );
    }
};



// ======================================================
// MESSAGE APIs
// ======================================================

const MessageAPI = {

    getFollowedUsers: function() {

        return apiRequest(
            "/messages/users"
        );
    },


    getConversation: function(userId) {

        return apiRequest(
            "/messages/" + userId
        );
    },


    sendMessage: function(userId, text) {

        return apiRequest(
            "/messages",
            {
                method: "POST",
                body: {
                    receiverId: userId,
                    text
                }
            }
        );
    }
};


// ======================================================
// MAKE API OBJECTS AVAILABLE TO OTHER JS FILES
// ======================================================

window.ConnectoAPI = {
    API_BASE_URL,
    USE_BACKEND,
    apiRequest,
    AuthAPI,
    UserAPI,
    PostAPI,
    StoryAPI,
    MessageAPI
};
