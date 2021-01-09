<template>
  <div>
   <ul v-if="true" id="suggestions">
      <li v-for="(tag, s) in suggestions" :key="s"
      @click="addTagFromSuggestions(s)">
        <img :src="getTagIcon(tag)" class="tagIcon">
        <span class="tagTitle">{{ tag }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import Axios from 'axios'
import $data from '@/javascript/staticData.js'
import config from '../../../../dev.env'
const log = console.log

export default {
  name: 'Suggestions',
  props: ['suggestions'],
  data() {
    return {
      projectTags: [],
      tagForPush: ""
    }
  },
  computed: {
    localSuggestions: function(){
        return this.suggestions
    }
  },
  methods: {
    addTagFromSuggestions(index) {
      const tag = $data.capitalizeString(this.localSuggestions[index])

      this.localSuggestions = []
      this.tagForPush = ""

      this.projectTags.push(tag)

      let lowercasedTags = $data.lowercaseTags(this.projectTags)
      log(lowercasedTags)

      this.$emit('add-tags-to-search', lowercasedTags);
      
      this.$store.commit('addTagsForFiltering', lowercasedTags)
    },
    getTagIcon(tag) {
      return $data.returnTagIcon(tag)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/centerX';
@import '@/scss/centerXY';
@import '@/scss/centerY';
@import '@/scss/Tag';

ul#suggestions {
  z-index: 1 !important;
  position: absolute;
  @include centerX;
  margin-top: 40px;
  background-color: rgb(82, 143, 192);
  max-width: 400px;
  max-height: 100px;
  text-align: center;
  z-index: 5;
  box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  border: 1px solid black;
  border-bottom-left-radius: 13px;
  border-bottom-right-radius: 13px;
  li {
    border: 1px solid black;
    padding: 3px 5px 3px 5px;
    font-weight: bold;
    display: inline-block;
    margin: 5px;
    background-color: white;
    border-radius: 3px;
    cursor: pointer;
    transition: .1s ease;
    &:hover {
      background-color: rgb(246, 212, 206);
    }
  }
}

</style>