This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Docker

Build and start the production container:

```bash
docker compose up --build
```

The application will be available at [http://localhost:3000](http://localhost:3000).

The Compose setup also starts PostgreSQL on port `5432`.

- Database: `pd_semoga_jaya`
- User: `postgres`
- Password: `postgres`
- Container connection URL: `postgresql://postgres:postgres@database:5432/pd_semoga_jaya`
- Host connection URL: `postgresql://postgres:postgres@localhost:5432/pd_semoga_jaya`

To stop the container:

```bash
docker compose down
```

## Seeding barang ke Neon

Dengan `DATABASE_URL` Neon yang benar di `.env`, jalankan dari folder proyek:

```bash
node prisma/seed-barang-neon.mjs
```

Seed menambahkan 80 barang baru tanpa memperbarui atau menghapus data lama. Seed dapat dijalankan kembali; barang dengan ID seed yang sama akan dilewati. Proses dibatalkan jika host bukan Neon, jumlah tabel `public` bukan 12, atau ID/nama barang bertabrakan.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
