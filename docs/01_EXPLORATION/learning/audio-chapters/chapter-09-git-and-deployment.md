# Chapter 9: Git and Deployment

**Duration:** ~15 minutes  
**Topic:** Managing code across v0, Cursor, and GitHub. Understanding Git prevents lost work and merge conflicts.

---

## Introduction

Welcome to Week 9 of the Camino Builder learning curriculum. This week, we're focusing on Git and deployment - the essential skills that let you ship your code to production with confidence. You're already managing code across v0, Cursor, and GitHub, and understanding how these tools work together will prevent lost work, merge conflicts, and deployment disasters.

By the end of this chapter, you'll understand the Git mental model, know the essential commands, and be comfortable with your branch strategy and deployment workflow on Vercel.

## The Git Mental Model

Git is a version control system - think of it as a time machine for your code. Every time you make a commit, you're creating a snapshot of your entire project at that moment in time. If something breaks, you can always go back to a previous snapshot.

Understanding Git requires grasping three core concepts: the working directory, the staging area, and commits.

Your **working directory** is the current state of your files - what you see in your code editor right now. When you edit files in Cursor or v0, you're making changes in your working directory.

The **staging area** is like a preparation zone. When you run `git add`, you're telling Git which changes you want to include in your next commit. This lets you be selective - maybe you fixed two bugs but want to commit them separately for clarity.

A **commit** is a permanent snapshot. When you run `git commit`, all the changes in your staging area become a commit with a unique identifier and a message describing what you changed. Commits are immutable - once created, they can't be changed, only referenced or rolled back.

Here's the typical workflow:

1. You edit files in your working directory - maybe you're building a new signal card component.
2. You stage the changes with `git add components/new-signal-card.tsx` - this tells Git you want to include this file.
3. You commit with `git commit -m "Add new signal card component"` - this creates a permanent snapshot.
4. You push with `git push` - this sends your commit to GitHub so it's backed up and visible to others.

This workflow happens whether you're working in v0, Cursor, or directly on GitHub. The tools are different, but the underlying Git operations are the same.

## Essential Git Commands

Let's walk through the commands you'll use every day. Don't worry about memorizing them - you'll internalize them through practice.

`git status` shows you what's changed. Run this frequently to understand the current state. You'll see which files are modified, which are staged, and which branch you're on.

`git add` stages files for the next commit. You can stage a specific file with `git add filename` or stage everything with `git add .` - the dot means "all changes in the current directory and below."

`git commit -m "message"` creates a commit with a message. Write clear messages that explain what changed and why. "Fix bug" is vague. "Fix null pointer error in signal calculation" is helpful.

`git push` sends your local commits to GitHub. If you're on a branch called `feature-upload`, running `git push` uploads your commits so they're backed up and visible on GitHub.

`git pull` downloads commits from GitHub to your local machine. If someone else made changes, or if you made changes in v0 and want to sync them to Cursor, you pull to get the latest code.

`git checkout -b branch-name` creates a new branch and switches to it. Branches let you work on features without affecting the main codebase. More on this in a moment.

`git merge branch-name` combines changes from one branch into another. If you built a feature on `feature-signals`, you'd merge it into `main` when it's ready to deploy.

`git log --oneline --graph` shows your commit history as a visual graph. This is incredibly useful for understanding how branches have evolved over time.

## Branch Strategy: Feature Branches and Main

In Camino, you're using a branch strategy that keeps main stable and deploys feature branches for testing. Let's break down why this matters.

The `main` branch is your production code. Whatever is on main is live at your production URL. Because of this, you never commit directly to main. Instead, you create feature branches.

A **feature branch** is a separate timeline where you build a new feature. Let's say you're adding the 3-question upload flow. You'd create a branch called `feature-upload-questions`, build the feature there, test it on a preview deployment, and only merge it to main once it's working.

Here's the workflow:

1. Start on main: `git checkout main` and `git pull` to get the latest code.
2. Create a feature branch: `git checkout -b feature-upload-questions`.
3. Build your feature. Make commits as you go: `git add .` then `git commit -m "Add upload questions UI"`.
4. Push to GitHub: `git push origin feature-upload-questions`.
5. Vercel automatically creates a preview deployment so you can test.
6. Once tested, create a pull request on GitHub to merge into main.
7. After the pull request is approved and merged, Vercel deploys to production.

This strategy prevents broken code from reaching production. If you discover a bug on your feature branch, you fix it there. Main stays clean.

In v0, you'll notice branches like `v0/nktran-9745`. v0 creates these automatically when you work on a project. These are feature branches too - v0 uses them to keep your experimental work separate from main.

## Merge Conflicts and How to Resolve Them

A **merge conflict** happens when two people (or you in two places) edit the same part of the same file differently. Git doesn't know which version to keep, so it asks you to decide.

Here's a typical scenario: You're working on the signals page in Cursor, improving the filter logic. Meanwhile, someone else (or you in v0) also edits the signals page to add a new button. When you try to merge, Git sees that the same lines changed in both places and can't automatically combine them.

Git marks the conflict in your file like this:

\`\`\`
<<<<<<< HEAD
const filteredSignals = signals.filter(s => s.status === 'active')
=======
const filteredSignals = signals.filter(s => s.category === filterCategory)
>>>>>>> feature-add-button
\`\`\`

The section between `<<<<<<< HEAD` and `=======` is your version. The section between `=======` and `>>>>>>> feature-add-button` is the incoming version.

To resolve it, you edit the file to keep what you want:

\`\`\`
const filteredSignals = signals.filter(s => 
  s.status === 'active' && s.category === filterCategory
)
\`\`\`

Then you remove the conflict markers, save the file, stage it with `git add`, and complete the merge with `git commit`.

The best way to avoid conflicts is to work on different files or different parts of the same file. Pull from main frequently so you're working with the latest code. And communicate with collaborators about what you're each working on.

## .gitignore: What Not to Commit

Your repository has a `.gitignore` file that tells Git which files to ignore. This is critical for security and performance.

The most important thing in `.gitignore` is `.env.local` - this file contains secret keys like your Supabase service role key and database passwords. If you commit it to GitHub, anyone with access to your repository can steal your keys and access your database. Always keep environment files out of version control.

Also ignored: `node_modules` - this folder contains thousands of dependency files. It's huge and unnecessary to commit because anyone can regenerate it by running `npm install`. Your repository only stores `package.json` and `package-lock.json`, which define what dependencies you need.

Other common ignores: `.next` (Next.js build output), `.vercel` (Vercel configuration), and `dist` (build artifacts). These are all generated files that can be recreated.

If you ever accidentally commit a secret, don't just delete it and commit again - it's still in the Git history. You need to rotate the secret (generate a new one and update it everywhere) and optionally use `git filter-branch` to remove it from history.

## Vercel Deployment: From Push to Production

Vercel is your deployment platform - it's where your app runs live on the internet. Understanding how it works helps you ship faster and debug deployment issues.

When you push a commit to the `main` branch on GitHub, Vercel detects it automatically and triggers a production deployment. Here's what happens:

1. Vercel clones your repository at the latest commit on main.
2. It installs dependencies by running `npm install`.
3. It builds your Next.js app by running `npm run build`. This compiles your TypeScript, bundles your components, and generates static pages.
4. It deploys the built app to Vercel's edge network - servers distributed globally for fast access.
5. Your production URL (like `camino.vercel.app`) now serves the new version.

The entire process takes about 2-3 minutes. You can watch it in real-time on the Vercel dashboard.

**Preview deployments** are one of Vercel's most powerful features. Every time you push to a non-main branch (like `feature-upload-questions`), Vercel creates a preview deployment at a unique URL. This lets you test your feature in a production-like environment before merging to main. You can share the preview URL with others to get feedback.

If something goes wrong in production, you can **rollback** to a previous deployment with one click in the Vercel dashboard. Find the deployment that was working, click "Promote to Production," and Vercel instantly switches back. This is a lifesaver when you discover a critical bug after deploying.

## Environment Variables on Vercel

Your app relies on environment variables - things like `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `NEON_DATABASE_URL`. These are configured in the Vercel dashboard under your project settings.

When Vercel builds your app, it injects these variables so your code can access them via `process.env.SUPABASE_URL`. This is why you never commit `.env.local` - the secrets live in Vercel's secure storage, not in your repository.

If you add a new environment variable, remember to add it both to your local `.env.local` (for local development) and to the Vercel dashboard (for production). If a variable is missing in production, you'll see errors like "Cannot read SUPABASE_URL of undefined."

Vercel also supports preview environment variables - different values for preview deployments versus production. This is useful if you want previews to use a staging database instead of the production database.

## Working Across v0, Cursor, and GitHub

You're working in three environments: v0 for rapid prototyping, Cursor for deep coding sessions, and GitHub as the source of truth. Here's how to keep them in sync.

**v0 workflow:**
- v0 creates a branch like `v0/nktran-9745` when you start working.
- All changes you make in v0 are automatically committed and pushed to this branch.
- When you're happy with the changes, you can either download the code and manually merge it, or use v0's GitHub integration to create a pull request.
- Once merged to main, the changes deploy to production.

**Cursor workflow:**
- Clone your repository from GitHub: `git clone https://github.com/yourusername/camino.git`
- Create a feature branch: `git checkout -b feature-name`
- Make changes in Cursor, commit frequently: `git add .` then `git commit -m "message"`
- Push your branch: `git push origin feature-name`
- Create a pull request on GitHub, test on the preview deployment, merge to main.

**Syncing between v0 and Cursor:**
- If you make changes in v0 and want to continue in Cursor, pull the v0 branch: `git checkout v0/nktran-9745` then `git pull`.
- If you make changes in Cursor and want to see them in v0, push your branch to GitHub and v0 can pull it.

The key is to always push your work to GitHub. GitHub is the single source of truth - both v0 and Cursor sync with it.

## Git Log: Understanding Your Project History

Your project's Git history is a valuable resource. Running `git log --oneline --graph` shows a visual representation of every commit, when it was made, and how branches have evolved.

Each commit has a unique identifier called a SHA - a long string like `a4f2b9c`. You can reference any commit by its SHA. For example, `git checkout a4f2b9c` takes you back to that exact state of the codebase. This is incredibly useful for debugging: "The bug wasn't there last week, let me check out last week's commit and confirm."

The log also shows who made each commit and when. If you're wondering when a particular feature was added, `git log --grep="upload"` searches commit messages for "upload."

You can also use `git blame filename` to see who last edited each line of a file and when. This isn't about blame in the negative sense - it's about understanding the history of the code. If you see a confusing line, `git blame` tells you which commit introduced it, and you can read the commit message for context.

## Practical Exercise: Your First Feature Branch

Let's put this all together with a practical exercise. You're going to create a feature branch, make a small change, test it on a preview deployment, and merge it to main.

1. **Start on main:** Open your terminal in Cursor and run `git checkout main` then `git pull` to ensure you're up to date.

2. **Create a feature branch:** Run `git checkout -b feature-improve-signal-card`. This creates a new branch and switches to it.

3. **Make a small change:** Open `components/signal-accordion-card.tsx` and add a comment at the top: `// Improved version`. Save the file.

4. **Stage and commit:** Run `git add components/signal-accordion-card.tsx` then `git commit -m "Add comment to signal card"`.

5. **Push to GitHub:** Run `git push origin feature-improve-signal-card`. This uploads your branch to GitHub.

6. **Check Vercel:** Go to the Vercel dashboard. You'll see a new preview deployment for your branch. Click the URL to see your change live.

7. **Create a pull request:** On GitHub, you'll see a prompt to create a pull request for your new branch. Click it, add a description, and create the PR.

8. **Merge to main:** If everything looks good on the preview, merge the pull request. Vercel will automatically deploy to production.

9. **Clean up:** After merging, delete the feature branch on GitHub and locally with `git branch -d feature-improve-signal-card`.

Congratulations - you've completed the full workflow. This is the process you'll use for every feature you ship.

## Common Git Mistakes and How to Fix Them

**Mistake 1: Committed to main by accident**

If you haven't pushed yet, you can move the commit to a new branch:
\`\`\`
git branch feature-oops
git reset --hard HEAD~1
git checkout feature-oops
\`\`\`

This creates a branch at your current commit, resets main to the previous commit, and switches to the new branch.

**Mistake 2: Want to undo the last commit**

If you committed but haven't pushed, run `git reset --soft HEAD~1`. This undoes the commit but keeps your changes staged so you can re-commit with a better message.

**Mistake 3: Made changes on main instead of a feature branch**

If you haven't committed yet, stash your changes with `git stash`, create a feature branch with `git checkout -b feature-name`, then apply your changes back with `git stash pop`.

**Mistake 4: Need to pull but have uncommitted changes**

Git won't let you pull if you have uncommitted changes that would conflict. Either commit your changes first, or stash them with `git stash`, pull with `git pull`, then reapply with `git stash pop`.

## Deployment Checklist

Before every deploy to production, run through this checklist:

- [ ] All tests pass (once you have tests)
- [ ] Preview deployment looks correct
- [ ] Database migrations are run (if applicable)
- [ ] Environment variables are up to date on Vercel
- [ ] No console.log statements left in the code
- [ ] No secrets committed to the repository
- [ ] All dependencies are installed (package.json is up to date)
- [ ] Build completes without errors locally (`npm run build`)

If something goes wrong in production, don't panic. Check the Vercel logs first - they'll show you exactly what error occurred. If it's a bug in your code, roll back to the previous deployment while you fix it. If it's a missing environment variable, add it in the Vercel dashboard and redeploy.

## Next Steps

This week, practice the Git workflow. Create a feature branch for every small change, even if it's just updating a comment. Get comfortable with the commands. Run `git status` frequently to build intuition.

Next week, we'll focus on error handling and debugging - how to make your app fail gracefully when things go wrong, and how to track down bugs systematically. You'll learn to use browser DevTools, structured logging, and the Cursor debugger to diagnose issues in production.

For now, remember: Git is your safety net. Commit often, push regularly, and always work on feature branches. With Git, you can always go back, so you can move forward fearlessly.
