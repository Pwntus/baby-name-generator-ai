# [BabyNameGeneratorAI.com](https://babynamegeneratorai.com)

## How it works

This app is powered by:

🚀 [Replicate](https://replicate.com/), a platform for running machine learning models in the cloud.

✂ [Llama 3](https://replicate.com/meta/meta-llama-3-70b-instruct), A 70 billion parameter language model from Meta, fine tuned for chat completions.

▲ [Vercel](https://vercel.com/), a platform for running web apps.

⚡️ Nuxt.js [server-side API handlers](server/api), for talking to the Replicate API.

📦 [NuxtUI](https://ui.nuxt.com/components/card), a UI Library for
Modern Web Apps.

## Run it yourself

You need a [Replicate API token](https://replicate.com/account). Copy the contents of [.example.env](.example.env) into a new file in the root of your directory called `.env` and insert the API key there, like this:

```bash
# Get your Replicate API token at https://www.replicate.com/account
NUXT_REPLICATE_API_TOKEN="<put your token here>"
```

Then, install the dependencies and run the local development server:

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your web browser. Done!
