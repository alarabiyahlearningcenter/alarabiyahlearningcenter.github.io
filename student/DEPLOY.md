# 🚀 Deployment Guide

## Supabase Secrets
supabase secrets set LIVEKIT_API_KEY=xxx
supabase secrets set LIVEKIT_API_SECRET=xxx
supabase secrets set LIVEKIT_WS_URL=wss://xxx.livekit.cloud
supabase secrets set OPENAI_API_KEY=sk-xxx

## Deploy Functions
supabase functions deploy livekit-token
supabase functions deploy ai-summary
supabase functions deploy send-class-summary

## Storage Buckets
- assignments (public read, auth write)
- Folders: recordings/, materials/, submissions/, chat/

## Host on Vercel
vercel --prod
