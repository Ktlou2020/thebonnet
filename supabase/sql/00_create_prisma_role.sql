-- Run this in the Supabase SQL editor as the postgres superuser.
-- It creates a dedicated Prisma role with privileges on the public schema.
-- Based on Supabase's Prisma guide, which recommends a custom user for Prisma.

create user prisma with password 'CHANGE_ME_SUPABASE_PASSWORD' bypassrls createdb;
grant prisma to postgres;

grant usage on schema public to prisma;
grant create on schema public to prisma;
grant all on all tables in schema public to prisma;
grant all on all routines in schema public to prisma;
grant all on all sequences in schema public to prisma;

alter default privileges for role postgres in schema public grant all on tables to prisma;
alter default privileges for role postgres in schema public grant all on routines to prisma;
alter default privileges for role postgres in schema public grant all on sequences to prisma;
