<template lang="pug">
#app.relative.overflow-x-hidden
  img.absolute.top-0.max-w-none(
    class="left-1/2 -ml-[39rem] w-[113rem] -z-10"
    src="/beams-basic.png"
  )
  .pt-8.pb-8.px-4.relative(
    class="sm:pb-16 md:pb-24 sm:px-6 lg:px-8"
  )
    .mx-auto.gap-4.flex.flex-row.max-w-5xl.items-center
      //- img.max-h-8(src="/img/logo.svg")
      .text-base(
        class="md:text-2xl"
      ) Baby Name Generator AI
      .grow
      u-button(
        to="https://github.com/Pwntus/baby-name-generator-ai"
        target="_blank"
        size="lg"
        icon="i-heroicons-star"
        variant="ghost"
      ) Star on GitHub

  .mx-auto.mb-8.gap-16.flex.flex-col.max-w-4xl(
    class="sm:gap-y-24 sm:mb-16 md:mb-24"
  )
    .text-center.relative
      .mb-10
        u-badge.px-3(
          label="Get baby name suggestions based on your names"
          size="md"
          variant="outline"
        )
      h1.text-5xl.font-bold.tracking-tight.text-gray-900(
        class="dark:text-white sm:text-7xl"
      )
        | Generate a 
        span.text-primary Baby Name 
        br(class="hidden lg:block")
        | With AI.
  
  .mx-auto.mb-8.px-4.max-w-xl(
    class="sm:mb-16 md:mb-24 sm:px-6 lg:px-8"
  )
    .space-y-8
      u-form-group(
        label="First name"
        name="first_name"
        size="xl"
      )
        u-input(
          v-model="names[0]"
          icon="i-heroicons-tag"
          size="xl"
        )
      u-form-group(
        label="Second name"
        name="second_name"
        size="xl"
      )
        u-input(
          v-model="names[1]"
          icon="i-heroicons-tag"
          size="xl"
        )
      u-form-group(
        label="Gender"
        name="gender"
        size="xl"
      )
        u-select(
          v-model="gender"
          :options="gender_items"
          icon="i-heroicons-face-smile"
          option-attribute="label"
          size="xl"
        )
      u-button(
        @click="createPrediction"
        :disabled="loading || names[0] === '' || names[1] === ''"
        :loading="loading"
        color="black"
        size="xl"
        block
      ) Generate

  .mx-auto.mb-8.px-4.max-w-xl(
    v-if="name || description"
    class="sm:mb-16 md:mb-24 sm:px-6 lg:px-8"
  )
    u-card(ref="card")
      template(#header)
        .text-center
          .text-sm.text-gray-500.mb-2
            | The baby of 
            span.font-bold.text-black {{ names[0] }}&nbsp;
            | &amp; 
            span.font-bold.text-black {{ names[1] }}&nbsp;
            | should be named:
          h1.text-3xl.font-bold.text-primary.text-lg(
            v-if="name"
            class="dark:text-white sm:text-5xl"
          ) {{ name }} 
      .text-lg.text-gray-700.tracking-tight(
        v-if="description"
        class="dark:text-gray-100"
      ) {{ description }}
      template(#footer)
        .text-center.text-sm.font-bold.text-black
          img.w-5.mr-4.inline(
            src="/favicon.png"
          )
          | BabyNameGeneratorAI.com
    u-button.mt-8(
      @click="share"
      size="xl"
      trailing-icon="i-heroicons-paper-airplane"
      variant="ghost"
      block
    ) Share Name
</template>

<script>
import { useLocalStorage, StorageSerializers } from '@vueuse/core'
import html2canvas from 'html2canvas'

export default {
  name: 'app',
  setup: () => ({
    gender: useLocalStorage('bnga-gender', ''),
    names: useLocalStorage('bnga-names', ['Brad Pitt', 'Angelina Jolie'], {
      serializer: StorageSerializers.object
    })
  }),
  data: () => ({
    loading: false,
    output: '',

    gender_items: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Random', value: '' }
    ]
  }),
  computed: {
    name() {
      const str = this.output

      if (!str || str === '') return null

      const lines = str.split('\n')

      return lines.shift().trim()
    },
    description() {
      const str = this.output

      if (!str || str === '') return null

      const lines = str.split('\n')

      if (lines.length < 2) return null

      lines.shift()

      return lines.join('').trim()
    }
  },
  methods: {
    async createPrediction() {
      this.loading = true

      try {
        console.log('--- createPrediction: create prediction')

        const { data, error } = await $fetch('/api/prediction', {
          method: 'POST',
          body: {
            gender: this.gender,
            names: this.names
          }
        })

        if (error) {
          throw new Error(error)
        }

        const url_stream = data?.url_stream

        if (!url_stream) {
          throw new Error('Failed to create prediction.')
        }

        this.process(url_stream)
      } catch (e) {
        console.log('--- createPrediction error: ', e)
        this.loading = false
      }
    },
    process(url_stream) {
      const source = new EventSource(url_stream)
      this.output = ''

      const removeEventListeners = () => {
        source.removeEventListener('output', handleOutput)
        source.removeEventListener('done', handleDone)
        source.removeEventListener('error', handleError)
      }

      const handleOutput = (e) => {
        this.output += e.data
      }

      const handleDone = (e) => {
        console.log('--- process output done: ', this.output)
        source.close()
        removeEventListeners()

        this.loading = false
      }

      const handleError = (e) => {
        console.log('--- process error: ', e)
        source.close()
        removeEventListeners()

        this.loading = false
      }

      source.addEventListener('output', handleOutput)
      source.addEventListener('done', handleDone)
      source.addEventListener('error', handleError)
    },
    async share() {
      const canvas = await html2canvas(this.$refs.card.$el)
      const link = document.createElement('a')
      link.download = 'babynamegeneratorai.com.png'
      link.href = canvas.toDataURL()
      link.click()
    }
  }
}
</script>

<style lang="stylus" scoped></style>
