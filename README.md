# HubForge

HubForge is a full-stack repository workspace for creating project repositories, tracking issues, and syncing versioned files to Amazon S3. It includes a SaaS-style React interface plus a command-line workflow for staging, committing, pushing, pulling, and restoring files.

## Features

- JWT sign-up, sign-in, and protected user profiles
- Public landing page and private developer workspace
- Public and private repositories with owner-only mutation controls
- Repository search, visibility control, and deletion
- Issue creation, closing, and reopening
- CLI-driven S3 file snapshots with commit IDs
- Synced file list with version counts and download action
- Server-side protection for private repositories, files, issues, and profiles

## Architecture

```text
React + Vite frontend
        │ HTTP + Bearer JWT
        ▼
Express API ───────── MongoDB
        │
        ▼
Amazon S3
repositories/<repository-name>/commits/<commit-id>/<file>
```

The browser does not access S3 directly. The API checks the signed-in user and repository visibility before listing or downloading a file.

## Stack

- Frontend: React 19, Vite, React Router
- Backend: Node.js, Express 5, Mongoose, MongoDB
- Authentication: JWT and bcrypt
- Storage: Amazon S3 with AWS SDK for JavaScript v3
- CLI: yargs and UUID

## Project structure

```text
HubForge/
├── frontend/                 # Vite React application
├── backend/                  # Express API and HubForge CLI
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── config/
└── .hub/                     # Generated local CLI metadata and commits
```

## Prerequisites

- Node.js 20+
- MongoDB Atlas or local MongoDB
- AWS account and an S3 bucket
- IAM credentials allowed to list, read, and write objects in the bucket

## Local setup

```powershell
git clone https://github.com/techmuskan/HubForge.git
cd HubForge

cd backend
npm install

cd ..\frontend
npm install
```

### Backend environment

Create `backend/.env`. Never commit it.

```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/hubforge
JWT_SECRET_KEY=replace-with-a-long-random-secret

AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=ap-south-1
S3_BUCKET=your-s3-bucket-name
```

### Frontend environment

For local work the frontend defaults to `http://localhost:3000`. To override it, add `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### Run locally

Terminal 1:

```powershell
cd backend
node index.js start
```

Terminal 2:

```powershell
cd frontend
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`.

## Web workflow

1. Create an account from the landing page.
2. Create a repository, for example `myProject`.
3. Open its repository page to manage issues and view synced files.
4. Link a local folder to exactly the same repository name with the CLI.

The repository name is the CLI storage key, so it must match the web-created name, including capitalization.

## CLI file-sync workflow

Run these commands from the folder you want to track. For the full project:

```powershell
cd C:\path\to\HubForge
```

Link the folder to `myProject`:

```powershell
node .\backend\index.js init myProject
```

Stage, commit, and upload a file:

```powershell
node .\backend\index.js add .\backend\hello.txt
node .\backend\index.js commit "Add hello file"
node .\backend\index.js push
```

S3 objects are stored like this:

```text
repositories/myProject/commits/<commit-id>/hello.txt
```

The UI groups snapshots into `hello.txt · 2 versions` and lets the user download the current version.

Other commands:

```powershell
node .\backend\index.js pull
node .\backend\index.js revert <commit-id>
```

> The CLI currently stages individual files. Recursive folder staging is not implemented yet.

## API overview

All endpoints except sign-up and login need this header:

```http
Authorization: Bearer <jwt-token>
```

| Area | Main endpoints |
| --- | --- |
| Auth | `POST /signup`, `POST /login` |
| Profile | `GET /userProfile/:id`, `PUT /updateProfile/:id` |
| Repositories | `POST /repo/create`, `GET /repo/all`, `GET /repo/:id` |
| Files | `GET /repo/:id/files`, `GET /repo/:id/file?path=<path>&commit=<id>` |
| Issues | `POST /issue/create`, `GET /issue/all/:repositoryId`, `PUT /issue/update/:id` |

## Deployment

Deploy the backend and frontend separately.

### Backend

Deploy `backend/` to a Node-capable platform such as Render, Railway, Fly.io, or AWS. Add all variables from `backend/.env` in the host’s environment settings. Confirm this responds after deploy:

```text
https://your-api-domain/
```

Expected response: `WELCOME!`.

Before production, restrict CORS in `backend/index.js` to the deployed frontend domain:

```js
app.use(cors({ origin: "https://your-app.vercel.app" }));
```

### Frontend

Deploy `frontend/` to Vercel or a static host and set:

```env
VITE_API_URL=https://your-api-domain
```

For Vercel:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Redeploy after setting `VITE_API_URL`; Vite injects it during build.

## Validation

```powershell
cd frontend
npm run lint
npm run build

cd ..\backend
node --check index.js
node --check controllers\repositoryController.js
```

## Notes

- Never commit `.env`, `node_modules`, `.hub`, or build output.
- The backend must run while using the local frontend.
- S3 needs outbound HTTPS access on port 443.
- If AWS returns `AccessDenied`, ensure IAM permits `s3:ListBucket`, `s3:GetObject`, and `s3:PutObject` for the configured bucket.
