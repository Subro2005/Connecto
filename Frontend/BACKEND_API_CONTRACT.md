# Connecto Frontend -> Backend API Contract

Base URL expected by the frontend:

http://localhost:8000/api/v1

The frontend sends cookies using:

credentials: "include"

So if you use JWT cookies, enable CORS credentials on the backend.

---

## AUTH

### Register
POST /auth/register

JSON body:
{
  "email": "example@email.com",
  "password": "123456"
}

The authentication user can exist before the Connecto profile is completed.
For this flow, `name`, `username`, and `bio` should NOT be required during registration.

### Login
POST /auth/login

JSON body:
{
  "identifier": "subrata",
  "password": "123456",
  "rememberMe": true
}

Recommended response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {}
  }
}

Set your access token as an httpOnly cookie.

### Logout
POST /auth/logout

### Forgot password
POST /auth/forgot-password

JSON:
{
  "email": "example@email.com"
}

---

## USER / PROFILE

GET /users/me

PATCH /users/me

This endpoint handles both first-time profile setup and later profile editing.

First-time profile setup JSON:
{
  "name": "Subrata Das",
  "username": "subrata",
  "bio": "Backend developer"
}

Later edit can send only changed fields, for example:
{
  "name": "New Name",
  "bio": "New bio"
}

Recommended GET /users/me response includes the current user. If `name` or `username` is empty, the frontend treats the Connecto profile as not created yet and shows the Create Account UI.

PATCH /users/me/profile-image

multipart/form-data field:
profileImage

GET /users/search?query=rahul

GET /users/:userId

POST /users/:userId/follow

DELETE /users/:userId/follow

GET /users/me/saved

---

## POSTS + REELS

Recommended database design:
Use ONE Post model for both images and videos.

Post fields can include:
owner
mediaUrl
mediaPublicId
mediaType: "image" | "video"
caption
likes
timestamps

### Create post
POST /posts

multipart/form-data:
media = image/video file
caption = text

Multer:
upload.single("media")

If mediaType is image:
- show in Home

If mediaType is video:
- show in Home
- also show in Reels

### Home
GET /posts

### Reels
GET /posts?mediaType=video

### Like
POST /posts/:postId/like

### Add comment
POST /posts/:postId/comments

JSON:
{
  "text": "Nice post"
}

### Get comments
GET /posts/:postId/comments

### Save / unsave
POST /posts/:postId/save

---

## STORIES

POST /stories

multipart/form-data:
story
overlayText
caption

Multer:
upload.single("story")

GET /stories

---

## MESSAGES

GET /messages/users

Return users the logged-in user follows.

GET /messages/:userId

POST /messages

JSON:
{
  "receiverId": "...",
  "text": "Hello"
}

---

## CORS

During local development:

Frontend:
http://127.0.0.1:5500
or
http://localhost:5500

Backend:
http://localhost:8000

Example backend CORS setup:

app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    credentials: true
}));

---

## IMPORTANT

In api.js you will see:

const USE_BACKEND = false;

Keep it false while you are still building/testing the backend.

When the required endpoints are ready, change it to:

const USE_BACKEND = true;

The login/register pages always call the backend because authentication cannot be meaningfully faked for production integration.


## First-time profile setup
The current frontend demo stores the first-time profile form in `localStorage` under `connectoProfile`.
When you connect the backend, replace that localStorage save with a profile create/update request (for example `PATCH /users/me`) using `name`, `username`, and `bio`.


## NEW USER PROFILE FLOW

1. POST /auth/register with email + password.
2. POST /auth/login and set the JWT httpOnly cookie.
3. GET /users/me when Connecto opens.
4. If the logged-in user has no name/username yet, Profile shows Create Account.
5. Create Account sends PATCH /users/me with name + username + bio.
6. Backend validates username uniqueness and updates the SAME logged-in User document.
7. Backend returns the updated user.
8. Frontend immediately shows the completed profile.

Important: profile setup does not create a second User document. It updates the authenticated user identified by the JWT cookie.
