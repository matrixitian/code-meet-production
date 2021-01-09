<template>
  <div id="main">
    <div id="tagAdder">
      <input v-model="tagForPush" @keyup.enter="addTag()"
      @keyup="suggestTags()" 
      placeholder="Add tag (enter)">
      <ul id="tagList">
        <li v-for="(tag, i) in projectTags" :key="i">
          <img :src="getTagIcon(tag)" class="tagIcon">
          <span class="tagTitle">{{tag}}</span>
          <button @click="removeTag(i)">
            <span>&#10005;</span>
          </button>
        </li>
      </ul>
    </div>
    <!-- Transform into Component -->
    <ul id="suggestions" 
    v-if="suggestions.length > 0 && tagForPush.length > 0">
      <li v-for="(tag, s) in suggestions" :key="s"
      @click="addTagFromSuggestions(s)">
        <img :src="getTagIcon(tag)" class="tagIcon">
        <span class="tagTitle">{{ tag }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import $data from '@/javascript/staticData.js'
const log = console.log

export default {
  name: 'Search',
  data() {
    return {
      projectTags: [],
      tagForPush: "",
      suggestions: []
    }
  },
  methods: {
    removeTag(i) {
      this.projectTags.splice(i, 1)

      let lowercasedTags = $data.lowercaseTags(this.projectTags)
      
      this.$store.commit('addTagsForFiltering', lowercasedTags)
    },
    addTagFromSuggestions(index) {
      const tag = $data.capitalizeString(this.suggestions[index])

      this.suggestions = []
      this.tagForPush = ""

      this.projectTags.push(tag)

      let lowercasedTags = $data.lowercaseTags(this.projectTags)
      
      this.$store.commit('addTagsForFiltering', lowercasedTags)
    },
    getTagIcon(tag) {
      return $data.returnTagIcon(tag)
    },
    async suggestTags() {
      const search = this.tagForPush

      const filtered = $data.tagIcons.filter(function(tag) {
        return tag.toLowerCase().indexOf(search.toLowerCase()) >= 0;
      })

      let capitalized = []
      filtered.forEach((result) => {
        let received = $data.capitalizeString(result)
        capitalized.push(received)
      })

      this.suggestions = capitalized
    },
    async addTag() {
      this.tagForPush = $data.capitalizeString(this.tagForPush)
      this.projectTags.push(this.tagForPush)
      this.tagForPush = ""
      this.suggestions = [] //hotfix

      let lowercasedTags = $data.lowercaseTags(this.projectTags)

      this.$store.commit('addTagsForFiltering', lowercasedTags)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/centerX';
@import '@/scss/centerXY';
@import '@/scss/centerY';
@import '@/scss/tag';

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

$tagsInputWidth: 100px;

#tagAdder {
  z-index: 4 !important;
  border-radius: 3px;
  @include centerX;
  position: absolute;
  height: 36px;
  margin-top: -4px;
  // border: 1px solid red;
  width: 50%;
  min-width: 400px;
  max-width: 700px;
  overflow-x: auto;
  // background-color: #1e2124;
  border: 2px solid rgba(0, 0, 0, 0.15);
  box-shadow: 1px 1px 7px 1px rgba(0, 0, 0, 0.1);
  input {
    outline: none;
    font-weight: bold;
    color: white;
    padding: 0 10px 0 10px;
    border: none;
    position: absolute;
    height: 100%;
    width: $tagsInputWidth;
    display: inline-block;
    margin-right: 100px;
    background-color: transparent;
    &::placeholder {
      color: #717a80;
    }
  }
  ul#tagList {
    display: block;
    margin-left: $tagsInputWidth + 10px;
    width: calc(100% - #{$tagsInputWidth} - 10px);
    // border: 1px solid black;
    height: 100%;
    max-height: 35px;
    overflow: hidden;
    white-space: nowrap;
    li {
      font-weight: bold;
      font-size: 15px;
      margin-top: 4px;
      padding: 4px;
      border-radius: 6px;
      display: inline-block;
      margin-left: 10px;
      background-color: white;
      cursor: pointer;
      transition: .1s ease;
      &:hover {
        background-color: rgb(230, 119, 100);
      }
      button {
        top: 2px;
        position: relative;
        margin-left: 5px;
        border-radius: 100%;
        border: none;
        font-weight: bold;
        font-size: 10px;
        width: 15px;
        height: 15px;
        background-color: #f1a1a0;
        transition: .3s ease;
        &:hover {
          background-color: white;
        }
        span {
          margin-left: 0px;
          margin-top: -1px;
          @include centerXY;
          color: white;
          transition: .3s ease;
          cursor: pointer;
          &:hover {
            color: #df190e;
          }
        }
      }
    }
  }
}
</style>