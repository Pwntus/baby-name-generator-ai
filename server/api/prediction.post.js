import Replicate from 'replicate'

// https://replicate.com/meta/meta-llama-3-70b-instruct
const MODEL_NAME = 'meta/meta-llama-3-70b-instruct'

export default defineEventHandler(async (event) => {
  try {
    let { gender, names } = await readBody(event)

    // Validate
    if (gender !== 'male' && gender !== 'female') gender = ''
    if (names.length < 2) throw new Error('Invalid input.')

    // Init Replicate
    const { replicateApiToken } = useRuntimeConfig(event)
    const replicate = new Replicate({ auth: replicateApiToken })

    console.log(`--- log (api/prediction): creating prediction`)

    // Create prediction
    const prediction = await replicate.predictions.create({
      model: MODEL_NAME,
      stream: true,
      input: {
        max_tokens: 128,
        min_tokens: -1,
        temperature: 1,
        top_p: 0.9,
        top_k: 0,
        stop_sequences: '<|end_of_text|>,<|eot_id|>',
        length_penalty: 1,
        presence_penalty: 1.15,
        seed: 1337,
        system_prompt: 'You are a name suggester machine.',
        prompt: `Make a new ${gender}name suggestion based on the following names: ${names.join(
          ', '
        )}. You only reply with the new name. The name can be multiple words. You output the explanation on a new line.`,
        prompt_template: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

        {system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>
        
        {prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>
`
      }
    })

    const stream = prediction?.urls?.stream

    if (!stream) {
      throw new Error('Failed to create prediciton.')
    }

    return { data: { url_stream: prediction.urls.stream } }
  } catch (e) {
    console.log('--- error (api/prediction): ', e)

    return {
      error: e.message
    }
  }
})
