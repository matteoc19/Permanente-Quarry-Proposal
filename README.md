# Permanente Quarry — Three Passes

An interactive research artifact: three passes of analysis on the post-extraction future of the Permanente Quarry, Santa Clara County, CA.

**Live:** [permanente-quarry-proposal.vercel.app](permanente-quarry-proposal.vercel.app)

## What this is

A 198-acre limestone quarry closed in 2023, facing a 42-million-cubic-yard reclamation obligation over forty years. This artifact traces three passes of research at increasing depth — generating candidate successor uses, building out the strongest scenario, then testing that scenario against governing statute and the operator's actual commercial position.

The method extracted from this research is a Claude skill: [post-extraction-site-use](https://github.com/matteoc19/post-extraction-site-use).

## Stack

React + Vite, single-page component, no external UI libraries. Built with Claude (Anthropic); site selection, judgment, and editorial direction by Matteo Calafiura-Soleri.

## Local development

```bash
npm install
npm run dev
```

## Deploy

Deployed on Vercel. Framework preset: Vite. No environment variables or special configuration required — root directory is the repo root.
