// ======================================================
// CONNECTO - SIMPLE FRONTEND DATA
// ======================================================

// There is no backend yet.
// So these arrays temporarily keep the data in the browser.
//
// When you refresh the page, the data disappears.
// Later your backend + MongoDB will replace these arrays.

let stories = [];
let posts = [];
let reels = [];
let savedPosts = [];
let savedItems = [];

let followingCount = 0;

// ------------------------------------------------------
// TEMPORARY FRONTEND USERS
// ------------------------------------------------------
// Later, replace this array with data from your backend:
// GET /api/users/search?query=...
//
// "isFollowing" controls who appears in Messages.

const connectoUsers = [
    {
        id: "user-shubham",
        name: "Shubham",
        username: "shubham",
        bio: "Connecto user",
        isFollowing: false
    },
    {
        id: "user-rahul",
        name: "Rahul",
        username: "rahul",
        bio: "Connecto user",
        isFollowing: false
    },
    {
        id: "user-neha",
        name: "Neha",
        username: "neha",
        bio: "Connecto user",
        isFollowing: false
    }
];

let recentSearches = [];
let selectedChatUserId = null;

// Temporary messages keyed by user id.
// Later your backend/database will store these.
const conversations = {};

// Used to know which post is being shared.
let sharingPostId = null;



// ======================================================
// PAGE NAVIGATION
// ======================================================

function showPage(pageName) {

    const pages = document.querySelectorAll(".page");

    // Hide all pages.
    pages.forEach(function(page) {
        page.classList.add("hidden");
    });

    // Show the selected page.
    const selectedPage = document.getElementById(pageName);
    selectedPage.classList.remove("hidden");

    changeActiveButton(pageName);

    // New users see the Create Account box the first time they open Profile.
    if (pageName === "profile") {
        refreshProfileSetupState();

        if (!hasCreatedProfile()) {
            openCreateAccount();
        }
    }
}



function changeActiveButton(pageName) {

    const buttons = document.querySelectorAll(".navButton");

    // Remove active design from all sidebar buttons.
    buttons.forEach(function(button) {
        button.classList.remove("activeButton");
    });

    // Example:
    // pageName = "home"
    // button id = "homeButton"
    const selectedButton =
        document.getElementById(pageName + "Button");

    if (selectedButton) {
        selectedButton.classList.add("activeButton");
    }
}



// ======================================================
// STORY CREATOR
// ======================================================

// The logged-in user has ONE story circle.
//
// If the same user adds another story,
// it is added inside the SAME circle.
//
// Later, when the backend is connected,
// group stories using the user's real userId.

const currentStoryUser = {
    userId: "current-user",
    username: "You",
    stories: []
};


// Other users can later come from the backend like:
//
// storyUsers.push({
//     userId: "rahul-id",
//     username: "Rahul",
//     stories: [ ...Rahul's stories... ]
// });
//
// Rahul will then get ONE separate circle.

let storyUsers = [];


// Used while viewing many stories from one user.
let openedStoryUser = null;
let openedStoryIndex = 0;



function openStoryCreator() {

    document
        .getElementById("storyModal")
        .classList.remove("hidden");
}



function closeStoryCreator() {

    document
        .getElementById("storyModal")
        .classList.add("hidden");
}



function chooseStoryPhoto() {

    // Opens phone gallery / laptop file chooser.
    document
        .getElementById("storyInput")
        .click();
}



// When a photo is selected, show its preview.
document
    .getElementById("storyInput")
    .addEventListener("change", function() {

        const file = this.files[0];

        if (!file) {
            return;
        }

        const imageURL = URL.createObjectURL(file);

        document
            .getElementById("storyPreviewImage")
            .src = imageURL;

        document
            .getElementById("storyPreviewBox")
            .classList.remove("hidden");
    });



function updateStoryOverlay() {

    const text =
        document.getElementById("storyOverlayText").value;

    document
        .getElementById("storyOverlayPreview")
        .textContent = text;
}



function addStory() {

    const file =
        document.getElementById("storyInput").files[0];

    const overlayText =
        document.getElementById("storyOverlayText").value;

    const caption =
        document.getElementById("storyCaption").value;

    if (!file) {
        alert("Please select a photo.");
        return;
    }


    const imageURL =
        URL.createObjectURL(file);


    const newStory = {
        imageURL: imageURL,
        overlayText: overlayText,
        caption: caption
    };


    // IMPORTANT:
    // Same logged-in user -> same circle.
    // We only add another story INSIDE that user's story array.
    currentStoryUser.stories.push(newStory);


    displayStories();

    clearStoryForm();

    closeStoryCreator();
}



function displayStories() {

    const storiesList =
        document.getElementById("storiesList");

    storiesList.innerHTML = "";


    // ==================================================
    // CURRENT USER - ALWAYS ONE FIXED CIRCLE
    // ==================================================

    const currentItem =
        document.createElement("div");

    currentItem.className = "storyItem";


    // No story yet:
    // show the normal + circle.
    if (currentStoryUser.stories.length === 0) {

        currentItem.innerHTML = `

            <div class="currentStoryWrapper">

                <div
                    class="storyRing"
                    onclick="openStoryCreator()"
                >

                    <div class="storyCircle yourStoryDefault">
                        <i class="fa-regular fa-user"></i>
                    </div>

                </div>

                <button
                    class="storyAddBadge"
                    onclick="event.stopPropagation(); openStoryCreator();"
                    title="Add story"
                >
                    <i class="fa-solid fa-plus"></i>
                </button>

            </div>

            <p>Your Story</p>
        `;
    }


    // Story already exists:
    // SAME circle is used.
    // It shows the latest story image.
    else {

        const latestStory =
            currentStoryUser.stories[
                currentStoryUser.stories.length - 1
            ];

        currentItem.innerHTML = `

            <div class="currentStoryWrapper">

                <div
                    class="storyRing"
                    onclick="openCurrentUserStories()"
                >

                    <div class="storyCircle">

                        <img
                            src="${latestStory.imageURL}"
                            alt="Your story"
                        >

                    </div>

                </div>


                <!-- Small + lets the SAME user add another story -->
                <button
                    class="storyAddBadge"
                    onclick="event.stopPropagation(); openStoryCreator();"
                    title="Add another story"
                >
                    <i class="fa-solid fa-plus"></i>
                </button>

            </div>

            <p>Your Story</p>
        `;
    }


    storiesList.appendChild(currentItem);


    // ==================================================
    // OTHER USERS
    // One userId = one circle
    // ==================================================

    storyUsers.forEach(function(user, userIndex) {

        if (!user.stories || user.stories.length === 0) {
            return;
        }

        const latestStory =
            user.stories[user.stories.length - 1];


        const storyItem =
            document.createElement("div");

        storyItem.className = "storyItem";


        storyItem.innerHTML = `

            <div
                class="storyRing"
                onclick="openOtherUserStories(${userIndex})"
            >

                <div class="storyCircle">

                    <img
                        src="${latestStory.imageURL}"
                        alt="${escapeHTML(user.username)} story"
                    >

                </div>

            </div>

            <p>${escapeHTML(user.username)}</p>
        `;


        storiesList.appendChild(storyItem);
    });
}



function clearStoryForm() {

    document.getElementById("storyInput").value = "";
    document.getElementById("storyOverlayText").value = "";
    document.getElementById("storyCaption").value = "";

    document.getElementById("storyOverlayPreview").textContent = "";

    document
        .getElementById("storyPreviewBox")
        .classList.add("hidden");
}



// ======================================================
// STORY VIEWER
// ======================================================

function openCurrentUserStories() {

    openedStoryUser = currentStoryUser;

    // Open the first story.
    openedStoryIndex = 0;

    showOpenedStory();
}



function openOtherUserStories(userIndex) {

    openedStoryUser = storyUsers[userIndex];

    openedStoryIndex = 0;

    showOpenedStory();
}



function showOpenedStory() {

    if (
        !openedStoryUser ||
        !openedStoryUser.stories ||
        openedStoryUser.stories.length === 0
    ) {
        return;
    }


    const story =
        openedStoryUser.stories[openedStoryIndex];


    document.getElementById("viewStoryImage").src =
        story.imageURL;

    document.getElementById("viewStoryOverlay").textContent =
        story.overlayText;

    document.getElementById("viewStoryCaption").textContent =
        story.caption;

    document.getElementById("viewerUsername").textContent =
        openedStoryUser.username;


    document
        .getElementById("storyViewer")
        .classList.remove("hidden");
}



// Clicking the shown story moves to the next story
// of the SAME user.
//
// Example:
// You add Story 1, Story 2, Story 3.
// There is still only ONE circle.
// Opening that circle lets you move through 1 -> 2 -> 3.

document
    .getElementById("viewStoryImage")
    .addEventListener("click", function() {

        if (!openedStoryUser) {
            return;
        }


        if (
            openedStoryIndex <
            openedStoryUser.stories.length - 1
        ) {

            openedStoryIndex++;

            showOpenedStory();
        }

        else {

            closeStoryViewer();
        }
    });



function closeStoryViewer() {

    document
        .getElementById("storyViewer")
        .classList.add("hidden");

    openedStoryUser = null;
    openedStoryIndex = 0;
}



// ======================================================
// CREATE PHOTO POST / VIDEO REEL
// ======================================================

function clearCreateForm() {

    const fileInput =
        document.getElementById("postFile");

    const captionInput =
        document.getElementById("postCaption");

    const preview =
        document.getElementById("postPreview");

    if (fileInput) {
        fileInput.value = "";
    }

    if (captionInput) {
        captionInput.value = "";
    }

    if (preview) {
        preview.innerHTML = "";
        preview.classList.add("hidden");
    }
}



function openCreatePost() {

    clearCreateForm();

    document
        .getElementById("createPostModal")
        .classList.remove("hidden");
}



function closeCreatePost() {

    document
        .getElementById("createPostModal")
        .classList.add("hidden");

    clearCreateForm();
}



function previewPostFile() {

    const fileInput =
        document.getElementById("postFile");

    const preview =
        document.getElementById("postPreview");

    const file =
        fileInput.files[0];

    preview.innerHTML = "";

    if (!file) {
        preview.classList.add("hidden");
        return;
    }

    const fileURL =
        URL.createObjectURL(file);

    if (file.type.startsWith("image/")) {

        const image =
            document.createElement("img");

        image.src = fileURL;
        image.alt = "Selected image";

        preview.appendChild(image);

    } else if (file.type.startsWith("video/")) {

        const video =
            document.createElement("video");

        video.src = fileURL;
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";

        preview.appendChild(video);
    }

    preview.classList.remove("hidden");
}



function createPost() {

    const fileInput =
        document.getElementById("postFile");

    const captionInput =
        document.getElementById("postCaption");

    const file =
        fileInput.files[0];

    const caption =
        captionInput.value.trim();

    if (!file) {
        alert("Please choose a photo or video.");
        return;
    }

    const fileURL =
        URL.createObjectURL(file);


    // --------------------------------------------------
    // IMAGE -> HOME ONLY
    // --------------------------------------------------

    if (file.type.startsWith("image/")) {

        posts.push({
            id: Date.now(),
            type: "image",
            fileURL: fileURL,
            caption: caption,
            likes: 0,
            liked: false,
            comments: [],
            saved: false
        });

        // Close immediately after successful upload.
        closeCreatePost();

        displayPosts();
        displayProfilePosts();
        updatePostCount();
    }


    // --------------------------------------------------
    // VIDEO -> HOME + REELS
    // --------------------------------------------------

    else if (file.type.startsWith("video/")) {

        const videoId =
            Date.now();

        posts.push({
            id: videoId,
            type: "video",
            fileURL: fileURL,
            caption: caption,
            likes: 0,
            liked: false,
            comments: [],
            saved: false
        });

        reels.push({
            id: videoId,
            type: "video",
            fileURL: fileURL,
            caption: caption,
            userId: "@subrata",
            following: false,
            likes: 0,
            liked: false,
            comments: [],
            saved: false
        });

        // Close immediately after successful upload.
        closeCreatePost();

        displayPosts();
        displayProfilePosts();
        updatePostCount();
        displayReels();
    }


    else {
        alert("Please choose an image or video file.");
        return;
    }


}



function updatePostCount() {

    const postsCount =
        document.getElementById("postsCount");

    if (postsCount) {
        postsCount.textContent = posts.length;
    }
}



// ======================================================
// DISPLAY POSTS
// ======================================================

function displayPosts() {

    const postList =
        document.getElementById("postList");

    const emptyHome =
        document.getElementById("emptyHome");

    postList.innerHTML = "";

    if (posts.length === 0) {

        emptyHome.classList.remove("hidden");
        return;
    }

    emptyHome.classList.add("hidden");


    // Newest post first.
    const reversedPosts =
        [...posts].reverse();


    reversedPosts.forEach(function(post) {

        const postElement =
            document.createElement("article");

        postElement.className = "post";


        // POST TOP
        const postUser =
            document.createElement("div");

        postUser.className = "postUser";

        postUser.innerHTML = `
            <div class="smallProfile">SD</div>
            <b>Subrata Das</b>
        `;


        // POST MEDIA
        // Image posts show an image.
        // Video posts show a playable video.
        const media =
            document.createElement("div");

        media.className = "postMedia";


        if (post.type === "video") {

            const video =
                document.createElement("video");

            video.src = post.fileURL;
            video.controls = true;
            video.playsInline = true;
            video.preload = "metadata";

            media.appendChild(video);

        } else {

            const image =
                document.createElement("img");

            image.src = post.fileURL;
            image.alt = "Uploaded post";

            media.appendChild(image);
        }


        // ACTION BUTTONS
        const actions =
            document.createElement("div");

        actions.className = "postActions";


        // LIKE
        const likeButton =
            document.createElement("button");

        likeButton.className =
            "actionButton" + (post.liked ? " liked" : "");

        likeButton.title = "Like";

        likeButton.innerHTML = `
            <i class="${post.liked ? "fa-solid" : "fa-regular"} fa-thumbs-up"></i>
            <span class="count">${post.likes}</span>
        `;

        likeButton.onclick = function() {
            toggleLike(post.id);
        };


        // COMMENT
        const commentButton =
            document.createElement("button");

        commentButton.className = "actionButton";
        commentButton.title = "Comments";

        commentButton.innerHTML = `
            <i class="fa-regular fa-comment"></i>
            <span class="count">${post.comments.length}</span>
        `;

        commentButton.onclick = function() {
            toggleComments(post.id);
        };


        // SHARE
        const shareButton =
            document.createElement("button");

        shareButton.className = "actionButton";
        shareButton.title = "Share";

        shareButton.innerHTML =
            `<i class="fa-regular fa-paper-plane"></i>`;

        shareButton.onclick = function() {
            openShareMenu(post.id);
        };


        // SAVE
        const saveButton =
            document.createElement("button");

        saveButton.className =
            "actionButton saveButton" +
            (post.saved ? " saved" : "");

        saveButton.title = "Save";

        saveButton.innerHTML = `
            <i class="${post.saved ? "fa-solid" : "fa-regular"} fa-bookmark"></i>
        `;

        saveButton.onclick = function() {
            toggleSavePost(post.id);
        };


        actions.appendChild(likeButton);
        actions.appendChild(commentButton);
        actions.appendChild(shareButton);
        actions.appendChild(saveButton);


        // CAPTION
        const caption =
            document.createElement("p");

        caption.className = "caption";

        const username =
            document.createElement("b");

        username.textContent = "Subrata Das ";

        caption.appendChild(username);
        caption.appendChild(
            document.createTextNode(post.caption)
        );


        // COMMENT SECTION
        const commentSection =
            document.createElement("div");

        commentSection.className =
            "commentSection hidden";

        commentSection.id =
            "comments-" + post.id;

        renderCommentSection(
            post,
            commentSection
        );


        postElement.appendChild(postUser);
        postElement.appendChild(media);
        postElement.appendChild(actions);
        postElement.appendChild(caption);
        postElement.appendChild(commentSection);

        postList.appendChild(postElement);
    });
}



// ======================================================
// LIKE
// ======================================================

function toggleLike(postId) {

    const post =
        posts.find(function(item) {
            return item.id === postId;
        });

    if (!post) {
        return;
    }


    if (post.liked) {

        post.liked = false;
        post.likes--;

    } else {

        post.liked = true;
        post.likes++;
    }


    displayPosts();
}



// ======================================================
// COMMENTS
// ======================================================

function toggleComments(postId) {

    const commentSection =
        document.getElementById(
            "comments-" + postId
        );

    if (commentSection) {
        commentSection.classList.toggle("hidden");
    }
}



function renderCommentSection(post, container) {

    container.innerHTML = "";


    const commentsList =
        document.createElement("div");

    commentsList.className = "commentsList";


    if (post.comments.length === 0) {

        const empty =
            document.createElement("p");

        empty.className = "muted";
        empty.textContent = "No comments yet.";

        commentsList.appendChild(empty);
    }


    post.comments.forEach(function(commentText) {

        const comment =
            document.createElement("p");

        comment.className = "comment";

        const name =
            document.createElement("b");

        name.textContent = "You ";

        comment.appendChild(name);
        comment.appendChild(
            document.createTextNode(commentText)
        );

        commentsList.appendChild(comment);
    });


    const inputRow =
        document.createElement("div");

    inputRow.className = "commentInputRow";


    const input =
        document.createElement("input");

    input.type = "text";
    input.placeholder = "Add a comment...";


    const button =
        document.createElement("button");

    button.textContent = "Post";


    button.onclick = function() {

        addComment(
            post.id,
            input.value
        );
    };


    inputRow.appendChild(input);
    inputRow.appendChild(button);

    container.appendChild(commentsList);
    container.appendChild(inputRow);
}



function addComment(postId, commentText) {

    const cleanComment =
        commentText.trim();

    if (cleanComment === "") {
        return;
    }


    const post =
        posts.find(function(item) {
            return item.id === postId;
        });


    if (!post) {
        return;
    }


    post.comments.push(cleanComment);


    // Redraw posts because comment count changed.
    displayPosts();


    // Open the comments again.
    const commentSection =
        document.getElementById(
            "comments-" + postId
        );

    if (commentSection) {
        commentSection.classList.remove("hidden");
    }
}



// ======================================================
// SHARE
// ======================================================

function openShareMenu(postId) {

    sharingPostId = postId;

    document
        .getElementById("shareModal")
        .classList.remove("hidden");
}



function closeShareMenu() {

    document
        .getElementById("shareModal")
        .classList.add("hidden");

    sharingPostId = null;
}



function shareTo(platform) {

    // This is a frontend demo.
    // A real deployed website would use its public post URL.

    alert(
        "Share to " + platform +
        ". After deployment, connect this to the real public post URL."
    );

    closeShareMenu();
}



function copyPostLink() {

    // There is no real public post URL yet because
    // this frontend is not connected to a backend.

    alert(
        "A real post link will be available after the backend and deployment are connected."
    );

    closeShareMenu();
}



// ======================================================
// SAVE POSTS
// ======================================================

function toggleSavePost(postId) {

    const post =
        posts.find(function(item) {
            return item.id === postId;
        });


    if (!post) {
        return;
    }


    post.saved = !post.saved;


    // If this Home post is also a Reel,
    // keep the Reel save icon/state synchronized.
    const sameReel =
        reels.find(function(reel) {
            return reel.id === postId;
        });


    if (sameReel) {
        sameReel.saved = post.saved;
    }


    refreshSavedItems();

    displayPosts();
    displayReels();
    displaySavedPosts();
}



function refreshSavedItems() {

    const savedMap = new Map();


    // Saved photos/videos from Home.
    posts.forEach(function(post) {

        if (post.saved) {
            savedMap.set(post.id, post);
        }
    });


    // Saved Reels.
    reels.forEach(function(reel) {

        if (reel.saved) {

            // Same video may already exist in Home posts.
            // Map prevents duplicate saved items.
            savedMap.set(reel.id, reel);
        }
    });


    savedItems =
        Array.from(savedMap.values());
}



// ======================================================
// PROFILE POSTS / SAVED
// ======================================================

function showProfilePosts() {

    document
        .getElementById("profilePosts")
        .classList.remove("hidden");

    document
        .getElementById("savedPosts")
        .classList.add("hidden");

    document
        .getElementById("noSavedMessage")
        .classList.add("hidden");


    document
        .getElementById("profilePostsTab")
        .classList.add("activeProfileTab");

    document
        .getElementById("savedTab")
        .classList.remove("activeProfileTab");
}



function showSavedPosts() {

    document
        .getElementById("profilePosts")
        .classList.add("hidden");

    document
        .getElementById("savedPosts")
        .classList.remove("hidden");


    document
        .getElementById("profilePostsTab")
        .classList.remove("activeProfileTab");

    document
        .getElementById("savedTab")
        .classList.add("activeProfileTab");


    displaySavedPosts();
}



function displayProfilePosts() {

    const profilePosts =
        document.getElementById("profilePosts");

    profilePosts.innerHTML = "";


    posts.forEach(function(post) {

        const item =
            document.createElement("div");

        item.className = "profilePostItem";


        if (post.type === "video") {

            const video =
                document.createElement("video");

            video.src = post.fileURL;
            video.controls = true;
            video.playsInline = true;
            video.preload = "metadata";

            item.appendChild(video);

        } else {

            const image =
                document.createElement("img");

            image.src = post.fileURL;
            image.alt = "Profile post";

            item.appendChild(image);
        }
        profilePosts.appendChild(item);
    });
}



function displaySavedPosts() {

    const savedContainer =
        document.getElementById("savedPosts");

    const noSavedMessage =
        document.getElementById("noSavedMessage");


    if (!savedContainer) {
        return;
    }


    // Always rebuild the list from current saved states.
    refreshSavedItems();

    savedContainer.innerHTML = "";


    if (savedItems.length === 0) {

        if (noSavedMessage) {
            noSavedMessage.classList.remove("hidden");
        }

        return;
    }


    if (noSavedMessage) {
        noSavedMessage.classList.add("hidden");
    }


    [...savedItems]
        .reverse()
        .forEach(function(item) {

            const card =
                document.createElement("div");

            card.className = "profilePostItem savedProfileItem";


            if (item.type === "video") {

                const video =
                    document.createElement("video");

                video.src = item.fileURL;
                video.controls = true;
                video.playsInline = true;
                video.preload = "metadata";

                card.appendChild(video);

            } else {

                const image =
                    document.createElement("img");

                image.src = item.fileURL;
                image.alt =
                    item.caption || "Saved post";

                card.appendChild(image);
            }


            savedContainer.appendChild(card);
        });
}



// ======================================================
// REELS
// ======================================================

function displayReels() {

    const reelsList =
        document.getElementById("reelsList");

    const noReelsMessage =
        document.getElementById("noReelsMessage");

    reelsList.innerHTML = "";

    const videoReels =
        reels.filter(function(reel) {
            return reel.type === "video";
        });

    if (videoReels.length === 0) {
        noReelsMessage.classList.remove("hidden");
        return;
    }

    noReelsMessage.classList.add("hidden");

    const reversedReels = [...videoReels].reverse();

    reversedReels.forEach(function(reel) {

        // Give older reel objects default values too.
        if (typeof reel.liked !== "boolean") reel.liked = false;
        if (typeof reel.likes !== "number") reel.likes = 0;
        if (!Array.isArray(reel.comments)) reel.comments = [];
        if (typeof reel.saved !== "boolean") reel.saved = false;

        const reelBox =
            document.createElement("article");

        reelBox.className = "reelBox";
        reelBox.dataset.reelId = reel.id;

        const videoWrap =
            document.createElement("div");

        videoWrap.className = "reelVideoWrap";

        const video =
            document.createElement("video");

        video.src = reel.fileURL;
        video.controls = true;
        video.playsInline = true;
        video.preload = "metadata";

        // Uploader information is OUTSIDE the video box.
        // It is a sibling of the video, just like the action buttons.
        if (!reel.userId) reel.userId = "@subrata";
        if (typeof reel.following !== "boolean") reel.following = false;

        const uploaderInfo = document.createElement("div");
        uploaderInfo.className = "reelUploaderInfo";

        const userRow = document.createElement("div");
        userRow.className = "reelUserRow";

        // Small profile picture beside the user ID.
        // It mirrors the current profile photo when one has been selected.
        const reelAvatar = document.createElement("div");
        reelAvatar.className = "reelUserAvatar";

        const currentProfileImage = document.querySelector("#profilePhoto img");

        if (currentProfileImage) {
            const avatarImage = document.createElement("img");
            avatarImage.src = currentProfileImage.src;
            avatarImage.alt = "Profile photo";
            reelAvatar.appendChild(avatarImage);
        } else {
            reelAvatar.textContent = "SD";
        }

        const userName = document.createElement("p");
        userName.className = "reelUserName";
        userName.textContent = reel.userId;

        const followButton = document.createElement("button");
        followButton.className = "reelFollowButton" + (reel.following ? " following" : "");
        followButton.textContent = reel.following ? "Following" : "Follow";
        followButton.addEventListener("click", function(event) {
            event.stopPropagation();
            reel.following = !reel.following;
            followButton.textContent = reel.following ? "Following" : "Follow";
            followButton.classList.toggle("following", reel.following);
        });

        userRow.appendChild(reelAvatar);
        userRow.appendChild(userName);
        userRow.appendChild(followButton);

        const caption = document.createElement("p");
        caption.className = "reelCaption";
        caption.textContent = reel.caption || "";

        uploaderInfo.appendChild(userRow);
        uploaderInfo.appendChild(caption);

        videoWrap.appendChild(video);

        // ------------------------------
        // ACTION BUTTONS
        // ------------------------------

        const actions =
            document.createElement("div");

        actions.className = "reelActions";

        // LIKE
        const likeButton =
            document.createElement("button");

        likeButton.className =
            "reelActionButton" +
            (reel.liked ? " active" : "");

        likeButton.innerHTML = `
            <i class="${reel.liked ? "fa-solid" : "fa-regular"} fa-heart"></i>
            <span>${reel.likes}</span>
        `;

        likeButton.onclick = function() {
            toggleReelLike(reel.id);
        };


        // COMMENT
        const commentButton =
            document.createElement("button");

        commentButton.className =
            "reelActionButton";

        commentButton.innerHTML = `
            <i class="fa-regular fa-comment"></i>
            <span>${reel.comments.length}</span>
        `;

        commentButton.onclick = function() {
            toggleReelComments(reel.id, reelBox);
        };


        // SHARE
        const shareButton =
            document.createElement("button");

        shareButton.className =
            "reelActionButton";

        shareButton.innerHTML = `
            <i class="fa-regular fa-paper-plane"></i>
            <span>Share</span>
        `;

        shareButton.onclick = function() {
            toggleReelShareMenu(reel.id, reelBox);
        };


        // SAVE
        const saveButton =
            document.createElement("button");

        saveButton.className =
            "reelActionButton" +
            (reel.saved ? " saved" : "");

        saveButton.innerHTML = `
            <i class="${reel.saved ? "fa-solid" : "fa-regular"} fa-bookmark"></i>
            <span>${reel.saved ? "Saved" : "Save"}</span>
        `;

        saveButton.onclick = function() {
            toggleReelSave(reel.id);
        };


        actions.appendChild(likeButton);
        actions.appendChild(commentButton);
        actions.appendChild(shareButton);
        actions.appendChild(saveButton);

        // Final reel layout:
        // LEFT = user ID, Follow button and caption
        // CENTER = tall video
        // RIGHT = like/comment/share/save icons
        reelBox.appendChild(uploaderInfo);
        reelBox.appendChild(videoWrap);
        reelBox.appendChild(actions);

        reelsList.appendChild(reelBox);
    });
}



function findReelById(reelId) {

    return reels.find(function(reel) {
        return reel.id === reelId;
    });
}



function toggleReelLike(reelId) {

    const reel = findReelById(reelId);

    if (!reel) {
        return;
    }

    reel.liked = !reel.liked;

    if (reel.liked) {
        reel.likes += 1;
    } else {
        reel.likes = Math.max(0, reel.likes - 1);
    }

    displayReels();
}



function toggleReelComments(reelId, reelBox) {

    // Close any existing reel share menu.
    const oldShareMenu =
        reelBox.querySelector(".reelShareMenu");

    if (oldShareMenu) {
        oldShareMenu.remove();
    }

    const oldPanel =
        reelBox.querySelector(".reelCommentPanel");

    if (oldPanel) {
        oldPanel.remove();
        return;
    }

    const reel = findReelById(reelId);

    if (!reel) {
        return;
    }

    const panel =
        document.createElement("div");

    panel.className = "reelCommentPanel";

    panel.innerHTML = `
        <div class="reelCommentHeader">
            <b>Comments</b>
            <button type="button" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="reelCommentsList"></div>

        <div class="reelCommentInputRow">
            <input
                type="text"
                placeholder="Add a comment..."
            >

            <button type="button">
                Post
            </button>
        </div>
    `;

    reelBox.appendChild(panel);

    const closeButton =
        panel.querySelector(".reelCommentHeader button");

    closeButton.onclick = function() {
        panel.remove();
    };

    const commentsList =
        panel.querySelector(".reelCommentsList");

    renderReelComments(reel, commentsList);

    const input =
        panel.querySelector("input");

    const postButton =
        panel.querySelector(".reelCommentInputRow button");

    function submitComment() {

        const text = input.value.trim();

        if (text === "") {
            return;
        }

        reel.comments.push({
            text: text
        });

        input.value = "";

        renderReelComments(reel, commentsList);

        // Update the comment count without closing the panel.
        const actionButtons =
            reelBox.querySelectorAll(".reelActionButton");

        if (actionButtons[1]) {
            actionButtons[1].querySelector("span").textContent =
                reel.comments.length;
        }
    }

    postButton.onclick = submitComment;

    input.onkeydown = function(event) {
        if (event.key === "Enter") {
            submitComment();
        }
    };
}



function renderReelComments(reel, container) {

    container.innerHTML = "";

    if (reel.comments.length === 0) {
        container.innerHTML =
            '<p class="muted">No comments yet.</p>';
        return;
    }

    reel.comments.forEach(function(comment) {

        const item =
            document.createElement("div");

        item.className = "reelCommentItem";

        item.textContent = comment.text;

        container.appendChild(item);
    });
}



function toggleReelShareMenu(reelId, reelBox) {

    // Close comments first.
    const commentPanel =
        reelBox.querySelector(".reelCommentPanel");

    if (commentPanel) {
        commentPanel.remove();
    }

    const oldMenu =
        reelBox.querySelector(".reelShareMenu");

    if (oldMenu) {
        oldMenu.remove();
        return;
    }

    const menu =
        document.createElement("div");

    menu.className = "reelShareMenu";

    menu.innerHTML = `
        <button type="button" data-share="copy">
            <i class="fa-regular fa-copy"></i>
            Copy Link
        </button>

        <button type="button" data-share="whatsapp">
            <i class="fa-brands fa-whatsapp"></i>
            WhatsApp
        </button>

        <button type="button" data-share="facebook">
            <i class="fa-brands fa-facebook"></i>
            Facebook
        </button>
    `;

    reelBox.appendChild(menu);

    menu.querySelectorAll("button").forEach(function(button) {

        button.onclick = function() {

            const type = button.dataset.share;

            if (type === "copy") {

                const fakeLink =
                    "https://connecto.app/reel/" + reelId;

                if (navigator.clipboard) {
                    navigator.clipboard.writeText(fakeLink);
                }

                alert("Reel link copied.");
            }

            if (type === "whatsapp") {
                alert("WhatsApp sharing will connect after backend/deployment.");
            }

            if (type === "facebook") {
                alert("Facebook sharing will connect after backend/deployment.");
            }

            menu.remove();
        };
    });
}



function toggleReelSave(reelId) {

    const reel =
        reels.find(function(item) {
            return item.id === reelId;
        });


    if (!reel) {
        return;
    }


    reel.saved = !reel.saved;


    // A video upload exists in both Home and Reels.
    // Keep both save states synchronized.
    const sameHomePost =
        posts.find(function(post) {
            return post.id === reelId;
        });


    if (sameHomePost) {
        sameHomePost.saved = reel.saved;
    }


    refreshSavedItems();

    displayReels();
    displayPosts();
    displaySavedPosts();
}



// ======================================================
// PROFILE IMAGE
// ======================================================

function openProfileImagePicker() {

    // Opens laptop folder / phone gallery.
    document
        .getElementById("profileImageInput")
        .click();
}


// When the user selects a profile image,
// show it immediately in the profile circle.
//
// There is still no backend here.
// Refreshing the page will remove the image.

document
    .getElementById("profileImageInput")
    .addEventListener("change", function() {

        const file = this.files[0];

        if (!file) {
            return;
        }


        const imageURL =
            URL.createObjectURL(file);


        const profilePhoto =
            document.getElementById("profilePhoto");


        // Remove "SD" text.
        profilePhoto.innerHTML = "";


        const image =
            document.createElement("img");

        image.src = imageURL;
        image.alt = "Profile photo";


        profilePhoto.appendChild(image);

        // Keep the small Reel avatar in sync with the profile photo.
        displayReels();
    });


// ======================================================
// FOLLOW / UNFOLLOW
// ======================================================

function toggleFollow(button, userId) {

    // userId is supplied by the search result.
    // This same structure can later be connected to:
    // POST /api/users/:userId/follow

    const user = connectoUsers.find(function(item) {
        return item.id === userId;
    });

    if (!user) {
        return;
    }

    user.isFollowing = !user.isFollowing;

    button.textContent =
        user.isFollowing ? "Following" : "Follow";

    followingCount =
        connectoUsers.filter(function(item) {
            return item.isFollowing;
        }).length;

    document
        .getElementById("followingCount")
        .textContent = followingCount;

    // Messages must always show ONLY followed users.
    renderMessageUsers();
}



// ======================================================
// MESSAGES
// ======================================================

function renderMessageUsers() {

    const messageUsers =
        document.getElementById("messageUsers");

    const noFollowedUsers =
        document.getElementById("noFollowedUsers");

    messageUsers.innerHTML = "";

    const followedUsers =
        connectoUsers.filter(function(user) {
            return user.isFollowing;
        });

    if (followedUsers.length === 0) {

        noFollowedUsers.classList.remove("hidden");
        return;
    }

    noFollowedUsers.classList.add("hidden");

    followedUsers.forEach(function(user) {

        const button =
            document.createElement("button");

        button.className = "messageUserButton";

        if (selectedChatUserId === user.id) {
            button.classList.add("activeChatUser");
        }

        button.onclick = function() {
            openChat(user.id);
        };

        button.innerHTML = `
            <span class="messageAvatar">
                ${escapeHTML(user.name.charAt(0).toUpperCase())}
            </span>

            <span class="messageUserText">
                <b>${escapeHTML(user.name)}</b>
                <span>@${escapeHTML(user.username)}</span>
            </span>
        `;

        messageUsers.appendChild(button);
    });
}



function openChat(userId) {

    const user = connectoUsers.find(function(item) {
        return item.id === userId && item.isFollowing;
    });

    if (!user) {
        return;
    }

    selectedChatUserId = userId;

    document
        .getElementById("chatHeader")
        .textContent = user.name;

    renderMessageUsers();
    renderConversation();
}



function renderConversation() {

    const chatMessages =
        document.getElementById("chatMessages");

    chatMessages.innerHTML = "";

    if (!selectedChatUserId) {

        chatMessages.innerHTML =
            '<p class="muted">Select a user to start chatting.</p>';

        return;
    }

    const messages =
        conversations[selectedChatUserId] || [];

    if (messages.length === 0) {

        chatMessages.innerHTML =
            '<p class="muted">No messages yet. Start the conversation.</p>';

        return;
    }

    messages.forEach(function(message) {

        const bubble =
            document.createElement("p");

        bubble.className =
            message.from === "me"
                ? "sentMessage"
                : "receivedMessage";

        bubble.textContent = message.text;

        chatMessages.appendChild(bubble);
    });

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}



function sendMessage() {

    if (!selectedChatUserId) {

        alert("Select a followed user first.");
        return;
    }

    const messageInput =
        document.getElementById("messageInput");

    const message =
        messageInput.value.trim();

    if (message === "") {
        return;
    }

    if (!conversations[selectedChatUserId]) {
        conversations[selectedChatUserId] = [];
    }

    conversations[selectedChatUserId].push({
        from: "me",
        text: message
    });

    messageInput.value = "";

    renderConversation();

    // Later replace the temporary push above with:
    // POST /api/messages
}



// ======================================================
// SEARCH
// ======================================================

function searchUsers() {

    const input =
        document.getElementById("searchInput");

    const searchText =
        input.value.trim().toLowerCase();

    const searchResults =
        document.getElementById("searchResults");

    searchResults.innerHTML = "";

    if (searchText === "") {
        return;
    }

    // Later replace this filter with your backend search:
    // GET /api/users/search?query=searchText

    const matchedUsers =
        connectoUsers.filter(function(user) {

            return (
                user.name.toLowerCase().includes(searchText) ||
                user.username.toLowerCase().includes(searchText)
            );
        });

    if (matchedUsers.length === 0) {

        searchResults.innerHTML =
            '<p class="muted">No Connecto account found.</p>';

        return;
    }

    matchedUsers.forEach(function(user) {

        const result =
            document.createElement("div");

        result.className = "searchUser";

        const info =
            document.createElement("div");

        info.className = "searchUserInfo";

        info.onclick = function() {
            openUserProfile(user.id);
        };

        info.innerHTML = `
            <span class="messageAvatar">
                ${escapeHTML(user.name.charAt(0).toUpperCase())}
            </span>

            <span class="searchUserText">
                <b>${escapeHTML(user.name)}</b>
                <span>@${escapeHTML(user.username)}</span>
            </span>
        `;

        const followButton =
            document.createElement("button");

        followButton.textContent =
            user.isFollowing ? "Following" : "Follow";

        followButton.onclick = function(event) {

            event.stopPropagation();

            toggleFollow(followButton, user.id);
        };

        result.appendChild(info);
        result.appendChild(followButton);

        searchResults.appendChild(result);
    });
}



function openUserProfile(userId) {

    const user = connectoUsers.find(function(item) {
        return item.id === userId;
    });

    if (!user) {
        return;
    }

    addRecentSearch(userId);

    const searchResults =
        document.getElementById("searchResults");

    searchResults.innerHTML = `
        <div class="userProfilePreview">

            <div class="userProfilePreviewTop">

                <span class="messageAvatar">
                    ${escapeHTML(user.name.charAt(0).toUpperCase())}
                </span>

                <div>
                    <h2>${escapeHTML(user.name)}</h2>
                    <p>@${escapeHTML(user.username)}</p>
                </div>

            </div>

            <p>${escapeHTML(user.bio)}</p>

        </div>
    `;

    // Later this function can navigate to:
    // /profile/:userId
    // after the backend provides the full user's profile.
}



function addRecentSearch(userId) {

    // Remove duplicate first.
    recentSearches =
        recentSearches.filter(function(id) {
            return id !== userId;
        });

    // Put newest search at the top.
    recentSearches.unshift(userId);

    // Keep only the latest 8.
    recentSearches =
        recentSearches.slice(0, 8);

    renderRecentSearches();
}



function renderRecentSearches() {

    const recentSearchList =
        document.getElementById("recentSearchList");

    const noRecentSearch =
        document.getElementById("noRecentSearch");

    recentSearchList.innerHTML = "";

    if (recentSearches.length === 0) {

        noRecentSearch.classList.remove("hidden");
        return;
    }

    noRecentSearch.classList.add("hidden");

    recentSearches.forEach(function(userId) {

        const user = connectoUsers.find(function(item) {
            return item.id === userId;
        });

        if (!user) {
            return;
        }

        const item =
            document.createElement("div");

        item.className = "recentSearchItem";

        item.onclick = function() {
            openUserProfile(user.id);
        };

        item.innerHTML = `
            <span class="messageAvatar">
                ${escapeHTML(user.name.charAt(0).toUpperCase())}
            </span>

            <span class="searchUserText">
                <b>${escapeHTML(user.name)}</b>
                <span>@${escapeHTML(user.username)}</span>
            </span>
        `;

        recentSearchList.appendChild(item);
    });
}



function clearRecentSearches() {

    recentSearches = [];
    renderRecentSearches();
}



// ======================================================
// SMALL SAFETY HELPER
// ======================================================

// Story usernames are inserted into HTML.
// This converts special HTML characters into plain text.

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}



// ======================================================
// FIRST PAGE DRAW
// ======================================================

displayPosts();
displayReels();
displayProfilePosts();


// EDIT PROFILE - frontend only until backend is connected

// ======================================================
// FIRST-TIME PROFILE / CREATE ACCOUNT
// ======================================================
// Backend/MongoDB is the only source of truth for profile data.
// The form sends name, username and bio to PATCH /api/v1/users/me.
// If the backend is not running yet, the request will simply fail;
// no profile data is stored in localStorage.

let backendProfileState = null;
let backendProfileChecked = false;

function backendModeEnabled() {
    return Boolean(window.ConnectoAPI && window.ConnectoAPI.USE_BACKEND);
}

function normalizeProfile(profile) {
    if (!profile) return null;

    const data = profile.data || profile.user || profile;

    return {
        name: data.name || "",
        username: (data.username || "").replace(/^@+/, ""),
        bio: data.bio || ""
    };
}

function profileIsComplete(profile) {
    const data = normalizeProfile(profile);
    return Boolean(data && data.name && data.username);
}

function getCreatedProfile() {
    return profileIsComplete(backendProfileState)
        ? normalizeProfile(backendProfileState)
        : null;
}

function hasCreatedProfile() {
    return Boolean(getCreatedProfile());
}

function refreshProfileSetupState() {
    const profileCard = document.getElementById("profileCard");
    const setupState = document.getElementById("profileSetupState");
    const profile = getCreatedProfile();

    if (!profileCard || !setupState) return;

    if (!profile) {
        setupState.classList.remove("hidden");
        profileCard.classList.add("hidden");
        return;
    }

    setupState.classList.add("hidden");
    profileCard.classList.remove("hidden");

    document.getElementById("profileDisplayName").textContent = profile.name;
    document.getElementById("profileDisplayUsername").textContent = "@" + profile.username;
    document.getElementById("profileDisplayBio").textContent = profile.bio || "No bio added yet.";

    const profilePhoto = document.getElementById("profilePhoto");
    if (profilePhoto && !profilePhoto.querySelector("img")) {
        const initials = profile.name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(function(part) { return part[0].toUpperCase(); })
            .join("");

        profilePhoto.textContent = initials || "U";
    }
}

function openCreateAccount() {
    const modal = document.getElementById("createAccountModal");
    if (!modal) return;

    clearCreateAccountErrors();
    modal.classList.remove("hidden");

    setTimeout(function() {
        const nameInput = document.getElementById("createAccountName");
        if (nameInput) nameInput.focus();
    }, 50);
}

function closeCreateAccount() {
    const modal = document.getElementById("createAccountModal");
    if (modal) modal.classList.add("hidden");
}

function clearCreateAccountErrors() {
    [
        "createAccountNameError",
        "createAccountUsernameError",
        "createAccountBioError"
    ].forEach(function(id) {
        const element = document.getElementById(id);
        if (element) element.textContent = "";
    });
}

async function createProfileAccount() {
    clearCreateAccountErrors();

    const name = document.getElementById("createAccountName").value.trim();
    const username = document.getElementById("createAccountUsername").value.trim().replace(/^@+/, "");
    const bio = document.getElementById("createAccountBio").value.trim();
    const submitButton = document.querySelector(".createAccountSubmit");

    let valid = true;

    if (!name) {
        document.getElementById("createAccountNameError").textContent = "Please enter your name.";
        valid = false;
    }

    if (!username) {
        document.getElementById("createAccountUsernameError").textContent = "Please choose a username.";
        valid = false;
    } else if (!/^[a-zA-Z0-9._]{3,30}$/.test(username)) {
        document.getElementById("createAccountUsernameError").textContent = "Use 3-30 letters, numbers, dots or underscores.";
        valid = false;
    }

    if (bio.length > 160) {
        document.getElementById("createAccountBioError").textContent = "Bio must be 160 characters or less.";
        valid = false;
    }

    if (!valid) return;

    const profile = {
        name: name,
        username: username.toLowerCase(),
        bio: bio
    };

    try {
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Creating...";
        }

        // Sends the object to your backend:
        // { name, username, bio }
        const response = await ConnectoAPI.UserAPI.createMyProfile(
            profile.name,
            profile.username,
            profile.bio
        );

        const returnedProfile = normalizeProfile(response);
        backendProfileState = profileIsComplete(returnedProfile)
            ? returnedProfile
            : profile;
        backendProfileChecked = true;

        refreshProfileSetupState();
        closeCreateAccount();

        if (typeof displayReels === "function") {
            displayReels();
        }
    } catch (error) {
        // 409 is commonly used when a username already exists.
        const message = error && error.message
            ? error.message
            : "Could not create your profile. Please try again.";

        document.getElementById("createAccountUsernameError").textContent = message;
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Create Account";
        }
    }
}

function initializeCreateAccountUI() {
    refreshProfileSetupState();

    const bio = document.getElementById("createAccountBio");
    const count = document.getElementById("createAccountBioCount");
    const nameInput = document.getElementById("createAccountName");
    const avatar = document.getElementById("createAccountAvatarPreview");

    if (bio && count) {
        bio.addEventListener("input", function() {
            count.textContent = bio.value.length + "/160";
        });
    }

    if (nameInput && avatar) {
        nameInput.addEventListener("input", function() {
            const initials = nameInput.value
                .trim()
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(function(part) { return part[0].toUpperCase(); })
                .join("");

            avatar.textContent = initials || "";

            if (!initials) {
                avatar.innerHTML = '<i class="fa-regular fa-user"></i>';
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", initializeCreateAccountUI);


function openEditProfile() {
    const name = document.getElementById("profileDisplayName");
    const bio = document.getElementById("profileDisplayBio");
    document.getElementById("editProfileName").value = name.textContent.trim();
    document.getElementById("editProfileBio").value = bio.textContent.trim();
    document.getElementById("editProfileModal").classList.remove("hidden");
}

function closeEditProfile() {
    document.getElementById("editProfileModal").classList.add("hidden");
}

function saveProfileChanges() {
    const name = document.getElementById("editProfileName").value.trim();
    const bio = document.getElementById("editProfileBio").value.trim();
    if (!name) { alert("Name cannot be empty."); return; }
    document.getElementById("profileDisplayName").textContent = name;
    document.getElementById("profileDisplayBio").textContent = bio;

    // Profile persistence is handled by the backend/MongoDB only.
    // The existing edit-profile API can be connected when that controller is ready.
    closeEditProfile();
}


// ======================================================
// BACKEND READY HELPERS
// ======================================================
//
// Connecto is configured to use your real backend.
// Profile/account persistence is never stored in localStorage.
//
// This keeps frontend and backend responsibilities clear.
// ======================================================


async function loadConnectoFromBackend() {

    if (!window.ConnectoAPI || !window.ConnectoAPI.USE_BACKEND) {
        return;
    }

    try {

        const [
            postResponse,
            reelResponse,
            profileResponse,
            storyResponse
        ] = await Promise.all([
            ConnectoAPI.PostAPI.getHomePosts(),
            ConnectoAPI.PostAPI.getReels(),
            ConnectoAPI.UserAPI.getMyProfile(),
            ConnectoAPI.StoryAPI.getStories()
        ]);


        // Recommended backend response format:
        //
        // {
        //   success: true,
        //   data: [...]
        // }
        //
        // The fallback below also supports returning arrays directly.

        posts =
            postResponse.data ||
            postResponse.posts ||
            postResponse ||
            [];

        reels =
            reelResponse.data ||
            reelResponse.reels ||
            reelResponse ||
            [];


        const profile =
            profileResponse.data ||
            profileResponse.user ||
            profileResponse;

        // The backend tells the frontend whether this logged-in user
        // has completed the Connecto profile setup. A profile is treated
        // as complete when both name and username exist.
        backendProfileState = profile || null;
        backendProfileChecked = true;
        refreshProfileSetupState();


        if (profile) {

            const nameElement =
                document.getElementById("profileDisplayName");

            const bioElement =
                document.getElementById("profileDisplayBio");

            const followersElement =
                document.getElementById("followersCount");

            const followingElement =
                document.getElementById("followingCount");


            if (nameElement && profile.name) {
                nameElement.textContent =
                    profile.name;
            }

            if (bioElement) {
                bioElement.textContent =
                    profile.bio || "";
            }

            if (
                followersElement &&
                profile.followersCount !== undefined
            ) {
                followersElement.textContent =
                    profile.followersCount;
            }

            if (
                followingElement &&
                profile.followingCount !== undefined
            ) {
                followingElement.textContent =
                    profile.followingCount;
            }
        }


        // Your backend may return grouped story users.
        if (storyResponse.data) {
            storyUsers =
                storyResponse.data;
        }


        displayPosts();
        displayReels();
        displayProfilePosts();
        displayStories();


    } catch (error) {

        console.error(
            "Connecto backend loading error:",
            error
        );
    }
}



// Call this only when backend mode is ON.
loadConnectoFromBackend();


// ======================================================
// REELS — one mouse-wheel gesture moves exactly one reel.
// This changes only Reel scrolling behavior.
// ======================================================
(function setupOneScrollOneReel() {
    const reelsList = document.getElementById("reelsList");

    if (!reelsList || reelsList.dataset.oneScrollSnapReady === "true") {
        return;
    }

    reelsList.dataset.oneScrollSnapReady = "true";

    let reelScrollLocked = false;

    reelsList.addEventListener("wheel", function (event) {
        const reelBoxes = Array.from(reelsList.querySelectorAll(".reelBox"));

        if (reelBoxes.length <= 1 || Math.abs(event.deltaY) < 4) {
            return;
        }

        event.preventDefault();

        if (reelScrollLocked) {
            return;
        }

        const currentScrollTop = reelsList.scrollTop;
        let currentIndex = 0;
        let smallestDistance = Infinity;

        reelBoxes.forEach(function (reelBox, index) {
            const distance = Math.abs(reelBox.offsetTop - currentScrollTop);

            if (distance < smallestDistance) {
                smallestDistance = distance;
                currentIndex = index;
            }
        });

        const direction = event.deltaY > 0 ? 1 : -1;
        const nextIndex = Math.max(
            0,
            Math.min(reelBoxes.length - 1, currentIndex + direction)
        );

        if (nextIndex === currentIndex) {
            return;
        }

        reelScrollLocked = true;

        reelsList.scrollTo({
            top: reelBoxes[nextIndex].offsetTop,
            behavior: "smooth"
        });

        window.setTimeout(function () {
            reelScrollLocked = false;
        }, 650);
    }, { passive: false });
})();
